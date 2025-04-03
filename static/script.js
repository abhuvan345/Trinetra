document.addEventListener("DOMContentLoaded", function () {
    const textElement1 = document.getElementById("animatedText1");
    const textElement2 = document.getElementById("animatedText2");
    const extraText = document.getElementById("extraText");

    const text1Part1 = "Welcome to ";
    const text1Part2 = '<span class="gradient-text">Trinetra</span>'; // Trinetra with gradient
    const text2 = " Your Vision for Better Health Find Doctors, Anytime, Anywhere!";
    
    let index1 = 0, index2 = 0;

    function typeEffect1() {
        if (index1 < text1Part1.length) {
            textElement1.innerHTML += text1Part1.charAt(index1);
            index1++;
            setTimeout(typeEffect1, 100);
        } else {
            textElement1.innerHTML += text1Part2; // Instantly add the gradient word
            setTimeout(typeEffect2, 500);
        }
    }

    function typeEffect2() {
        if (index2 < text2.length) {
            textElement2.textContent += text2.charAt(index2);
            index2++;
            setTimeout(typeEffect2, 80);
        } else {
            setTimeout(() => {
                extraText.style.opacity = 1;
            }, 1000);
        }
    }

    textElement1.innerHTML = "";
    textElement2.textContent = "";
    extraText.style.opacity = 0;
    typeEffect1();
});


async function analyzeSymptoms() {
    const symptoms = document.getElementById("symptomsInput").value;
    const resultSection = document.getElementById("resultSection");
    const aiResult = document.getElementById("aiResult");
    const diseaseNameElement = document.getElementById("diseaseName");
    const homeRemedies = document.getElementById("homeRemedies");
    const doctorButton = document.getElementById("goToDoctors");

    if (symptoms.trim() === "") {
        alert("Please enter your symptoms.");
        return;
    }

    aiResult.innerHTML = "Analyzing symptoms... Please wait.";
    resultSection.style.display = "block";
    homeRemedies.style.display = "none";
    doctorButton.style.display = "none";

    try {
        const response = await fetch("http://127.0.0.1:8000/api/analyze/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symptoms: symptoms })
        });

        if (!response.ok) throw new Error("Server error!");

        const data = await response.json();
        const diagnosisStatus = data.message.status;
        const diseaseName = data.message.disease;
        const homeRemedy = data.message.home_remedies || "No specific home remedies available.";  

        let color;
        if (diagnosisStatus === "Critical") color = "red";
        else if (diagnosisStatus === "Moderate") color = "orange";
        else color = "green";

        aiResult.innerHTML = `<strong style="color: ${color};">Disease Status: ${diagnosisStatus}</strong>`;
        diseaseNameElement.innerHTML = `<strong>Disease Name:</strong> ${diseaseName}`;

        if (diagnosisStatus === "Mild") {
            homeRemedies.innerHTML = `<strong>Home Remedies:</strong> ${homeRemedy}`;
            homeRemedies.style.display = "block";
        } else {
            doctorButton.href = `doctors.html?disease=${encodeURIComponent(diseaseName)}`;
            doctorButton.style.display = "block";
        }

    } catch (error) {
        aiResult.innerHTML = "<strong style='color: red;'>Error fetching diagnosis. Please try again.</strong>";
        console.error("Error:", error);
    }
}


document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const doctorName = urlParams.get("doctor");
    const specialization = urlParams.get("specialization");
    const consultationFee = urlParams.get("fee");

    if (doctorName && specialization && consultationFee) {
        // Show the appointment confirmation section
        document.getElementById("appointmentDetails").style.display = "block";

        document.getElementById("doctorName").textContent = doctorName;
        document.getElementById("doctorSpecialization").textContent = specialization;
        document.getElementById("consultationFee").textContent = consultationFee;

        const advanceFee = (parseFloat(consultationFee) * 0.1).toFixed(2);
        document.getElementById("advanceFee").textContent = advanceFee;

        document.getElementById("payButton").addEventListener("click", function () {
            window.location.href = `payment.html?doctor=${encodeURIComponent(doctorName)}&fee=${advanceFee}`;
        });

    } else {
        // Show appointment history section if user directly accesses Appointments Page
        document.getElementById("appointmentHistory").style.display = "block";

        fetch("http://127.0.0.1:8000/api/appointments")  // Backend API for appointments
    .then(response => response.json())
    .then(data => {
        const currentList = document.getElementById("currentList");
        const historyList = document.getElementById("historyList");

        if (data.current.length > 0) {
            data.current.forEach(appointment => {
                let li = document.createElement("li");
                li.innerHTML = `<strong>${appointment.doctor}</strong> - ${appointment.date} at ${appointment.time}`;
                currentList.appendChild(li);
            });
        } else {
            currentList.innerHTML = `<p class="no-appointments">No current appointments. You are healthy! 🎉</p>`;
        }

        if (data.history.length > 0) {
            data.history.forEach(appointment => {
                let li = document.createElement("li");
                li.innerHTML = `<strong>${appointment.doctor}</strong> - ${appointment.date}`;
                historyList.appendChild(li);
            });
        } else {
            historyList.innerHTML = "<p>No past appointments.</p>";
        }
    })
    .catch(error => console.error("Error fetching appointments:", error));

    }
});

document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signupForm");

    signupForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent page refresh

        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const errorMsg = document.getElementById("error-msg");

        if (password !== confirmPassword) {
            errorMsg.textContent = "Passwords do not match!";
        } else {
            errorMsg.textContent = "";
            alert("Signup successful! Redirecting...");
            window.location.href = "index.html"; // Redirect after successful signup
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent page refresh

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        const errorMsg = document.getElementById("login-error-msg");

        if (email === "" || password === "") {
            errorMsg.textContent = "Please fill in all fields!";
        } else {
            errorMsg.textContent = "";
            alert("Login successful! Redirecting...");
            window.location.href = "index.html"; // Redirect after successful login
        }
    });
});
