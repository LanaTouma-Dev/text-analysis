from django.urls import path
from . import views

urlpatterns = [
    # Queue
    path('decisions/',              views.DecisionListView.as_view()),
    path('decisions/<int:pk>/',     views.DecisionDetailView.as_view()),
    path('decisions/<int:pk>/decide/', views.DecideView.as_view()),

    # Analytics
    path('analytics/summary/',    views.AnalyticsSummaryView.as_view()),
    path('analytics/volume/',     views.AnalyticsVolumeView.as_view()),
    path('analytics/categories/', views.AnalyticsCategoriesView.as_view()),

    # Audit
    path('audit/', views.AuditLogView.as_view()),

    # Thresholds
    path('thresholds/', views.ThresholdView.as_view()),

    # Health
    path('health/', views.HealthView.as_view()),
]
