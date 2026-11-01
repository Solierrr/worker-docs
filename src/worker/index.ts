import previews from "../content/previews.json";
import { handlePreview, resolveTarget } from "./proxy";

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

interface WorkerCache {
  match: (request: string) => Promise<Response | undefined>;
  put: (request: string, response: Response) => Promise<void>;
}

const allowed: ReadonlySet<string> = new Set(previews.map((preview) => preview.name));

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const target = resolveTarget(new URL(request.url), allowed);
    if (!target) return env.ASSETS.fetch(request);
    const cache = (globalThis as unknown as { caches: { default: WorkerCache } }).caches.default;
    return handlePreview(request, target, { fetchUpstream: (url, init) => fetch(url, init), cache });
  },
};
