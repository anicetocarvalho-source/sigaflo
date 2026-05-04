import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { normalizeEmail } from '@/lib/validation';

export interface EmailInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string | null;
  onChange?: (v: string) => void;
  invalid?: boolean;
}

/** Input de email com lowercase + trim onBlur, aria-invalid. */
export const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ value, onChange, onBlur, invalid, className, ...rest }, ref) => {
    return (
      <Input
        ref={ref}
        type="email"
        inputMode="email"
        autoCapitalize="none"
        autoComplete="email"
        spellCheck={false}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={(e) => {
          const norm = normalizeEmail(e.target.value);
          if (norm !== e.target.value) onChange?.(norm);
          onBlur?.(e);
        }}
        aria-invalid={invalid}
        className={cn(invalid && 'border-destructive', className)}
        {...rest}
      />
    );
  }
);
EmailInput.displayName = 'EmailInput';
