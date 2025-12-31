import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useAppStore } from '@/store/appStore'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const pageTitles: Record<string, string> = {
    '/': 'ภาพรวม',
    '/projects': 'โปรเจกต์',
    '/projects/new': 'สร้างโปรเจกต์ใหม่',
    '/tasks': 'จัดการงาน',
    '/team': 'สมาชิกทีม',
    '/notifications': 'การแจ้งเตือน',
    '/settings': 'ตั้งค่า',
}

export function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { user, loading } = useAuth()
    const location = useLocation()
    const { loadAllData, isLoading } = useAppStore()

    // Load data from Supabase (or demo data if not configured)
    useEffect(() => {
        if (user) {
            loadAllData()
        }
    }, [user, loadAllData])

    // Get page title based on current path
    const getTitle = () => {
        const path = location.pathname
        if (pageTitles[path]) return pageTitles[path]
        if (path.startsWith('/projects/') && path !== '/projects/new') {
            if (path.includes('/finance')) return 'การเงินโปรเจกต์'
            if (path.includes('/tasks')) return 'จัดการงาน'
            return 'รายละเอียดโปรเจกต์'
        }
        return ''
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#101622] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-[#135bec] text-5xl animate-spin">
                        progress_activity
                    </span>
                    <p className="text-gray-500 dark:text-[#9da6b9]">กำลังโหลด...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="flex min-h-screen w-full bg-gray-50 dark:bg-[#101622] overflow-hidden">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <Header
                    title={getTitle()}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#101622]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <span className="material-symbols-outlined text-[#135bec] text-4xl animate-spin">
                                progress_activity
                            </span>
                        </div>
                    ) : (
                        <Outlet />
                    )}
                </main>
            </div>
        </div>
    )
}
