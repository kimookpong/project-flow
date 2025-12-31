import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/ui'
import { useAppStore } from '@/store/appStore'

interface SidebarProps {
    isOpen?: boolean
    onClose?: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation()
    const { profile, signOut } = useAuth()
    const notifications = useAppStore(state => state.notifications)
    const unreadCount = notifications.filter(n => !n.is_read).length

    const navItems = [
        { path: '/', icon: 'dashboard', label: 'แดชบอร์ด' },
        { path: '/projects', icon: 'work', label: 'โปรเจกต์' },
        { path: '/tasks', icon: 'task_alt', label: 'จัดการงาน' },
        { path: '/team', icon: 'group', label: 'ทีม' },
        {
            path: '/notifications',
            icon: 'notifications',
            label: 'การแจ้งเตือน',
            badge: unreadCount > 0 ? unreadCount : undefined
        },
        { path: '/settings', icon: 'settings', label: 'ตั้งค่า' },
    ]

    const getLinkClasses = (isActive: boolean) => {
        const baseClasses = 'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors'
        if (isActive) {
            return `${baseClasses} bg-[#135bec]/20 text-[#135bec] font-medium`
        }
        return `${baseClasses} text-gray-600 dark:text-[#9da6b9] hover:bg-gray-100 dark:hover:bg-[#282e39] hover:text-gray-900 dark:hover:text-white`
    }

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed md:static inset-y-0 left-0
          w-64 flex-shrink-0
          border-r border-gray-200 dark:border-[#282e39]
          bg-white dark:bg-[#101622]
          flex flex-col
          z-50
          transform transition-transform duration-300 md:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
            >
                <div className="p-4 flex flex-col h-full justify-between">
                    <div className="flex flex-col gap-6">
                        {/* Brand */}
                        <div className="flex items-center gap-3 px-2">
                            <img src="/logo.png" alt="ProjectFlow Logo" className="w-10 h-10 rounded-xl" />
                            <div className="flex flex-col">
                                <h1 className="text-gray-900 dark:text-white text-base font-bold leading-tight">ProjectFlow</h1>
                                <p className="text-gray-500 dark:text-[#9da6b9] text-xs font-normal">Manage efficiently</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => getLinkClasses(isActive || location.pathname === item.path)}
                                    onClick={onClose}
                                >
                                    <span className={`material-symbols-outlined ${location.pathname === item.path ? 'fill' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-sm font-medium">{item.label}</span>
                                    {item.badge && (
                                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                                            {item.badge}
                                        </span>
                                    )}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* User Profile */}
                    <div className="border-t border-gray-200 dark:border-[#282e39] pt-4">
                        <div className="flex items-center gap-3 px-2 mb-3">
                            <Avatar
                                src={profile?.avatar_url}
                                name={profile?.full_name || 'User'}
                                size="sm"
                                status="online"
                            />
                            <div className="flex flex-col overflow-hidden">
                                <p className="text-gray-900 dark:text-white text-sm font-medium truncate">
                                    {profile?.full_name || 'ผู้ใช้'}
                                </p>
                                <p className="text-gray-500 dark:text-[#9da6b9] text-xs truncate">
                                    {profile?.job_title || 'Member'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="flex items-center gap-3 px-3 py-2 w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <span className="text-sm font-medium">ออกจากระบบ</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
