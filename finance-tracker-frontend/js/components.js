async function loadFooter() {
    const response = await fetch("components/footer.html");
    const data = await response.text();
    document.getElementById("footer").innerHTML = data;

    const year = document.getElementById("year");
    if (year) {
        year.textContent = new Date().getFullYear();
    }
}

document.addEventListener("DOMContentLoaded", loadFooter);
