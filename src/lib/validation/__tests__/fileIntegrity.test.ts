import { describe, it, expect, vi } from 'vitest';
import { computeFileIntegrity, sha256OfFile } from '../fileIntegrity';

// Polyfill crypto.subtle.digest com hash determinística simples (FNV-1a hex 64 chars).
function fakeDigest(_algo: string, buf: ArrayBuffer): Promise<ArrayBuffer> {
  const bytes = new Uint8Array(buf);
  // gera 32 bytes determinísticos a partir do conteúdo
  const out = new Uint8Array(32);
  let h = 2166136261;
  for (let i = 0; i < bytes.length; i++) {
    h ^= bytes[i];
    h = Math.imul(h, 16777619);
  }
  for (let i = 0; i < 32; i++) {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    out[i] = h & 0xff;
  }
  return Promise.resolve(out.buffer);
}

if (!('crypto' in globalThis) || !globalThis.crypto?.subtle) {
  // @ts-expect-error test polyfill
  globalThis.crypto = { subtle: { digest: fakeDigest } };
} else if (!globalThis.crypto.subtle?.digest) {
  // @ts-expect-error test polyfill
  globalThis.crypto.subtle = { digest: fakeDigest };
}

describe('fileIntegrity', () => {
  it('produz hash hex de 64 chars', async () => {
    const f = new File(['hello sigaflo'], 'a.txt', { type: 'text/plain' });
    const h = await sha256OfFile(f);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it('hash determinístico para mesmo conteúdo', async () => {
    const a = new File(['same'], 'a.txt');
    const b = new File(['same'], 'b.txt');
    expect(await sha256OfFile(a)).toBe(await sha256OfFile(b));
  });

  it('computeFileIntegrity devolve metadados completos', async () => {
    const f = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    const meta = await computeFileIntegrity(f);
    expect(meta.name).toBe('doc.pdf');
    expect(meta.mime).toBe('application/pdf');
    expect(meta.size_bytes).toBe(1);
    expect(meta.sha256).toMatch(/^[0-9a-f]{64}$/);
  });
});
