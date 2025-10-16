import { getSystemTheme } from "@/utils/theme";
import type { JSX } from "solid-js";

export const renderTo = (elem: JSX.Element, ref?: HTMLElement, t?: string) => {
  const theme = t ?? getSystemTheme();
  const container = ref ?? document.body;
  // document.body.classList.add("");
  // document.body.setAttribute("data-theme", theme);
  const root = document.createElement("div");
  root.id = "root";
  container.appendChild(root);
  render(
    () => (
      <div class="searchtuner-container" data-theme={theme}>
        {elem}
      </div>
    ),
    root,
  );
};
