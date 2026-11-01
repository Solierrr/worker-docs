// Junta o gallery.json de cada repositório na lista que a aba Previews mostra (src/content/previews.json).
const locales = ["pt-BR", "en-US", "es-ES"];
const kinds = ["gallery", "storybook"];

function localized(value, field, repo) {
  if (!value || typeof value !== "object") throw new Error(`${repo}: ${field} precisa ter um texto por idioma`);
  for (const locale of locales) {
    if (typeof value[locale] !== "string" || value[locale].trim() === "") {
      throw new Error(`${repo}: ${field} sem texto em ${locale}`);
    }
  }
  return Object.fromEntries(locales.map((locale) => [locale, value[locale]]));
}

export function mergePreviews(byRepo) {
  const seen = new Set();
  return Object.entries(byRepo).map(([repo, file]) => {
    if (!file || file.name !== repo) throw new Error(`${repo}: o campo "name" precisa ser o nome do repositório`);
    if (!kinds.includes(file.kind)) throw new Error(`${repo}: "kind" precisa ser gallery ou storybook`);
    if (seen.has(file.name)) throw new Error(`${repo}: nome repetido`);
    seen.add(file.name);
    return {
      name: file.name,
      kind: file.kind,
      title: localized(file.title, "title", repo),
      description: localized(file.description, "description", repo),
    };
  });
}
