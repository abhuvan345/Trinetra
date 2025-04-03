from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils import classify_symptom, find_nearby_doctors
import stripe
from django.conf import settings
from django.http import JsonResponse


@api_view(['POST'])
def analyze_symptoms(request):
    symptoms = request.data.get("symptoms", "")
    if not symptoms:
        return Response({"error": "Symptoms are required"}, status=400)

    result = classify_symptom(symptoms)

    if "Mild" in result:
        return Response({"status": "Mild", "advice": result})
    else:
        return Response({"status": "See a doctor", "message": result})


@api_view(['POST'])
def recommend_doctors(request):
    latitude = request.data.get("latitude")
    longitude = request.data.get("longitude")

    if not latitude or not longitude:
        return Response({"error": "Location is required"}, status=400)

    doctors = find_nearby_doctors(latitude, longitude)
    return Response({"doctors": doctors})


stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['POST'])
def create_payment_intent(request):
    try:
        amount = request.data.get("amount", 5000)  # Default: ₹50
        currency = "inr"

        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            payment_method_types=["card"]
        )

        return Response({"client_secret": intent.client_secret})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

from django.http import JsonResponse

def home(request):
    return JsonResponse({"message": "Welcome to Trinetra API!"})
