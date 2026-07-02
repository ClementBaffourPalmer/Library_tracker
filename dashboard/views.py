from __future__ import annotations

import json
import csv
from datetime import datetime, timedelta

from django.contrib.auth.decorators import login_required
from django.db.models import Count
from django.db.models.functions import TruncDate, TruncHour
from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect, render
from django.utils import timezone

from django.contrib.auth import get_user_model
from django.db.models import Max

from accounts.models import UserProfile
from tracking.models import EntryExitEvent, LibrarySettings
from tracking.services import (
    get_current_occupancy_snapshot,
    get_last_event_for_user,
    get_today_counts,
)

User = get_user_model()


def _is_admin(user) -> bool:
    if not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    try:
        return getattr(user.profile, "role", "USER") == "ADMIN"
    except Exception:
        return False


def _parse_date(date_str: str | None):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None


@login_required
def home(request: HttpRequest) -> HttpResponse:
    if _is_admin(request.user):
        return redirect("admin_dashboard")
    return redirect("user_dashboard")


@login_required
def user_dashboard(request: HttpRequest) -> HttpResponse:
    settings_obj = LibrarySettings.get_solo()
    snapshot = get_current_occupancy_snapshot()

    last_event = get_last_event_for_user(request.user)
    is_inside = bool(last_event and last_event.event_type == EntryExitEvent.EventType.ENTRY)

    history = list(
        EntryExitEvent.objects.filter(user=request.user).order_by("-event_time", "-id")[:25]
    )

    context = {
        "library_settings": settings_obj,
        "occupancy": snapshot.occupancy,
        "is_inside": is_inside,
        "history": history,
    }
    return render(request, "dashboard/user_dashboard.html", context)


@login_required
def admin_dashboard(request: HttpRequest) -> HttpResponse:
    if not _is_admin(request.user):
        return redirect("home")

    settings_obj = LibrarySettings.get_solo()
    snapshot = get_current_occupancy_snapshot()
    entries_today, exits_today = get_today_counts()
    student_analytics: dict[str, list] = {"departments": [], "top_students": []}

    try:
        from students.models import AttendanceRecord, Student

        student_analytics["departments"] = list(
            Student.objects.exclude(department__isnull=True)
            .exclude(department__exact="")
            .values("department")
            .annotate(total=Count("id"))
            .order_by("-total", "department")[:6]
        )
        student_analytics["top_students"] = list(
            AttendanceRecord.objects.select_related("student")
            .values("student_id", "student__full_name", "student__index_number", "student__department")
            .annotate(total=Count("id"))
            .order_by("-total", "student__full_name")[:5]
        )
    except Exception:
        pass

    now = timezone.now()
    start_day = (now - timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0)

    daily_counts = (
        EntryExitEvent.objects.filter(event_time__gte=start_day, event_time__lte=now)
        .annotate(day=TruncDate("event_time"))
        .values("day", "event_type")
        .annotate(count=Count("id"))
        .order_by("day")
    )

    day_labels = []
    entries_series = []
    exits_series = []

    for i in range(7):
        d = (start_day + timedelta(days=i)).date()
        day_labels.append(d.isoformat())
        entries_series.append(0)
        exits_series.append(0)

    idx_map = {day_labels[i]: i for i in range(len(day_labels))}
    for row in daily_counts:
        day_str = str(row["day"])
        if day_str not in idx_map:
            continue
        if row["event_type"] == EntryExitEvent.EventType.ENTRY:
            entries_series[idx_map[day_str]] = row["count"]
        else:
            exits_series[idx_map[day_str]] = row["count"]

    daily_visits_series = [entries_series[i] + exits_series[i] for i in range(len(day_labels))]
    occupancy_series = []
    running_balance = 0
    for index in range(len(day_labels)):
        running_balance += entries_series[index] - exits_series[index]
        occupancy_series.append(running_balance)

    capacity = settings_obj.capacity_limit
    warning_threshold = int(capacity * (settings_obj.warning_threshold_percent / 100.0))

    if snapshot.occupancy >= capacity:
        occupancy_status = "full"
    elif snapshot.occupancy >= warning_threshold:
        occupancy_status = "warning"
    else:
        occupancy_status = "normal"

    context = {
        "library_settings": settings_obj,
        "occupancy": snapshot.occupancy,
        "occupancy_status": occupancy_status,
        "entries_today": entries_today,
        "exits_today": exits_today,
        "users_inside": snapshot.currently_inside_users,
        "dashboard_payload_json": json.dumps(
            {
                "weekLabels": day_labels,
                "entriesSeries": entries_series,
                "exitsSeries": exits_series,
                "dailyVisitsSeries": daily_visits_series,
                "occupancySeries": occupancy_series,
                "weeklyUsageLabels": ["Entries", "Exits"],
                "weeklyUsageSeries": [sum(entries_series), sum(exits_series)],
                "departmentLabels": [row["department"] for row in student_analytics["departments"]],
                "departmentSeries": [row["total"] for row in student_analytics["departments"]],
                "topStudentLabels": [row["student__full_name"] for row in student_analytics["top_students"]],
                "topStudentSeries": [row["total"] for row in student_analytics["top_students"]],
            }
        ),
        "student_departments": student_analytics["departments"],
        "top_students": student_analytics["top_students"],
    }
    return render(request, "dashboard/admin_dashboard.html", context)


