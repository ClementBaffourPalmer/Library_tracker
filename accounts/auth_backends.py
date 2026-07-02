from __future__ import annotations

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

from .models import UserProfile


User = get_user_model()


class UsernameOrStudentIdBackend(ModelBackend):
    """
    Authenticate with either the Django username or the profile Student/Staff ID.

    Username matches win first so existing credentials keep their current behavior
    even if another user's student/staff identifier happens to have the same value.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        identifier = (username or kwargs.get(User.USERNAME_FIELD) or "").strip()
        if not identifier or password is None:
            return None

        user = (
            User._default_manager.filter(username__iexact=identifier)
            .select_related("profile")
            .first()
        )

        if user is None:
            profile = (
                UserProfile.objects.select_related("user")
                .filter(student_staff_id__iexact=identifier)
                .first()
            )
            user = profile.user if profile else None

        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
