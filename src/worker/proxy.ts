// Proxy dos previews: docs.solarianetwork.site/previews/<repositório>/... serve o GitHub Pages por baixo.
// O portal continua no ar se o Pages cair: a última resposta boa de cada caminho fica guardada e é servida
// quando o Pages falha (stale-if-error).

export const upstreamOrigin = "https://solierrr.github.io";
const pathPrefix = "/previews/";
const freshSeconds = 300;
const staleSeconds = 7 * 24 * 60 * 60;

export interface ProxyDeps {
  fetchUpstream: (url: string, init: RequestInit) => Promise<Response>;
  cache: { match: (key: string) => Promise<Response | undefined>; put: (key: string, response: Response) => Promise<void> };
}

export interface PreviewTarget {
  repository: string;
  rest: string;
  search: string;
}

// Separa /previews/<repo>/<resto> e confere o repositório contra a lista publicada
export function resolveTarget(url: URL, allowed: ReadonlySet<string>): PreviewTarget | null {
  if (!url.pathname.startsWith(pathPrefix)) return null;
  const [repository, ...parts] = url.pathname.slice(pathPrefix.length).split("/");
  if (!repository || !allowed.has(repository)) return null;
  return { repository, rest: parts.length ? `/${parts.join("/")}` : "", search: url.search };
}

export function upstreamUrl(target: PreviewTarget): string {
  return `${upstreamOrigin}/${target.repository}${target.rest || "/"}${target.search}`;
}

// O Pages responde 301 com endereço absoluto do github.io; o visitante precisa continuar no portal
export function rewriteLocation(location: string, target: PreviewTarget): string {
  let parsed: URL;
  try {
    parsed = new URL(location, upstreamOrigin);
  } catch {
    return `${pathPrefix}${target.repository}/`;
  }
  const base = `/${target.repository}`;
  if (parsed.origin !== upstreamOrigin || (parsed.pathname !== base && !parsed.pathname.startsWith(`${base}/`))) {
    return `${pathPrefix}${target.repository}/`;
  }
  return `${pathPrefix}${target.repository}${parsed.pathname.slice(base.length) || "/"}${parsed.search}${parsed.hash}`;
}

export function unavailablePage(target: PreviewTarget): Response {
  const direct = `${upstreamOrigin}/${target.repository}/`;
  const body = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Preview indisponível</title><main style="font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem"><h1>Preview indisponível</h1><p>O GitHub Pages não respondeu e ainda não há uma cópia guardada deste preview. Tente de novo em alguns minutos ou abra o endereço direto.</p><p><a href="${direct}">${direct}</a></p><p><a href="/previews">Voltar para os previews</a></p></main></html>`;
  return new Response(body, { status: 502, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

function withHeaders(response: Response, extra: Record<string, string>): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(extra)) headers.set(name, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

const staleKey = (url: string) => `https://previews.invalid/stale/${encodeURIComponent(url)}`;

export async function handlePreview(request: Request, target: PreviewTarget, deps: ProxyDeps): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });
  }
  // /previews/<repo> sem barra final: os caminhos relativos do preview só funcionam com a barra
  if (!target.rest) {
    return new Response(null, { status: 308, headers: { location: `${pathPrefix}${target.repository}/${target.search}` } });
  }

  const url = upstreamUrl(target);
  let upstream: Response | undefined;
  try {
    upstream = await deps.fetchUpstream(url, {
      method: request.method,
      redirect: "manual",
      headers: { accept: request.headers.get("accept") ?? "*/*", "accept-language": request.headers.get("accept-language") ?? "" },
    });
  } catch {
    upstream = undefined;
  }

  if (upstream && upstream.status >= 300 && upstream.status < 400) {
    const location = upstream.headers.get("location");
    return new Response(null, { status: upstream.status, headers: { location: rewriteLocation(location ?? "", target) } });
  }

  if (upstream && upstream.status < 500) {
    if (upstream.ok && request.method === "GET") {
      await deps.cache.put(staleKey(url), withHeaders(upstream.clone(), { "cache-control": `public, max-age=${staleSeconds}` }));
    }
    return withHeaders(upstream, { "cache-control": `public, max-age=${freshSeconds}`, "x-preview-source": "pages" });
  }

  const stale = await deps.cache.match(staleKey(url));
  if (stale) return withHeaders(stale, { "cache-control": "public, max-age=60", "x-preview-source": "stale" });
  return unavailablePage(target);
}
