from django.contrib import admin

from .models import AttendanceRecord, Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("full_name", "index_number", "department", "level", "date_added")
    search_fields = ("full_name", "index_number", "department", "level")
    list_filter = ("department", "level")
    ordering = ("full_name",)


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("student", "action", "timestamp")
    search_fields = ("student__full_name", "student__index_number")
    list_filter = ("action", "timestamp")
    date_hierarchy = "timestamp"

