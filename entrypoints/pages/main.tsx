import { render } from "solid-js/web";
import App from "./router";

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);

render(() => <App />, root);
