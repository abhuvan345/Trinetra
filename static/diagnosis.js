document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 JavaScript Loaded!");

    // Ensure elements exist before using them
    const analyzeButton = document.getElementById("analyzeButton");
    const symptomsInput = document.getElementById("symptoms");
    const aiResult = document.getElementById("aiResult");
    const diseaseName = document.getElementById("diseaseName");
    const visitDoctor = document.getElementById("visitDoctor");
    const doctorSuggestions = document.getElementById("doctorSuggestions");
    const resultSection = document.getElementById("resultSection");

    if (!analyzeButton || !symptomsInput) {
        console.error("❌ Required elements not found! Check HTML IDs.");
        return;
    }

    analyzeButton.addEventListener("click", function () {
        console.log("🔍 Analyzing symptoms...");

        const symptoms = symptomsInput.value.trim();
        if (!symptoms) {
            alert("⚠️ Please enter symptoms before submitting.");
            return;
        }

        fetch("/api/analyze_symptoms/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symptoms }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`❌ HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("✅ API Response:", data);

            if (aiResult) aiResult.innerHTML = `Severity: <strong>${data.status}</strong>`;
            if (diseaseName) diseaseName.innerHTML = `Advice: ${data.advice}`;
            if (visitDoctor) visitDoctor.innerHTML = `Visit Doctor: ${data.visit_doctor ? "Yes" : "No"}`;

            if (doctorSuggestions) {
                doctorSuggestions.innerHTML = "<h3>Recommended Doctors:</h3>";
                data.suggested_doctors.forEach(doctor => {
                    doctorSuggestions.innerHTML += `<p>📍 ${doctor.name} (Lat: ${doctor.latitude}, Lon: ${doctor.longitude})</p>`;
                });
            }

            if (resultSection) resultSection.style.display = "block";
        })
        .catch(error => {
            console.error("❌ Error:", error);
            alert("An error occurred. Please try again.");
        });
    });
});
