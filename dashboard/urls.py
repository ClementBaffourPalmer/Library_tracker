from django.urls import path

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("dashboard/", views.user_dashboard, name="user_dashboard"),
    path("admin-dashboard/", views.admin_dashboard, name="admin_dashboard"),
    # NOTE: Do not use the `/admin/` prefix (reserved for Django Admin site).
    path("admin-dashboard/occupancy/", views.admin_current_occupancy, name="admin_current_occupancy"),
    path("admin-dashboard/entries-today/", views.admin_entries_today, name="admin_entries_today"),
    path("admin-dashboard/exits-today/", views.admin_exits_today, name="admin_exits_today"),
    path("admin-dashboard/capacity/", views.admin_capacity_level, name="admin_capacity_level"),
    path("reports/daily/", views.daily_report, name="daily_report"),
    path("reports/daily.csv", views.daily_report_csv, name="daily_report_csv"),
    path("reports/weekly/", views.weekly_report, name="weekly_report"),
    path("settings/", views.settings, name="settings"),
    path("users/", views.users, name="users"),
    path("users/add/", views.add_user, name="add_user"),
]
