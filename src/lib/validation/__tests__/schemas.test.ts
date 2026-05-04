import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  optionalEmailSchema,
  phoneAOSchema,
  optionalPhoneAOSchema,
  personNameSchema,
  biSchema,
  nifSchema,
  pastDateSchema,
  fileSchema,
  MAX_FILE_BYTES,
} from '../schemas';

describe('emailSchema', () => {
  it('normaliza e valida', () => {
    expect(emailSchema.parse(' Foo@Bar.AO ')).toBe('foo@bar.ao');
  });
  it('rejeita inválido', () => {
    expect(() => emailSchema.parse('nope')).toThrow();
  });
  it('optional aceita vazio', () => {
    expect(optionalEmailSchema.parse('')).toBeNull();
    expect(optionalEmailSchema.parse('a@b.co')).toBe('a@b.co');
    expect(() => optionalEmailSchema.parse('bad')).toThrow();
  });
});

describe('phoneAOSchema', () => {
  it('normaliza variantes', () => {
    expect(phoneAOSchema.parse('923 456 789')).toBe('+244923456789');
    expect(phoneAOSchema.parse('+244 923 456 789')).toBe('+244923456789');
  });
  it('rejeita prefixo inválido', () => {
    expect(() => phoneAOSchema.parse('812345678')).toThrow();
  });
  it('optional aceita vazio', () => {
    expect(optionalPhoneAOSchema.parse('')).toBeNull();
    expect(optionalPhoneAOSchema.parse('923456789')).toBe('+244923456789');
  });
});

describe('personNameSchema', () => {
  it('normaliza Title Case', () => {
    expect(personNameSchema.parse('  joão da silva  ')).toBe('João da Silva');
  });
  it('rejeita dígitos', () => {
    expect(() => personNameSchema.parse('João 2')).toThrow();
  });
});

describe('biSchema / nifSchema', () => {
  it('BI válido', () => {
    expect(biSchema.parse(' 004567890la041 ')).toBe('004567890LA041');
  });
  it('NIF válido', () => {
    expect(nifSchema.parse('12.34.56.78.90')).toBe('1234567890');
  });
});

describe('pastDateSchema', () => {
  it('aceita data passada', () => {
    expect(pastDateSchema.parse('2020-01-01')).toBe('2020-01-01');
  });
  it('rejeita futura', () => {
    const future = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    expect(() => pastDateSchema.parse(future)).toThrow();
  });
});

describe('fileSchema', () => {
  it('aceita PDF dentro do limite', () => {
    const f = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    expect(fileSchema.parse(f)).toBe(f);
  });
  it('rejeita MIME não permitido', () => {
    const f = new File(['x'], 'a.exe', { type: 'application/x-msdownload' });
    expect(() => fileSchema.parse(f)).toThrow();
  });
  it('rejeita ficheiro acima do limite', () => {
    const big = new File([new Uint8Array(MAX_FILE_BYTES + 1)], 'a.pdf', { type: 'application/pdf' });
    expect(() => fileSchema.parse(big)).toThrow();
  });
});
