import React, { useId } from 'react';
import type { TextareaHTMLAttributes, ReactNode } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
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

export default function Textarea({
  label,
  error,
  containerClassName = '',
  className = '',
  variant = 'dark',
  id,
  placeholder,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id || generatedId;

  // Apply custom styling to all standard textareas (variant !== 'none') to keep styling consistent
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
        <label htmlFor={textareaId} className="form-label text-secondary small fw-bold mb-1">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        placeholder={finalPlaceholder}
        className={`form-control ${variantClass} ${invalidClass} ${className}`.trim()}
        style={{ resize: 'none', ...props.style }}
        {...props}
      />
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
}
