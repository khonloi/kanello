import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  className = '',
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'btn-primary text-white',
    secondary: 'btn-secondary text-white',
    outline: 'btn-outline-secondary',
    ghost: 'bg-transparent border-0',
    danger: 'btn-danger text-white'
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  };

  const loadingStyle = isLoading ? { opacity: 0.7, pointerEvents: 'none' as const } : {};
  const mergedStyle = { ...style, ...loadingStyle };

  return (
    <button
      className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-100' : ''} ${className}`.trim()}
      disabled={disabled || isLoading}
      style={mergedStyle}
      {...props}
    >
      {children}
    </button>
  );
}
