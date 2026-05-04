import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  maskPhoneAONational,
  normalizePhoneAO,
  phoneAOToNational,
  ANGOLA_DIAL_CODE,
} from '@/lib/validation';

export interface PhoneInputAOProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onBlur'> {
  /** Valor canónico (ex.: +244923456789) ou nacional (9 dígitos) ou vazio. */
  value?: string | null;
  /** Devolve sempre formato canónico +244XXXXXXXXX (ou '' se inválido/incompleto). */
  onChange?: (canonical: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
}

/**
 * Input de telefone móvel angolano.
 * - Indicativo +244 fixo, não editável.
 * - Aceita apenas 9 dígitos nacionais.
 * - Máscara visível: "9XX XXX XXX".
 * - Devolve sempre o valor canónico ao formulário.
 */
export const PhoneInputAO = React.forwardRef<HTMLInputElement, PhoneInputAOProps>(
  ({ value, onChange, onBlur, className, invalid, ...rest }, ref) => {
    const initialNat = React.useMemo(() => {
      if (!value) return '';
      const nat = phoneAOToNational(value);
      // Se não validar ainda, mantém só dígitos para o utilizador acabar de escrever.
      return nat || (value.replace(/\D/g, '').slice(-9));
    }, [value]);

    const [display, setDisplay] = React.useState(maskPhoneAONational(initialNat));

    React.useEffect(() => {
      setDisplay(maskPhoneAONational(initialNat));
    }, [initialNat]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const masked = maskPhoneAONational(e.target.value);
      setDisplay(masked);
      const digits = masked.replace(/\s/g, '');
      // Devolve canónico se válido, senão o que houver (form revalida onBlur)
      const canonical = digits.length === 9 ? normalizePhoneAO(digits) : '';
      onChange?.(canonical || `${ANGOLA_DIAL_CODE}${digits}`);
    };

    return (
      <div className={cn('flex items-stretch rounded-md border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring', invalid && 'border-destructive', className)}>
        <span className="flex items-center px-3 text-sm text-muted-foreground bg-muted select-none border-r border-input" aria-hidden>
          {ANGOLA_DIAL_CODE}
        </span>
        <Input
          ref={ref}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="9XX XXX XXX"
          value={display}
          onChange={handleChange}
          onBlur={onBlur}
          aria-invalid={invalid}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          {...rest}
        />
      </div>
    );
  }
);
PhoneInputAO.displayName = 'PhoneInputAO';
