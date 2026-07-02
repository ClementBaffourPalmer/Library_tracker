from django.contrib.auth import authenticate, get_user_model
from django.test import TestCase


User = get_user_model()


class UsernameOrStudentIdBackendTests(TestCase):
    def test_authenticates_with_username(self):
        user = User.objects.create_user(username="student1", password="pass1234")

        authenticated = authenticate(username="student1", password="pass1234")

        self.assertEqual(authenticated, user)

    def test_authenticates_with_student_staff_id(self):
        user = User.objects.create_user(username="student2", password="pass1234")
        user.profile.student_staff_id = "STU-2001"
        user.profile.save(update_fields=["student_staff_id"])

        authenticated = authenticate(username="STU-2001", password="pass1234")

        self.assertEqual(authenticated, user)
