document.addEventListener("DOMContentLoaded", function () {
    // Ensure elements exist before using them
    const symptomsInput = document.getElementById("symptomsInput");
    const analyzeButton = document.getElementById("analyzeButton");
    const resultSection = document.getElementById("resultSection");
    const aiResult = document.getElementById("aiResult");
    const diseaseName = document.getElementById("diseaseName");
    const visitDoctor = document.getElementById("visitDoctor");
    const doctorSuggestions = document.getElementById("doctorSuggestions");
    const goToDoctors = document.getElementById("goToDoctors");
    const diagnosisForm = document.getElementById("diagnosisForm");

    if (diagnosisForm) {
        diagnosisForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            if (!symptomsInput) return;
            const symptoms = symptomsInput.value.trim();

            if (!symptoms) {
                alert("Please enter your symptoms.");
                return;
            }

            analyzeButton.disabled = true;
            analyzeButton.innerText = "Analyzing...";

            try {
                const response = await fetch("/api/analyze_symptoms/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCSRFToken(),
                    },
                    body: JSON.stringify({ symptoms }),
                });

                const data = await response.json();

                if (response.ok) {
                    aiResult.textContent = data.status || "Unknown";
                    diseaseName.textContent = data.advice || "No advice available";
                    visitDoctor.textContent = data.visit_doctor || "Unknown";

                    doctorSuggestions.innerHTML = "";
                    if (Array.isArray(data.suggested_doctors) && data.suggested_doctors.length > 0) {
                        data.suggested_doctors.forEach((doctor) => {
                            const doctorItem = document.createElement("p");
                            doctorItem.textContent = doctor.name;
                            doctorSuggestions.appendChild(doctorItem);
                        });
                        goToDoctors.style.display = "inline-block";
                    } else {
                        goToDoctors.style.display = "none";
                    }

                    resultSection.style.display = "block";
                } else {
                    alert(data.error || "Failed to analyze symptoms.");
                }
            } catch (error) {
                alert("An error occurred. Please try again.");
            } finally {
                analyzeButton.disabled = false;
                analyzeButton.innerText = "Analyze Symptoms";
            }
        });
    }

    // Function to get CSRF token from cookies
    function getCSRFToken() {
        const cookies = document.cookie.split("; ");
        for (const cookie of cookies) {
            const [name, value] = cookie.split("=");
            if (name === "csrftoken") return value;
        }
        return "";
    }
});
