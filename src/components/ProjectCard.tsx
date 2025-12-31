import { Link } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { Card, Avatar } from '@/components/ui'

interface ProjectCardProps {
    project: {
        id: string
        name: string
        description: string | null
        status: 'active' | 'completed' | 'on_hold'
        end_date: string | null
        production_url?: string | null
        demo_url?: string | null
        github_url?: string | null
    }
}

export function ProjectCard({ project }: ProjectCardProps) {
    const { tasks, members, incomes, expenses, projectMembers } = useAppStore()

    // Calculate Progress
    const projectTasks = tasks.filter(t => t.project_id === project.id)
    const completedProjectTasks = projectTasks.filter(t => t.status === 'done').length
    const progress = projectTasks.length > 0
        ? Math.round((completedProjectTasks / projectTasks.length) * 100)
        : 0

    // Get Project Members
    const currentProjectMembers = members.filter(m =>
        projectMembers.some(pm => pm.project_id === project.id && pm.user_id === m.id)
    ).slice(0, 3)

    // Fallback to all members if no specific assignment (for demo) or keep empty if strict
    // Dashboard logic used a fallback. Let's keep it consistent or use a strict check if preferred.
    // Given the demo nature, let's replicate the Dashboard logic which had a fallback for display consistency?
    // Dashboard logic: const displayMembers = currentProjectMembers.length > 0 ? currentProjectMembers : members.slice(0, 3)
    // Actually, in `ProjectsPage` it DID show a "?" if empty. `DashboardPage` seemed to force show members.
    // I'll stick to the "Real" logic + strict fallback if desired, but for visual consistency let's use the Dashboard approach which looked "richer".
    const displayMembers = currentProjectMembers.length > 0 ? currentProjectMembers : members.slice(0, 3)
    const extraMemberCount = projectMembers.filter(pm => pm.project_id === project.id).length - 3

    // Calculate Financials
    const projectRevenue = incomes
        .filter(i => i.project_id === project.id)
        .reduce((sum, i) => sum + i.amount, 0)
    const projectExpenses = expenses
        .filter(e => e.project_id === project.id)
        .reduce((sum, e) => sum + e.amount, 0)

    const statusLabels = {
        active: 'กำลังดำเนินการ',
        completed: 'เสร็จสิ้น',
        on_hold: 'รอดำเนินการ',
    }

    return (
        <Link to={`/projects/${project.id}`}>
            <div className="flex flex-col gap-6 h-full !p-6 bg-white dark:bg-[#1e232d] rounded-2xl border border-gray-100 dark:border-[#282e39] hover:border-[#135bec]/50 transition-all group relative overflow-hidden shadow-sm hover:shadow-md cursor-pointer">
                {/* Top Gradient Border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#135bec]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="shrink-0 size-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center text-[#135bec] border border-blue-500/10 group-hover:scale-110 transition-transform duration-500">
                        <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
                    </div>

                    {/* Title & Desc */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex justify-between items-start gap-2">
                            <h4 className="text-gray-900 dark:text-white font-bold text-base truncate pr-2 group-hover:text-[#135bec] transition-colors">{project.name}</h4>

                            {/* Optional Links (from ProjectsPage design, Dashboard didn't have them but user might want "best of both") 
                                User asked "make them show same". Dashboard didn't have links. ProjectsPage did. 
                                I'll INLCUDE links because they are useful functionality found in ProjectsPage. 
                            */}
                            <div className="flex gap-2 items-center justify-start shrink-0">
                                {project.production_url && (
                                    <a href={project.production_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition-colors size-[20px]" title="Production" onClick={(e) => e.stopPropagation()}>
                                        <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                                    </a>
                                )}
                                {project.demo_url && (
                                    <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors size-[20px]" title="Demo" onClick={(e) => e.stopPropagation()}>
                                        <span className="material-symbols-outlined text-[16px]">public</span>
                                    </a>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-500 dark:text-[#9da6b9] text-xs line-clamp-2 leading-relaxed">
                            {project.description || 'ไม่มีคำอธิบาย'}
                        </p>
                    </div>
                </div>

                {/* Status Badge - REMOVED per user request/edit in Dashboard */}

                {/* Financials Summary */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-green-50 dark:bg-green-900/10 p-2 rounded-lg">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">รายรับ</p>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">฿{(projectRevenue / 1000).toLocaleString()}k</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/10 p-2 rounded-lg">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">รายจ่าย</p>
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">฿{(projectExpenses / 1000).toLocaleString()}k</p>
                    </div>
                </div>

                {/* Progress */}
                <div className="flex flex-col gap-2 pt-2">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-[#9da6b9]">
                        <span>ความคืบหน้า</span>
                        <span className="text-gray-900 dark:text-white font-medium">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-[#135bec] h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {displayMembers.map((member) => (
                                <Avatar
                                    key={member.id}
                                    src={member.avatar_url}
                                    name={member.full_name || ''}
                                    size="xs"
                                />
                            ))}
                            {extraMemberCount > 0 && (
                                <div className="size-6 rounded-full bg-gray-100 dark:bg-[#282e39] border border-gray-200 dark:border-[#282e39] flex items-center justify-center text-[8px] text-gray-400">
                                    +{extraMemberCount}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#9da6b9]">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        {project.end_date
                            ? new Date(project.end_date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })
                            : 'ไม่มีกำหนด'
                        }
                    </div>
                </div>
            </div>
        </Link>
    )
}
