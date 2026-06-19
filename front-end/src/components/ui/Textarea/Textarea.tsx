import { useId } from 'react';
import type { TextareaHTMLAttributes, ReactNode } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  error?: string;
  containerClassName?: string;
  variant?: 'dark' | 'light' | 'none';
}

export default function Textarea({
  label,
  error,
  containerClassName = '',
  className = '',
  variant = 'dark',
  id,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id || generatedId;

  const variantClass = 
    variant === 'dark' ? 'bg-dark text-white border-secondary' : 
    variant === 'light' ? 'bg-white text-dark border-secondary' : '';

  const invalidClass = error ? 'is-invalid' : '';

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={textareaId} className="form-label text-secondary small fw-bold mb-1">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`form-control ${variantClass} ${invalidClass} ${className}`.trim()}
        style={{ resize: 'none', ...props.style }}
        {...props}
      />
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
}
