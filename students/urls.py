from django.urls import path

from . import views

urlpatterns = [
    path("", views.student_list, name="student_list"),
    path("add/", views.student_create, name="student_add"),
    path("<int:pk>/", views.student_detail, name="student_detail"),
    path("<int:pk>/edit/", views.student_update, name="student_edit"),
    path("<int:pk>/delete/", views.student_delete, name="student_delete"),
    path("import/", views.student_import, name="student_import"),
    path("import/template.csv", views.student_sample_template, name="student_sample_template"),
    path("attendance/", views.attendance_board, name="attendance_board"),
    path("attendance/<int:pk>/<str:action>/", views.student_attendance_action, name="student_attendance_action"),
]

