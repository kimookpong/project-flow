interface AvatarProps {
    src?: string | null
    name?: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    status?: 'online' | 'away' | 'busy' | 'offline'
    className?: string
}

export function Avatar({ src, name, size = 'md', status, className = '' }: AvatarProps) {
    const sizeClasses = {
        xs: 'h-6 w-6 text-[10px]',
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
    }

    const statusColors = {
        online: 'bg-green-500',
        away: 'bg-yellow-500',
        busy: 'bg-red-500',
        offline: 'bg-gray-400',
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
    }

    return (
        <div className={`relative inline-flex ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={name || 'Avatar'}
                    className={`${sizeClasses[size]} rounded-full object-cover bg-gray-200 dark:bg-[#282e39]`}
                />
            ) : (
                <div
                    className={`
            ${sizeClasses[size]}
            rounded-full
            bg-gradient-to-br from-[#135bec] to-[#6366f1]
            flex items-center justify-center
            text-white font-bold
          `}
                >
                    {name ? getInitials(name) : '?'}
                </div>
            )}
            {status && (
                <span
                    className={`
            absolute bottom-0 right-0
            ${size === 'xs' || size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'}
            ${statusColors[status]}
            rounded-full
            border-2 border-white dark:border-[#101622]
          `}
                />
            )}
        </div>
    )
}
