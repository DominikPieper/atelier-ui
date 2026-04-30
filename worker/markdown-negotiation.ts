// Skip static assets and non-doc paths
const SKIP = /^\/storybook-|\.\w{2,5}$/;

export async function negotiateMarkdown(
  request: Request,
  next: () => Promise<Response>,
): Promise<Response> {
  if (!request.headers.get("Accept")?.includes("text/markdown")) {
    return next();
  }

  const { pathname } = new URL(request.url);
  if (SKIP.test(pathname)) return next();

  const response = await next();
  if (!response.headers.get("content-type")?.includes("text/html")) return response;

  const markdown = htmlToMarkdown(await response.text());

  return new Response(markdown, {
    status: response.status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Vary": "Accept",
      "x-markdown-tokens": String(Math.ceil(markdown.length / 4)),
    },
  });
}

function htmlToMarkdown(html: string): string {
  let s = html;

  // Remove non-content blocks
  s = s.replace(/<head[\s\S]*?<\/head>/i, "");
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, "");
  s = s.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  s = s.replace(/<aside[\s\S]*?<\/aside>/gi, "");
  s = s.replace(/<footer[\s\S]*?<\/footer>/gi, "");

  // Extract <main> content
  const mainMatch = s.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) s = mainMatch[1];

  // Flatten syntax-highlighted code blocks (expressive-code wraps lines in spans)
  s = s.replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, (pre) =>
    "<pre>" + decode(pre.replace(/<[^>]+>/g, "")) + "</pre>"
  );

  // Code blocks
  s = s.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, c) => "\n```\n" + c.trim() + "\n```\n\n");

  // Inline code
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, c) => "`" + decode(stripTags(c)) + "`");

  // Headings
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => "# " + stripTags(t) + "\n\n");
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => "## " + stripTags(t) + "\n\n");
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => "### " + stripTags(t) + "\n\n");
  s = s.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => "#### " + stripTags(t) + "\n\n");

  // Links (before stripping tags)
  s = s.replace(
    /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi,
    (_, href, text) => `[${stripTags(text)}](${href})`
  );

  // Bold and italic
  s = s.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, "**$1**");
  s = s.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, "_$1_");

  // Lists
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => "- " + stripTags(t).trim() + "\n");
  s = s.replace(/<\/?(?:ul|ol)[^>]*>/gi, "\n");

  // Paragraphs and line breaks
  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => stripTags(t).trim() + "\n\n");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<hr\s*\/?>/gi, "\n---\n\n");

  // Strip remaining tags and decode entities
  s = decode(s.replace(/<[^>]+>/g, ""));

  return s.replace(/\n{3,}/g, "\n\n").trim();
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}
