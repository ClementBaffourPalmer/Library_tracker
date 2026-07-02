from __future__ import annotations

import csv

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_POST

from dashboard.views import _is_admin

from .forms import AttendanceActionForm, StudentForm, StudentImportForm
from .models import AttendanceRecord, Student
from .services import (
    get_attendance_snapshot,
    get_current_students_inside,
    get_student_analytics,
    get_student_attendance_history,
    import_students,
    record_student_action,
)


def _student_queryset(request: HttpRequest):
    query = (request.GET.get("q") or "").strip()
    queryset = Student.objects.all().order_by("full_name", "index_number")
    if query:
        queryset = queryset.filter(
            Q(full_name__icontains=query)
            | Q(index_number__icontains=query)
            | Q(department__icontains=query)
            | Q(level__icontains=query)
        )
    return query, queryset


@login_required
def student_list(request: HttpRequest) -> HttpResponse:
    if not _is_admin(request.user):
        return redirect("home")

    query, queryset = _student_queryset(request)
    paginator = Paginator(queryset, 10)
    page_obj = paginator.get_page(request.GET.get("page"))
    analytics = get_student_analytics()

    context = {
        "query": query,
        "page_obj": page_obj,
        "students": page_obj.object_list,
        "total_students": queryset.count(),
        "analytics": analytics,
    }
    return render(request, "students/student_list.html", context)


@login_required
def student_detail(request: HttpRequest, pk: int) -> HttpResponse:
    if not _is_admin(request.user):
        return redirect("home")

    student = get_object_or_404(Student, pk=pk)
    history = get_student_attendance_history(student, limit=20)
    current_inside = student in get_current_students_inside()

    return render(
        request,
        "students/student_detail.html",
        {
            "student": student,
            "history": history,
            "current_inside": current_inside,
        },
    )


@login_required
def student_create(request: HttpRequest) -> HttpResponse:
    if not _is_admin(request.user):
        return redirect("home")

    form = StudentForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Student created successfully.")
        return redirect("student_list")

    return render(request, "students/student_form.html", {"form": form, "mode": "Create"})


@login_required
def student_update(request: HttpRequest, pk: int) -> HttpResponse:
    if not _is_admin(request.user):
        return redirect("home")

    student = get_object_or_404(Student, pk=pk)
    form = StudentForm(request.POST or None, instance=student)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Student updated successfully.")
        return redirect("student_detail", pk=student.pk)

    return render(request, "students/student_form.html", {"form": form, "mode": "Edit", "student": student})


@login_required
def student_delete(request: HttpRequest, pk: int) -> HttpResponse:
    if not _is_admin(request.user):
        return redirect("home")

    student = get_object_or_404(Student, pk=pk)
    if request.method == "POST":
        student.delete()
        messages.success(request, "Student deleted successfully.")
        return redirect("student_list")

    return render(request, "students/student_confirm_delete.html", {"student": student})


@login_required
def student_import(request: HttpRequest) -> HttpResponse:
    if not _is_admin(request.user):
        return redirect("home")

    form = StudentImportForm(request.POST or None, request.FILES or None)
    summary = None
    if request.method == "POST" and form.is_valid():
        uploaded_file = form.cleaned_data["file"]
        try:
            summary = import_students(uploaded_file)
            messages.success(
                request,
                f"Imported {summary.successfully_imported} students. {summary.duplicates_skipped} duplicates skipped.",
            )
        except RuntimeError as exc:
            form.add_error("file", str(exc))
        except Exception as exc:  # pragma: no cover - defensive UI path
            form.add_error("file", f"Import failed: {exc}")

    return render(request, "students/student_import.html", {"form": form, "summary": summary})


@login_required
def student_sample_template(request: HttpRequest) -> HttpResponse:
    if not _is_admin(request.user):
        return redirect("home")

    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="student_import_template.csv"'
    writer = csv.writer(response)
    writer.writerow(["Full Name", "Index Number", "Department", "Level"])
    writer.writerow(["John Mensah", "ICT2024001", "ICT", "400"])
    writer.writerow(["Mary Owusu", "ICT2024002", "ICT", "300"])
    return response


@login_required
def attendance_board(request: HttpRequest) -> HttpResponse:
    if not _is_admin(request.user):
        return redirect("home")

    query = (request.GET.get("q") or "").strip()
    students = Student.objects.all().order_by("full_name", "index_number")
    if query:
        students = students.filter(
            Q(full_name__icontains=query)
            | Q(index_number__icontains=query)
            | Q(department__icontains=query)
            | Q(level__icontains=query)
        )

    snapshot = get_attendance_snapshot()
    analytics = get_student_analytics(limit=8)
    recent_history = get_student_attendance_history(limit=20)

    return render(
        request,
        "students/attendance_board.html",
        {
            "query": query,
            "students": students[:20],
            "snapshot": snapshot,
            "recent_history": recent_history,
            "analytics": analytics,
            "action_form": AttendanceActionForm(),
        },
    )


@login_required
@require_POST
def student_attendance_action(request: HttpRequest, pk: int, action: str) -> HttpResponse:
    if not _is_admin(request.user):
        return redirect("home")

    student = get_object_or_404(Student, pk=pk)
    action = action.upper()
    if action not in AttendanceRecord.Action.values:
        messages.error(request, "Invalid attendance action.")
        return redirect(request.META.get("HTTP_REFERER") or reverse("attendance_board"))

    record, message = record_student_action(student, action)
    if record:
        messages.success(request, message)
    else:
        messages.warning(request, message)
    return redirect(request.META.get("HTTP_REFERER") or reverse("attendance_board"))
