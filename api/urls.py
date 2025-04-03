from django.urls import path
from .views import analyze_symptoms, recommend_doctors, create_payment_intent

urlpatterns = [
    path('analyze/', analyze_symptoms, name='analyze_symptoms'),
    path('doctors/', recommend_doctors, name='recommend_doctors'),
    path('payment/', create_payment_intent, name='create_payment'),
]
