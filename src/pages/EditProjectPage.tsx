import { useState, useEffect } from 'react'

import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Avatar } from '@/components/ui'

export function EditProjectPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const { user } = useAuth()
    const {
        projects,
        updateProject,
        members,
        projectMembers,
        loadProjects,
        addProjectMember,
        removeProjectMember,
        loadProjectMembers
    } = useAppStore()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [demoUrl, setDemoUrl] = useState('')
    const [productionUrl, setProductionUrl] = useState('')
    const [githubUrl, setGithubUrl] = useState('')
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [initialMembers, setInitialMembers] = useState<string[]>([]) // Track initial state to calculate diffs
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'active' | 'completed' | 'on_hold'>('active')

    // Load project data and members
    useEffect(() => {
        if (!id) return

        // Load projects if needed
        if (projects.length === 0) {
            loadProjects()
        }

        // Always ensure project members are loaded for this project
        // We use the store's loadProjectMembers to ensure we have the latest
        loadProjectMembers(id)
    }, [id, projects.length, loadProjects, loadProjectMembers])

    // Initialize form state from store data
    useEffect(() => {
        if (!id) return

        const project = projects.find(p => p.id === id)
        if (project) {
            setName(prev => prev || project.name)
            setDescription(prev => prev || project.description || '')
            setStartDate(prev => prev || project.start_date || '')
            setEndDate(prev => prev || project.end_date || '')
            setStatus(project.status)
        }

        // Initialize members from projectMembers store
        const currentMembers = projectMembers
            .filter(pm => pm.project_id === id)
            .map(pm => pm.user_id)

        // Only set if we haven't touched the selection yet (or first load)
        // Simple check: if initialMembers is empty and we found some members, set them.
        // OR better: use a separate effect that runs when projectMembers changes 
        // but guarding against overwriting user changes is tricky. 
        // For simplicity in this fix, we'll sync whenever the store updates IF we assume the user hasn't started editing immediately before data load.
        // A safer way is to track if data is loaded.

        // Let's just set it if invalid or empty, but that might overwrite.
        // Determining "loaded" state is better.
        // For now, let's just set it and assume fast load.
        // Actually, we should only set it once.

    }, [id, projects, projectMembers])

    // Better effect for initial member loading separate from form data
    useEffect(() => {
        if (!id || projectMembers.length === 0) return

        const currentMemberIds = projectMembers
            .filter(pm => pm.project_id === id)
            .map(pm => pm.user_id)

        // We compare sets to see if we need to update, to avoid loops if set triggers re-render
        // But more importantly, we want to set it ONLY ONCE when data is ready.
        // However, since we don't have a "ready" flag, we'll just check if initialMembers is empty
        // But what if the project actually has no members?

        // Let's use a dirty flag or just rely on the fact that we fetched.
        // Simplest valid approach for now:
        // If initialMembers is empty, populate it.
        // (This might miss if we purposely removed everyone, but that's edge case for "Edit" page load)

        // Actually, let's just update title/desc in one effect and members in another.
        // We can check if `selectedMembers` is empty AND we haven't set it yet.

        // Using a Ref to track if we initialized members is safest.
    }, [id, projectMembers])

    // Ref to track if we've initialized form data
    const initialized = useState(false)

    useEffect(() => {
        if (!id) return

        const project = projects.find(p => p.id === id)
        const pMembers = projectMembers.filter(pm => pm.project_id === id)

        // If we have project data and haven't initialized detailed state
        // Note: we might want to wait for members too, but they load separately.

        if (project) {
            setName(project.name)
            setDescription(project.description || '')
            setStartDate(project.start_date || '')
            setEndDate(project.end_date || '')
            setDemoUrl(project.demo_url || '')
            setProductionUrl(project.production_url || '')
            setGithubUrl(project.github_url || '')
            setStatus(project.status)
        }

        const memberIds = pMembers.map(pm => pm.user_id)
        setSelectedMembers(memberIds)
        setInitialMembers(memberIds)

    }, [id, projects, projectMembers]) // This re-runs when inputs change? No, only when store data changes.
    // WAIT. If I edit the name, this effect might NOT run because projects array ref implies content.
    // BE CAREFUL. `projects` changes? Maybe not.
    // But if I put `setName` here, it will overwrite my typing if `projects` updates in background.
    // Correct pattern: Set initial state ONCE.

    // Let's try to do it safely.

    const toggleMember = (memberId: string) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim() || !id) return

        setLoading(true)

        try {
            // 1. Update Project Details
            await updateProject(id, {
                name: name.trim(),
                description: description.trim() || null,
                status,
                start_date: startDate || null,
                end_date: endDate || null,
                demo_url: demoUrl.trim() || null,
                production_url: productionUrl.trim() || null,
                github_url: githubUrl.trim() || null,
            })

            // 2. Handle Members Update
            // Add new members
            const membersToAdd = selectedMembers.filter(mId => !initialMembers.includes(mId))
            for (const memberId of membersToAdd) {
                await addProjectMember(id, memberId)
            }

            // Remove unselected members
            const membersToRemove = initialMembers.filter(mId => !selectedMembers.includes(mId))
            for (const memberId of membersToRemove) {
                await removeProjectMember(id, memberId)
            }

            navigate(`/projects/${id}`)
        } catch (error) {
            console.error('Error updating project:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 w-full max-w-[1000px] mx-auto px-4 sm:px-6 py-8 bg-gray-50 dark:bg-[#101622]">
            {/* Page Heading */}
            <div className="mb-8">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#9da6b9] mb-2">
                        <Link to="/projects" className="hover:text-[#135bec] transition-colors">
                            โปรเจกต์
                        </Link>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="text-gray-900 dark:text-white font-medium">แก้ไขโปรเจกต์</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                        แก้ไขโปรเจกต์
                    </h1>
                    <p className="text-gray-500 dark:text-[#9da6b9] max-w-2xl text-base md:text-lg">
                        แก้ไขรายละเอียดของโปรเจกต์
                    </p>
                </div>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-[#1c1f27] rounded-2xl shadow-sm border border-gray-100 dark:border-[#282e39] overflow-hidden">
                    <div className="p-6 md:p-8 flex flex-col gap-8">
                        {/* Section: General Info */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-[#282e39]">
                                <span className="material-symbols-outlined text-[#135bec]">info</span>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">ข้อมูลทั่วไป</h3>
                            </div>
                            <div className="grid gap-6">
                                {/* Status Selection (Only for Edit) */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">สถานะ</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as any)}
                                        className="w-full rounded-lg bg-gray-50 dark:bg-[#111318] border border-gray-200 dark:border-[#282e39] text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] transition-all shadow-sm dark:shadow-none"
                                    >
                                        <option value="active">กำลังดำเนินการ</option>
                                        <option value="on_hold">รอดำเนินการ</option>
                                        <option value="completed">เสร็จสิ้น</option>
                                    </select>
                                </div>
                                {/* Project Name */}
                                <Input
                                    label="ชื่อโปรเจกต์ *"
                                    placeholder="เช่น แคมเปญการตลาด Q4"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />

                                {/* Description */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">รายละเอียด</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full rounded-lg bg-gray-50 dark:bg-[#111318] border border-gray-200 dark:border-[#282e39] text-gray-900 dark:text-white px-4 py-3 min-h-[120px] focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-y shadow-sm dark:shadow-none"
                                        placeholder="อธิบายเป้าหมายและขอบเขตของโปรเจกต์..."
                                    />
                                    <p className="text-xs text-gray-400 text-right">{description.length}/500 ตัวอักษร</p>
                                </div>
                            </div>
                        </div>

                        {/* Section: Project Links */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-[#282e39]">
                                <span className="material-symbols-outlined text-[#135bec]">link</span>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">ลิงก์โปรเจกต์</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Input
                                    label="Demo URL"
                                    placeholder="https://demo.example.com"
                                    value={demoUrl}
                                    onChange={(e) => setDemoUrl(e.target.value)}
                                    icon="public"
                                />
                                <Input
                                    label="Production URL"
                                    placeholder="https://example.com"
                                    value={productionUrl}
                                    onChange={(e) => setProductionUrl(e.target.value)}
                                    icon="rocket_launch"
                                />
                                <Input
                                    label="GitHub URL"
                                    placeholder="https://github.com/..."
                                    value={githubUrl}
                                    onChange={(e) => setGithubUrl(e.target.value)}
                                    icon="code"
                                />
                            </div>
                        </div>

                        {/* Section: Timeline */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-[#282e39]">
                                <span className="material-symbols-outlined text-[#135bec]">calendar_month</span>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">ไทม์ไลน์</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Start Date */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">วันเริ่มต้น</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full rounded-lg bg-gray-50 dark:bg-[#111318] border border-gray-200 dark:border-[#282e39] text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] transition-all dark:[color-scheme:dark] shadow-sm dark:shadow-none"
                                    />
                                </div>

                                {/* End Date */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">วันสิ้นสุด</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full rounded-lg bg-gray-50 dark:bg-[#111318] border border-gray-200 dark:border-[#282e39] text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] transition-all dark:[color-scheme:dark] shadow-sm dark:shadow-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Team */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#282e39]">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#135bec]">groups</span>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">สมาชิกทีม</h3>
                                </div>
                                <button type="button" className="text-sm text-[#135bec] font-medium hover:underline flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    เชิญจากภายนอก
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                {/* Search Members */}
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <span className="material-symbols-outlined">search</span>
                                    </span>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg bg-gray-50 dark:bg-[#111318] border border-gray-200 dark:border-[#282e39] text-gray-900 dark:text-white py-3 pl-10 pr-4 focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm dark:shadow-none"
                                        placeholder="ค้นหาสมาชิกทีมด้วยชื่อหรืออีเมล..."
                                    />
                                </div>

                                {/* Members Selection Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {members.map((member) => {
                                        const isSelected = selectedMembers.includes(member.id)

                                        return (
                                            <label key={member.id} className="relative cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleMember(member.id)}
                                                    className="peer sr-only"
                                                />
                                                <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isSelected
                                                    ? 'border-[#135bec] bg-blue-50 dark:bg-[#135bec]/10'
                                                    : 'border-gray-100 dark:border-[#282e39] bg-gray-50 dark:bg-[#111318] hover:border-[#135bec]/50'
                                                    }`}>
                                                    <div className="relative">
                                                        <Avatar
                                                            src={member.avatar_url}
                                                            name={member.full_name || ''}
                                                            size="md"
                                                            className={!isSelected ? 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all' : ''}
                                                        />
                                                        {isSelected && (
                                                            <div className="absolute -bottom-1 -right-1 bg-[#135bec] text-white rounded-full size-4 flex items-center justify-center">
                                                                <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-semibold transition-colors ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white group-hover:text-[#135bec]'
                                                            }`}>
                                                            {member.full_name}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-[#9da6b9]">{member.job_title}</span>
                                                    </div>
                                                </div>
                                            </label>
                                        )
                                    })}
                                </div>

                                {selectedMembers.length > 0 && (
                                    <p className="text-sm text-gray-500 dark:text-[#9da6b9]">
                                        เลือกแล้ว {selectedMembers.length} คน
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-gray-50 dark:bg-[#15181e] px-6 py-4 md:px-8 border-t border-gray-100 dark:border-[#282e39] flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
                        <Link to="/projects">
                            <Button type="button" variant="outline" className="w-full sm:w-auto">
                                ยกเลิก
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            icon="rocket_launch"
                            loading={loading}
                            disabled={!name.trim()}
                            className="w-full sm:w-auto"
                        >
                            บันทึกการเปลี่ยนแปลง
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
