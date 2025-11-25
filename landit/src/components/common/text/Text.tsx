import { ReactNode } from 'react';

interface TextProps {
  children: ReactNode;
  variant?: 'default' | 'muted' | 'primary' | 'accent' | 'destructive';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  as?: 'span' | 'div' | 'small' | 'strong' | 'em';
  className?: string;
}

export default function Text({ 
  children,
  variant = 'default',
  size = 'base',
  weight = 'normal',
  as = 'span',
  className = ''
}: TextProps) {
  const variantClasses = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    primary: 'text-primary',
    accent: 'text-accent',
    destructive: 'text-destructive'
  };
  
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };
  
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };
  
  const combinedClasses = `${variantClasses[variant]} ${sizeClasses[size]} ${weightClasses[weight]} ${className}`;
  
  const Component = as;
  
  return (
    <Component className={combinedClasses}>
      {children}
    </Component>
  );
}