from django.db import models
from django.utils import timezone


class Student(models.Model):
    full_name = models.CharField(max_length=200)
    index_number = models.CharField(max_length=60, unique=True)
    department = models.CharField(max_length=120, blank=True, null=True)
    level = models.CharField(max_length=40, blank=True, null=True)
    date_added = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["full_name", "index_number"]
        indexes = [
            models.Index(fields=["full_name"]),
            models.Index(fields=["index_number"]),
        ]

    def __str__(self) -> str:
        return f"{self.full_name} ({self.index_number})"


class AttendanceRecord(models.Model):
    class Action(models.TextChoices):
        ENTRY = "ENTRY", "Entry"
        EXIT = "EXIT", "Exit"

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="attendance_records",
    )
    action = models.CharField(max_length=5, choices=Action.choices)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-timestamp", "-id"]
        indexes = [
            models.Index(fields=["student", "timestamp"]),
            models.Index(fields=["action", "timestamp"]),
        ]

    def __str__(self) -> str:
        return f"{self.student.index_number} {self.action} @ {self.timestamp}"

