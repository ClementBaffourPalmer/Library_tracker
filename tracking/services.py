from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from django.contrib.auth import get_user_model
from django.db.models import Max
from django.utils import timezone

from .models import EntryExitEvent


User = get_user_model()


@dataclass(frozen=True)
class OccupancySnapshot:
    occupancy: int
    currently_inside_users: list[User]


def get_users_currently_inside() -> list[User]:
    latest = (
        EntryExitEvent.objects.values("user_id")
        .annotate(latest_time=Max("event_time"), latest_id=Max("id"))
        .values_list("user_id", "latest_id")
    )

    latest_ids = [row[1] for row in latest]
    if not latest_ids:
        return []

    inside_user_ids = (
        EntryExitEvent.objects.filter(id__in=latest_ids, event_type=EntryExitEvent.EventType.ENTRY)
        .values_list("user_id", flat=True)
        .distinct()
    )
    return list(User.objects.filter(id__in=list(inside_user_ids)).order_by("username"))


def get_current_occupancy_snapshot() -> OccupancySnapshot:
    users_inside = get_users_currently_inside()
    return OccupancySnapshot(occupancy=len(users_inside), currently_inside_users=users_inside)


def get_today_counts(now: datetime | None = None) -> tuple[int, int]:
    now = now or timezone.now()
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    qs = EntryExitEvent.objects.filter(event_time__gte=start, event_time__lte=now)
    entries = qs.filter(event_type=EntryExitEvent.EventType.ENTRY).count()
    exits = qs.filter(event_type=EntryExitEvent.EventType.EXIT).count()
    return entries, exits


def get_last_event_for_user(user) -> EntryExitEvent | None:
    return EntryExitEvent.objects.filter(user=user).order_by("-event_time", "-id").first()
