import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Avatar } from '@/components/ui'
import { useAppStore } from '@/store/appStore'

interface HeaderProps {
    title?: string
    onMenuClick?: () => void
}

export function Header({ title, onMenuClick }: HeaderProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()
    const { profile } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const notifications = useAppStore(state => state.notifications)
    const unreadCount = notifications.filter(n => !n.is_read).length

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-gray-200 dark:border-[#282e39] px-4 md:px-6 py-4 bg-white/95 dark:bg-[#101622]/95 backdrop-blur sticky top-0 z-30">
            <div className="flex items-center gap-2 md:gap-2 w-full max-w-2xl">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className="text-gray-700 dark:text-white md:hidden"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>

                {/* Page title */}
                {title && (
                    <h2 className="text-gray-900 dark:text-white text-lg md:text-xl font-bold leading-tight tracking-tight hidden sm:block">
                        {title}
                    </h2>
                )}

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex flex-col min-w-40 h-10 flex-1 max-w-md">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-gray-100 dark:bg-[#282e39] focus-within:ring-2 focus-within:ring-[#135bec]/50 transition-all">
                        <div className="text-gray-400 dark:text-[#9da6b9] flex items-center justify-center pl-4 rounded-l-lg">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-none bg-transparent h-full placeholder:text-gray-400 dark:placeholder:text-[#9da6b9] px-4 pl-2 text-sm font-normal leading-normal"
                            placeholder="ค้นหาโปรเจกต์, งาน..."
                        />
                    </div>
                </form>
            </div>

            <div className="flex items-center gap-2 md:gap-3 pl-2">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="relative flex items-center justify-center rounded-lg size-10 bg-gray-100 dark:bg-[#282e39] text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#323945] transition-colors"
                    title={theme === 'dark' ? 'เปลี่ยนเป็น Light Mode' : 'เปลี่ยนเป็น Dark Mode'}
                >
                    <span className="material-symbols-outlined">
                        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                    </span>
                </button>

                {/* Notifications */}
                <button
                    onClick={() => navigate('/notifications')}
                    className="relative flex items-center justify-center rounded-lg size-10 bg-gray-100 dark:bg-[#282e39] text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#323945] transition-colors"
                >
                    <span className="material-symbols-outlined">notifications</span>
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-[#282e39]" />
                    )}
                </button>

                {/* User avatar */}
                <Link to="/settings" className="hidden sm:block">
                    <Avatar
                        src={profile?.avatar_url}
                        name={profile?.full_name || 'User'}
                        size="md"
                        className="transition-colors cursor-pointer"
                    />
                </Link>
            </div>
        </header>
    )
}
