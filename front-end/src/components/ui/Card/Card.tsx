import React, { forwardRef } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({ children, className = '', onClick, style }, ref) => {
  const baseClass = "card border-0 p-3";
  
  return (
    <div 
      ref={ref}
      className={`${baseClass} ${className}`.trim()} 
      onClick={onClick}
      style={{ ...style, cursor: onClick ? 'pointer' : undefined }}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
export default Card;
