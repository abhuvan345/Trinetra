document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("diagnosisForm");
    const symptomsInput = document.getElementById("symptomsInput");
    const analyzeButton = document.getElementById("analyzeButton");

    const aiResult = document.getElementById("aiResult");
    const diseaseName = document.getElementById("diseaseName");
    const visitDoctor = document.getElementById("visitDoctor");
    const doctorSuggestions = document.getElementById("doctorSuggestions");
    const resultSection = document.getElementById("resultSection");
    const goToDoctors = document.getElementById("goToDoctors");

    // Enable button only when input is not empty
    symptomsInput.addEventListener("input", function () {
        analyzeButton.disabled = symptomsInput.value.trim() === "";
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        const symptoms = symptomsInput.value.trim();
        if (!symptoms) return;

        // Fetch CSRF token
        const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;

        fetch("/api/analyze_symptoms/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({ symptoms: symptoms })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            aiResult.textContent = data.status || "Unknown";
            diseaseName.textContent = data.advice || "No advice available.";
            visitDoctor.textContent = data.visit_doctor || "Unknown";

            // Display doctor suggestions if any
            doctorSuggestions.innerHTML = "";
            if (data.suggested_doctors && data.suggested_doctors.length > 0) {
                doctorSuggestions.innerHTML = "<h4>Suggested Doctors:</h4>";
                data.suggested_doctors.forEach(doctor => {
                    doctorSuggestions.innerHTML += `<p>${doctor.name} - ${doctor.specialization}</p>`;
                });
                goToDoctors.style.display = "block";
            } else {
                goToDoctors.style.display = "none";
            }

            resultSection.style.display = "block";
        })
        .catch(error => console.error("Error:", error));
    });
});
