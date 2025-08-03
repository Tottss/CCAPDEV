module.exports = (req, res, next) => {
  res.locals.logoutScript = `
    <script>
      document.addEventListener("DOMContentLoaded", () => {
        const btn = document.getElementById("logoutbutton");
        if (btn) {
          btn.addEventListener("click", async (e) => {
            e.preventDefault();
            try {
              const response = await fetch("/api/user/logout", {
                method: "POST",
                credentials: "include"
              });
              if (response.ok) {
                window.location.href = "/login";
              } else {
                const errText = await response.text();
                alert("Logout failed. Server said: " + errText);
              }
            } catch (err) {
              console.error("Logout error:", err);
              alert("Error logging out.");
            }
          });
        }
      });
    </script>
  `;
  next();
};
