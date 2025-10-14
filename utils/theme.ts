export function getPageTheme() {
  const cs = getComputedStyle(document.body);
  const scheme = cs.getPropertyValue("background-color");
  if (scheme && scheme === "rgb(32, 33, 36)") return "light";
  if (scheme && scheme === "rgb(255, 255, 255)") return "dark";
  return getSystemTheme();
}

export function getSystemTheme() {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}
