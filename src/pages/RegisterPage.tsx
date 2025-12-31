import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input } from '@/components/ui'

export function RegisterPage() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { user, signUp } = useAuth()

    if (user) {
        return <Navigate to="/" replace />
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน')
            return
        }

        if (password.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
            return
        }

        setLoading(true)

        try {
            await signUp(email, password, fullName)
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#101622] flex flex-col justify-center items-center p-4 sm:p-6">
            {/* Main Card */}
            <div className="w-full max-w-[480px] flex flex-col bg-white dark:bg-[#1c1f27] rounded-2xl shadow-xl border border-gray-200 dark:border-[#282e39] overflow-hidden">
                {/* Header Section */}
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-6">
                        <img src="/logo.png" alt="ProjectFlow Logo" className="w-10 h-10 rounded-xl" />
                        <h2 className="text-gray-900 dark:text-white text-xl font-bold leading-tight tracking-tight">
                            ProjectFlow
                        </h2>
                    </div>
                    <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-tight mb-2">
                        สร้างบัญชีใหม่
                    </h1>
                    <p className="text-gray-500 dark:text-[#9da6b9] text-sm font-normal leading-normal">
                        เริ่มต้นใช้งาน ProjectFlow วันนี้ ฟรี!
                    </p>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-8 pb-8">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Full Name Field */}
                    <Input
                        type="text"
                        label="ชื่อ-นามสกุล"
                        icon="person"
                        placeholder="สมชาย ใจดี"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />

                    {/* Email Field */}
                    <Input
                        type="email"
                        label="อีเมล"
                        icon="mail"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    {/* Password Field */}
                    <Input
                        type="password"
                        label="รหัสผ่าน"
                        icon="lock"
                        placeholder="อย่างน้อย 6 ตัวอักษร"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {/* Confirm Password Field */}
                    <Input
                        type="password"
                        label="ยืนยันรหัสผ่าน"
                        icon="lock"
                        placeholder="กรอกรหัสผ่านอีกครั้ง"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    {/* Actions */}
                    <div className="flex flex-col gap-4 mt-2">
                        <Button
                            type="submit"
                            loading={loading}
                            className="h-12 text-base"
                        >
                            สมัครสมาชิก
                        </Button>
                    </div>

                    <div className="flex justify-center mt-4">
                        <p className="text-gray-500 dark:text-[#9da6b9] text-sm font-normal leading-normal">
                            มีบัญชีอยู่แล้ว?{' '}
                            <Link to="/login" className="text-[#135bec] hover:text-blue-400 font-medium ml-1 transition-colors">
                                เข้าสู่ระบบ
                            </Link>
                        </p>
                    </div>
                </form>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-xs text-gray-400 dark:text-[#637588]">
                    © 2024 ProjectFlow Inc. All rights reserved.
                </p>
            </div>
        </div>
    )
}
