import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
  containerClassName?: string;
  variant?: 'dark' | 'light' | 'none';
}

export default function Input({
  label,
  error,
  containerClassName = '',
  className = '',
  variant = 'dark',
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const variantClass = 
    variant === 'dark' ? 'bg-dark text-white border-secondary' : 
    variant === 'light' ? 'bg-white text-dark border-secondary' : '';

  const invalidClass = error ? 'is-invalid' : '';

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className="form-label text-secondary small fw-bold mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`form-control ${variantClass} ${invalidClass} ${className}`.trim()}
        {...props}
      />
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
}
