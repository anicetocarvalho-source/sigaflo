import {
  describe,
  it,
  expect,
} from 'vitest';
import {
  EMAIL_REGEX,
  PHONE_AO_NATIONAL_REGEX,
  PHONE_AO_INTL_REGEX,
  NAME_REGEX,
  BI_AO_REGEX,
  NIF_AO_REGEX,
  normalizeEmail,
  normalizePhoneAO,
  phoneAOToNational,
  normalizeName,
  normalizeBI,
  normalizeNIF,
  isValidEmail,
  isValidPhoneAO,
  isValidName,
  isValidBI,
  isValidNIF,
  collapseSpaces,
  stripNonDigits,
} from '../primitives';

describe('Email', () => {
  it('aceita emails válidos', () => {
    expect(EMAIL_REGEX.test('user@example.com')).toBe(true);
    expect(isValidEmail(' User@Example.COM ')).toBe(true);
  });
  it('rejeita inválidos', () => {
    expect(isValidEmail('foo')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('a b@c.com')).toBe(false);
    expect(isValidEmail('@x.com')).toBe(false);
  });
  it('normaliza para lowercase + trim', () => {
    expect(normalizeEmail('  Foo@Bar.AO ')).toBe('foo@bar.ao');
  });
});

describe('Telefone AO', () => {
  it.each([
    ['912345678', true],
    ['923456789', true],
    ['934567890', true],
    ['945678901', true],
    ['956789012', true],
    ['976789012', true],
    ['996789012', true],
  ])('aceita prefixo válido %s', (n, ok) => {
    expect(PHONE_AO_NATIONAL_REGEX.test(n)).toBe(ok);
  });

  it.each(['812345678', '902345678', '12345', '9234567890'])('rejeita inválido %s', (n) => {
    expect(PHONE_AO_NATIONAL_REGEX.test(n)).toBe(false);
  });

  it('normaliza variantes para +244', () => {
    expect(normalizePhoneAO('923 456 789')).toBe('+244923456789');
    expect(normalizePhoneAO('+244 923-456-789')).toBe('+244923456789');
    expect(normalizePhoneAO('00244923456789')).toBe('+244923456789');
    expect(normalizePhoneAO('244923456789')).toBe('+244923456789');
  });

  it('devolve "" se inválido', () => {
    expect(normalizePhoneAO('123')).toBe('');
    expect(normalizePhoneAO('812345678')).toBe('');
  });

  it('phoneAOToNational devolve só os 9 dígitos', () => {
    expect(phoneAOToNational('+244923456789')).toBe('923456789');
    expect(phoneAOToNational('lixo')).toBe('');
  });

  it('PHONE_AO_INTL_REGEX valida canónico', () => {
    expect(PHONE_AO_INTL_REGEX.test('+244923456789')).toBe(true);
    expect(PHONE_AO_INTL_REGEX.test('+244812345678')).toBe(false);
  });

  it('isValidPhoneAO', () => {
    expect(isValidPhoneAO('923 456 789')).toBe(true);
    expect(isValidPhoneAO('123')).toBe(false);
  });
});

describe('Nome', () => {
  it('aceita acentos, hífen, apóstrofo', () => {
    expect(isValidName('João Manuel')).toBe(true);
    expect(isValidName('Maria d’Almeida')).toBe(true);
    expect(isValidName('Ana-Sofia Mendes')).toBe(true);
  });
  it('rejeita dígitos e símbolos', () => {
    expect(isValidName('João 2')).toBe(false);
    expect(isValidName('João@Manuel')).toBe(false);
    expect(isValidName('A')).toBe(false);
  });
  it('NAME_REGEX bate com letras Unicode', () => {
    expect(NAME_REGEX.test('Çelina')).toBe(true);
  });
  it('normalizeName aplica Title Case e preserva conectores', () => {
    expect(normalizeName('  joão  da  silva  ')).toBe('João da Silva');
    expect(normalizeName('MARIA DOS SANTOS')).toBe('Maria dos Santos');
  });
});

describe('BI / NIF', () => {
  it('BI válido', () => {
    expect(BI_AO_REGEX.test('004567890LA041')).toBe(true);
    expect(isValidBI(' 004567890la041 ')).toBe(true);
  });
  it('BI inválido', () => {
    expect(isValidBI('004567890L041')).toBe(false);
    expect(isValidBI('abc')).toBe(false);
  });
  it('NIF 10 dígitos', () => {
    expect(NIF_AO_REGEX.test('1234567890')).toBe(true);
    expect(isValidNIF('123 456 78 90')).toBe(true);
    expect(isValidNIF('12345')).toBe(false);
  });
  it('normalizadores', () => {
    expect(normalizeBI(' 004567890la041 ')).toBe('004567890LA041');
    expect(normalizeNIF('12.34.56.78.90')).toBe('1234567890');
  });
});

describe('Helpers', () => {
  it('collapseSpaces', () => {
    expect(collapseSpaces('  a   b   c ')).toBe('a b c');
  });
  it('stripNonDigits', () => {
    expect(stripNonDigits('+244 923-456-789')).toBe('244923456789');
  });
});
