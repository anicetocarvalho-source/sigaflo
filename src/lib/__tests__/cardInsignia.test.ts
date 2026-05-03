import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderCardFrontHtml, insigniaAngolaUrl } from '@/lib/cardTemplate';

// Mock jspdf — capture addImage calls to validate the batch renderer uses the same insignia asset.
const addImageMock = vi.fn();
const jsPdfInstance = {
  addImage: addImageMock,
  rect: vi.fn(),
  setFillColor: vi.fn().mockReturnThis(),
  setDrawColor: vi.fn().mockReturnThis(),
  setLineWidth: vi.fn().mockReturnThis(),
  setTextColor: vi.fn().mockReturnThis(),
  setFont: vi.fn().mockReturnThis(),
  setFontSize: vi.fn().mockReturnThis(),
  text: vi.fn(),
  circle: vi.fn(),
  roundedRect: vi.fn(),
  splitTextToSize: (s: string) => [s],
  line: vi.fn(),
  addPage: vi.fn(),
  output: vi.fn(() => new Blob()),
};
vi.mock('jspdf', () => ({ default: vi.fn(() => jsPdfInstance) }));
vi.mock('qrcode', () => ({
  default: { toDataURL: vi.fn(async () => 'data:image/png;base64,QR==') },
}));
vi.mock('jszip', () => ({ default: vi.fn() }));

const FAKE_DATA_URL = 'data:image/png;base64,INSIGNIA==';

beforeEach(() => {
  addImageMock.mockClear();
  // fetch returns a tiny PNG-like blob; FileReader will produce our data URL.
  global.fetch = vi.fn(async () => ({
    ok: true,
    blob: async () => new Blob(['x'], { type: 'image/png' }),
  })) as unknown as typeof fetch;

  class FR {
    public result: string | null = null;
    public onload: (() => void) | null = null;
    public onerror: ((e?: unknown) => void) | null = null;
    readAsDataURL() {
      this.result = FAKE_DATA_URL;
      queueMicrotask(() => this.onload?.());
    }
  }
  // @ts-expect-error override for test
  global.FileReader = FR;
});

describe('Insígnia: paridade entre cardTemplate e cardBatchExport', () => {
  it('cardTemplate inclui a insígnia oficial via <img src=...>', () => {
    const html = renderCardFrontHtml({
      farmer: { id: 'f1', name: 'Maria', registration_number: 'AO-1' } as any,
    });
    expect(html).toContain('class="brasao"');
    expect(html).toContain(insigniaAngolaUrl);
    expect(html).toMatch(/<img[^>]+src="[^"]*insignia[^"]*"/i);
  });

  it('cardBatchExport carrega a insígnia uma única vez (cache + dedupe) e usa-a no jsPDF', async () => {
    const mod = await import('@/lib/cardBatchExport');
    // 1ª chamada: dispara fetch
    await mod.preloadInsignia();
    // 2ª e 3ª chamadas em paralelo: devem reutilizar cache (sem refetch)
    await Promise.all([mod.preloadInsignia(), mod.preloadInsignia()]);
    expect((global.fetch as any).mock.calls.length).toBe(1);

    // Renderiza um cartão e verifica que addImage foi invocado com a data URL da insígnia
    const farmer: any = { id: 'f1', name: 'Maria', registration_number: 'AO-1', farmer_type: 'individual' };
    await mod.exportCardBatch(
      [farmer],
      { f1: { serial: 'AO-1', qr_token: 'tok' } },
      { ...mod.DEFAULT_BATCH_OPTIONS, packaging: 'single_pdf', format: 'cr80_individual', includeBack: false },
    ).catch(() => { /* downloadBlob não existe em jsdom; ignoramos */ });

    const insigniaCall = addImageMock.mock.calls.find((c) => c[0] === FAKE_DATA_URL);
    expect(insigniaCall, 'jsPDF.addImage deve ser chamado com a insígnia em cache').toBeTruthy();
    expect(insigniaCall?.[1]).toBe('PNG');
  });
});
