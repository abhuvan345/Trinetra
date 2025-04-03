import google.generativeai as genai
import json
import re
from django.conf import settings

# Configure Google AI
genai.configure(api_key=settings.GOOGLE_GEMINI_API_KEY)


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
    response_text = re.sub(r'```json|```', '', response.text.strip()).strip()

    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        return {"status": "Error", "advice": "Invalid AI response. Please try again."}
