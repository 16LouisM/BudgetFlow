document.addEventListener("DOMContentLoaded", function () {

  fetch("..finance-tracker-frontend/components/footer.html")
    .then(response => {
      if (!response.ok) {
        throw new Error("Footer not found");
      }
      return response.text();
    })
    .then(data => {
      document.getElementById("footer-container").innerHTML = data;

      const yearSpan = document.getElementById("year");
      if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
      }
    })
    .catch(error => console.error("Footer loading error:", error));

});
