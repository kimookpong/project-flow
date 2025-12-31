import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Avatar } from '@/components/ui'

export function CreateProjectPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { createProject, members } = useAppStore()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const toggleMember = (memberId: string) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) return

        setLoading(true)

        try {
            const newProject = await createProject({
                name: name.trim(),
                description: description.trim() || null,
                status: 'active',
                start_date: startDate || null,
                end_date: endDate || null,
                created_by: user?.id || null,
            })

            navigate(`/projects/${newProject.id}`)
        } catch (error) {
            console.error('Error creating project:', error)
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
                        <span className="text-gray-900 dark:text-white font-medium">สร้างใหม่</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                        สร้างโปรเจกต์ใหม่
                    </h1>
                    <p className="text-gray-500 dark:text-[#9da6b9] max-w-2xl text-base md:text-lg">
                        กรอกรายละเอียดด้านล่างเพื่อเริ่มต้นโปรเจกต์ใหม่ของคุณ กำหนดขอบเขต ไทม์ไลน์ และเลือกสมาชิกทีม
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
                            สร้างโปรเจกต์
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
