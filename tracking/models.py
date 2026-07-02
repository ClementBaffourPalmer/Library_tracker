from django.conf import settings
from django.db import models
from django.utils import timezone


class LibrarySettings(models.Model):
    library_name = models.CharField(max_length=200, default="University Library")
    capacity_limit = models.PositiveIntegerField(default=500)
    warning_threshold_percent = models.PositiveIntegerField(default=80)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self) -> str:
        return f"{self.library_name} (cap={self.capacity_limit})"


class EntryExitEvent(models.Model):
    class EventType(models.TextChoices):
        ENTRY = "ENTRY", "Entry"
        EXIT = "EXIT", "Exit"

    class Source(models.TextChoices):
        WEB_MANUAL = "WEB_MANUAL", "Web Manual"
        ADMIN_OVERRIDE = "ADMIN_OVERRIDE", "Admin Override"
        RFID = "RFID", "RFID"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="library_events",
    )
    event_type = models.CharField(max_length=5, choices=EventType.choices)
    event_time = models.DateTimeField(default=timezone.now)
    source = models.CharField(max_length=20, choices=Source.choices, default=Source.WEB_MANUAL)
    gate = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-event_time", "-id"]
        indexes = [
            models.Index(fields=["event_time"]),
            models.Index(fields=["user", "event_time"]),
            models.Index(fields=["event_type", "event_time"]),
        ]

    def __str__(self) -> str:
        return f"{self.user.username} {self.event_type} @ {self.event_time}"
