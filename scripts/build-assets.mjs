import { mkdir, copyFile, readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function copy(from, to) {
  await ensureDir(path.dirname(to));
  await copyFile(from, to);
}

async function main() {
  // Vendor libs for offline-friendly templates (no CDN).
  await copy(
    path.join(ROOT, "node_modules/chart.js/dist/chart.umd.min.js"),
    path.join(ROOT, "static/vendor/chartjs/chart.umd.min.js")
  );

  await copy(
    path.join(ROOT, "node_modules/lucide/dist/umd/lucide.min.js"),
    path.join(ROOT, "static/vendor/lucide/lucide.min.js")
  );

  // Inter font (css + woff2) from @fontsource.
  // Use `latin.css` to avoid referencing non-copied subsets.
  const interCssSrc = path.join(ROOT, "node_modules/@fontsource/inter/latin.css");
  const interCssDst = path.join(ROOT, "static/vendor/fonts/inter/latin.css");
  await copy(interCssSrc, interCssDst);

  // Copy only the font files referenced by the css (latin + latin-ext, woff2 + woff).
  const interFilesSrcDir = path.join(ROOT, "node_modules/@fontsource/inter/files");
  const interFilesDstDir = path.join(ROOT, "static/vendor/fonts/inter/files");
  await ensureDir(interFilesDstDir);

  const files = await readdir(interFilesSrcDir);
  const wanted = files.filter((f) => {
    if (!f.startsWith("inter-latin")) return false; // includes latin + latin-ext
    return f.endsWith(".woff2") || f.endsWith(".woff");
  });

  for (const f of wanted) {
    await copy(path.join(interFilesSrcDir, f), path.join(interFilesDstDir, f));
  }
}

await main();

