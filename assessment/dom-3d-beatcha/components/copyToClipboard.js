async function writeClipboardText(text) {
  const copyEmail = document.querySelector("button");
  copyEmail.id = "copyToClipboard";
  copyEmail.text = "○bchatelbell@gmail.com";

  copyEmail.addEventListener("click", () =>
    writeClipboardText("hello@beachatel.studio"),
  );

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error(error.message);
  }
}

async function onClick(event) {
  const copied = document.getElementById("copied");
  const isCopied = copied.style.display === "none";
  copied.style.display = isCopied ? "block" : "none";
  console.log("copied");

  setTimeout(function onClick() {
    copied.style.display = "none";
  }, 1000); //
}
