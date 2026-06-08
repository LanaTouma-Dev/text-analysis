from datetime import timedelta

from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission


class IsSeniorModerator(BasePermission):
    """Tier 2+ only — Senior Moderator or Admin."""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.tier >= 2
        )

from .models import ModerationDecision, AuditLog, CategoryThreshold, ActiveLearningEntry
from .serializers import (
    QueueMessageSerializer, DecisionDetailSerializer,
    AuditLogSerializer, CategoryThresholdSerializer,
)


class StandardPagination(PageNumberPagination):
    page_size = 25


# ---------------------------------------------------------------------------
# Queue / Decisions
# ---------------------------------------------------------------------------

class DecisionListView(APIView):
    """GET /api/v1/decisions/ — paginated moderation queue with filters."""

    def get(self, request):
        qs = ModerationDecision.objects.select_related('message').order_by('-created_at')

        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        flagged = request.query_params.get('flagged')
        if flagged is not None:
            qs = qs.filter(is_flagged=flagged.lower() == 'true')

        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = QueueMessageSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class DecisionDetailView(APIView):
    """GET /api/v1/decisions/{id}/"""

    def get(self, request, pk):
        decision = get_object_or_404(
            ModerationDecision.objects.select_related('message'), pk=pk
        )
        return Response(DecisionDetailSerializer(decision).data)


class DecideView(APIView):
    """POST /api/v1/decisions/{id}/decide/  body: {action: approve|block|escalate}"""

    def post(self, request, pk):
        decision = get_object_or_404(ModerationDecision, pk=pk)
        action = request.data.get('action')

        if action not in ['approved', 'blocked', 'escalated']:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

        decision.status     = action
        decision.decided_at = timezone.now()
        # decided_by = request.user  # uncomment after JWT auth is wired
        decision.save()

        # Audit log
        AuditLog.objects.create(
            decision=decision,
            moderator=request.user if request.user.is_authenticated else _get_system_user(),
            action=action,
            ai_scores_at_time=decision.category_scores,
            ip_address=request.META.get('REMOTE_ADDR'),
        )

        # Active learning — flag high-confidence disagreements
        if decision.category_scores:
            top_score = max(decision.category_scores.values())
            top_cat   = max(decision.category_scores, key=decision.category_scores.get)
            if action == 'approved' and top_score > 0.80:
                ActiveLearningEntry.objects.create(
                    decision=decision,
                    human_action=action,
                    ai_top_category=top_cat,
                    ai_top_score=top_score,
                    is_disagreement=True,
                )

        return Response({'status': action})


def _get_system_user():
    from django.contrib.auth.models import User
    user, _ = User.objects.get_or_create(username='system')
    return user


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------

RANGE_DELTAS = {
    '1H':  timedelta(hours=1),
    '24H': timedelta(hours=24),
    '7D':  timedelta(days=7),
    '30D': timedelta(days=30),
}


class AnalyticsSummaryView(APIView):
    """GET /api/v1/analytics/summary/"""

    def get(self, request):
        now   = timezone.now()
        since = now - timedelta(hours=24)
        qs    = ModerationDecision.objects.filter(created_at__gte=since)

        total    = qs.count()
        flagged  = qs.filter(is_flagged=True).count()
        blocked  = qs.filter(status='blocked').count()
        pending  = qs.filter(status='pending').count()
        block_rate = round(blocked / total * 100, 1) if total else 0

        return Response({
            'total_24h':  total,
            'flagged_24h': flagged,
            'blocked_24h': blocked,
            'pending':    pending,
            'block_rate': block_rate,
        })


class AnalyticsVolumeView(APIView):
    """GET /api/v1/analytics/volume/?range=24H"""

    def get(self, request):
        range_param = request.query_params.get('range', '24H')
        delta = RANGE_DELTAS.get(range_param, timedelta(hours=24))
        since = timezone.now() - delta

        qs = ModerationDecision.objects.filter(created_at__gte=since)

        # Simple bucketing — group by hour
        from django.db.models.functions import TruncHour, TruncDay
        trunc = TruncHour if range_param in ('1H', '24H') else TruncDay
        from django.db.models import Count, Q

        data = (
            qs.annotate(bucket=trunc('created_at'))
            .values('bucket')
            .annotate(
                safe=Count('id', filter=Q(is_flagged=False)),
                flagged=Count('id', filter=Q(is_flagged=True)),
            )
            .order_by('bucket')
        )

        result = [
            {
                'label': row['bucket'].strftime('%H:%M' if range_param in ('1H', '24H') else '%b %d'),
                'safe':    row['safe'],
                'flagged': row['flagged'],
            }
            for row in data
        ]
        return Response(result)


class AnalyticsCategoriesView(APIView):
    """GET /api/v1/analytics/categories/"""

    def get(self, request):
        decisions = ModerationDecision.objects.filter(is_flagged=True)
        counts = {}
        for d in decisions:
            for cat, score in (d.flagged_categories or []):
                counts[cat] = counts.get(cat, 0) + 1
        result = [{'category': k, 'count': v} for k, v in sorted(counts.items(), key=lambda x: -x[1])]
        return Response(result)


# ---------------------------------------------------------------------------
# Audit log
# ---------------------------------------------------------------------------

class AuditLogView(APIView):
    """GET /api/v1/audit/"""

    def get(self, request):
        qs = AuditLog.objects.select_related(
            'moderator', 'decision__message'
        ).order_by('-created_at')

        action_filter = request.query_params.get('action')
        if action_filter:
            qs = qs.filter(action=action_filter)

        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(AuditLogSerializer(page, many=True).data)


# ---------------------------------------------------------------------------
# Thresholds
# ---------------------------------------------------------------------------

class ThresholdView(APIView):
    """GET/PUT /api/v1/thresholds/  — PUT requires Senior Moderator (tier 2+)"""

    def get_permissions(self):
        if self.request.method == 'PUT':
            return [IsSeniorModerator()]
        return [IsAuthenticated()]

    def get(self, request):
        thresholds = CategoryThreshold.objects.all()
        return Response(CategoryThresholdSerializer(thresholds, many=True).data)

    def put(self, request):
        import redis, json
        for item in request.data:
            CategoryThreshold.objects.filter(
                category_id=item['category_id']
            ).update(threshold=item['threshold'])

        # Bust Redis threshold cache so Celery picks up changes within 60s
        try:
            r = redis.Redis(host='localhost', port=6379, db=2)
            r.delete('thresholds')
        except Exception:
            pass

        return Response({'updated': len(request.data)})


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

class HealthView(APIView):
    """GET /api/v1/health/"""
    permission_classes = [AllowAny]

    def get(self, request):
        import httpx

        def check(url):
            try:
                httpx.get(url, timeout=2)
                return 'ok'
            except Exception:
                return 'unreachable'

        return Response({
            'marbert': check('http://localhost:8001/health'),
            'acegpt':  check('http://10.215.181.1:8003/health'),
            'django':  'ok',
        })
