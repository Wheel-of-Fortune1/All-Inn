// Wait for DOM to load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Get logged-in user info
    const res = await fetch("/api/auth/me", { credentials: "include" });
    const user = await res.json();
    console.log("User from /api/auth/me:", user);

    const adminPanel = document.getElementById("adminPanel");

    // Redirect non-admins to home
    if (!user || user.role !== "admin") {
      window.location.href = "home.html";
      return;
    }

    // Show admin panel for admins
    adminPanel.style.display = "block";

    // Ban button logic
    document.getElementById("banBtn").onclick = async () => {
      const username = document.getElementById("username").value.trim();
      if (!username) return alert("Enter a username");

      try {
        const res = await fetch("/api/admin/ban", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username })
        });

        const data = await res.json();
        document.getElementById("msg").textContent = data.message || data.error;
      } catch (err) {
        console.error(err);
        document.getElementById("msg").textContent = "Error banning user";
      }
    };

    // Unban button logic
    document.getElementById("unbanBtn").onclick = async () => {
      const username = document.getElementById("username").value.trim();
      if (!username) return alert("Enter a username");

      try {
        const res = await fetch("/api/admin/unban", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username })
        });

        const data = await res.json();
        document.getElementById("msg").textContent = data.message || data.error;
      } catch (err) {
        console.error(err);
        document.getElementById("msg").textContent = "Error unbanning user";
      }
    };
    document.getElementById("homeBtn").onclick = () => {
      window.location.href = "home.html";
    };


  } catch (err) {
    console.error("Admin check failed:", err);
    window.location.href = "home.html";
  }
});