@login_required
def admin_current_occupancy(request: HttpRequest) -> HttpResponse:
    if not _is_admin(request.user):
        return redirect("home")

    settings_obj = LibrarySettings.get_solo()
    snapshot = get_current_occupancy_snapshot()

    capacity = settings_obj.capacity_limit
    warning_threshold = int(capacity * (settings_obj.warning_threshold_percent / 100.0))

    if snapshot.occupancy >= capacity:
        occupancy_status = "full"
    elif snapshot.occupancy >= warning_threshold:
        occupancy_status = "warning"
    else:
        occupancy_status = "normal"

    context = {
        "library_settings": settings_obj,
        "occupancy": snapshot.occupancy,
        "capacity": capacity,
        "warning_threshold": warning_threshold,
        "occupancy_status": occupancy_status,
        "users_inside": snapshot.currently_inside_users,
    }
    return render(request, "dashboard/admin_current_occupancy.html", context)


@login_required
def admin_entries_today(request: HttpRequest) -> HttpResponse:
    if not _is_admin(request.user):
        return redirect("home")

    today = timezone.localdate()
    start = timezone.make_aware(datetime.combine(today, datetime.min.time()))
    end = start + timedelta(days=1)

    qs = (
        EntryExitEvent.objects.filter(
            event_type=EntryExitEvent.EventType.ENTRY,
            event_time__gte=start,
            event_time__lt=end,
        )
        .select_related("user")
        .order_by("-event_time", "-id")
    )

    context = {
        "date": today,
        "total": qs.count(),
        "events": list(qs[:250]),
    }
    return render(request, "dashboard/admin_entries_today.html", context)


@login_required
def admin_exits_today(request: HttpRequest) -> HttpResponse:
    if not _is_admin(request.user):
        return redirect("home")

    today = timezone.localdate()
    start = timezone.make_aware(datetime.combine(today, datetime.min.time()))
    end = start + timedelta(days=1)

    qs = (
        EntryExitEvent.objects.filter(
            event_type=EntryExitEvent.EventType.EXIT,
            event_time__gte=start,
            event_time__lt=end,
        )
        .select_related("user")
        .order_by("-event_time", "-id")
    )

    context = {
        "date": today,
        "total": qs.count(),
        "events": list(qs[:250]),
    }
    return render(request, "dashboard/admin_exits_today.html", context)


@login_required
def admin_capacity_level(request: HttpRequest) -> HttpResponse:
    if not _is_admin(request.user):
        return redirect("home")

    settings_obj = LibrarySettings.get_solo()
    snapshot = get_current_occupancy_snapshot()
    entries_today, exits_today = get_today_counts()

    capacity = settings_obj.capacity_limit
    warning_threshold = int(capacity * (settings_obj.warning_threshold_percent / 100.0))

    if snapshot.occupancy >= capacity:
        occupancy_status = "full"
    elif snapshot.occupancy >= warning_threshold:
        occupancy_status = "warning"
    else:
        occupancy_status = "normal"

    # Progress percentage capped 0..100
    pct = int(min(100, max(0, round((snapshot.occupancy / max(1, capacity)) * 100))))

    context = {
        "library_settings": settings_obj,
        "occupancy": snapshot.occupancy,
        "capacity": capacity,
        "warning_threshold": warning_threshold,
        "occupancy_status": occupancy_status,
        "occupancy_percent": pct,
        "entries_today": entries_today,
        "exits_today": exits_today,
    }
    return render(request, "dashboard/admin_capacity_level.html", context)


