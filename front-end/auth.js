// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function () {
    const signInBtn = document.getElementById("signInBtn");
    const signUpBtn = document.getElementById("signUpBtn");
    const authForm = document.getElementById("authForm");
    const errorMsg = document.getElementById("errorMsg");

    let mode = null;
    // Sign In button listener
    signInBtn.addEventListener("click", function (e) {
        e.preventDefault();
       
        authForm.classList.add('show');
        mode = "signin";
        errorMsg.textContent = "";
        authForm.username.focus();
    });
    // Sign Up button listener
    signUpBtn.addEventListener("click", function (e) {
        e.preventDefault();

        authForm.classList.add('show');
        mode = "signup";
        errorMsg.textContent = "";
        authForm.username.focus();
    });
    // Form submission listener
    authForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (!mode) {
            errorMsg.textContent = "Please select Sign In or Sign Up first";
            return;
        }

        const username = authForm.username.value.trim();
        const password = authForm.password.value;

        if (!username || !password) {
            errorMsg.textContent = "Please fill in all fields";
            return;
        }

        errorMsg.textContent = "Processing...";
        errorMsg.style.color = "#51cf66";

        try {
            const res = await fetch(`/api/auth/${mode}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                errorMsg.textContent = `${mode === "signin" ? "Signed in" : "Account created"} successfully!`;
                errorMsg.style.color = "#51cf66";

           
                setTimeout(() => {
                    window.location.href = "home.html";
                }, 1000);
            } else {
                errorMsg.style.color = "#ff6b6b";
                errorMsg.textContent = data.error || "Something went wrong";
            }
        } catch (err) {
            console.error("Error:", err);
            errorMsg.style.color = "#ff6b6b";
            errorMsg.textContent = "Network error - Unable to connect to server";
        }
    });

    console.log("Event listeners attached successfully");
});