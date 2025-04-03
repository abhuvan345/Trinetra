from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
import razorpay
import requests
import json
import re
import google.generativeai as genai
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY, settings.RAZORPAY_SECRET))

# Configure Google AI for symptom analysis
genai.configure(api_key=settings.GOOGLE_GEMINI_API_KEY)

# Serve the HTML page



@api_view(['POST'])
def analyze_symptoms(request):
    symptoms = request.data.get("symptoms", "")

    if not symptoms:
        return Response({"error": "Symptoms are required"}, status=400)

    result = classify_symptom(symptoms)

    if not isinstance(result, dict):  # Ensure result is a valid dictionary
        return Response({"error": "Invalid AI response format."}, status=500)

    severity = result.get("status", "Unknown")
    advice = result.get("advice", "No advice available.")

    visit_doctor = {
        "Mild": False,
        "Moderate": "Optional – Monitor symptoms and visit if needed",
        "Severe": True
    }.get(severity, "Unknown")

    suggested_doctors = []

    # If the condition is Severe, fetch nearby doctors (using a sample location)
    if visit_doctor is True:
        sample_lat = 12.9716
        sample_lon = 77.5946

        doctors = find_doctors(sample_lat, sample_lon)

        if isinstance(doctors, list) and len(doctors) > 0:
            suggested_doctors = doctors[:3]  # Pick the first 3 doctors

    return Response({
        "status": severity,
        "advice": advice,
        "visit_doctor": visit_doctor,
        "suggested_doctors": suggested_doctors
    })


@api_view(['POST'])
def recommend_doctors(request):
    latitude = request.data.get("latitude")
    longitude = request.data.get("longitude")

    if not latitude or not longitude:
        return JsonResponse({"error": "Location is required"}, status=400)

    doctors = find_doctors(latitude, longitude)
    return JsonResponse({"doctors": doctors})


@api_view(['POST'])
def create_payment(request):
    try:
        amount = int(request.data.get("amount", 500)) * 100  # Convert to paise
        payment_order = razorpay_client.order.create({
            "amount": amount,
            "currency": "INR",
            "payment_capture": "1"
        })
        return JsonResponse({"order_id": payment_order["id"]})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def find_doctors(lat, lon):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": "doctor",
        "format": "json",
        "limit": 10,
        "dedupe": 1,
        "viewbox": f"{lon - 0.05},{lat + 0.05},{lon + 0.05},{lat - 0.05}",
        "bounded": 0
    }

    headers = {'User-Agent': 'Mozilla/5.0'}
    response = requests.get(url, params=params, headers=headers)

    if response.status_code == 200:
        data = response.json()
        doctors = [
            {
                "name": item.get("display_name", "Unknown"),
                "latitude": item.get("lat"),
                "longitude": item.get("lon"),
            }
            for item in data
        ]
        return doctors

    return {"error": "Failed to fetch doctors"}




def classify_symptom(symptoms):
    model = genai.GenerativeModel("gemini-1.5-pro-latest")
    prompt = f"""
    Classify the severity of these symptoms: {symptoms}.
    Return a **valid JSON object** with:
    {{"status": "<Mild/Moderate/Severe>", "advice": "<Detailed explanation>"}}
    Ensure the response is **strictly in JSON format without any extra text**.
    """

    response = model.generate_content(prompt)

    # 🔹 Ensure response is properly cleaned before JSON parsing
    response_text = response.text.strip()
    response_text = re.sub(r'```json|```', '', response_text).strip()

    try:
        result = json.loads(response_text)  # Convert string to JSON
        if isinstance(result, dict):  # Ensure it's a dictionary
            return result
    except json.JSONDecodeError:
        pass  # Fall back to default error handling

    return {"status": "Unknown", "advice": "AI response could not be parsed."}




def signup_view(request):
    if request.method == "POST":
        full_name = request.POST.get("full_name")
        email = request.POST.get("email")
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirm_password")

        if password != confirm_password:
            messages.error(request, "Passwords do not match!")
            return redirect("signup")

        if User.objects.filter(username=email).exists():
            messages.error(request, "Email is already registered!")
            return redirect("signup")

        # Create User
        user = User.objects.create_user(username=email, email=email, password=password)
        user.first_name = full_name
        user.save()

        messages.success(request, "Account created successfully! Please log in.")
        return redirect("login")

    return render(request, "signup.html")

def login_view(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")

        user = authenticate(request, username=email, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, "Login successful!")
            return redirect("home")
        else:
            messages.error(request, "Invalid credentials!")

    return render(request, "login.html")

def logout_view(request):
    logout(request)
    messages.success(request, "You have logged out successfully!")
    return redirect("login")


def home(request):
    return render(request, "index.html")

def about(request):
    return render(request, "about.html")

def diagnosis_page(request):
    return render(request, "diagnosis.html")

def appointments_page(request):
    return render(request, "appoitments.html")

def doctors_page(request):
    return render(request, "doctors.html")