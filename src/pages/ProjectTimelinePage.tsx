import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useAppStore } from '@/store/appStore'

export function ProjectTimelinePage() {
    const { id } = useParams<{ id: string }>()
    const { projects } = useAppStore()
    const project = projects.find(p => p.id === id)

    // Mock Timeline Data
    // In real app, this would be computed from project.start_date, project.end_date, and tasks
    const months = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.']
    const timelineData = [
        { id: 1, name: 'Kickoff Meeting', start: 1, duration: 2, status: 'completed', assignee: 'Alex', color: 'bg-green-500' },
        { id: 2, name: 'Design System', start: 3, duration: 4, status: 'completed', assignee: 'Sarah', color: 'bg-blue-500' },
        { id: 3, name: 'Frontend Dev', start: 6, duration: 6, status: 'in_progress', assignee: 'Mike', color: 'bg-purple-500' },
        { id: 4, name: 'Backend API', start: 6, duration: 5, status: 'in_progress', assignee: 'John', color: 'bg-orange-500' },
        { id: 5, name: 'Testing & QA', start: 11, duration: 3, status: 'todo', assignee: 'Team', color: 'bg-gray-400' },
    ]

    if (!project) return null

    return (
        <div className="flex flex-col max-w-[1400px] mx-auto w-full px-4 md:px-8 py-6 gap-6 bg-gray-50 dark:bg-[#101622] min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center flex-wrap gap-2 text-sm">
                    <Link to="/projects" className="text-gray-500 dark:text-[#9da6b9] hover:text-[#135bec] transition-colors">
                        โปรเจกต์
                    </Link>
                    <span className="text-gray-400 dark:text-[#9da6b9]">/</span>
                    <Link to={`/projects/${id}`} className="text-gray-500 dark:text-[#9da6b9] hover:text-[#135bec] transition-colors">
                        {project.name}
                    </Link>
                    <span className="text-gray-400 dark:text-[#9da6b9]">/</span>
                    <span className="text-gray-900 dark:text-white font-medium">Timeline</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link to={`/projects/${id}`}><Button variant="outline">กลับ</Button></Link>
                    <Button icon="add">เพิ่มกิจกรรม</Button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-8 border-b border-gray-200 dark:border-[#282e39] overflow-x-auto scrollbar-hide">
                <Link to={`/projects/${id}`} className="pb-3 border-b-2 border-transparent text-gray-500 dark:text-[#9da6b9] hover:text-[#135bec] dark:hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
                    ภาพรวม
                </Link>
                <Link to={`/projects/${id}/tasks`} className="pb-3 border-b-2 border-transparent text-gray-500 dark:text-[#9da6b9] hover:text-[#135bec] dark:hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
                    งาน
                </Link>
                <Link to={`/projects/${id}/finance`} className="pb-3 border-b-2 border-transparent text-gray-500 dark:text-[#9da6b9] hover:text-[#135bec] dark:hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
                    การเงิน
                </Link>
                <Link to={`/projects/${id}/files`} className="pb-3 border-b-2 border-transparent text-gray-500 dark:text-[#9da6b9] hover:text-[#135bec] dark:hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
                    ไฟล์
                </Link>
                <Link to={`/projects/${id}/timeline`} className="pb-3 border-b-2 border-[#135bec] text-[#135bec] font-bold text-sm">
                    Timeline
                </Link>
            </div>

            {/* Timeline Content */}
            <div className="bg-white dark:bg-[#1e232d] border border-gray-100 dark:border-[#282e39] rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 dark:border-[#282e39] flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#135bec]">calendar_month</span>
                        ไทม์ไลน์โครงการ Q4 2023
                    </h3>
                    <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#282e39] rounded text-gray-500"><span className="material-symbols-outlined">zoom_in</span></button>
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#282e39] rounded text-gray-500"><span className="material-symbols-outlined">zoom_out</span></button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-[800px] p-6">
                        {/* Month Headers */}
                        <div className="grid grid-cols-12 gap-0 mb-4 border-b border-gray-100 dark:border-[#282e39] pb-2">
                            {months.map((month, idx) => (
                                <div key={idx} className="col-span-3 text-sm font-semibold text-gray-500 dark:text-[#9da6b9] pl-2 border-l border-gray-100 dark:border-[#282e39]">
                                    {month}
                                </div>
                            ))}
                        </div>

                        {/* Grid Lines Background */}
                        <div className="relative">
                            <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="border-l border-gray-50 dark:border-[#282e39] h-full"></div>
                                ))}
                            </div>

                            {/* Tasks Rows */}
                            <div className="flex flex-col gap-4 relative py-2">
                                {timelineData.map((task) => (
                                    <div key={task.id} className="grid grid-cols-12 relative h-10 items-center group">
                                        {/* Bar */}
                                        <div
                                            className={`col-start-${task.start} col-span-${task.duration} rounded-lg ${task.color} opacity-90 hover:opacity-100 transition-all shadow-sm cursor-pointer relative flex items-center px-3 z-10`}
                                            style={{
                                                gridColumnStart: task.start,
                                                gridColumnEnd: `span ${task.duration}`
                                            }}
                                        >
                                            <span className="text-white text-xs font-medium truncate">{task.name}</span>

                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                                {task.name} • {task.assignee}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
