// Atualiza src/content/previews.json a partir do gallery.json da raiz de cada repositório de preview.
//   node scripts/sync-previews.mjs          grava a lista
//   node scripts/sync-previews.mjs --check  falha se a lista estiver desatualizada
// Os arquivos vêm da branch main de cada repositório (todos públicos), pelo endereço raw do GitHub.
import { readFileSync, writeFileSync } from "node:fs";
import { mergePreviews } from "./previews-merge.mjs";

const org = "Solierrr";
const listPath = new URL("../src/content/previews.json", import.meta.url);
const repos = JSON.parse(readFileSync(new URL("./previews-repos.json", import.meta.url), "utf8"));

async function load(repo) {
  const response = await fetch(`https://raw.githubusercontent.com/${org}/${repo}/main/gallery.json`);
  if (!response.ok) throw new Error(`${repo}: gallery.json respondeu ${response.status}`);
  return [repo, await response.json()];
}

const byRepo = Object.fromEntries(await Promise.all(repos.map(load)));

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