@login_required
def daily_report(request: HttpRequest) -> HttpResponse:
    if not _is_admin(request.user):
        return redirect("home")

    selected_date = _parse_date(request.GET.get("date")) or timezone.localdate()
    start = timezone.make_aware(datetime.combine(selected_date, datetime.min.time()))
    end = start + timedelta(days=1)

    qs = EntryExitEvent.objects.filter(event_time__gte=start, event_time__lt=end)
    total_entries = qs.filter(event_type=EntryExitEvent.EventType.ENTRY).count()
    total_exits = qs.filter(event_type=EntryExitEvent.EventType.EXIT).count()

    hourly_counts = (
        qs.annotate(hour=TruncHour("event_time"))
        .values("hour", "event_type")
        .annotate(count=Count("id"))
        .order_by("hour")
    )

    labels = [f"{h:02d}:00" for h in range(24)]
    entries = [0] * 24
    exits = [0] * 24
    for row in hourly_counts:
        hour = row["hour"].hour if row["hour"] else None
        if hour is None:
            continue
        if row["event_type"] == EntryExitEvent.EventType.ENTRY:
            entries[hour] = row["count"]
        else:
            exits[hour] = row["count"]

    context = {
        "selected_date": selected_date.isoformat(),
        "total_entries": total_entries,
        "total_exits": total_exits,
        "chart_labels_json": json.dumps(labels),
        "chart_entries_json": json.dumps(entries),
        "chart_exits_json": json.dumps(exits),
    }
    return render(request, "dashboard/daily_report.html", context)


@login_required
def daily_report_csv(request: HttpRequest) -> HttpResponse:
    if not _is_admin(request.user):
        return redirect("home")

    selected_date = _parse_date(request.GET.get("date")) or timezone.localdate()
    start = timezone.make_aware(datetime.combine(selected_date, datetime.min.time()))
    end = start + timedelta(days=1)

    qs = (
        EntryExitEvent.objects.filter(event_time__gte=start, event_time__lt=end)
        .select_related("user")
        .order_by("event_time", "id")
    )

    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = f'attachment; filename="daily_report_{selected_date.isoformat()}.csv"'

    writer = csv.writer(response)
    writer.writerow(["username", "email", "event_type", "event_time", "source", "gate"])
    for e in qs:
        writer.writerow([
            e.user.username,
            e.user.email,
            e.event_type,
            e.event_time.isoformat(),
            e.source,
            e.gate or "",
        ])

    return response


@login_required
def weekly_report(request: HttpRequest) -> HttpResponse:
    if not _is_admin(request.user):
        return redirect("home")

    now = timezone.now()
    start_day = (now - timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0)

    daily_counts = (
        EntryExitEvent.objects.filter(event_time__gte=start_day, event_time__lte=now)
        .annotate(day=TruncDate("event_time"))
        .values("day", "event_type")
        .annotate(count=Count("id"))
        .order_by("day")
    )

    day_labels = []
    entries_series = []
    exits_series = []

    for i in range(7):
        d = (start_day + timedelta(days=i)).date()
        day_labels.append(d.isoformat())
        entries_series.append(0)
        exits_series.append(0)

    idx_map = {day_labels[i]: i for i in range(len(day_labels))}
    for row in daily_counts:
        day_str = row["day"].isoformat() if row["day"] else None
        if not day_str or day_str not in idx_map:
            continue
        if row["event_type"] == EntryExitEvent.EventType.ENTRY:
            entries_series[idx_map[day_str]] = row["count"]
        else:
            exits_series[idx_map[day_str]] = row["count"]

    context = {
        "chart_labels_json": json.dumps(day_labels),
        "chart_entries_json": json.dumps(entries_series),
        "chart_exits_json": json.dumps(exits_series),
    }
    return render(request, "dashboard/weekly_report.html", context)


@login_required
def settings(request: HttpRequest) -> HttpResponse:
    """
    Settings UI page.

    Keeps persistence minimal:
    - Admins can update existing `LibrarySettings` fields.
    - Notification toggles are stored in session (UI preference only).
    """
    if request.method == "POST":
        is_admin = _is_admin(request.user)
        if is_admin:
            settings_obj = LibrarySettings.get_solo()

            capacity_raw = request.POST.get("capacity_limit")
            warning_raw = request.POST.get("warning_threshold_percent")
            library_name_raw = request.POST.get("library_name")

            if library_name_raw is not None:
                settings_obj.library_name = (library_name_raw or settings_obj.library_name).strip()[:200]

            try:
                capacity = int(capacity_raw) if capacity_raw is not None else settings_obj.capacity_limit
                settings_obj.capacity_limit = max(1, capacity)
            except (TypeError, ValueError):
                pass

            try:
                warning = int(warning_raw) if warning_raw is not None else settings_obj.warning_threshold_percent
                settings_obj.warning_threshold_percent = min(100, max(1, warning))
            except (TypeError, ValueError):
                pass

            settings_obj.save()

        # UI-only preferences (session scoped)
        request.session["notify_capacity"] = bool(request.POST.get("notify_capacity"))
        request.session["notify_weekly_digest"] = bool(request.POST.get("notify_weekly_digest"))
        request.session["notify_security"] = bool(request.POST.get("notify_security"))
        request.session["settings_saved"] = True

        return redirect("settings")

    settings_obj = LibrarySettings.get_solo()
    saved = bool(request.session.pop("settings_saved", False))

    context = {
        "is_admin": _is_admin(request.user),
        "library_settings": settings_obj,
        "saved": saved,
        "notify_capacity": bool(request.session.get("notify_capacity", True)),
        "notify_weekly_digest": bool(request.session.get("notify_weekly_digest", True)),
        "notify_security": bool(request.session.get("notify_security", True)),
    }
    return render(request, "dashboard/settings.html", context)


