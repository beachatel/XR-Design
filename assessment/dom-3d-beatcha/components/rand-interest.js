let interests = [
  "p5.js",
  "web design",
  "machine learning",
  "creative coding",
  "data visualisation",
  "data science",
  "urban analytics",
  "design",
  "motion design",
  "animation",
  "visual programming",
  "processing",
  "audio visual",
  "javascript",
  "ux & web accesibility",
];

document.addEventListener("DOMContentLoaded", () => {
  const output = document.querySelector("#output");

  function changeInterest() {
    output.innerHTML = interests[Math.floor(Math.random() * interests.length)];
  }

  changeInterest();

  setInterval(changeInterest, 250);
});
