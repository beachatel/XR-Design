function toggleDarkMode() {
  const body = document.body;
  const button = document.getElementById("darkModeToggle");

  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    button.textContent = "toggleLightScreen()";
    localStorage.setItem("darkMode", "enabled");
  } else {
    button.textContent = "toggleDarkScreen()";
    localStorage.setItem("darkMode", "disabled");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;
  const button = document.getElementById("darkModeToggle");

  if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
    button.textContent = "toggleLightScreen()";
  } else {
    button.textContent = "toggleDarkScreen()";
  }
});
