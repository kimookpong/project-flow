import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    icon?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, icon, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-2">
                {label && (
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#9da6b9] material-symbols-outlined text-[20px]">
                            {icon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        className={`
              w-full rounded-lg 
              bg-gray-50 dark:bg-[#111318]
              border border-gray-300 dark:border-[#3b4354]
              text-gray-900 dark:text-white
              placeholder:text-gray-400 dark:placeholder:text-[#637588]
              focus:outline-none focus:ring-2 focus:ring-[#135bec]/50 focus:border-[#135bec]
              transition-all
              h-12 px-4
              ${icon ? 'pl-11' : ''}
              ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}
              ${className}
            `}
                        {...props}
                    />
                </div>
                {error && (
                    <span className="text-sm text-red-500">{error}</span>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
