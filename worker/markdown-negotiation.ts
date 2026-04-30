// Skip Storybook subtrees and any path that already has a file extension.
const SKIP = /^\/storybook-|\.\w{2,5}$/;

interface Assets {
  fetch: (request: Request) => Promise<Response>;
}

export async function negotiateMarkdown(
  request: Request,
  assets: Assets,
): Promise<Response> {
  if (!request.headers.get("Accept")?.includes("text/markdown")) {
    return assets.fetch(request);
  }

  const url = new URL(request.url);
  if (SKIP.test(url.pathname)) return assets.fetch(request);

  const mdUrl = new URL(url);
  // astro-llms-md emits /.md for the root and /<path>.md (no trailing slash) for the rest.
  mdUrl.pathname =
    url.pathname === "/" ? "/.md" : url.pathname.replace(/\/$/, "") + ".md";

  const mdResponse = await assets.fetch(new Request(mdUrl, request));
  if (!mdResponse.ok) return assets.fetch(request);

  const headers = new Headers(mdResponse.headers);
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set("Vary", "Accept");
  return new Response(mdResponse.body, { status: mdResponse.status, headers });
}
