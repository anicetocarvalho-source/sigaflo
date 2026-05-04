import { describe, it, expect } from 'vitest';
import {
  searchTermSchema,
  optionalSearchTermSchema,
  uuidSchema,
  optionalUuidSchema,
  optionalEnumSchema,
  escapeIlike,
  prepareSearchTerm,
  validate,
  SEARCH_MIN_LEN,
  SEARCH_MAX_LEN,
} from '../search';

describe('searchTermSchema', () => {
  it('aceita termo simples e colapsa espaços', () => {
    const r = validate(searchTermSchema, '  João   Silva  ');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe('João Silva');
  });

  it('rejeita termo abaixo do mínimo', () => {
    const r = validate(searchTermSchema, 'a');
    expect(r.ok).toBe(false);
  });

  it(`rejeita termo acima de ${SEARCH_MAX_LEN}`, () => {
    const r = validate(searchTermSchema, 'a'.repeat(SEARCH_MAX_LEN + 1));
    expect(r.ok).toBe(false);
  });

  it.each(['<script>', 'a;b', 'a`b', 'a\\b', 'a>b'])(
    'rejeita caracteres proibidos: %s',
    (t) => {
      const r = validate(searchTermSchema, t);
      expect(r.ok).toBe(false);
    },
  );

  it('rejeita caracteres de controlo', () => {
    const r = validate(searchTermSchema, 'abc\u0000def');
    expect(r.ok).toBe(false);
  });
});

describe('optionalSearchTermSchema', () => {
  it('vazio devolve null', () => {
    const r = validate(optionalSearchTermSchema, '');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeNull();
  });
  it('undefined devolve null', () => {
    const r = validate(optionalSearchTermSchema, undefined);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeNull();
  });
  it('rejeita termo curto não vazio', () => {
    const r = validate(optionalSearchTermSchema, 'x');
    expect(r.ok).toBe(false);
  });
});

describe('uuidSchema', () => {
  it('aceita UUID v4 válido', () => {
    const r = validate(uuidSchema, '550e8400-e29b-41d4-a716-446655440000');
    expect(r.ok).toBe(true);
  });
  it('rejeita string arbitrária', () => {
    expect(validate(uuidSchema, 'not-a-uuid').ok).toBe(false);
  });
});

describe('optionalUuidSchema', () => {
  it('aceita "all" como null', () => {
    const r = validate(optionalUuidSchema, 'all');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeNull();
  });
  it('aceita undefined como null', () => {
    const r = validate(optionalUuidSchema, undefined);
    expect(r.ok).toBe(true);
  });
  it('rejeita uuid malformado', () => {
    expect(validate(optionalUuidSchema, '123').ok).toBe(false);
  });
});

describe('optionalEnumSchema', () => {
  const schema = optionalEnumSchema(['draft', 'submitted', 'approved'] as const);
  it('aceita valor permitido', () => {
    const r = validate(schema, 'submitted');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe('submitted');
  });
  it('aceita "all" como null', () => {
    const r = validate(schema, 'all');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeNull();
  });
  it('rejeita valor desconhecido', () => {
    expect(validate(schema, 'pirata').ok).toBe(false);
  });
});

describe('escapeIlike', () => {
  it('escapa % e _', () => {
    expect(escapeIlike('100%_off')).toBe('100\\%\\_off');
  });
  it('remove vírgulas e parêntesis', () => {
    expect(escapeIlike('a,b(c)d')).toBe('a b c d'.replace(/\s+/g, ' '));
  });
});

describe('prepareSearchTerm', () => {
  it('devolve termo escapado', () => {
    expect(prepareSearchTerm('João%')).toBe('João\\%');
  });
  it('devolve null em entrada inválida', () => {
    expect(prepareSearchTerm('<')).toBeNull();
    expect(prepareSearchTerm('a')).toBeNull();
  });
});