@login_required
def users(request: HttpRequest) -> HttpResponse:
    """
    Users management page.
    
    Lists all users with their roles, status, and last activity.
    Admin-only access.
    """
    if not _is_admin(request.user):
        return redirect("home")

    # Get all users with their profiles and last activity
    users_list = User.objects.select_related("profile").annotate(
        last_activity=Max("library_events__event_time")
    ).order_by("-date_joined")

    # Prepare user data with role and status
    users_data = []
    for user in users_list:
        try:
            profile = user.profile
            role_display = profile.get_role_display()
            student_staff_id = profile.student_staff_id or ""
        except UserProfile.DoesNotExist:
            role_display = "User"
            student_staff_id = ""

        # Determine status: Active if user.is_active and has recent activity (within 90 days)
        last_activity = getattr(user, "last_activity", None)
        is_active_user = user.is_active
        if last_activity:
            days_since_activity = (timezone.now() - last_activity).days
            status = "Active" if is_active_user and days_since_activity <= 90 else "Inactive"
        else:
            status = "Active" if is_active_user else "Inactive"

        users_data.append({
            "user": user,
            "role": role_display,
            "status": status,
            "last_activity": last_activity,
            "student_staff_id": student_staff_id,
        })

    # Calculate summary stats
    active_count = sum(1 for u in users_data if u["status"] == "Active")
    admin_count = sum(1 for u in users_data if u["role"] == "Admin")

    context = {
        "users": users_data,
        "total_users": len(users_data),
        "active_count": active_count,
        "admin_count": admin_count,
        "add_user_errors": request.session.pop("add_user_errors", None),
        "add_user_form": request.session.pop("add_user_form", None),
        "add_user_success": bool(request.session.pop("add_user_success", False)),
    }
    return render(request, "dashboard/users.html", context)


@login_required
def add_user(request: HttpRequest) -> HttpResponse:
    """
    Admin: create a new user + profile via the Users page modal.
    """
    if not _is_admin(request.user):
        return redirect("home")
    if request.method != "POST":
        return redirect("users")

    username = (request.POST.get("username") or "").strip()
    email = (request.POST.get("email") or "").strip()
    first_name = (request.POST.get("first_name") or "").strip()
    last_name = (request.POST.get("last_name") or "").strip()
    password = request.POST.get("password") or ""
    role = (request.POST.get("role") or "USER").strip().upper()
    student_staff_id = (request.POST.get("student_staff_id") or "").strip()
    is_active = bool(request.POST.get("is_active", "1"))

    errors: dict[str, str] = {}
    if not username:
        errors["username"] = "Username is required."
    elif User.objects.filter(username=username).exists():
        errors["username"] = "That username is already taken."

    if email and "@" not in email:
        errors["email"] = "Enter a valid email address."

    if not password or len(password) < 6:
        errors["password"] = "Password must be at least 6 characters."

    if role not in (UserProfile.Role.ADMIN, UserProfile.Role.USER):
        errors["role"] = "Select a valid role."

    if username and UserProfile.objects.filter(student_staff_id__iexact=username).exists():
        errors["username"] = "That username conflicts with an existing Student/Staff ID."

    if student_staff_id and UserProfile.objects.filter(student_staff_id=student_staff_id).exists():
        errors["student_staff_id"] = "That Student/Staff ID is already in use."
    elif student_staff_id and User.objects.filter(username__iexact=student_staff_id).exists():
        errors["student_staff_id"] = "That Student/Staff ID conflicts with an existing username."

    form_state = {
        "username": username,
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "role": role,
        "student_staff_id": student_staff_id,
        "is_active": is_active,
    }

    if errors:
        request.session["add_user_errors"] = errors
        request.session["add_user_form"] = form_state
        return redirect("users")

    user = User.objects.create_user(
        username=username,
        email=email or "",
        password=password,
        first_name=first_name,
        last_name=last_name,
        is_active=is_active,
    )

    # The profile is created by signal on user creation; update it in place.
    UserProfile.objects.update_or_create(
        user=user,
        defaults={
            "role": role,
            "student_staff_id": student_staff_id or None,
        },
    )

    # Optional: make admins staff for Django admin access.
    if role == UserProfile.Role.ADMIN and not user.is_staff:
        user.is_staff = True
        user.save(update_fields=["is_staff"])

    request.session["add_user_success"] = True
    return redirect("users")
