import { getSystemTheme } from "@/utils/theme";
import type { JSX } from "solid-js";

import "@/assets/base.css";

export const renderToBody = (elem: JSX.Element) => {
  const theme = getSystemTheme();
  document.body.classList.add("searchtuner-container");
  document.body.setAttribute("data-theme", theme);
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
  render(() => elem, root);
};
