import { useSearchParams, Link } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { Card, Badge, Avatar } from '@/components/ui'

export function SearchPage() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') || ''
    const { projects, tasks, members } = useAppStore()

    const lowerQuery = query.toLowerCase()

    const foundProjects = projects.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        (p.description && p.description.toLowerCase().includes(lowerQuery))
    )

    const foundTasks = tasks.filter(t =>
        t.title.toLowerCase().includes(lowerQuery) ||
        (t.description && t.description.toLowerCase().includes(lowerQuery))
    )

    return (
        <div className="flex flex-col mx-auto px-4 md:px-8 py-8 bg-gray-50 dark:bg-[#101622] min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    ผลการค้นหา: "{query}"
                </h1>
                <p className="text-gray-500 dark:text-[#9da6b9]">
                    พบ {foundProjects.length} โปรเจกต์ และ {foundTasks.length} งาน
                </p>
            </div>

            <div className="space-y-8">
                {/* Projects Section */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">folder</span>
                        โปรเจกต์ ({foundProjects.length})
                    </h2>
                    {foundProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {foundProjects.map(project => (
                                <Link key={project.id} to={`/projects/${project.id}`} className="block">
                                    <Card hover className="h-full">
                                        <div className="flex flex-col h-full gap-3">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={project.name}>
                                                    {project.name}
                                                </h3>
                                                <Badge variant={
                                                    project.status === 'active' ? 'success' :
                                                        project.status === 'completed' ? 'default' : 'warning'
                                                }>
                                                    {project.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-[#9da6b9] line-clamp-2 mt-1">
                                                {project.description || 'ไม่มีรายละเอียด'}
                                            </p>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400 dark:text-gray-600 bg-white dark:bg-[#161b24] p-8 rounded-xl text-center border border-dashed border-gray-200 dark:border-gray-700">
                            ไม่พบโปรเจกต์ที่ตรงกับเงื่อนไข
                        </div>
                    )}
                </section>

                {/* Tasks Section */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500">task</span>
                        งาน ({foundTasks.length})
                    </h2>
                    {foundTasks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {foundTasks.map(task => {
                                const assignee = members.find(m => m.id === task.assignee_id)
                                return (
                                    <div key={task.id} className="block">
                                        <Card className="h-full">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                                                        {task.title}
                                                    </h4>
                                                    <Badge className="text-xs">
                                                        {task.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-[#9da6b9] line-clamp-2">
                                                    {task.description || 'ไม่มีรายละเอียด'}
                                                </p>
                                                <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
                                                    {assignee ? (
                                                        <div className="flex items-center gap-2">
                                                            <Avatar src={assignee.avatar_url} name={assignee.full_name || ''} size="xs" />
                                                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[100px]">
                                                                {assignee.full_name}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Unassigned</span>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-gray-400 dark:text-gray-600 bg-white dark:bg-[#161b24] p-8 rounded-xl text-center border border-dashed border-gray-200 dark:border-gray-700">
                            ไม่พบงานที่ตรงกับเงื่อนไข
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
