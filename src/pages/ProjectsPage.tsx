import { Link } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { Card, Button, Avatar, Badge } from '@/components/ui'
import { ProjectCard } from '@/components/ProjectCard'

export function ProjectsPage() {
    const { projects, tasks, members } = useAppStore()



    return (
        <div className="p-4 md:p-8 flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">โปรเจกต์ทั้งหมด</h1>
                    <p className="text-gray-500 dark:text-[#9da6b9] text-sm mt-1">
                        จัดการและติดตามโปรเจกต์ของคุณ ({projects.length} โปรเจกต์)
                    </p>
                </div>
                <Link to="/projects/new">
                    <Button icon="add">สร้างโปรเจกต์ใหม่</Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 rounded-lg bg-[#135bec]/10 text-[#135bec] text-sm font-medium">
                    ทั้งหมด
                </button>
                <button className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#282e39] text-gray-500 dark:text-[#9da6b9] hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
                    กำลังดำเนินการ
                </button>
                <button className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#282e39] text-gray-500 dark:text-[#9da6b9] hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
                    เสร็จสิ้น
                </button>
                <button className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#282e39] text-gray-500 dark:text-[#9da6b9] hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
                    รอดำเนินการ
                </button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}

                {/* Add New Project Card */}
                <Link to="/projects/new">
                    <Card className="!border-dashed border-gray-300 dark:border-white/10 hover:border-[#135bec] dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-[#2d3542] flex flex-col items-center justify-center gap-3 cursor-pointer group min-h-[250px]">
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
    )
}
