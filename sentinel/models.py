from django.db import models
from django.contrib.auth.models import User


class Message(models.Model):
    external_id       = models.CharField(max_length=100, unique=True, db_index=True)
    sender            = models.CharField(max_length=30)
    recipient         = models.CharField(max_length=30, null=True, blank=True)
    body              = models.TextField()
    preprocessed_body = models.TextField(blank=True)
    timestamp         = models.BigIntegerField()  # Unix ms from Spring Boot
    received_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['received_at']),
            models.Index(fields=['sender']),
        ]

    def __str__(self):
        return f'{self.sender} @ {self.received_at:%Y-%m-%d %H:%M}'


class ModerationDecision(models.Model):
    STATUS_CHOICES = [
        ('safe',      'Safe'),
        ('pending',   'Pending'),
        ('approved',  'Approved'),
        ('blocked',   'Blocked'),
        ('escalated', 'Escalated'),
        ('failed',    'Failed'),
    ]

    message            = models.OneToOneField(Message, on_delete=models.CASCADE, related_name='decision')
    is_flagged         = models.BooleanField(default=False)
    category_scores    = models.JSONField()                   # {"hate": 0.91, "spam": 0.12, ...}
    flagged_categories = models.JSONField(default=list)       # [["hate", 0.91], ["spam", 0.12]]
    ar_expl            = models.TextField(blank=True)
    en_expl            = models.TextField(blank=True)
    status             = models.CharField(max_length=15, default='pending', choices=STATUS_CHOICES, db_index=True)
    infer_latency_ms   = models.FloatField(null=True, blank=True)
    decided_by         = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='decisions')
    decided_at         = models.DateTimeField(null=True, blank=True)
    created_at         = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['is_flagged', 'created_at']),
        ]

    def __str__(self):
        return f'Decision({self.status}) for {self.message}'


class AuditLog(models.Model):
    """Append-only. Rows are never updated or deleted."""
    decision          = models.ForeignKey(ModerationDecision, on_delete=models.CASCADE, related_name='audit_logs')
    moderator         = models.ForeignKey(User, on_delete=models.PROTECT, related_name='audit_logs')
    action            = models.CharField(max_length=15)   # approved / blocked / escalated
    reason            = models.TextField(blank=True)
    ai_scores_at_time = models.JSONField()                # snapshot of scores at decision time
    ip_address        = models.GenericIPAddressField(null=True, blank=True)
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.moderator} {self.action} @ {self.created_at:%Y-%m-%d %H:%M}'


class CategoryThreshold(models.Model):
    SEVERITY_CHOICES = [
        ('danger', 'Danger'),
        ('amber',  'Amber'),
    ]

    category_id  = models.CharField(max_length=30, unique=True)
    display_name = models.CharField(max_length=60)
    threshold    = models.FloatField(default=0.5)
    severity     = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    updated_by   = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    updated_at   = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.display_name} (>={self.threshold})'


class ActiveLearningEntry(models.Model):
    """Tracks human/AI disagreements for weekly MARBERT retraining export."""
    decision        = models.ForeignKey(ModerationDecision, on_delete=models.CASCADE, related_name='learning_entries')
    human_action    = models.CharField(max_length=15)
    ai_top_category = models.CharField(max_length=30)
    ai_top_score    = models.FloatField()
    is_disagreement = models.BooleanField()
    exported_at     = models.DateTimeField(null=True, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Disagreement: AI={self.ai_top_category}({self.ai_top_score:.2f}) Human={self.human_action}'


class ModeratorProfile(models.Model):
    ROLE_CHOICES = [
        ('moderator', 'Moderator'),
        ('senior',    'Senior Moderator'),
        ('admin',     'Admin'),
    ]

    user      = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role      = models.CharField(max_length=20, choices=ROLE_CHOICES, default='moderator')
    initials  = models.CharField(max_length=4)
    tier      = models.IntegerField(default=1)   # 1=moderator, 2=senior, 3=admin
    is_online = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.user.username} ({self.role})'
