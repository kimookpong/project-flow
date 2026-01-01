import { useAppStore } from '@/store/appStore'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, Badge, Button } from '@/components/ui'

export function NotificationsPage() {
    const { user } = useAuth()
    const { notifications, markNotificationRead, markAllNotificationsRead, members } = useAppStore()

    const unreadCount = notifications.filter(n => !n.is_read).length

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'task_assigned':
                return { icon: 'assignment', color: 'bg-[#135bec] text-white' }
            case 'comment':
                return { icon: 'chat_bubble', color: 'bg-green-500 text-white' }
            case 'mention':
                return { icon: 'alternate_email', color: 'bg-blue-500 text-white' }
            case 'status_change':
                return { icon: 'rocket_launch', color: 'bg-purple-500 text-white' }
            default:
                return { icon: 'notifications', color: 'bg-gray-500 text-white' }
        }
    }

    const formatTimeAgo = (dateString: string) => {
        const now = new Date()
        const date = new Date(dateString)
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`
        if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`
        if (diffDays === 1) return 'เมื่อวานนี้'
        return `${diffDays} วันที่แล้ว`
    }

    const groupedNotifications = {
        today: notifications.filter(n => {
            const today = new Date().toDateString()
            return new Date(n.created_at).toDateString() === today
        }),
        yesterday: notifications.filter(n => {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            return new Date(n.created_at).toDateString() === yesterday.toDateString()
        }),
        older: notifications.filter(n => {
            const twoDaysAgo = new Date()
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
            return new Date(n.created_at) < twoDaysAgo
        }),
    }

    const handleMarkAllRead = () => {
        if (user?.id) {
            markAllNotificationsRead(user.id)
        }
    }

    return (
        <div className="flex flex-col mx-auto px-4 md:px-8 py-8 bg-gray-50 dark:bg-[#101622]">
            {/* Page Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                        การแจ้งเตือน
                    </h1>
                    <p className="text-gray-500 dark:text-[#9da6b9] text-sm md:text-base">
                        ติดตามความคืบหน้าและการเปลี่ยนแปลงล่าสุดในโปรเจกต์ของคุณ
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" icon="filter_list">ตัวกรอง</Button>
                    <Button icon="done_all" onClick={handleMarkAllRead}>
                        อ่านทั้งหมด
                    </Button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-[#3b4354]">
                <div className="flex gap-8">
                    <a className="group flex flex-col items-center justify-center border-b-[3px] border-[#135bec] pb-3 px-2 cursor-pointer">
                        <div className="flex items-center gap-2">
                            <p className="text-[#135bec] text-sm font-bold">ทั้งหมด</p>
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#135bec]/10 px-1.5 text-xs font-bold text-[#135bec]">
                                {notifications.length}
                            </span>
                        </div>
                    </a>
                    <a className="group flex flex-col items-center justify-center border-b-[3px] border-transparent hover:border-gray-400 dark:hover:border-gray-600 pb-3 px-2 cursor-pointer transition-all">
                        <div className="flex items-center gap-2">
                            <p className="text-gray-500 dark:text-[#9da6b9] group-hover:text-gray-700 dark:group-hover:text-gray-300 text-sm font-bold transition-colors">
                                ยังไม่อ่าน
                            </p>
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-200 dark:bg-[#282e39] px-1.5 text-xs font-bold text-gray-500 dark:text-[#9da6b9]">
                                {unreadCount}
                            </span>
                        </div>
                    </a>
                    <a className="group flex flex-col items-center justify-center border-b-[3px] border-transparent hover:border-gray-400 dark:hover:border-gray-600 pb-3 px-2 cursor-pointer transition-all">
                        <p className="text-gray-500 dark:text-[#9da6b9] group-hover:text-gray-700 dark:group-hover:text-gray-300 text-sm font-bold transition-colors">
                            ที่ถูกกล่าวถึง
                        </p>
                    </a>
                </div>
            </div>

            {/* Notifications List */}
            <div className="flex flex-col gap-2">
                {/* Today */}
                {groupedNotifications.today.length > 0 && (
                    <>
                        <div className="py-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">วันนี้</h3>
                        </div>
                        {groupedNotifications.today.map((notification) => {
                            const iconConfig = getNotificationIcon(notification.type)
                            const randomMember = members[Math.floor(Math.random() * members.length)]

                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => markNotificationRead(notification.id)}
                                    className={`group relative flex flex-col sm:flex-row gap-4 p-4 rounded-xl cursor-pointer transition-all shadow-sm dark:shadow-none ${notification.is_read
                                        ? 'bg-white dark:bg-[#111318] border border-gray-100 dark:border-[#282e39] hover:bg-gray-50 dark:hover:bg-[#1a202c] opacity-80 hover:opacity-100'
                                        : 'bg-white dark:bg-[#1a202c] border-l-4 border-l-[#135bec] border-y border-r border-gray-100 dark:border-y-transparent dark:border-r-transparent hover:bg-gray-50 dark:hover:bg-[#242b38]'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="relative shrink-0">
                                            <Avatar
                                                src={randomMember?.avatar_url}
                                                name={randomMember?.full_name || 'User'}
                                                size="lg"
                                            />
                                            <div className={`absolute -bottom-1 -right-1 flex items-center justify-center size-5 rounded-full ring-2 ring-white dark:ring-[#111318] ${iconConfig.color}`}>
                                                <span className="material-symbols-outlined text-[12px]">{iconConfig.icon}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-1 flex-col gap-1">
                                            <div className="flex items-center justify-between w-full">
                                                <p className="text-gray-900 dark:text-white text-base font-semibold leading-tight">
                                                    {notification.title}
                                                </p>
                                                <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
                                                    {formatTimeAgo(notification.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 dark:text-[#9da6b9] text-sm leading-normal">
                                                {notification.content}
                                            </p>
                                            {notification.type === 'task_assigned' && (
                                                <div className="mt-2 flex gap-2">
                                                    <button className="px-3 py-1.5 rounded-md bg-[#135bec]/10 hover:bg-[#135bec]/20 text-[#135bec] text-xs font-bold transition-colors">
                                                        รับทราบ
                                                    </button>
                                                    <button className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-[#3b4354] hover:bg-gray-100 dark:hover:bg-[#282e39] text-gray-700 dark:text-gray-300 text-xs font-bold transition-colors shadow-sm dark:shadow-none">
                                                        ดูรายละเอียด
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {!notification.is_read && (
                                        <div className="hidden sm:flex shrink-0 flex-col items-end">
                                            <div className="size-2.5 rounded-full bg-[#135bec] ring-4 ring-[#135bec]/20" />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </>
                )}

                {/* Yesterday */}
                {groupedNotifications.yesterday.length > 0 && (
                    <>
                        <div className="py-2 mt-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">เมื่อวานนี้</h3>
                        </div>
                        {groupedNotifications.yesterday.map((notification) => {
                            const iconConfig = getNotificationIcon(notification.type)
                            const randomMember = members[Math.floor(Math.random() * members.length)]

                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => markNotificationRead(notification.id)}
                                    className={`group relative flex flex-col sm:flex-row gap-4 p-4 rounded-xl cursor-pointer transition-all shadow-sm dark:shadow-none ${notification.is_read
                                        ? 'bg-white dark:bg-[#111318] border border-gray-100 dark:border-[#282e39] hover:bg-gray-50 dark:hover:bg-[#1a202c] opacity-80 hover:opacity-100'
                                        : 'bg-white dark:bg-[#1a202c] border-l-4 border-l-[#135bec] border-y border-r border-gray-100 dark:border-y-transparent dark:border-r-transparent hover:bg-gray-50 dark:hover:bg-[#242b38]'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="relative shrink-0">
                                            {notification.type === 'status_change' ? (
                                                <div className="flex items-center justify-center size-12 rounded-full border border-purple-100 dark:border-none bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                                    <span className="material-symbols-outlined">rocket_launch</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Avatar
                                                        src={randomMember?.avatar_url}
                                                        name={randomMember?.full_name || 'User'}
                                                        size="lg"
                                                    />
                                                    <div className={`absolute -bottom-1 -right-1 flex items-center justify-center size-5 rounded-full ring-2 ring-white dark:ring-[#111318] ${iconConfig.color}`}>
                                                        <span className="material-symbols-outlined text-[12px]">{iconConfig.icon}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col gap-1">
                                            <div className="flex items-center justify-between w-full">
                                                <p className="text-gray-900 dark:text-white text-base font-medium leading-tight">
                                                    {notification.title}
                                                </p>
                                                <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
                                                    {formatTimeAgo(notification.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 dark:text-[#9da6b9] text-sm leading-normal">
                                                {notification.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </>
                )}

                {notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-transparent rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-none mt-4">
                        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">notifications_off</span>
                        <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-2">ไม่มีการแจ้งเตือน</h3>
                        <p className="text-gray-500 dark:text-[#9da6b9] text-sm">คุณยังไม่มีการแจ้งเตือนใดๆ ในขณะนี้</p>
                    </div>
                )}
            </div>

            {/* Load More */}
            {notifications.length > 0 && (
                <div className="mt-8 flex justify-center">
                    <button className="text-gray-500 dark:text-[#9da6b9] hover:text-gray-900 dark:hover:text-white text-sm font-medium flex items-center gap-2 px-6 py-3 rounded-lg bg-white dark:bg-transparent border border-gray-100 dark:border-none hover:bg-gray-100 dark:hover:bg-[#282e39] transition-all shadow-sm dark:shadow-none">
                        <span>โหลดเพิ่มเติม</span>
                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </button>
                </div>
            )}
        </div>
    )
}
