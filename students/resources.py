from __future__ import annotations

from .models import Student

try:  # pragma: no cover - optional dependency
    from import_export import resources
except Exception:  # pragma: no cover - optional dependency
    resources = None


if resources is not None:  # pragma: no cover - optional dependency
    class StudentResource(resources.ModelResource):
        class Meta:
            model = Student
            fields = ("full_name", "index_number", "department", "level", "date_added")

