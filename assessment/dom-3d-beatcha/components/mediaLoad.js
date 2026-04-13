export async function mediaLoad() {
  const [url1, url2] = await Promise.all([loadImage(url1), loadImage(url2)]);

  const materialParams = {
    url1: "https://res.cloudinary.com/din8rv70n/image/upload/v1770920864/Screenshot_2026-02-12_at_18.27.12_qxhabx.png",
    url2: "https://res.cloudinary.com/din8rv70n/image/upload/v1770895670/Screenshot_2026-02-12_at_11.27.12_gbbgy6.png",
  };

  imageContainer.appendChild();

  const container = document.createElement("div");
  container.id = "container";

  return container;
}
