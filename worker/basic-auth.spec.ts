import { describe, expect, it, vi } from 'vitest';
import { checkBasicAuth } from './basic-auth';

const basic = (user: string, pass: string) =>
  'Basic ' + Buffer.from(`${user}:${pass}`, 'utf-8').toString('base64');

const req = (authorization?: string) =>
  new Request('https://atelier.pieper.io/', {
    headers: authorization ? { Authorization: authorization } : {},
  });

describe('checkBasicAuth', () => {
  it('fails closed with 503 when no secret is configured', async () => {
    for (const secret of [undefined, '']) {
      const res = await checkBasicAuth(req(basic('a', 'b')), secret);
      expect(res?.status).toBe(503);
      expect(await res?.text()).toBe('Site password not configured');
    }
  });

  it('challenges a request without Authorization', async () => {
    const res = await checkBasicAuth(req(), 'secret');
    expect(res?.status).toBe(401);
    expect(res?.headers.get('WWW-Authenticate')).toBe(
      'Basic realm="Atelier", charset="UTF-8"',
    );
    expect(res?.headers.get('Cache-Control')).toBe('no-store');
  });

  it('rejects a wrong password', async () => {
    const res = await checkBasicAuth(req(basic('u', 'nope')), 'secret');
    expect(res?.status).toBe(401);
  });

  it('accepts the right password with any username', async () => {
    expect(
      await checkBasicAuth(req(basic('alice', 'secret')), 'secret'),
    ).toBeNull();
    expect(await checkBasicAuth(req(basic('', 'secret')), 'secret')).toBeNull();
  });

  it('accepts passwords with colons and umlauts', async () => {
    const pw = 'Müller:Straße:ü';
    expect(await checkBasicAuth(req(basic('u', pw)), pw)).toBeNull();
  });

  it('rejects a prefix or extension of the right password', async () => {
    expect(
      (await checkBasicAuth(req(basic('u', 'secre')), 'secret'))?.status,
    ).toBe(401);
    expect(
      (await checkBasicAuth(req(basic('u', 'secret!')), 'secret'))?.status,
    ).toBe(401);
  });

  it('rejects non-Basic schemes and garbage credentials', async () => {
    for (const header of [
      'Bearer secret',
      'Basic',
      'Basic !!!not-base64!!!',
      'Basic ' + Buffer.from('nocolon').toString('base64'),
      'Basic ' + Buffer.from([0xff, 0xfe, 0x3a, 0x41]).toString('base64'),
    ]) {
      const res = await checkBasicAuth(req(header), 'secret');
      expect(res?.status, header).toBe(401);
    }
  });
});

describe('worker routing', () => {
  const load = async () => {
    vi.resetModules();
    vi.doMock('./mcp', () => ({
      mcpHandler: async () => async () => new Response('mcp-ok'),
    }));
    return (await import('./index')).default;
  };
  const env = (password?: string) => ({
    SITE_PASSWORD: password,
    ASSETS: { fetch: async () => new Response('asset') },
  });

  it('leaves the MCP route unprotected', async () => {
    const worker = await load();
    const res = await worker.fetch(
      new Request('https://atelier.pieper.io/storybook-react/mcp'),
      env('secret'),
    );
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('mcp-ok');
  });

  it('challenges everything else and serves it once authorised', async () => {
    const worker = await load();
    const url = 'https://atelier.pieper.io/storybook-react/index.html';
    expect((await worker.fetch(new Request(url), env('secret'))).status).toBe(
      401,
    );
    const ok = await worker.fetch(
      new Request(url, { headers: { Authorization: basic('x', 'secret') } }),
      env('secret'),
    );
    expect(await ok.text()).toBe('asset');
  });
});
