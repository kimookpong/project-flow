import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input } from '@/components/ui'

export function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const { user, signIn } = useAuth()

    if (user) {
        return <Navigate to="/" replace />
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await signIn(email, password)
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
                        ยินดีต้อนรับกลับ
                    </h1>
                    <p className="text-gray-500 dark:text-[#9da6b9] text-sm font-normal leading-normal">
                        กรอกข้อมูลของคุณเพื่อเข้าสู่ระบบ
                    </p>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-8 pb-8">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

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
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label className="text-gray-900 dark:text-white text-sm font-medium leading-normal">
                                รหัสผ่าน
                            </label>
                        </div>
                        <div className="flex w-full flex-1 items-stretch rounded-lg relative">
                            <span className="absolute left-4 top-3 text-[#9da6b9] material-symbols-outlined text-xl select-none">
                                lock
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]/50 focus:border-[#135bec] border border-gray-300 dark:border-[#3b4354] bg-gray-50 dark:bg-[#111318] h-12 placeholder:text-gray-400 dark:placeholder:text-[#637588] pl-11 pr-12 text-sm font-normal leading-normal transition-all"
                                placeholder="กรอกรหัสผ่านของคุณ"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 top-0 bottom-0 px-3 text-[#9da6b9] hover:text-white transition-colors flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                        <div className="flex justify-end mt-1">
                            <a className="text-[#135bec] text-xs font-medium leading-normal hover:underline" href="#">
                                ลืมรหัสผ่าน?
                            </a>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-4 mt-2">
                        <Button
                            type="submit"
                            loading={loading}
                            className="h-12 text-base"
                        >
                            เข้าสู่ระบบ
                        </Button>
                    </div>

                    <div className="flex justify-center mt-4">
                        {/* Registration is now invite-only */}
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
