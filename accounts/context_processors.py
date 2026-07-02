def role_flags(request):
    user = getattr(request, "user", None)
    if not user or not getattr(user, "is_authenticated", False):
        return {"is_admin": False}

    if getattr(user, "is_superuser", False):
        return {"is_admin": True}

    try:
        return {"is_admin": getattr(user.profile, "role", "USER") == "ADMIN"}
    except Exception:
        return {"is_admin": False}


def system_notifications(request):
    """
    Small, server-side notification feed for the navbar.

    Keeps logic defensive: failures should never break page rendering.
    """
    user = getattr(request, "user", None)
    if not user or not getattr(user, "is_authenticated", False):
        return {"nav_notifications": [], "nav_notification_count": 0}

    # Import lazily to avoid hard failures during migrations / startup.
    try:
        from django.utils import timezone

        from tracking.models import EntryExitEvent, LibrarySettings
        from tracking.services import get_current_occupancy_snapshot, get_today_counts
    except Exception:
        return {"nav_notifications": [], "nav_notification_count": 0}

    # Non-admins currently don't get system feed.
    is_admin = False
    if getattr(user, "is_superuser", False):
        is_admin = True
    else:
        try:
            is_admin = getattr(user.profile, "role", "USER") == "ADMIN"
        except Exception:
            is_admin = False

    if not is_admin:
        return {"nav_notifications": [], "nav_notification_count": 0}

    notifications = []

    try:
        settings_obj = LibrarySettings.get_solo()
        snapshot = get_current_occupancy_snapshot()

        capacity = max(1, int(getattr(settings_obj, "capacity_limit", 1)))
        warning_threshold = int(capacity * (getattr(settings_obj, "warning_threshold_percent", 80) / 100.0))

        if snapshot.occupancy >= capacity:
            notifications.append({
                "type": "danger",
                "title": "Capacity reached",
                "message": f"Occupancy is {snapshot.occupancy}/{capacity}. Consider limiting entries.",
                "time": "now",
                "icon": "alert-triangle",
            })
        elif snapshot.occupancy >= warning_threshold and bool(request.session.get("notify_capacity", True)):
            notifications.append({
                "type": "warning",
                "title": "Capacity warning",
                "message": f"Occupancy is {snapshot.occupancy}/{capacity} (warning threshold {warning_threshold}).",
                "time": "now",
                "icon": "bell",
            })
    except Exception:
        # Ignore capacity failures.
        pass

    try:
        entries_today, exits_today = get_today_counts()
        notifications.append({
            "type": "info",
            "title": "Today so far",
            "message": f"{entries_today} entries, {exits_today} exits recorded today.",
            "time": "today",
            "icon": "bar-chart-3",
        })
    except Exception:
        pass

    try:
        recent = (
            EntryExitEvent.objects.select_related("user")
            .order_by("-event_time", "-id")[:3]
        )
        now = timezone.now()
        for e in recent:
            minutes = int(max(0, (now - e.event_time).total_seconds() // 60))
            when = "just now" if minutes < 1 else f"{minutes}m ago"
            evt = "Entry" if e.event_type == EntryExitEvent.EventType.ENTRY else "Exit"
            notifications.append({
                "type": "neutral",
                "title": f"{evt} recorded",
                "message": f"{e.user.username} • {e.event_time.strftime('%H:%M')}",
                "time": when,
                "icon": "activity",
            })
    except Exception:
        pass

    notifications = notifications[:6]
    return {
        "nav_notifications": notifications,
        "nav_notification_count": len(notifications),
    }
