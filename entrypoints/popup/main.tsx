import { renderTo } from "@/utils/render";
import { ArrowUpDown, Settings, Info, Hash } from "lucide-solid";
import logo from "@/assets/icon.png";
import { type JSX } from "solid-js";

const basePagesUrl = browser.runtime.getURL("/pages.html") + "#";
const Button = (props: {
  path: string;
  icon: JSX.Element;
  text: string;
  hoverColor: `group-hover:${string}`;
}) => (
  <a
    href={basePagesUrl + props.path}
    target="_blank"
    class="group flex items-center gap-3 rounded-lg hover:underline"
  >
    <div
      class={`bg-foreground/10 rounded-md p-1.5 transition-colors ${props.hoverColor} group-hover:text-white`}
    >
      {props.icon}
    </div>
    <span class="text-sm">{props.text}</span>
  </a>
);

function App() {
  return (
    <div class="bg-background text-foreground flex h-full w-full min-w-[320px] flex-col gap-4 p-4">
      <div class="flex items-center gap-3">
        <img src={logo} alt="SearchTuner" class="h-10 w-10 rounded-lg" />
        <div class="flex flex-col">
          <h1 class="text-lg font-semibold">SearchTuner</h1>
          <p class="text-foreground/60 text-xs">
            Customize your search results
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-2 px-4">
        <Button
          path="/rankings"
          icon={<ArrowUpDown size={18} />}
          text="View Rankings"
          hoverColor="group-hover:bg-red-500"
        />
        <div class="pointer-events-none opacity-50">
          <Button
            path="/settings"
            icon={<Hash size={18} />}
            text="Bangs (coming soon)"
            hoverColor="group-hover:bg-yellow-500"
          />
        </div>

        <Button
          path="/settings"
          icon={<Settings size={18} />}
          text="Settings"
          hoverColor="group-hover:bg-green-600"
        />

        <Button
          path="/about"
          icon={<Info size={18} />}
          text="About"
          hoverColor="group-hover:bg-blue-500"
        />
      </div>
    </div>
  );
}

renderTo(<App />);
