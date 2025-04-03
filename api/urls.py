from django.urls import path
from . import views
from .views import analyze_symptoms, recommend_doctors, create_payment, home, about, signup_view, login_view, logout_view, diagnosis_page, appointments_page, doctors_page


urlpatterns = [
    path("about/", views.about, name="about_page"),
    path("diagnosis/", views.diagnosis_page, name="diagnosis_page"),
    path("appointments/", views.appointments_page, name="appointments_page"),
    path("doctors/", views.doctors_page, name="doctors_page"),  # If doctors.html exists
    path("login/", views.login_view, name="login_page"),
    path("signup/", views.signup_view, name="signup_page"),



    path('analyze_symptoms/', analyze_symptoms, name='analyze_symptoms'),
    path('recommend_doctors/', recommend_doctors, name='recommend_doctors'),
    path('create_payment/', create_payment, name='create_payment'),
]
