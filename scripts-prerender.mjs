import { readFile, writeFile, mkdir } from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const html = await readFile(new URL('dist/index.html', root), 'utf8');
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const renderItem = item => `<li>${escape(item)}</li>`;
const renderList = block => {
  const tag = block.ordered ? 'ol' : 'ul';
  return `<${tag}>` + block.items.map(renderItem).join('') + `</${tag}>`;
};
const renderBlock = block => {
  switch (block.type) {
    case 'paragraph': case 'note': return `<p>${escape(block.text)}</p>`;
    case 'heading': return `<h3>${escape(block.text)}</h3>`;
    case 'list': return renderList(block);
    case 'link': return `<p><a href="${escape(block.href)}">${escape(block.text)}</a></p>`;
    default: return '';
  }
};
const renderSection = section => {
  const body = section.blocks.map(renderBlock).join('');
  return `<section id="${escape(section.id)}"><h2>${escape(section.title)}</h2>` + body + '</section>';
};
for (const id of ['privacy','terms','cookies','google-calendar']) {
  const doc = JSON.parse(await readFile(new URL(`src/content/${id}/pt-BR.json`,root),'utf8'));
  const content = `<main><nav><a href="/">Início</a></nav><h1>${escape(doc.title)}</h1><p>${escape(doc.description)}</p>${doc.sections.map(renderSection).join('')}</main>`;
  const page=html.replace('<title>Solaria Docs</title>',`<title>${escape(doc.title)} | Solaria Docs</title>`).replace('content="Documentação pública do Solaria."',`content="${escape(doc.description)}"`).replace('<div id="root"></div>',`<div id="root">${content}</div>`);
  const dir=new URL(`dist/documentos/${id}/`,root); await mkdir(dir,{recursive:true}); await writeFile(new URL('index.html',dir),page);
}
const home='<main><h1>Solaria Docs</h1><h2>O que é o Solaria</h2><p>O Solaria é um marketplace de energia solar. Ele reúne consumidores, profissionais e fornecedores em um só lugar para comparar placas solares, encontrar profissionais qualificados, receber propostas e acompanhar projetos de instalação. É um projeto acadêmico, e as compras são fictícias.</p><p>Você pode criar uma conta com e-mail e senha ou entrar com Google ou Microsoft. Ao entrar com o Google, usamos apenas seu nome, e-mail e foto de perfil, somente para identificar você no Solaria.</p><nav aria-label="Documentos"><a href="/documentos/privacy/">Política de privacidade</a> · <a href="/documentos/terms/">Termos de uso</a> · <a href="/documentos/cookies/">Política de cookies</a> · <a href="/documentos/google-calendar/">Google Calendar</a></nav><p>Contato: <a href="mailto:solaria.innetwork@gmail.com">solaria.innetwork@gmail.com</a></p></main>';
const homePage = html.replace('content="Documentação pública do Solaria."','content="O Solaria é um marketplace de energia solar que reúne consumidores, profissionais e fornecedores. Documentação pública, política de privacidade e termos de uso."');
await writeFile(new URL('dist/index.html',root),homePage.replace('<div id="root"></div>',`<div id="root">${home}</div>`));
await writeFile(new URL('dist/404.html',root),'<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Página não encontrada | Solaria Docs</title><main><h1>Página não encontrada</h1><a href="/">Voltar ao início</a></main></html>');

// Aba Previews: /previews e uma cópia por idioma (/pt-BR/previews...), que é o endereço que os previews usam no cabeçalho.
const previews = JSON.parse(await readFile(new URL('src/content/previews.json', root), 'utf8'));
const previewItem = item => '<li><a href="/previews/' + escape(item.name) + '/">' + escape(item.title['pt-BR']) + '</a>: ' + escape(item.description['pt-BR']) + '</li>';
const previewsMain = '<main><nav><a href="/">Início</a></nav><h1>Previews</h1><ul>' + previews.map(previewItem).join('') + '</ul></main>';
const previewsPage = html.replace('<title>Solaria Docs</title>', '<title>Previews | Solaria Docs</title>').replace('<div id="root"></div>', '<div id="root">' + previewsMain + '</div>');
await Promise.all(['previews', 'pt-BR/previews', 'en-US/previews', 'es-ES/previews'].map(async path => {
  const dir = new URL('dist/' + path + '/', root);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL('index.html', dir), previewsPage);
}));
