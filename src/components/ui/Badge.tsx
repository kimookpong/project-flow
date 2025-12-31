import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface BadgeProps {
    children: ReactNode
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'blue' | 'orange'
    size?: 'sm' | 'md'
    className?: string
}

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
    const variantClasses = {
        default: 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300',
        primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    }

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
    }

    return (
        <span
            className={`
        inline-flex items-center
        rounded-full
        font-bold uppercase tracking-wider
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
        >
            {children}
        </span>
    )
}
