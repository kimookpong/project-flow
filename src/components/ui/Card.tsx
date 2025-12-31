import type { ReactNode } from 'react'

interface CardProps {
    children: ReactNode
    className?: string
    hover?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
    const paddingClasses = {
        none: '',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-6',
    }

    return (
        <div
            className={`
        bg-white dark:bg-[#282e39]
        rounded-xl
        border border-gray-100 dark:border-white/5
        shadow-sm
        ${hover ? 'hover:border-gray-200 dark:hover:border-white/10 hover:shadow-md transition-all cursor-pointer' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
        >
            {children}
        </div>
    )
}
