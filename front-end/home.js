// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ home.js loaded and DOM ready");

  async function checkRole() {
    try {
      console.log("Calling /api/auth/me...");
      const res = await fetch("/api/auth/me", { credentials: "include" });
      console.log("Response status:", res.status);

      const user = await res.json();
      console.log("User role check:", user);

      // Show admin button if user is admin
      if (user.role === "admin") {
        console.log("✅ Admin detected, showing button");
        document.getElementById("adminBtn").style.display = "inline-block";
      } else {
        // Hide admin button for non-admins
        console.log("❌ Not admin, hiding button");
        document.getElementById("adminBtn").style.display = "none";
      }
    } catch (err) {
      console.error("Role check failed", err);
    }
  }
  // Initial role check on page load
  checkRole();
});
