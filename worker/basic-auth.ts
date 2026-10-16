const CHALLENGE = 'Basic realm="Atelier", charset="UTF-8"';

function unauthorized(): Response {
  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': CHALLENGE, 'Cache-Control': 'no-store' },
  });
}

// Pulls the password out of a `Basic` header. The username is ignored on
// purpose: participants share one password. Split on the FIRST colon only,
// since RFC 7617 forbids colons in the user-id but not in the password.
function passwordFrom(header: string | null): string | null {
  const match = header?.match(/^Basic\s+(\S+)$/i);
  if (!match) return null;
  try {
    const bytes = Uint8Array.from(atob(match[1]), (c) => c.charCodeAt(0));
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    const colon = decoded.indexOf(':');
    return colon === -1 ? null : decoded.slice(colon + 1);
  } catch {
    return null;
  }
}

async function digest(value: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(value);
  return new Uint8Array(await crypto.subtle.digest('SHA-256', data));
}

// Hashing first gives both sides a fixed length, so the byte loop below never
// leaks the secret's length or the position of the first mismatch. A hand-
// rolled loop because `crypto.subtle.timingSafeEqual` is workerd-only and
// would not run in the Node test environment.
async function safeEqual(a: string, b: string): Promise<boolean> {
  const [da, db] = await Promise.all([digest(a), digest(b)]);
  let diff = 0;
  for (let i = 0; i < da.length; i++) diff |= da[i] ^ db[i];
  return diff === 0;
}

/**
 * Returns `null` when the request may proceed, otherwise the response to send.
 * Fails closed: without a configured password nothing is served, because an
 * unset secret must never turn into an unprotected site.
 */
export async function checkBasicAuth(
  request: Request,
  password: string | undefined,
): Promise<Response | null> {
  if (!password) {
    return new Response('Site password not configured', {
      status: 503,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  const supplied = passwordFrom(request.headers.get('Authorization'));
  if (supplied === null || !(await safeEqual(supplied, password))) {
    return unauthorized();
  }
  return null;
}
