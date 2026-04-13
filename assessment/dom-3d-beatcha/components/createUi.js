// import { createUi } from "../../interactiveProjectTemplate";
// Create a fixed UI container on left of the screen
// Figure out styling for mobile
export function createUi() {
  const UiContainer = createElement("div");
  UiContainer.id = "ui-container";
  UiContainer.style.backgroundcolor = "red";
  return UiContainer;
}
