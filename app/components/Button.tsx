import { ReactNode, ButtonHTMLAttributes } from 'react';

// ============ Types ============
type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'ghost'
  | 'outline'
  | 'purple-light'
  | 'blue-light'
  | 'green-light';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Button content */
  children: ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Optional icon to display before text */
  icon?: ReactNode;
}

// ============ Component ============
/**
 * Reusable Button component with multiple variants and sizes
 */
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
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200';

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-300',
    secondary:
      'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:bg-slate-100',
    success: 'bg-teal-600 text-white hover:bg-teal-700 disabled:bg-teal-300',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300',
    ghost: 'bg-white text-slate-700 hover:bg-slate-50 disabled:bg-slate-50',
    outline:
      'border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:border-slate-200',
    'purple-light':
      'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:bg-slate-100',
    'blue-light':
      'bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:bg-slate-100',
    'green-light':
      'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:bg-slate-100',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
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
