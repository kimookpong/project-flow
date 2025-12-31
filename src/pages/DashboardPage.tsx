import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useAppStore } from '@/store/appStore'
import { Card, Button, Avatar, Badge } from '@/components/ui'
import { ProjectCard } from '@/components/ProjectCard'

export function DashboardPage() {
    const { profile, user } = useAuth()
    const { projects, tasks, members, incomes, expenses, projectMembers, revenueShares } = useAppStore()

    // Filter projects where I am a member
    const myProjectsList = projects.filter(p =>
        projectMembers.some(pm => pm.project_id === p.id && pm.user_id === user?.id)
    )

    // Calculate stats
    const activeProjects = myProjectsList.filter(p => p.status === 'active').length
    const tasksDueToday = tasks.filter(t => {
        if (!t.due_date) return false
        const today = new Date().toISOString().split('T')[0]
        return t.due_date === today && t.status !== 'done'
    }).length
    const completedTasks = tasks.filter(t => t.status === 'done').length
    const totalTasks = tasks.length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Calculate Financials
    // Calculate Financials (My Revenue)
    const { myRevenue, myRevenueDetails } = (() => {
        let total = 0
        const details: { projectId: string; projectName: string; sharePercent: number; amount: number }[] = []

        myProjectsList.forEach(project => {
            const projectRevenue = incomes
                .filter(i => i.project_id === project.id)
                .reduce((sum, i) => sum + i.amount, 0)

            const myShare = revenueShares.find(s => s.project_id === project.id && s.user_id === user?.id)
            const sharePercent = myShare?.share_percentage || 0
            const amount = (projectRevenue * sharePercent) / 100

            if (amount > 0) {
                total += amount
                details.push({
                    projectId: project.id,
                    projectName: project.name,
                    sharePercent,
                    amount
                })
            }
        })
        return { myRevenue: total, myRevenueDetails: details }
    })()

    // Get my tasks (assigned to current user)
    const myTasks = tasks.filter(t => t.assignee_id === user?.id).slice(0, 5)



    return (
        <div className="p-4 md:p-8 flex flex-col gap-8">
            {/* Welcome & Action Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        ยินดีต้อนรับกลับ, {profile?.full_name?.split(' ')[0] || 'คุณ'}! 👋
                    </h1>
                    <p className="text-gray-500 dark:text-[#9da6b9] text-sm">
                        นี่คือสิ่งที่เกิดขึ้นกับโปรเจกต์ของคุณวันนี้
                    </p>
                </div>
                <Link to="/projects/new">
                    <Button icon="add">สร้างโปรเจกต์ใหม่</Button>
                </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <div className="flex justify-between items-start">
                        <p className="text-gray-500 dark:text-[#9da6b9] text-sm font-medium">โปรเจกต์ที่กำลังดำเนินการ</p>
                        <span className="material-symbols-outlined text-[#135bec] bg-[#135bec]/10 p-1.5 rounded-lg text-[20px]">
                            folder
                        </span>
                    </div>
                    <div className="flex items-end gap-3 mt-2">
                        <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold">{activeProjects}</p>
                        <span className="text-[#0bda5e] text-xs font-medium bg-[#0bda5e]/10 px-1.5 py-0.5 rounded mb-1">
                            +2 เดือนนี้
                        </span>
                    </div>
                </Card>

                <Card>
                    <div className="flex justify-between items-start">
                        <p className="text-gray-500 dark:text-[#9da6b9] text-sm font-medium">งานที่ครบกำหนดวันนี้</p>
                        <span className="material-symbols-outlined text-orange-400 bg-orange-400/10 p-1.5 rounded-lg text-[20px]">
                            calendar_today
                        </span>
                    </div>
                    <div className="flex items-end gap-3 mt-2">
                        <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold">{tasksDueToday}</p>
                        <p className="text-gray-500 dark:text-[#9da6b9] text-xs mb-1">สู้ๆ นะ!</p>
                    </div>
                </Card>

                <Card className="sm:col-span-2">
                    <div className="flex justify-between items-start">
                        <p className="text-gray-500 dark:text-[#9da6b9] text-sm font-medium">รายรับของฉัน</p>
                        <span className="material-symbols-outlined text-green-500 bg-green-500/10 p-1.5 rounded-lg text-[20px]">
                            payments
                        </span>
                    </div>
                    <div className="flex flex-col gap-4 mt-2">
                        <div className="flex items-end gap-3">
                            <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold">
                                ฿{(myRevenue || 0).toLocaleString()}
                            </p>
                            <span className="text-xs text-gray-500 dark:text-[#9da6b9] mb-1">
                                จาก {myRevenueDetails.length} โปรเจกต์
                            </span>
                        </div>

                        {/* Revenue Details */}
                        {myRevenueDetails.length > 0 && (
                            <div className="flex flex-col gap-2 border-t border-gray-100 dark:border-white/5 pt-3 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                                {myRevenueDetails.map((detail) => (
                                    <div key={detail.projectId} className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#135bec] shrink-0"></span>
                                            <span className="text-gray-600 dark:text-[#9da6b9] truncate max-w-[120px] sm:max-w-none">{detail.projectName}</span>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-gray-500 dark:text-[#9da6b9]">
                                                {detail.sharePercent}%
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-white w-16 text-right">
                                                ฿{detail.amount.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column: Project Grid */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-gray-900 dark:text-white text-lg font-bold">โปรเจกต์ล่าสุด</h3>
                        <Link to="/projects" className="text-[#135bec] text-sm font-medium hover:text-blue-400">
                            ดูทั้งหมด
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myProjectsList.slice(0, 6).map((project) => {
                            return (
                                <ProjectCard key={project.id} project={project} />
                            )
                        })}

                        {/* Add New Project Card */}
                        <Link to="/projects/new">
                            <Card className="!border-dashed border-gray-300 dark:border-white/10 hover:border-[#135bec] dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-[#2d3542] flex flex-col items-center justify-center gap-3 cursor-pointer group h-full min-h-[250px]">
                                <div className="size-14 rounded-full bg-gray-100 dark:bg-[#111318] flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[#135bec] text-2xl">add</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-900 dark:text-white font-medium text-sm">สร้างโปรเจกต์ใหม่</p>
                                    <p className="text-gray-500 dark:text-[#9da6b9] text-xs mt-1">เริ่มต้นโปรเจกต์ใหม่ของคุณ</p>
                                </div>
                            </Card>
                        </Link>
                    </div>
                </div>

                {/* Right Column: My Tasks */}
                <div className="flex flex-col gap-6">
                    <Card className="flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-gray-900 dark:text-white font-bold text-sm">งานของฉัน ({myTasks.length})</h3>
                            <Link to="/tasks">
                                <button className="text-[#135bec] hover:bg-[#135bec]/10 p-1 rounded transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                </button>
                            </Link>
                        </div>

                        <div className="flex flex-col gap-3">
                            {myTasks.map((task) => {
                                const project = projects.find(p => p.id === task.project_id)
                                const assignee = members.find(m => m.id === task.assignee_id)
                                const isDone = task.status === 'done'

                                return (
                                    <div key={task.id} className={`flex items-center gap-3 group cursor-pointer ${isDone ? 'opacity-75' : ''}`}>
                                        <div className={`size-5 rounded-full border flex items-center justify-center transition-colors ${isDone
                                            ? 'border-green-500 bg-green-500/20 text-green-500'
                                            : 'border-gray-300 dark:border-[#9da6b9] hover:border-[#135bec] hover:text-[#135bec] text-transparent'
                                            }`}>
                                            <span className="material-symbols-outlined text-[14px]">check</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${isDone
                                                ? 'text-gray-400 dark:text-[#9da6b9] line-through'
                                                : 'text-gray-900 dark:text-white group-hover:text-[#135bec]'
                                                } transition-colors`}>
                                                {task.title}
                                            </p>
                                            <p className="text-gray-500 dark:text-[#9da6b9] text-xs">
                                                {project?.name || 'Unknown'} • {task.due_date ? new Date(task.due_date).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }) : 'ไม่มีกำหนด'}
                                            </p>
                                        </div>
                                        {assignee && (
                                            <Avatar
                                                src={assignee.avatar_url}
                                                name={assignee.full_name || ''}
                                                size="xs"
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <Link to="/tasks">
                            <button className="w-full py-2 text-xs text-gray-500 dark:text-[#9da6b9] hover:text-gray-900 dark:hover:text-white font-medium border-t border-gray-100 dark:border-white/5 mt-4 pt-4">
                                ดูงานทั้งหมด
                            </button>
                        </Link>
                    </Card>
                </div>
            </div>
        </div>
    )
}
