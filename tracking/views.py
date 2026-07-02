from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect
from django.utils import timezone

from .models import EntryExitEvent
from .services import get_last_event_for_user


def _is_admin(user) -> bool:
    if not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    try:
        return getattr(user.profile, "role", "USER") == "ADMIN"
    except Exception:
        return False


def _safe_next_url(request: HttpRequest) -> str | None:
    next_url = request.POST.get("next") or request.GET.get("next")
    if not next_url:
        return None
    if next_url.startswith("/") and not next_url.startswith("//"):
        return next_url
    return None


@login_required
def record_entry(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return redirect("user_dashboard")

    last = get_last_event_for_user(request.user)
    if last and last.event_type == EntryExitEvent.EventType.ENTRY:
        return redirect(_safe_next_url(request) or ("admin_dashboard" if _is_admin(request.user) else "user_dashboard"))

    EntryExitEvent.objects.create(
        user=request.user,
        event_type=EntryExitEvent.EventType.ENTRY,
        event_time=timezone.now(),
        source=EntryExitEvent.Source.WEB_MANUAL,
    )
    return redirect(_safe_next_url(request) or ("admin_dashboard" if _is_admin(request.user) else "user_dashboard"))


@login_required
def record_exit(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return redirect("user_dashboard")

    last = get_last_event_for_user(request.user)
    if last and last.event_type == EntryExitEvent.EventType.EXIT:
        return redirect(_safe_next_url(request) or ("admin_dashboard" if _is_admin(request.user) else "user_dashboard"))

    EntryExitEvent.objects.create(
        user=request.user,
        event_type=EntryExitEvent.EventType.EXIT,
        event_time=timezone.now(),
        source=EntryExitEvent.Source.WEB_MANUAL,
    )
    return redirect(_safe_next_url(request) or ("admin_dashboard" if _is_admin(request.user) else "user_dashboard"))
