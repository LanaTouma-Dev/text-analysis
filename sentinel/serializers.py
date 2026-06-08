from rest_framework import serializers
from .models import Message, ModerationDecision, AuditLog, CategoryThreshold


class QueueMessageSerializer(serializers.ModelSerializer):
    """Shape matches Angular QueueMessage interface exactly."""
    cats   = serializers.SerializerMethodField()
    ar     = serializers.CharField(source='message.body')
    sender = serializers.CharField(source='message.sender')
    ts     = serializers.IntegerField(source='message.timestamp')
    en     = serializers.SerializerMethodField()

    def get_cats(self, obj):
        return obj.flagged_categories  # already [[cat, score], ...]

    def get_en(self, obj):
        return ''  # translation not implemented yet

    conf = serializers.SerializerMethodField()

    def get_conf(self, obj):
        if not obj.flagged_categories:
            return 0.0
        return round(obj.flagged_categories[0][1], 4)

    class Meta:
        model  = ModerationDecision
        fields = ['id', 'ts', 'sender', 'cats', 'ar', 'en',
                  'ar_expl', 'en_expl', 'conf', 'status']


class DecisionDetailSerializer(serializers.ModelSerializer):
    message_body     = serializers.CharField(source='message.body')
    message_sender   = serializers.CharField(source='message.sender')
    message_received = serializers.DateTimeField(source='message.received_at')

    class Meta:
        model  = ModerationDecision
        fields = ['id', 'message_body', 'message_sender', 'message_received',
                  'is_flagged', 'category_scores', 'flagged_categories',
                  'ar_expl', 'en_expl', 'status', 'infer_latency_ms',
                  'decided_at', 'created_at']


class AuditLogSerializer(serializers.ModelSerializer):
    moderator_name = serializers.CharField(source='moderator.username')
    message_id     = serializers.IntegerField(source='decision.message.id')
    message_body   = serializers.CharField(source='decision.message.body')

    class Meta:
        model  = AuditLog
        fields = ['id', 'moderator_name', 'action', 'reason',
                  'ai_scores_at_time', 'ip_address', 'created_at',
                  'message_id', 'message_body']


class CategoryThresholdSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CategoryThreshold
        fields = ['id', 'category_id', 'display_name', 'threshold', 'severity']
