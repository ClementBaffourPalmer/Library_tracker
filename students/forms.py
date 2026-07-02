from django import forms

from .models import Student


class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ["full_name", "index_number", "department", "level"]
        widgets = {
            "full_name": forms.TextInput(attrs={"class": "sl-input", "placeholder": "Full name"}),
            "index_number": forms.TextInput(attrs={"class": "sl-input", "placeholder": "Index number"}),
            "department": forms.TextInput(attrs={"class": "sl-input", "placeholder": "Department"}),
            "level": forms.TextInput(attrs={"class": "sl-input", "placeholder": "Level"}),
        }


class StudentImportForm(forms.Form):
    file = forms.FileField(
        label="Student file",
        help_text="Upload a CSV or XLSX file with headers: Full Name, Index Number, Department, Level.",
        widget=forms.ClearableFileInput(attrs={"class": "sl-input", "accept": ".csv,.xlsx"}),
    )


class AttendanceActionForm(forms.Form):
    action = forms.ChoiceField(
        choices=(("ENTRY", "Entry"), ("EXIT", "Exit")),
        widget=forms.Select(attrs={"class": "sl-input"}),
    )

