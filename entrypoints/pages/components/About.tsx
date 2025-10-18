import { GitHub } from "@/component/icons/Github";

const About = () => {
  return (
    <div class="flex flex-col items-center gap-4">
      <h1 class="text-3xl font-bold tracking-tight">About</h1>
      <p class="text-sm">
        Version{" "}
        {browser.runtime.getManifest().version_name ??
          browser.runtime.getManifest().version}
      </p>
      <a
        href="https://github.com/ShoeBoom/SearchTuner"
        target="_blank"
        class="flex items-center gap-2 rounded bg-black px-4 py-2 text-white"
      >
        <GitHub />
        GitHub
      </a>
    </div>
  );
};

export default About;
