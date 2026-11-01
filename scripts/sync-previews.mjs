// Atualiza src/content/previews.json a partir do gallery.json da raiz de cada repositório de preview.
//   node scripts/sync-previews.mjs          grava a lista
//   node scripts/sync-previews.mjs --check  falha se a lista estiver desatualizada
// Os arquivos vêm da branch main de cada repositório, pela CLI do GitHub (gh).
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { mergePreviews } from "./previews-merge.mjs";

const org = "Solierrr";
const listPath = new URL("../src/content/previews.json", import.meta.url);
const repos = JSON.parse(readFileSync(new URL("./previews-repos.json", import.meta.url), "utf8"));

const byRepo = {};
for (const repo of repos) {
  const raw = execFileSync(
    "gh",
    ["api", "-H", "Accept: application/vnd.github.raw", `repos/${org}/${repo}/contents/gallery.json?ref=main`],
    { encoding: "utf8" },
  );
  byRepo[repo] = JSON.parse(raw);
}

const next = `${JSON.stringify(mergePreviews(byRepo), null, 2)}\n`;
if (process.argv.includes("--check")) {
  if (next !== readFileSync(listPath, "utf8")) {
    console.error("previews.json está desatualizado: rode `npm run previews:sync`.");
    process.exit(1);
  }
  console.log("previews.json está em dia.");
} else {
  writeFileSync(listPath, next);
  console.log("previews.json atualizado.");
}
