import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Button, Avatar, Badge, Input } from '@/components/ui'
import { useAppStore } from '@/store/appStore'

export function ProjectFilesPage() {
    const { id } = useParams<{ id: string }>()
    const { projects } = useAppStore()
    const project = projects.find(p => p.id === id)

    // Mock Files Data
    const [files] = useState([
        { id: 1, name: 'Project_Proposal.pdf', type: 'pdf', size: '2.4 MB', uploadedBy: 'Alex Morgan', date: '2023-10-24' },
        { id: 2, name: 'Design_System_v2.fig', type: 'figma', size: '15.8 MB', uploadedBy: 'Sarah Chen', date: '2023-10-25' },
        { id: 3, name: 'Q4_Financial_Report.xlsx', type: 'excel', size: '450 KB', uploadedBy: 'Mike Ross', date: '2023-10-26' },
        { id: 4, name: 'Logo_Assets.zip', type: 'zip', size: '128 MB', uploadedBy: 'Alex Morgan', date: '2023-10-27' },
        { id: 5, name: 'Meeting_Notes_Kickoff.docx', type: 'word', size: '1.2 MB', uploadedBy: 'Sarah Chen', date: '2023-10-28' },
    ])

    if (!project) return null

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf': return 'picture_as_pdf';
            case 'figma': return 'image';
            case 'excel': return 'table_view';
            case 'zip': return 'folder_zip';
            case 'word': return 'description';
            default: return 'insert_drive_file';
        }
    }

    const getFileColor = (type: string) => {
        switch (type) {
            case 'pdf': return 'text-red-500 bg-red-50 dark:bg-red-900/10';
            case 'figma': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/10';
            case 'excel': return 'text-green-500 bg-green-50 dark:bg-green-900/10';
            case 'zip': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/10';
            case 'word': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/10';
            default: return 'text-gray-500 bg-gray-50 dark:bg-gray-800';
        }
    }

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
                    <span className="text-gray-900 dark:text-white font-medium">ไฟล์</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link to={`/projects/${id}`}><Button variant="outline">กลับ</Button></Link>
                    <Button icon="upload_file">อัปโหลดไฟล์</Button>
                </div>
            </div>

            {/* Tab Navigation (To be reused or componentized later) */}
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
                <Link to={`/projects/${id}/files`} className="pb-3 border-b-2 border-[#135bec] text-[#135bec] font-bold text-sm">
                    ไฟล์
                </Link>
                <Link to={`/projects/${id}/timeline`} className="pb-3 border-b-2 border-transparent text-gray-500 dark:text-[#9da6b9] hover:text-[#135bec] dark:hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
                    Timeline
                </Link>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#1e232d] p-4 rounded-xl border border-gray-100 dark:border-[#282e39]">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#135bec]">folder_open</span>
                        ไฟล์ทั้งหมด ({files.length})
                    </h3>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-[240px]">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </span>
                            <input
                                type="text"
                                placeholder="ค้นหาไฟล์..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#111318] border border-gray-200 dark:border-[#282e39] rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-[#135bec] outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {files.map((file) => (
                        <div key={file.id} className="bg-white dark:bg-[#1e232d] p-4 rounded-xl border border-gray-100 dark:border-[#282e39] hover:border-[#135bec] dark:hover:border-[#135bec] transition-all group cursor-pointer flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className={`size-12 rounded-lg flex items-center justify-center ${getFileColor(file.type)}`}>
                                    <span className="material-symbols-outlined text-[24px]">{getFileIcon(file.type)}</span>
                                </div>
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-[#282e39] rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                </button>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-[#135bec] transition-colors" title={file.name}>{file.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-[#9da6b9] mt-1">{file.size} • {file.date}</p>
                            </div>

                            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-50 dark:border-[#282e39]">
                                <div className="size-6 rounded-full bg-gray-200 dark:bg-[#282e39] flex items-center justify-center text-[10px] text-gray-600 dark:text-gray-400">
                                    {file.uploadedBy.charAt(0)}
                                </div>
                                <span className="text-xs text-gray-500 dark:text-[#9da6b9]">โดย {file.uploadedBy}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
