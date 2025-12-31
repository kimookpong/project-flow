import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { Card, Button, Avatar, Badge } from '@/components/ui'

export function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const {
        projects,
        deleteProject,
        tasks,
        members,
        projectMembers,
        loadProjectMembers
    } = useAppStore()

    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Load project members on mount or when id changes
    useEffect(() => {
        if (id) {
            loadProjectMembers(id)
        }
    }, [id, loadProjectMembers])

    const handleDelete = async () => {
        if (window.confirm('คุณแน่ใจว่าต้องการลบโปรเจกต์นี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
            if (id) {
                await deleteProject(id)
                navigate('/projects')
            }
        }
    }

    const project = projects.find(p => p.id === id)
    const projectTasks = tasks.filter(t => t.project_id === id)

    // Filter members based on project_members table
    const currentProjectMembers = members.filter(m =>
        projectMembers.some(pm => pm.project_id === id && pm.user_id === m.id)
    )

    if (!project) {
        return (
            <div className="p-8 text-center bg-gray-50 dark:bg-[#101622] min-h-screen">
                <h1 className="text-gray-900 dark:text-white text-2xl font-bold">ไม่พบโปรเจกต์</h1>
                <Link to="/projects" className="text-[#135bec] hover:underline mt-4 inline-block">
                    กลับไปหน้าโปรเจกต์
                </Link>
            </div>
        )
    }

    const completedTasks = projectTasks.filter(t => t.status === 'done').length
    const progress = projectTasks.length > 0
        ? Math.round((completedTasks / projectTasks.length) * 100)
        : 0

    const statusBadge = {
        active: { variant: 'primary' as const, label: 'กำลังดำเนินการ' },
        completed: { variant: 'success' as const, label: 'เสร็จสิ้น' },
        on_hold: { variant: 'warning' as const, label: 'รอดำเนินการ' },
    }

    // Tab Helper
    const isActive = (path: string) => location.pathname === path

    return (
        <div className="flex flex-col max-w-[1400px] mx-auto w-full px-4 md:px-8 py-6 gap-6 bg-gray-50 dark:bg-[#101622] min-h-screen">
            {/* Breadcrumbs & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center flex-wrap gap-2 text-sm">
                    <Link to="/projects" className="text-gray-500 dark:text-[#9da6b9] hover:text-[#135bec] transition-colors">
                        โปรเจกต์
                    </Link>
                    <span className="text-gray-400 dark:text-[#9da6b9]">/</span>
                    <span className="text-gray-900 dark:text-white font-medium">{project.name}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon="share">แชร์</Button>
                    <div className="relative">
                        <Button
                            variant="outline"
                            icon="more_horiz"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        />
                        {isMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1c1f27] rounded-xl shadow-lg border border-gray-100 dark:border-[#282e39] py-2 z-50">
                                    <button
                                        onClick={() => navigate(`/projects/${id}/edit`)}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#282e39] flex items-center gap-2 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                        แก้ไขโปรเจกต์
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                        ลบโปรเจกต์
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    <Link to={`/projects/${id}/tasks`}>
                        <Button icon="add">เพิ่มงานใหม่</Button>
                    </Link>
                </div>
            </div>

            {/* Project Header Info */}
            <div className="flex flex-col lg:flex-row justify-between gap-8 pb-6 border-b border-gray-200 dark:border-[#282e39]">
                <div className="flex items-start gap-5 max-w-2xl">
                    <div className="shrink-0 size-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center text-[#135bec] border border-blue-500/10">
                        <span className="material-symbols-outlined text-[32px]">rocket_launch</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                {project.name}
                            </h1>
                            <div className={`py-1 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${project.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                    project.status === 'completed' ? 'bg-blue-500/10 text-blue-500' :
                                        'bg-yellow-500/10 text-yellow-500'
                                }`}>
                                <div className={`size-1.5 rounded-full ${project.status === 'active' ? 'bg-green-500' :
                                        project.status === 'completed' ? 'bg-blue-500' :
                                            'bg-yellow-500'
                                    }`} />
                                {statusBadge[project.status].label}
                            </div>
                        </div>
                        <p className="text-gray-500 dark:text-[#9da6b9] text-base leading-relaxed">
                            {project.description || 'ไม่มีคำอธิบาย'}
                        </p>
                        <div className="flex items-center gap-6 mt-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#9da6b9]">
                                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                <span>กำหนดเสร็จ: {project.end_date
                                    ? new Date(project.end_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
                                    : 'ไม่ระบุ'
                                }</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[280px]">
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-medium text-gray-500 dark:text-[#9da6b9]">ความคืบหน้าโดยรวม</span>
                        <span className="text-xl font-bold text-[#135bec]">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-[#282e39] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#135bec] rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-[#9da6b9] mt-1">
                        <span>{completedTasks} เสร็จแล้ว</span>
                        <span>{projectTasks.length - completedTasks} เหลืออยู่</span>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Tasks List */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Tabs */}
                    <div className="flex gap-8 border-b border-gray-200 dark:border-[#282e39] overflow-x-auto scrollbar-hide">
                        <Link
                            to={`/projects/${id}`}
                            className={`pb-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${isActive(`/projects/${id}`)
                                    ? 'border-[#135bec] text-[#135bec] font-bold'
                                    : 'border-transparent text-gray-500 dark:text-[#9da6b9] hover:text-[#135bec] dark:hover:text-white'
                                }`}
                        >
                            ภาพรวม
                        </Link>
                        <Link
                            to={`/projects/${id}/tasks`}
                            className={`pb-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${isActive(`/projects/${id}/tasks`)
                                    ? 'border-[#135bec] text-[#135bec] font-bold'
                                    : 'border-transparent text-gray-500 dark:text-[#9da6b9] hover:text-[#135bec] dark:hover:text-white'
                                }`}
                        >
                            งาน
                        </Link>
                        <Link
                            to={`/projects/${id}/finance`}
                            className={`pb-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${isActive(`/projects/${id}/finance`)
                                    ? 'border-[#135bec] text-[#135bec] font-bold'
                                    : 'border-transparent text-gray-500 dark:text-[#9da6b9] hover:text-[#135bec] dark:hover:text-white'
                                }`}
                        >
                            การเงิน
                        </Link>
                        <Link
                            to={`/projects/${id}/files`}
                            className={`pb-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${isActive(`/projects/${id}/files`)
                                    ? 'border-[#135bec] text-[#135bec] font-bold'
                                    : 'border-transparent text-gray-500 dark:text-[#9da6b9] hover:text-[#135bec] dark:hover:text-white'
                                }`}
                        >
                            ไฟล์
                        </Link>
                        <Link
                            to={`/projects/${id}/timeline`}
                            className={`pb-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${isActive(`/projects/${id}/timeline`)
                                    ? 'border-[#135bec] text-[#135bec] font-bold'
                                    : 'border-transparent text-gray-500 dark:text-[#9da6b9] hover:text-[#135bec] dark:hover:text-white'
                                }`}
                        >
                            Timeline
                        </Link>
                    </div>

                    {/* Tasks Table - Only show on Overview (root path) */}
                    {/* Note: In a real app with sub-routes, this component would be rendered by <Outlet /> or handled by routing. 
                        Since we are manually routing in App.tsx to specific pages, this component is ONLY for the Overview page 
                        layout logic. BUT, currently TasksPage is a separate page. 
                        So if we are here at /projects/:id, we should show Overview content.
                        
                        Let's keep the recent tasks table here as "Overview".
                    */}
                    <Card className="!p-0 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-[#282e39] flex justify-between items-center bg-white dark:bg-[#1e232d]">
                            <h3 className="font-bold text-gray-900 dark:text-white">งานล่าสุด</h3>
                            <Link to={`/projects/${id}/tasks`} className="text-sm text-[#135bec] hover:underline font-medium">ดูทั้งหมด</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-[#282e39] bg-gray-50 dark:bg-[#1a202c]">
                                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-[#9da6b9] uppercase tracking-wider w-[40%]">
                                            ชื่องาน
                                        </th>
                                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-[#9da6b9] uppercase tracking-wider w-[15%]">
                                            สถานะ
                                        </th>
                                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-[#9da6b9] uppercase tracking-wider w-[15%]">
                                            กำหนดเสร็จ
                                        </th>
                                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-[#9da6b9] uppercase tracking-wider w-[15%]">
                                            ผู้รับผิดชอบ
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-[#282e39]">
                                    {projectTasks.slice(0, 5).map((task) => {
                                        const assignee = members.find(m => m.id === task.assignee_id)
                                        const statusBadges = {
                                            todo: { variant: 'default' as const, label: 'รอดำเนินการ' },
                                            in_progress: { variant: 'warning' as const, label: 'กำลังทำ' },
                                            review: { variant: 'purple' as const, label: 'ตรวจสอบ' },
                                            done: { variant: 'success' as const, label: 'เสร็จแล้ว' },
                                        }

                                        return (
                                            <tr key={task.id} className="group hover:bg-gray-50 dark:hover:bg-[#252c3a] transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`size-5 rounded border flex items-center justify-center cursor-pointer transition-all ${task.status === 'done'
                                                            ? 'border-green-500 bg-green-500/20 text-green-500'
                                                            : 'border-gray-300 dark:border-[#9da6b9] hover:border-[#135bec] hover:text-[#135bec] text-transparent'
                                                            }`}>
                                                            <span className="material-symbols-outlined text-[16px]">check</span>
                                                        </div>
                                                        <span className={`text-sm font-medium ${task.status === 'done'
                                                            ? 'text-gray-400 dark:text-[#9da6b9] line-through'
                                                            : 'text-gray-900 dark:text-white group-hover:text-[#135bec]'
                                                            } transition-colors cursor-pointer`}>
                                                            {task.title}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant={statusBadges[task.status].variant}>
                                                        {statusBadges[task.status].label}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-500 dark:text-[#9da6b9]">
                                                    {task.due_date
                                                        ? new Date(task.due_date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })
                                                        : '-'
                                                    }
                                                </td>
                                                <td className="py-3 px-4">
                                                    {assignee ? (
                                                        <Avatar
                                                            src={assignee.avatar_url}
                                                            name={assignee.full_name || ''}
                                                            size="sm"
                                                        />
                                                    ) : (
                                                        <div className="size-7 rounded-full bg-gray-100 dark:bg-[#282e39] flex items-center justify-center text-[10px] text-gray-400 dark:text-[#9da6b9]">
                                                            ?
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {projectTasks.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-[#9da6b9]">
                                                ยังไม่มีงานในโปรเจกต์นี้
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Sidebar */}
                <aside className="w-full lg:w-[320px] flex flex-col gap-6">
                    {/* Project Links Card */}
                    {(project.demo_url || project.production_url || project.github_url) && (
                        <Card>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">ลิงก์</h3>
                            <div className="flex flex-col gap-3">
                                {project.production_url && (
                                    <a
                                        href={project.production_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#252c3a] transition-colors group"
                                    >
                                        <div className="size-8 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#135bec] transition-colors">Production</span>
                                            <span className="text-xs text-gray-500 dark:text-[#9da6b9] truncate max-w-[180px]">{project.production_url}</span>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-400 text-[16px] ml-auto">open_in_new</span>
                                    </a>
                                )}
                                {project.demo_url && (
                                    <a
                                        href={project.demo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#252c3a] transition-colors group"
                                    >
                                        <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[18px]">public</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#135bec] transition-colors">Demo / Staging</span>
                                            <span className="text-xs text-gray-500 dark:text-[#9da6b9] truncate max-w-[180px]">{project.demo_url}</span>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-400 text-[16px] ml-auto">open_in_new</span>
                                    </a>
                                )}
                                {project.github_url && (
                                    <a
                                        href={project.github_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#252c3a] transition-colors group"
                                    >
                                        <div className="size-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-center">
                                            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px] fill-current">
                                                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#135bec] transition-colors">Repository</span>
                                            <span className="text-xs text-gray-500 dark:text-[#9da6b9] truncate max-w-[180px]">{project.github_url}</span>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-400 text-[16px] ml-auto">open_in_new</span>
                                    </a>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Team Card */}
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">ทีม</h3>
                            <button className="text-[#135bec] hover:text-[#135bec]/80 text-xs font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">person_add</span>
                                เชิญ
                            </button>
                        </div>
                        <div className="flex flex-col gap-3">
                            {currentProjectMembers.map((member) => (
                                <div key={member.id} className="flex items-center gap-3">
                                    <Avatar
                                        src={member.avatar_url}
                                        name={member.full_name || ''}
                                        size="sm"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{member.full_name}</span>
                                        <span className="text-xs text-gray-500 dark:text-[#9da6b9]">{member.job_title}</span>
                                    </div>
                                </div>
                            ))}
                            <button className="mt-2 pt-3 border-t border-gray-100 dark:border-[#282e39] text-center text-gray-500 dark:text-[#9da6b9] hover:text-gray-900 dark:hover:text-white text-xs font-medium transition-colors">
                                ดูสมาชิกทั้งหมด
                            </button>
                        </div>
                    </Card>

                    {/* Sprint Goal Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-[#135bec]/20 dark:to-[#135bec]/5 rounded-xl border border-blue-200 dark:border-[#135bec]/20 p-5 shadow-sm dark:shadow-none">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">เป้าหมาย Sprint</h3>
                        <p className="text-xs text-gray-600 dark:text-blue-100 mb-4">
                            ทำงานสำคัญทุกอย่างให้เสร็จก่อนวันประชุม Review วันศุกร์นี้
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">4</span>
                            <span className="text-sm text-gray-500 dark:text-blue-200">วันที่เหลือ</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}
