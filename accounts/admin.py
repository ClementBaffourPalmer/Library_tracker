from django.contrib import admin

from .models import RFIDCard, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "student_staff_id", "created_at")
    search_fields = ("user__username", "user__email", "student_staff_id")
    list_filter = ("role",)


@admin.register(RFIDCard)
class RFIDCardAdmin(admin.ModelAdmin):
    list_display = ("tag_uid", "user", "active", "issued_at")
    search_fields = ("tag_uid", "user__username", "user__email")
    list_filter = ("active",)
