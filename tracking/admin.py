from django.contrib import admin

from .models import EntryExitEvent, LibrarySettings


@admin.register(LibrarySettings)
class LibrarySettingsAdmin(admin.ModelAdmin):
    list_display = ("library_name", "capacity_limit", "warning_threshold_percent", "updated_at")


@admin.register(EntryExitEvent)
class EntryExitEventAdmin(admin.ModelAdmin):
    list_display = ("user", "event_type", "event_time", "source", "gate")
    search_fields = ("user__username", "user__email", "gate")
    list_filter = ("event_type", "source")
    date_hierarchy = "event_time"
