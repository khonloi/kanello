import React, { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
  containerClassName?: string;
  variant?: 'dark' | 'light' | 'none';
}

function getTextFromNode(node: React.ReactNode): string {
  if (!node) return "";
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getTextFromNode).join("");
  }
  if (React.isValidElement(node)) {
    return getTextFromNode((node.props as any).children);
  }
  return "";
}

export default function Input({
  label,
  error,
  containerClassName = '',
  className = '',
  variant = 'dark',
  id,
  placeholder,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  // Apply custom styling to all standard inputs (variant !== 'none') to keep styling consistent
  const isCustomInput = variant !== 'none';

  const variantClass = variant === 'none'
    ? ''
    : (variant === 'light' ? 'bg-white text-dark border-secondary' : 'modal-input-custom');

  const invalidClass = error ? 'is-invalid' : '';

  const finalPlaceholder = placeholder || (isCustomInput ? getTextFromNode(label) : undefined);
  const showLabel = label && !isCustomInput;

  return (
    <div className={containerClassName}>
      {showLabel && (
        <label htmlFor={inputId} className="form-label text-secondary small fw-bold mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        placeholder={finalPlaceholder}
        className={`form-control ${variantClass} ${invalidClass} ${className}`.trim()}
        {...props}
      />
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
}
