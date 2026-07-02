from django.urls import path

from . import views

urlpatterns = [
    path("entry/", views.record_entry, name="record_entry"),
    path("exit/", views.record_exit, name="record_exit"),
]
