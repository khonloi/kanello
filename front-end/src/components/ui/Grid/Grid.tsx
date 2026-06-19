import React from 'react';

interface GridProps {
  children: React.ReactNode;
  gap?: number;
  className?: string;
  wrap?: boolean;
}

export default function Grid({ children, gap = 3, className = '', wrap = true }: GridProps) {
  return (
    <div className={`d-flex ${wrap ? 'flex-wrap' : 'flex-nowrap'} gap-${gap} ${className}`.trim()}>
      {children}
    </div>
  );
}
