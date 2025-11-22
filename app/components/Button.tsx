import { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline' | 'purple-light' | 'blue-light' | 'green-light';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-md transition-colors font-medium inline-flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400',
    secondary: 'bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:bg-gray-200',
    success: 'bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-400',
    ghost: 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:border-gray-200',
    'purple-light': 'bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:bg-gray-100',
    'blue-light': 'bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:bg-gray-100',
    'green-light': 'bg-green-100 text-green-700 hover:bg-green-200 disabled:bg-gray-100',
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'cursor-not-allowed opacity-50' : '';
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}