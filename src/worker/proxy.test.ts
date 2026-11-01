import { describe, expect, it, vi } from "vitest";
import { handlePreview, resolveTarget, rewriteLocation, upstreamUrl, type PreviewTarget, type ProxyDeps } from "./proxy";

const allowed = new Set(["api-email", "web-app"]);
const target: PreviewTarget = { repository: "api-email", rest: "/emails/a.html", search: "" };

function deps(upstream: () => Promise<Response>, stored = new Map<string, Response>()): ProxyDeps & { stored: Map<string, Response> } {
  return {
    fetchUpstream: vi.fn(upstream),
    cache: {
      match: async (key) => stored.get(key)?.clone(),
      put: async (key, response) => {
        stored.set(key, response);
      },
    },
    stored,
  };
}

const get = (path = "/previews/api-email/emails/a.html") => new Request(`https://docs.example${path}`);

describe("resolveTarget", () => {
  it("accepts a published repository and keeps the rest and the query", () => {
    expect(resolveTarget(new URL("https://d.example/previews/api-email/emails/a.html?x=1"), allowed)).toEqual({
      repository: "api-email",
      rest: "/emails/a.html",
      search: "?x=1",
    });
    expect(resolveTarget(new URL("https://d.example/previews/web-app/"), allowed)).toEqual({ repository: "web-app", rest: "/", search: "" });
    expect(resolveTarget(new URL("https://d.example/previews/web-app"), allowed)).toEqual({ repository: "web-app", rest: "", search: "" });
  });

  it("ignores everything else", () => {
    for (const path of ["/previews", "/previews/", "/previews/unknown/x", "/documentos/privacy", "/"]) {
      expect(resolveTarget(new URL(`https://d.example${path}`), allowed)).toBeNull();
    }
  });

  it("cannot escape the repository with dot segments", () => {
    const resolved = resolveTarget(new URL("https://d.example/previews/api-email/%2e%2e/%2e%2e/other/x"), allowed);
    expect(resolved).toBeNull();
  });
});

describe("upstreamUrl and rewriteLocation", () => {
  it("maps the portal path to the Pages path", () => {
    expect(upstreamUrl(target)).toBe("https://solierrr.github.io/api-email/emails/a.html");
    expect(upstreamUrl({ ...target, rest: "", search: "?a=1" })).toBe("https://solierrr.github.io/api-email/?a=1");
  });

  it("keeps redirects inside the portal", () => {
    expect(rewriteLocation("https://solierrr.github.io/api-email/emails/", target)).toBe("/previews/api-email/emails/");
    expect(rewriteLocation("/api-email/x?y=1#z", target)).toBe("/previews/api-email/x?y=1#z");
    expect(rewriteLocation("https://evil.example/", target)).toBe("/previews/api-email/");
    expect(rewriteLocation("https://solierrr.github.io/other-repo/", target)).toBe("/previews/api-email/");
  });
});

describe("handlePreview", () => {
  it("serves the Pages response and remembers it", async () => {
    const d = deps(async () => new Response("<h1>ok</h1>", { status: 200, headers: { "content-type": "text/html" } }));
    const response = await handlePreview(get(), target, d);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("<h1>ok</h1>");
    expect(response.headers.get("x-preview-source")).toBe("pages");
    expect(response.headers.get("cache-control")).toContain("max-age=300");
    expect(d.stored.size).toBe(1);
    expect(d.fetchUpstream).toHaveBeenCalledWith("https://solierrr.github.io/api-email/emails/a.html", expect.objectContaining({ redirect: "manual" }));
  });

  it("passes a 404 through without storing it", async () => {
    const d = deps(async () => new Response("missing", { status: 404 }));
    const response = await handlePreview(get(), target, d);
    expect(response.status).toBe(404);
    expect(d.stored.size).toBe(0);
  });

  it("serves the stored copy when Pages fails with a server error", async () => {
    const stored = new Map<string, Response>();
    await handlePreview(get(), target, deps(async () => new Response("good copy", { status: 200 }), stored));
    const response = await handlePreview(get(), target, deps(async () => new Response("down", { status: 503 }), stored));
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("good copy");
    expect(response.headers.get("x-preview-source")).toBe("stale");
  });

  it("serves the stored copy when the request to Pages throws", async () => {
    const stored = new Map<string, Response>();
    await handlePreview(get(), target, deps(async () => new Response("good copy", { status: 200 }), stored));
    const response = await handlePreview(get(), target, deps(async () => Promise.reject(new Error("network")), stored));
    expect(await response.text()).toBe("good copy");
  });

  it("shows a friendly page with the direct link when there is no stored copy", async () => {
    const response = await handlePreview(get(), target, deps(async () => new Response("down", { status: 500 })));
    expect(response.status).toBe(502);
    expect(await response.text()).toContain("https://solierrr.github.io/api-email/");
  });

  it("rewrites redirects to stay under the portal", async () => {
    const d = deps(async () => new Response(null, { status: 301, headers: { location: "https://solierrr.github.io/api-email/emails/" } }));
    const response = await handlePreview(get("/previews/api-email/emails"), { ...target, rest: "/emails" }, d);
    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("/previews/api-email/emails/");
  });

  it("adds the trailing slash to the preview root", async () => {
    const d = deps(async () => new Response("x"));
    const response = await handlePreview(get("/previews/api-email"), { repository: "api-email", rest: "", search: "?a=1" }, d);
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("/previews/api-email/?a=1");
    expect(d.fetchUpstream).not.toHaveBeenCalled();
  });

  it("only answers GET and HEAD", async () => {
    const d = deps(async () => new Response("x"));
    const response = await handlePreview(new Request("https://d.example/previews/api-email/x", { method: "POST", body: "a" }), target, d);
    expect(response.status).toBe(405);
    expect(d.fetchUpstream).not.toHaveBeenCalled();
  });
});
