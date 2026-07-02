from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone


class UserProfile(models.Model):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        USER = "USER", "User"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.USER)
    student_staff_id = models.CharField(max_length=50, blank=True, null=True, unique=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self) -> str:
        return f"{self.user.username} ({self.role})"


class RFIDCard(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="rfid_cards",
    )
    tag_uid = models.CharField(max_length=100, unique=True)
    active = models.BooleanField(default=True)
    issued_at = models.DateTimeField(default=timezone.now)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                condition=Q(active=True),
                name="unique_active_rfid_per_user",
            )
        ]

    def __str__(self) -> str:
        return f"{self.tag_uid} -> {self.user.username}"
