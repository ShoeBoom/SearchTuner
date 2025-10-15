import { render } from "solid-js/web";
import App from "./app";

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);

render(() => <App />, root);
