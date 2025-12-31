import React, { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { Card, Button, Avatar, Badge, Input } from '@/components/ui'
import type { Profile } from '@/lib/database.types'

export function TeamPage() {
    const { members, tasks, createMember, updateMember, deleteMember } = useAppStore()
    const [searchQuery, setSearchQuery] = useState('')

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<Profile | null>(null)
    const [isResetPassword, setIsResetPassword] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        job_title: '',
        bio: '',
        avatar_url: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const filteredMembers = members.filter(member =>
        member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getMemberStats = (memberId: string) => {
        const memberTasks = tasks.filter(t => t.assignee_id === memberId)
        const inProgressTasks = memberTasks.filter(t => t.status === 'in_progress').length
        const totalCapacity = 5 // Max tasks per person
        const capacityPercent = Math.min((inProgressTasks / totalCapacity) * 100, 100)
        return { inProgressTasks, capacityPercent }
    }

    const getMemberStatus = (lastLogin: string | null | undefined) => {
        if (!lastLogin) return { status: 'offline', label: 'ออฟไลน์', color: 'bg-gray-400', lastActive: 'ไม่เคยใช้งาน' }

        const loginDate = new Date(lastLogin)
        const now = new Date()
        const diffInMinutes = (now.getTime() - loginDate.getTime()) / (1000 * 60)

        // Online if active within last 15 minutes
        if (diffInMinutes < 15) {
            return { status: 'online', label: 'ออนไลน์', color: 'bg-green-500', lastActive: 'ใช้งานเมื่อสักครู่' }
        } else if (diffInMinutes < 60) {
            return { status: 'away', label: 'ไม่อยู่', color: 'bg-yellow-500', lastActive: `ใช้งานเมื่อ ${Math.floor(diffInMinutes)} น. ที่แล้ว` }
        } else {
            const diffInHours = Math.floor(diffInMinutes / 60)
            let lastActiveStr = ''
            if (diffInHours < 24) {
                lastActiveStr = `ใช้งานเมื่อ ${diffInHours} ชม. ที่แล้ว`
            } else {
                lastActiveStr = `ใช้งานล่าสุด ${loginDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}`
            }
            return { status: 'offline', label: 'ออฟไลน์', color: 'bg-gray-400', lastActive: lastActiveStr }
        }
    }

    const handleOpenAddModal = () => {
        setEditingMember(null)
        setIsResetPassword(false)
        setFormData({ full_name: '', job_title: '', bio: '', avatar_url: '', email: '', password: '', confirmPassword: '' })
        setErrors({})
        setIsModalOpen(true)
    }

    const handleOpenEditModal = (member: Profile) => {
        setEditingMember(member)
        setIsResetPassword(false)
        setFormData({
            full_name: member.full_name || '',
            job_title: member.job_title || '',
            bio: member.bio || '',
            avatar_url: member.avatar_url || '',
            email: member.email || '',
            password: '',
            confirmPassword: ''
        })
        setErrors({})
        setIsModalOpen(true)
    }

    const handleDeleteMember = async (id: string) => {
        if (confirm('ยืนยันหน้าการลบสมาชิกคนนี้?')) {
            await deleteMember(id)
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.full_name.trim()) newErrors.full_name = 'กรุณากรอกชื่อ-นามสกุล'
        if (!formData.job_title.trim()) newErrors.job_title = 'กรุณากรอกตำแหน่งงาน'

        // Validate Email (Create or Edit)
        if (!formData.email.trim()) {
            newErrors.email = 'กรุณากรอกอีเมล'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
        }

        // Validate Password (Create or Reset)
        if (!editingMember || isResetPassword) {
            if (!formData.password) {
                newErrors.password = 'กรุณากรอกรหัสผ่าน'
            } else if (formData.password.length < 6) {
                newErrors.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        if (editingMember) {
            await updateMember(editingMember.id, formData)
        } else {
            await createMember(formData)
        }
        setIsModalOpen(false)
    }

    // Stats
    const totalMembers = members.length
    const activeMembers = members.filter(m => {
        if (!m.last_login) return false
        const diff = (new Date().getTime() - new Date(m.last_login).getTime()) / (1000 * 60)
        return diff < 15
    }).length
    const onLeave = 2 // Mock data for now as we don't have leave system yet

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1400px] mx-auto w-full bg-gray-50 dark:bg-[#101622]">
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-gray-900 dark:text-white">
                        สมาชิกทีม
                    </h1>
                    <p className="text-gray-500 dark:text-[#9da6b9] text-base max-w-2xl">
                        จัดการบุคลากร บทบาท และสถานะการทำงาน ติดตามว่าใครกำลังทำงานอะไร
                    </p>
                </div>
                <Button icon="person_add" onClick={handleOpenAddModal}>เพิ่มสมาชิก</Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-[#135bec]">
                            <span className="material-symbols-outlined text-[20px]">groups</span>
                        </div>
                        <p className="text-gray-500 dark:text-[#9da6b9] text-sm font-medium">สมาชิกทั้งหมด</p>
                    </div>
                    <p className="text-gray-900 dark:text-white text-3xl font-bold">{totalMembers}</p>
                    <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                        <span>+2 เดือนนี้</span>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                            <span className="material-symbols-outlined text-[20px]">radio_button_checked</span>
                        </div>
                        <p className="text-gray-500 dark:text-[#9da6b9] text-sm font-medium">ออนไลน์ตอนนี้</p>
                    </div>
                    <p className="text-gray-900 dark:text-white text-3xl font-bold">{activeMembers}</p>
                    <div className="text-xs text-gray-500 dark:text-[#9da6b9] mt-1">
                        {Math.round((activeMembers / totalMembers) * 100)}% ของทีมกำลังออนไลน์
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                            <span className="material-symbols-outlined text-[20px]">beach_access</span>
                        </div>
                        <p className="text-gray-500 dark:text-[#9da6b9] text-sm font-medium">ลาพักผ่อน</p>
                    </div>
                    <p className="text-gray-900 dark:text-white text-3xl font-bold">{onLeave}</p>
                    <div className="text-xs text-gray-500 dark:text-[#9da6b9] mt-1">
                        กลับมาวันจันทร์หน้า
                    </div>
                </Card>
            </div>

            {/* Filters & Search */}
            <Card className="!p-2 flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Search */}
                <div className="w-full md:w-96 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#9da6b9] material-symbols-outlined text-[20px]">
                        search
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-100 dark:bg-[#282e39] border-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#9da6b9] focus:ring-2 focus:ring-[#135bec] focus:outline-none text-sm transition-all"
                        placeholder="ค้นหาชื่อหรืออีเมล..."
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-[#3b4354] hover:bg-gray-50 dark:hover:bg-[#282e39] text-gray-700 dark:text-white text-sm font-medium transition-colors whitespace-nowrap">
                        <span>แผนก</span>
                        <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-[#3b4354] hover:bg-gray-50 dark:hover:bg-[#282e39] text-gray-700 dark:text-white text-sm font-medium transition-colors whitespace-nowrap">
                        <span>บทบาท</span>
                        <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-[#3b4354] hover:bg-gray-50 dark:hover:bg-[#282e39] text-gray-700 dark:text-white text-sm font-medium transition-colors whitespace-nowrap">
                        <span>สถานะ</span>
                        <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                    </button>
                </div>
            </Card>

            {/* Team Members Table */}
            <Card className="!p-0 overflow-hidden">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-[#282e39] bg-gray-50 dark:bg-[#232936] text-xs font-semibold text-gray-500 dark:text-[#9da6b9] uppercase tracking-wider">
                    <div className="col-span-4">สมาชิก</div>
                    <div className="col-span-2">บทบาท</div>
                    <div className="col-span-2">สถานะ</div>
                    <div className="col-span-3">ภาระงาน</div>
                    <div className="col-span-1 text-right">จัดการ</div>
                </div>

                {/* Table Body */}
                <div className="flex flex-col divide-y divide-gray-100 dark:divide-[#282e39]">
                    {filteredMembers.map((member, index) => {
                        const stats = getMemberStats(member.id)
                        const statusInfo = getMemberStatus(member.last_login)

                        const roleColors: Record<string, string> = {
                            'Product Manager': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
                            'UI/UX Designer': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                            'Frontend Developer': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
                            'Backend Developer': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
                            'QA Engineer': 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300',
                        }

                        return (
                            <div key={member.id} className="group md:grid md:grid-cols-12 md:gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-[#1f242f] transition-colors">
                                {/* Member Info */}
                                <div className="flex items-center gap-3 col-span-4 mb-3 md:mb-0">
                                    <div className="relative">
                                        <Avatar
                                            src={member.avatar_url}
                                            name={member.full_name || ''}
                                            size="md"
                                        />
                                        <div className={`absolute bottom-0 right-0 size-3 ${statusInfo.color} border-2 border-white dark:border-[#1a202c] rounded-full`} />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-gray-900 dark:text-white text-sm font-semibold">{member.full_name}</p>
                                        <p className="text-gray-500 dark:text-[#9da6b9] text-xs">{member.email}</p>
                                    </div>
                                </div>

                                {/* Role */}
                                <div className="col-span-2 flex items-center mb-2 md:mb-0">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[member.job_title || ''] || 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'}`}>
                                        {member.job_title}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="col-span-2 flex flex-col gap-1 mb-2 md:mb-0">
                                    <div className="flex items-center gap-2">
                                        <div className={`size-2 rounded-full ${statusInfo.color}`} />
                                        <span className="text-gray-700 dark:text-white text-sm font-medium">{statusInfo.label}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-[#9da6b9] pl-4">{statusInfo.lastActive}</span>
                                </div>

                                {/* Capacity */}
                                <div className="col-span-3 flex flex-col gap-1 mb-2 md:mb-0">
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-[#9da6b9]">
                                        <span>{stats.inProgressTasks} งานกำลังทำ</span>
                                        <span>{Math.round(stats.capacityPercent)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-[#3b4354] rounded-full h-1.5">
                                        <div
                                            className={`h-1.5 rounded-full ${stats.capacityPercent > 80 ? 'bg-red-500' :
                                                stats.capacityPercent > 50 ? 'bg-yellow-500' :
                                                    'bg-[#135bec]'
                                                }`}
                                            style={{ width: `${stats.capacityPercent}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="col-span-1 flex justify-end gap-2">
                                    <button
                                        onClick={() => handleOpenEditModal(member)}
                                        className="p-1 rounded-lg text-gray-400 dark:text-[#9da6b9] hover:text-[#135bec] hover:bg-[#135bec]/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMember(member.id)}
                                        className="p-1 rounded-lg text-gray-400 dark:text-[#9da6b9] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-[#282e39] bg-gray-50 dark:bg-[#232936]">
                    <p className="text-sm text-gray-500 dark:text-[#9da6b9]">
                        แสดง <span className="font-medium text-gray-900 dark:text-white">1</span> ถึง{' '}
                        <span className="font-medium text-gray-900 dark:text-white">{filteredMembers.length}</span> จาก{' '}
                        <span className="font-medium text-gray-900 dark:text-white">{members.length}</span> รายการ
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>ก่อนหน้า</Button>
                        <Button variant="outline" size="sm">ถัดไป</Button>
                    </div>
                </div>
            </Card>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingMember ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มสมาชิกใหม่'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#282e39] text-gray-500 dark:text-[#9da6b9] transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <Input
                                        label="ชื่อ-นามสกุล"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        placeholder="เช่น นายสมชาย ใจดี"
                                        required
                                    />
                                    {errors.full_name && <p className="text-red-500 text-xs">{errors.full_name}</p>}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Input
                                        label="ตำแหน่งงาน"
                                        value={formData.job_title}
                                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                        placeholder="เช่น Frontend Developer"
                                        required
                                    />
                                    {errors.job_title && <p className="text-red-500 text-xs">{errors.job_title}</p>}
                                </div>
                            </div>

                            {!editingMember && (
                                <div className="flex flex-col gap-1">
                                    <Input
                                        label="อีเมล"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@example.com"
                                        required
                                    />
                                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                                </div>
                            )}

                            {editingMember && (
                                <div className="flex flex-col gap-1">
                                    <Input
                                        label="อีเมล (แก้ไข)"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@example.com"
                                        required
                                    />
                                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                                </div>
                            )}

                            {editingMember && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="resetPassword"
                                        checked={isResetPassword}
                                        onChange={(e) => setIsResetPassword(e.target.checked)}
                                        className="rounded border-gray-300 dark:border-[#3b4354] text-[#135bec] focus:ring-[#135bec]"
                                    />
                                    <label htmlFor="resetPassword" className="text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
                                        เปลี่ยนรหัสผ่าน
                                    </label>
                                </div>
                            )}

                            {(!editingMember || isResetPassword) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex flex-col gap-1">
                                        <Input
                                            label={editingMember ? "รหัสผ่านใหม่" : "รหัสผ่าน"}
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                            required={!editingMember || isResetPassword}
                                        />
                                        {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Input
                                            label={editingMember ? "ยืนยันรหัสผ่านใหม่" : "ยืนยันรหัสผ่าน"}
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            placeholder="••••••••"
                                            required={!editingMember || isResetPassword}
                                        />
                                        {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    เกี่ยวกับสมาชิก
                                </label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full rounded-lg bg-gray-50 dark:bg-[#111318] border border-gray-300 dark:border-[#3b4354] text-gray-900 dark:text-white p-3 min-h-[100px] focus:ring-2 focus:ring-[#135bec]/50 outline-none transition-all"
                                    placeholder="คำอธิบายสั้นๆ..."
                                />
                            </div>
                            <Input
                                label="รูปภาพโปรไฟล์ (URL)"
                                value={formData.avatar_url}
                                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                placeholder="https://..."
                            />

                            <div className="flex justify-end gap-3 mt-4">
                                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                                    ยกเลิก
                                </Button>
                                <Button type="submit">
                                    {editingMember ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มสมาชิก'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    )
}
