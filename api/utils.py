import google.generativeai as genai
from django.conf import settings
import json
import re
import requests
import google.generativeai as genai

genai.configure(api_key="AIzaSyAETpUc0o7Ev2bxk5K48Bufo-a5oEE-s9M")


def classify_symptom(symptoms):
    model = genai.GenerativeModel("gemini-1.5-pro-latest")
    prompt = f"""
    Classify the severity of these symptoms: {symptoms}.
    Return a **valid JSON object** with:
    {{
      "status": "<Mild/Moderate/Severe>",
      "advice": "<Detailed explanation>"
    }}
    Ensure the response is strictly in JSON format without any extra text.
    """

    response = model.generate_content(prompt)

    response_text = response.text.strip()

    # 🔥 Remove triple backticks if present
    response_text = re.sub(r'```json|```', '', response_text).strip()

    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        return {
            "status": "Error",
            "advice": "Invalid AI response. Please try again."
        }

def find_nearby_doctors(latitude, longitude):
    url = f"https://nominatim.openstreetmap.org/search"
    params = {
        "q": "doctor",
        "format": "json",
        "limit": 5,
        "lat": latitude,
        "lon": longitude
    }

    response = requests.get(url, params=params)
    data = response.json()

    doctors = [
        {"name": place["display_name"], "latitude": place["lat"], "longitude": place["lon"]}
        for place in data
    ]

    return doctors
