import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Avatar } from '@/components/ui'
import { useAppStore } from '@/store/appStore'

export function SettingsPage() {
    const { user, profile, updateProfile, signOut } = useAuth()
    const [loading, setLoading] = useState(false)
    const [firstName, setFirstName] = useState(profile?.full_name?.split(' ')[0] || '')
    const [lastName, setLastName] = useState(profile?.full_name?.split(' ').slice(1).join(' ') || '')
    const email = user?.email || ''
    const [jobTitle, setJobTitle] = useState(profile?.job_title || '')
    const [bio, setBio] = useState(profile?.bio || '')

    // Notification settings
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [browserNotifications, setBrowserNotifications] = useState(true)
    const [weeklySummary, setWeeklySummary] = useState(false)

    const handleSave = async () => {
        setLoading(true)
        await updateProfile({
            full_name: `${firstName} ${lastName}`.trim(),
            job_title: jobTitle,
            bio: bio,
        })
        setLoading(false)
        alert('บันทึกข้อมูลสำเร็จ')
    }

    const handleResetData = async () => {
        if (confirm('ยืนยันคุณต้องการรีเซ็ตข้อมูลตัวอย่างทั้งหมดเป็นค่าเริ่มต้น?')) {
            await useAppStore.getState().resetData()
            alert('รีเซ็ตข้อมูลสำเร็จ')
            window.location.reload()
        }
    }

    return (
        <div className="flex h-full w-full bg-white dark:bg-[#101622]">
            {/* Sidebar Navigation */}


            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-[#101622]">
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 pb-24">
                    <div className="mx-auto flex flex-col gap-10">
                        {/* Page Heading */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
                                โปรไฟล์สาธารณะ
                            </h1>
                            <p className="text-gray-500 dark:text-[#9da6b9] text-base">
                                จัดการข้อมูลส่วนตัวของคุณที่จะแสดงให้ทีมเห็น และตั้งค่าบัญชี
                            </p>
                        </div>

                        <hr className="border-gray-200 dark:border-gray-800" />

                        {/* Avatar Section */}
                        <section className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between p-6 bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm dark:shadow-none">
                            <div className="flex items-center gap-5">
                                <div className="relative group">
                                    <Avatar
                                        src={profile?.avatar_url}
                                        name={profile?.full_name || 'User'}
                                        size="xl"
                                    />
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <span className="material-symbols-outlined text-white">edit</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-gray-900 dark:text-white text-lg font-bold">รูปโปรไฟล์</h3>
                                    <p className="text-gray-500 dark:text-[#9da6b9] text-sm">รองรับไฟล์ JPG, PNG (ไม่เกิน 2MB)</p>
                                </div>
                            </div>
                            <Button variant="outline">เปลี่ยนรูปภาพ</Button>
                        </section>

                        {/* Personal Information Form */}
                        <section className="flex flex-col gap-6">
                            <h2 className="text-gray-900 dark:text-white text-xl font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#135bec]">badge</span>
                                ข้อมูลส่วนตัว
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="ชื่อจริง"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                                <Input
                                    label="นามสกุล"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                                <div className="md:col-span-2">
                                    <Input
                                        label="อีเมล (ใช้สำหรับล็อกอิน)"
                                        type="email"
                                        icon="mail"
                                        value={email}
                                        disabled
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Input
                                        label="ตำแหน่งงาน"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-2 flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">เกี่ยวกับฉัน</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full rounded-lg bg-white dark:bg-[#1c1f27] border border-gray-200 dark:border-[#3b4354] px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] outline-none transition-all h-32 resize-none shadow-sm dark:shadow-none"
                                    />
                                    <span className="text-xs text-gray-400 text-right">{bio.length}/500 ตัวอักษร</span>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-200 dark:border-gray-800" />

                        {/* Notifications Section */}
                        <section className="flex flex-col gap-6">
                            <h2 className="text-gray-900 dark:text-white text-xl font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#135bec]">notifications_active</span>
                                การตั้งค่าการแจ้งเตือน
                            </h2>
                            <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-[#1e293b] shadow-sm dark:shadow-none">
                                {/* Item 1 */}
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-900 dark:text-white font-medium">แจ้งเตือนทางอีเมล</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">รับข่าวสารและการอัปเดตโปรเจกต์ทางอีเมล</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={emailNotifications}
                                            onChange={(e) => setEmailNotifications(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#135bec]/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#135bec]" />
                                    </label>
                                </div>

                                {/* Item 2 */}
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-900 dark:text-white font-medium">การแจ้งเตือนบนเบราว์เซอร์</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">แสดงป๊อปอัพเมื่อมีการเมนชั่นหรือมอบหมายงาน</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={browserNotifications}
                                            onChange={(e) => setBrowserNotifications(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#135bec]/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#135bec]" />
                                    </label>
                                </div>

                                {/* Item 3 */}
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-900 dark:text-white font-medium">สรุปรายสัปดาห์</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">ส่งสรุปความคืบหน้างานทุกวันจันทร์</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={weeklySummary}
                                            onChange={(e) => setWeeklySummary(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#135bec]/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#135bec]" />
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* Danger Zone */}
                        <section className="mt-8 pt-8 border-t border-red-100 dark:border-red-900/30 flex flex-col gap-6">
                            <h2 className="text-red-600 dark:text-red-400 text-xl font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined">warning</span>
                                โซนอันตราย
                            </h2>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                <div>
                                    <h3 className="text-red-600 dark:text-red-400 font-bold">รีเซ็ตข้อมูลทั้งหมด (Demo)</h3>
                                    <p className="text-red-500 dark:text-red-400/70 text-sm mt-1">
                                        คืนค่าข้อมูลตัวอย่างทั้งหมดกลับเป็นค่าเริ่มต้น (โปรเจกต์, งาน, สมาชิก)
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={handleResetData}
                                >
                                    รีเซ็ตข้อมูล
                                </Button>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                <div>
                                    <h3 className="text-red-600 dark:text-red-400 font-bold">ลบบัญชีผู้ใช้</h3>
                                    <p className="text-red-500 dark:text-red-400/70 text-sm mt-1">
                                        การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลทั้งหมดจะถูกลบถาวร
                                    </p>
                                </div>
                                <Button variant="danger">ลบบัญชีของคุณ</Button>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Sticky Action Bar */}
                <div className="sticky bottom-0 z-10 w-full bg-white/90 dark:bg-[#111318]/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-8 py-4 flex items-center justify-end gap-3">
                    <Button variant="ghost">ยกเลิก</Button>
                    <Button icon="save" loading={loading} onClick={handleSave}>
                        บันทึกการเปลี่ยนแปลง
                    </Button>
                </div>
            </main>
        </div>
    )
}
