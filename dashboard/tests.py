from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from accounts.models import UserProfile


User = get_user_model()


class AddUserViewTests(TestCase):
    def test_add_user_updates_existing_profile_created_by_signal(self):
        admin = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="pass1234",
        )
        self.client.force_login(admin)

        response = self.client.post(
            reverse("add_user"),
            {
                "username": "student3",
                "email": "student3@example.com",
                "password": "pass1234",
                "role": "USER",
                "student_staff_id": "STU-3001",
                "is_active": "1",
            },
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.headers["Location"], reverse("users"))

        created_user = User.objects.get(username="student3")
        profiles = UserProfile.objects.filter(user=created_user)

        self.assertEqual(profiles.count(), 1)
        self.assertEqual(created_user.profile.student_staff_id, "STU-3001")
        self.assertEqual(created_user.profile.role, UserProfile.Role.USER)
