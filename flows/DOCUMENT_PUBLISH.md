<p align="center">
  <img src="../assets/readme/banners/react.png" alt="React" width="100%">
</p>

# Publicação de conteúdo

O conteúdo JSON é validado e incluído no build antes da publicação no domínio público.

```mermaid
flowchart TD
 A[Revisa conteúdo e idiomas] --> B[Atualiza manifesto e prerender]
 B --> C[Typecheck e lint]
 C --> D[Build com HTML estático]
 D --> E[Wrangler publica dist]
 E --> F[Visitante consulta documento]
```

Um JSON inválido, a falta do tarball ou uma falha de build impedem a entrega, e a falta de autorização no Cloudflare impede a publicação, enquanto os documentos sem tradução usam o idioma padrão.