<p align="center">
  <img src="../assets/readme/banners/react.png" alt="React" width="100%">
</p>

# Arquitetura

O portal usa React, TypeScript, Vite e uma biblioteca visual distribuída por tarball local. Os documentos são validados ao carregar pelo módulo de conteúdo.

```mermaid
flowchart LR
 J[Documentos JSON] --> V[Validação e catálogo]
 V --> R[React e navegação]
 J --> P[Prerender de build]
 R --> D[dist]
 P --> D
 D --> C[Cloudflare Static Assets]
```

| Pasta ou arquivo | Papel |
|---|---|
| `src/content/` | Conteúdo por documento e idioma, manifesto e rodapé |
| `src/config/content/` | Carregamento e fallback |
| `src/features/document/` | Tipos, validação e ícones |
| `src/components/` | Layout, sumário e navegação |
| `scripts-prerender.mjs` | HTML das rotas conhecidas e página 404 |
| `wrangler.jsonc` | Build, assets e domínio |

As seções exigem identificadores únicos, e os links ficam limitados aos esquemas e caminhos aceitos pela validação, enquanto o prerender usa uma lista fixa de documentos, independente do manifesto. O portal não tem autenticação, banco nem API de negócio.