<p align="center">
  <img src="../assets/readme/banners/react.png" alt="React" width="100%">
</p>

# Deploy

O Worker publica o portal no domínio próprio `docs.solarianetwork.site`, serve a pasta `dist/` gerada pelo build com página 404 própria e não depende do cluster GKE. O endereço `workers.dev` fica desligado, e o script na Cloudflare tem o mesmo nome do repositório, `worker-docs`, como define o [`wrangler.jsonc`](https://github.com/Solierrr/worker-docs/blob/main/wrangler.jsonc).

A publicação é feita pelo workflow manual `Deploy`, que gera o build e executa `npm run deploy` com os segredos `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` do repositório, criados pelo Terraform no `infra-platform`. Enquanto a integração da Cloudflare com o GitHub estiver ligada no painel, ela também publica a cada mudança, por isso o caminho único depende de desligá-la. O procedimento comum aos Workers está em [CLOUDFLARE_WORKER.md](https://github.com/Solierrr/docs-warehouse/blob/main/readme/deploy/CLOUDFLARE_WORKER.md).

O domínio está no ar, e os textos publicados ainda estão em revisão editorial e legal.
