import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    icon?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }, ref) => {
        const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

        const variantClasses = {
            primary: 'bg-[#135bec] hover:bg-[#1050d4] text-white shadow-lg shadow-blue-500/20 focus:ring-blue-500',
            secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-[#282e39] dark:hover:bg-[#323a46] dark:text-white focus:ring-gray-500',
            outline: 'border border-gray-200 dark:border-[#3b4354] bg-transparent hover:bg-gray-50 dark:hover:bg-[#282e39] text-gray-700 dark:text-white focus:ring-gray-500',
            ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-[#282e39] text-gray-700 dark:text-white focus:ring-gray-500',
            danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
        }

        const sizeClasses = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2.5 text-sm',
            lg: 'px-6 py-3 text-base',
        }

        return (
            <button
                ref={ref}
                className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                ) : icon ? (
                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                ) : null}
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'
