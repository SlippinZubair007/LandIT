import { ReactNode } from 'react';

interface LabelProps {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  variant?: 'default' | 'muted' | 'error';
  size?: 'sm' | 'base' | 'lg';
  className?: string;
}

export default function Label({ 
  children,
  htmlFor,
  required = false,
  variant = 'default',
  size = 'base',
  className = ''
}: LabelProps) {
  const variantClasses = {
    default: 'text-card-foreground',
    muted: 'text-muted-foreground',
    error: 'text-destructive'
  };
  
  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg'
  };
  
  const baseClasses = 'block font-medium';
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <label htmlFor={htmlFor} className={combinedClasses}>
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  );
}