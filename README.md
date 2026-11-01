# Solaria Docs

Portal público de documentação do Solaria, desenvolvido com React, Vite e @solaria.network/web-lib. Os documentos são JSON em `src/content/<documento>/<idioma>.json`, organizados por `src/content/manifest.json`, e os links do rodapé ficam em `src/content/footer.json`. A interface e os documentos estão disponíveis em português (pt-BR), inglês (en-US) e espanhol (es-ES). O idioma vem do cookie `solaria_language` ou do navegador, com pt-BR como padrão; os textos da interface ficam em `src/config/i18n/locales/<idioma>/docs.json`.

## Previews

A aba Previews (`/previews`, `/pt-BR/previews`, `/en-US/previews` e `/es-ES/previews`) lista os ambientes de preview (galerias e Storybooks) e abre cada um em `/previews/<repositório>/`. O Worker (`src/worker/`) serve o GitHub Pages por baixo desse caminho, só para os repositórios da lista, só em GET e HEAD e com os redirecionamentos mantidos dentro do portal. A última resposta boa de cada caminho fica guardada por 7 dias e é servida se o Pages falhar; sem cópia, o visitante vê uma página com o endereço direto.

A lista em `src/content/previews.json` vem do `gallery.json` da raiz de cada repositório (`scripts/previews-repos.json`): `npm run previews:sync` lê a `main` de cada um pelo endereço raw do GitHub (os repositórios são públicos) e `npm run previews:check` falha se a lista estiver desatualizada (roda no CI e todo dia no workflow `Previews Check`). Para incluir um preview, crie o `gallery.json` no repositório dele (nome igual ao do repositório, tipo `gallery` ou `storybook` e título e descrição nos três idiomas), acrescente o nome em `scripts/previews-repos.json` e rode o sync.

## Desenvolvimento

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm run build
npm run check
```

O build gera páginas HTML para as rotas conhecidas e uma página 404. O Worker usa Cloudflare Workers Static Assets e domínio próprio, sem dependência do cluster. Este repositório se chamava `web-docs`; o script na Cloudflare tem o mesmo nome do repositório (`worker-docs`), definido em `wrangler.jsonc`. A publicação é o workflow `Deploy` (manual), que roda o build e o `wrangler deploy` com os secrets `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` do repositório; o token (`workers-deploy`) é criado pelo Terraform no `infra-platform`. Se a integração GitHub da Cloudflare ainda estiver ligada no painel, ela publica em paralelo; desligue-a para deixar o workflow como único caminho. `npm run deploy` continua valendo para uma publicação local.

Os documentos legais e de integração contêm avisos de conteúdo pendente: não são políticas aprovadas nem documentação suficiente para verificação OAuth. PDFs podem ser colocados manualmente em `pdfs/` junto ao documento, mas download ainda não foi implementado. As traduções em inglês e espanhol são rascunhos e precisam de revisão antes da publicação.

A dependência web-lib é consumida diretamente pelo tarball em vendor/, gerado do pacote 0.5.0 com correção local no Canvas para não apagar o desenho em notificações de resize sem mudança de tamanho. A correção vive no repositório web-lib; após publicação, substituir o tarball pela versão corrigida do npm. O grid branco usa o Canvas original com composição CSS, sem outra implementação do pattern.
