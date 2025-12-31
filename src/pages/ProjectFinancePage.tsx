import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { useAuth } from '@/contexts/AuthContext'
import { Card, Button, Avatar, Badge, Input } from '@/components/ui'
import type { ProjectIncome, ProjectExpense } from '@/lib/database.types'

type SortField = 'date' | 'amount' | 'title'
type SortOrder = 'asc' | 'desc'

export function ProjectFinancePage() {
    const { id } = useParams<{ id: string }>()
    const { user } = useAuth()
    const {
        projects,
        incomes,
        expenses,
        revenueShares,
        members,
        addIncome,
        updateIncome,
        addExpense,
        updateExpense,
        deleteIncome,
        deleteExpense,
        updateRevenueShare,
        loadProjectFinance
    } = useAppStore()

    const [showIncomeModal, setShowIncomeModal] = useState(false)
    const [showExpenseModal, setShowExpenseModal] = useState(false)
    const [editingIncome, setEditingIncome] = useState<ProjectIncome | null>(null)
    const [editingExpense, setEditingExpense] = useState<ProjectExpense | null>(null)

    // Filtering & Sorting State
    const [incomeFilter, setIncomeFilter] = useState<{ category: string; search: string }>({ category: 'all', search: '' })
    const [expenseFilter, setExpenseFilter] = useState<{ category: string; search: string }>({ category: 'all', search: '' })
    const [incomeSort, setIncomeSort] = useState<{ field: SortField; order: SortOrder }>({ field: 'date', order: 'desc' })
    const [expenseSort, setExpenseSort] = useState<{ field: SortField; order: SortOrder }>({ field: 'date', order: 'desc' })

    // Load finance data for this project
    useEffect(() => {
        if (id) {
            loadProjectFinance(id)
        }
    }, [id, loadProjectFinance])

    const project = projects.find(p => p.id === id)

    // Filtered and Sorted Incomes
    const processedIncomes = useMemo(() => {
        let result = incomes.filter(i => i.project_id === id)

        if (incomeFilter.category !== 'all') {
            result = result.filter(i => i.category === incomeFilter.category)
        }

        if (incomeFilter.search) {
            result = result.filter(i => i.title.toLowerCase().includes(incomeFilter.search.toLowerCase()))
        }

        return [...result].sort((a, b) => {
            const fieldA = a[incomeSort.field]
            const fieldB = b[incomeSort.field]
            if (fieldA === null || fieldB === null) return 0

            const multiplier = incomeSort.order === 'asc' ? 1 : -1
            if (fieldA < fieldB) return -1 * multiplier
            if (fieldA > fieldB) return 1 * multiplier
            return 0
        })
    }, [incomes, id, incomeFilter, incomeSort])

    // Filtered and Sorted Expenses
    const processedExpenses = useMemo(() => {
        let result = expenses.filter(e => e.project_id === id)

        if (expenseFilter.category !== 'all') {
            result = result.filter(e => e.category === expenseFilter.category)
        }

        if (expenseFilter.search) {
            result = result.filter(e => e.title.toLowerCase().includes(expenseFilter.search.toLowerCase()))
        }

        return [...result].sort((a, b) => {
            const fieldA = a[expenseSort.field]
            const fieldB = b[expenseSort.field]
            if (fieldA === null || fieldB === null) return 0

            const multiplier = expenseSort.order === 'asc' ? 1 : -1
            if (fieldA < fieldB) return -1 * multiplier
            if (fieldA > fieldB) return 1 * multiplier
            return 0
        })
    }, [expenses, id, expenseFilter, expenseSort])

    const projectShares = revenueShares.filter(s => s.project_id === id)

    if (!project) {
        return (
            <div className="p-8 text-center bg-gray-50 dark:bg-[#101622] min-h-screen">
                <h1 className="text-gray-900 dark:text-white text-2xl font-bold">ไม่พบโปรเจกต์</h1>
                <Link to="/projects" className="text-[#135bec] hover:underline mt-4 inline-block">
                    กลับไปหน้าโปรเจกต์
                </Link>
            </div>
        )
    }

    const totalIncome = incomes.filter(i => i.project_id === id).reduce((sum, i) => sum + i.amount, 0)
    const totalExpense = expenses.filter(e => e.project_id === id).reduce((sum, e) => sum + e.amount, 0)
    const netProfit = totalIncome - totalExpense
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const incomeCategoryLabels: Record<ProjectIncome['category'], string> = {
        contract: 'สัญญา',
        milestone: 'งวดงาน',
        bonus: 'โบนัส',
        other: 'อื่นๆ',
    }

    const expenseCategoryLabels: Record<ProjectExpense['category'], string> = {
        salary: 'เงินเดือน',
        software: 'ซอฟต์แวร์',
        hardware: 'ฮาร์ดแวร์',
        marketing: 'การตลาด',
        travel: 'เดินทาง',
        other: 'อื่นๆ',
    }

    const getTotalShare = () => {
        return projectShares.reduce((sum, s) => sum + s.share_percentage, 0)
    }

    const getMemberShare = (userId: string) => {
        const share = projectShares.find(s => s.user_id === userId)
        return share?.share_percentage || 0
    }

    const getMemberEarnings = (userId: string) => {
        const share = getMemberShare(userId)
        return (netProfit * share) / 100
    }

    const handleShareChange = (userId: string, value: string) => {
        const percentage = Math.min(100, Math.max(0, parseFloat(value) || 0))
        updateRevenueShare(id!, userId, percentage)
    }

    const handleEditIncome = (income: ProjectIncome) => {
        setEditingIncome(income)
        setShowIncomeModal(true)
    }

    const handleEditExpense = (expense: ProjectExpense) => {
        setEditingExpense(expense)
        setShowExpenseModal(true)
    }

    // Income Modal Component
    const IncomeModal = () => {
        const [title, setTitle] = useState(editingIncome?.title || '')
        const [amount, setAmount] = useState(editingIncome?.amount.toString() || '')
        const [category, setCategory] = useState<ProjectIncome['category']>(editingIncome?.category || 'contract')
        const [date, setDate] = useState(editingIncome?.date || new Date().toISOString().split('T')[0])
        const [description, setDescription] = useState(editingIncome?.description || '')

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault()
            const payload = {
                project_id: id!,
                title,
                description: description || null,
                amount: parseFloat(amount),
                date,
                category,
                created_by: editingIncome?.created_by || user?.id || null,
            }

            if (editingIncome) {
                updateIncome(editingIncome.id, payload)
            } else {
                addIncome(payload)
            }

            setShowIncomeModal(false)
            setEditingIncome(null)
        }

        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {editingIncome ? 'แก้ไขรายรับ' : 'เพิ่มรายรับ'}
                        </h2>
                        <button onClick={() => { setShowIncomeModal(false); setEditingIncome(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            label="ชื่อรายการ"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="เช่น เงินมัดจำโปรเจกต์"
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="จำนวนเงิน (บาท)"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                required
                            />
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ประเภท</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as ProjectIncome['category'])}
                                    className="w-full h-12 px-4 rounded-lg bg-gray-100 dark:bg-[#111318] border border-gray-200 dark:border-[#3b4354] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] transition-all"
                                >
                                    <option value="contract">สัญญา</option>
                                    <option value="milestone">งวดงาน</option>
                                    <option value="bonus">โบนัส</option>
                                    <option value="other">อื่นๆ</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">วันที่</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full h-12 px-4 rounded-lg bg-gray-100 dark:bg-[#111318] border border-gray-200 dark:border-[#3b4354] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] transition-all dark:[color-scheme:dark]"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">รายละเอียด (ไม่บังคับ)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-[#111318] border border-gray-200 dark:border-[#3b4354] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] transition-all resize-none h-20"
                                placeholder="รายละเอียดเพิ่มเติม..."
                            />
                        </div>
                        <div className="flex gap-3 justify-end mt-2">
                            <Button type="button" variant="ghost" onClick={() => { setShowIncomeModal(false); setEditingIncome(null); }}>
                                ยกเลิก
                            </Button>
                            <Button type="submit" icon={editingIncome ? 'save' : 'add'}>
                                {editingIncome ? 'บันทึกการแก้ไข' : 'เพิ่มรายรับ'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        )
    }

    // Expense Modal Component
    const ExpenseModal = () => {
        const [title, setTitle] = useState(editingExpense?.title || '')
        const [amount, setAmount] = useState(editingExpense?.amount.toString() || '')
        const [category, setCategory] = useState<ProjectExpense['category']>(editingExpense?.category || 'salary')
        const [date, setDate] = useState(editingExpense?.date || new Date().toISOString().split('T')[0])
        const [description, setDescription] = useState(editingExpense?.description || '')

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault()
            const payload = {
                project_id: id!,
                title,
                description: description || null,
                amount: parseFloat(amount),
                date,
                category,
                created_by: editingExpense?.created_by || user?.id || null,
            }

            if (editingExpense) {
                updateExpense(editingExpense.id, payload)
            } else {
                addExpense(payload)
            }

            setShowExpenseModal(false)
            setEditingExpense(null)
        }

        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {editingExpense ? 'แก้ไขค่าใช้จ่าย' : 'เพิ่มค่าใช้จ่าย'}
                        </h2>
                        <button onClick={() => { setShowExpenseModal(false); setEditingExpense(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            label="ชื่อรายการ"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="เช่น ค่าซอฟต์แวร์"
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="จำนวนเงิน (บาท)"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                required
                            />
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ประเภท</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as ProjectExpense['category'])}
                                    className="w-full h-12 px-4 rounded-lg bg-gray-100 dark:bg-[#111318] border border-gray-200 dark:border-[#3b4354] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] transition-all"
                                >
                                    <option value="salary">เงินเดือน</option>
                                    <option value="software">ซอฟต์แวร์</option>
                                    <option value="hardware">ฮาร์ดแวร์</option>
                                    <option value="marketing">การตลาด</option>
                                    <option value="travel">เดินทาง</option>
                                    <option value="other">อื่นๆ</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">วันที่</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full h-12 px-4 rounded-lg bg-gray-100 dark:bg-[#111318] border border-gray-200 dark:border-[#3b4354] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] transition-all dark:[color-scheme:dark]"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">รายละเอียด (ไม่บังคับ)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-[#111318] border border-gray-200 dark:border-[#3b4354] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] transition-all resize-none h-20"
                                placeholder="รายละเอียดเพิ่มเติม..."
                            />
                        </div>
                        <div className="flex gap-3 justify-end mt-2">
                            <Button type="button" variant="ghost" onClick={() => { setShowExpenseModal(false); setEditingExpense(null); }}>
                                ยกเลิก
                            </Button>
                            <Button type="submit" variant={editingExpense ? 'primary' : 'danger'} icon={editingExpense ? 'save' : 'remove'}>
                                {editingExpense ? 'บันทึกการแก้ไข' : 'เพิ่มค่าใช้จ่าย'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col max-w-[1400px] mx-auto w-full px-4 md:px-8 py-6 gap-6 bg-gray-50 dark:bg-[#101622]">
            {/* Breadcrumbs */}
            <div className="flex items-center flex-wrap gap-2 text-sm">
                <Link to="/projects" className="text-gray-500 dark:text-[#9da6b9] hover:text-[#135bec] transition-colors">
                    โปรเจกต์
                </Link>
                <span className="text-gray-400 dark:text-[#9da6b9]">/</span>
                <Link to={`/projects/${id}`} className="text-gray-500 dark:text-[#9da6b9] hover:text-[#135bec] transition-colors">
                    {project.name}
                </Link>
                <span className="text-gray-400 dark:text-[#9da6b9]">/</span>
                <span className="text-gray-900 dark:text-white font-medium">การเงิน</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">การเงินโปรเจกต์</h1>
                    <p className="text-gray-500 dark:text-[#9da6b9] text-sm mt-1">{project.name}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" icon="download">ส่งออก</Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-green-500/20 text-green-600 dark:text-green-400">
                            <span className="material-symbols-outlined">trending_up</span>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-[#9da6b9] text-xs uppercase tracking-wider">รายรับรวม</p>
                            <p className="text-gray-900 dark:text-white text-xl font-bold">{formatCurrency(totalIncome)}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400">
                            <span className="material-symbols-outlined">trending_down</span>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-[#9da6b9] text-xs uppercase tracking-wider">ค่าใช้จ่ายรวม</p>
                            <p className="text-gray-900 dark:text-white text-xl font-bold">{formatCurrency(totalExpense)}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${netProfit >= 0 ? 'bg-blue-100 dark:bg-blue-500/20 text-[#135bec] dark:text-blue-400' : 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400'}`}>
                            <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-[#9da6b9] text-xs uppercase tracking-wider">กำไรสุทธิ</p>
                            <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {formatCurrency(netProfit)}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                            <span className="material-symbols-outlined">percent</span>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-[#9da6b9] text-xs uppercase tracking-wider">อัตรากำไร</p>
                            <p className="text-gray-900 dark:text-white text-xl font-bold">{profitMargin}%</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Income & Expense Lists */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Income Section */}
                    <Card className="!p-0 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-[#282e39] bg-gray-50 dark:bg-[#1c2333]/50">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">arrow_downward</span>
                                    <h3 className="text-gray-900 dark:text-white font-bold">รายรับ ({processedIncomes.length})</h3>
                                </div>
                                <Button size="sm" icon="add" onClick={() => setShowIncomeModal(true)}>
                                    เพิ่มรายรับ
                                </Button>
                            </div>

                            {/* Filters & Sorting */}
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-gray-400">search</span>
                                    <input
                                        type="text"
                                        placeholder="ค้นหารายรับ..."
                                        value={incomeFilter.search}
                                        onChange={(e) => setIncomeFilter(prev => ({ ...prev, search: e.target.value }))}
                                        className="w-full h-9 pl-10 pr-4 rounded-lg bg-white dark:bg-[#111318] border border-gray-200 dark:border-[#3b4354] text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-[#135bec] outline-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        value={incomeFilter.category}
                                        onChange={(e) => setIncomeFilter(prev => ({ ...prev, category: e.target.value }))}
                                        className="h-9 px-3 rounded-lg bg-white dark:bg-[#111318] border border-gray-200 dark:border-[#3b4354] text-xs text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-[#135bec] outline-none"
                                    >
                                        <option value="all">ทุกประเภท</option>
                                        <option value="contract">สัญญา</option>
                                        <option value="milestone">งวดงาน</option>
                                        <option value="bonus">โบนัส</option>
                                        <option value="other">อื่นๆ</option>
                                    </select>
                                    <select
                                        value={`${incomeSort.field}-${incomeSort.order}`}
                                        onChange={(e) => {
                                            const [field, order] = e.target.value.split('-')
                                            setIncomeSort({ field: field as SortField, order: order as SortOrder })
                                        }}
                                        className="h-9 px-3 rounded-lg bg-white dark:bg-[#111318] border border-gray-200 dark:border-[#3b4354] text-xs text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-[#135bec] outline-none"
                                    >
                                        <option value="date-desc">วันที่ (ใหม่-เก่า)</option>
                                        <option value="date-asc">วันที่ (เก่า-ใหม่)</option>
                                        <option value="amount-desc">จำนวนเงิน (มาก-น้อย)</option>
                                        <option value="amount-asc">จำนวนเงิน (น้อย-มาก)</option>
                                        <option value="title-asc">ชื่อ (ก-ฮ)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-[#282e39]">
                            {processedIncomes.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-[#9da6b9]">
                                    <span className="material-symbols-outlined text-4xl mb-2 block text-gray-300 dark:text-[#3b4354]">payments</span>
                                    ไม่พบรายการที่ตรงกับเงื่อนไข
                                </div>
                            ) : (
                                processedIncomes.map((income) => (
                                    <div key={income.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#242b38] transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
                                                <span className="material-symbols-outlined text-[20px]">payments</span>
                                            </div>
                                            <div className="cursor-pointer" onClick={() => handleEditIncome(income)}>
                                                <p className="text-gray-900 dark:text-white font-medium hover:text-[#135bec] transition-colors">{income.title}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#9da6b9]">
                                                    <Badge variant="success" size="sm">{incomeCategoryLabels[income.category]}</Badge>
                                                    <span>{formatDate(income.date)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-green-600 dark:text-green-400 font-bold">+{formatCurrency(income.amount)}</span>
                                            <div className="flex opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => handleEditIncome(income)}
                                                    className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all p-1"
                                                    title="แก้ไข"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => deleteIncome(income.id)}
                                                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all p-1"
                                                    title="ลบ"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Expense Section */}
                    <Card className="!p-0 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-[#282e39] bg-gray-50 dark:bg-[#1c2333]/50">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-500 dark:text-red-400">arrow_upward</span>
                                    <h3 className="text-gray-900 dark:text-white font-bold">ค่าใช้จ่าย ({processedExpenses.length})</h3>
                                </div>
                                <Button size="sm" variant="outline" icon="add" onClick={() => setShowExpenseModal(true)}>
                                    เพิ่มค่าใช้จ่าย
                                </Button>
                            </div>

                            {/* Filters & Sorting */}
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-gray-400">search</span>
                                    <input
                                        type="text"
                                        placeholder="ค้นหาค่าใช้จ่าย..."
                                        value={expenseFilter.search}
                                        onChange={(e) => setExpenseFilter(prev => ({ ...prev, search: e.target.value }))}
                                        className="w-full h-9 pl-10 pr-4 rounded-lg bg-white dark:bg-[#111318] border border-gray-200 dark:border-[#3b4354] text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-[#135bec] outline-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        value={expenseFilter.category}
                                        onChange={(e) => setExpenseFilter(prev => ({ ...prev, category: e.target.value }))}
                                        className="h-9 px-3 rounded-lg bg-white dark:bg-[#111318] border border-gray-200 dark:border-[#3b4354] text-xs text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-[#135bec] outline-none"
                                    >
                                        <option value="all">ทุกประเภท</option>
                                        <option value="salary">เงินเดือน</option>
                                        <option value="software">ซอฟต์แวร์</option>
                                        <option value="hardware">ฮาร์ดแวร์</option>
                                        <option value="marketing">การตลาด</option>
                                        <option value="travel">เดินทาง</option>
                                        <option value="other">อื่นๆ</option>
                                    </select>
                                    <select
                                        value={`${expenseSort.field}-${expenseSort.order}`}
                                        onChange={(e) => {
                                            const [field, order] = e.target.value.split('-')
                                            setExpenseSort({ field: field as SortField, order: order as SortOrder })
                                        }}
                                        className="h-9 px-3 rounded-lg bg-white dark:bg-[#111318] border border-gray-200 dark:border-[#3b4354] text-xs text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-[#135bec] outline-none"
                                    >
                                        <option value="date-desc">วันที่ (ใหม่-เก่า)</option>
                                        <option value="date-asc">วันที่ (เก่า-ใหม่)</option>
                                        <option value="amount-desc">จำนวนเงิน (มาก-น้อย)</option>
                                        <option value="amount-asc">จำนวนเงิน (น้อย-มาก)</option>
                                        <option value="title-asc">ชื่อ (ก-ฮ)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-[#282e39]">
                            {processedExpenses.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-[#9da6b9]">
                                    <span className="material-symbols-outlined text-4xl mb-2 block text-gray-300 dark:text-[#3b4354]">receipt_long</span>
                                    ไม่พบรายการที่ตรงกับเงื่อนไข
                                </div>
                            ) : (
                                processedExpenses.map((expense) => (
                                    <div key={expense.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#242b38] transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
                                                <span className="material-symbols-outlined text-[20px]">receipt</span>
                                            </div>
                                            <div className="cursor-pointer" onClick={() => handleEditExpense(expense)}>
                                                <p className="text-gray-900 dark:text-white font-medium hover:text-[#135bec] transition-colors">{expense.title}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#9da6b9]">
                                                    <Badge variant="danger" size="sm">{expenseCategoryLabels[expense.category]}</Badge>
                                                    <span>{formatDate(expense.date)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-red-600 dark:text-red-400 font-bold">-{formatCurrency(expense.amount)}</span>
                                            <div className="flex opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => handleEditExpense(expense)}
                                                    className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all p-1"
                                                    title="แก้ไข"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => deleteExpense(expense.id)}
                                                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all p-1"
                                                    title="ลบ"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Revenue Share Settings */}
                <div className="flex flex-col gap-6">
                    <Card>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[#135bec]">pie_chart</span>
                            <h3 className="text-gray-900 dark:text-white font-bold">การแบ่งรายได้</h3>
                        </div>

                        <div className="mb-4 p-4 rounded-lg bg-gray-100 dark:bg-[#111318]">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-500 dark:text-[#9da6b9] text-sm">รวมสัดส่วนทั้งหมด</span>
                                <span className={`font-bold ${getTotalShare() === 100 ? 'text-green-600 dark:text-green-400' : getTotalShare() > 100 ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                    {getTotalShare()}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-[#282e39] rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${getTotalShare() === 100 ? 'bg-green-500' : getTotalShare() > 100 ? 'bg-red-500' : 'bg-yellow-500'
                                        }`}
                                    style={{ width: `${Math.min(getTotalShare(), 100)}%` }}
                                />
                            </div>
                            {getTotalShare() !== 100 && (
                                <p className="text-xs mt-2 text-yellow-600 dark:text-yellow-400">
                                    {getTotalShare() > 100 ? 'สัดส่วนเกิน 100%' : `เหลืออีก ${100 - getTotalShare()}%`}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            {members.map((member) => {
                                const share = getMemberShare(member.id)
                                const earnings = getMemberEarnings(member.id)

                                return (
                                    <div key={member.id} className="p-3 rounded-lg border border-gray-100 dark:border-none bg-white dark:bg-[#111318] hover:bg-gray-50 dark:hover:bg-[#1a202c] transition-colors shadow-sm dark:shadow-none">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Avatar
                                                src={member.avatar_url}
                                                name={member.full_name || ''}
                                                size="sm"
                                            />
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-gray-900 dark:text-white text-sm font-medium truncate">{member.full_name}</p>
                                                <p className="text-gray-500 dark:text-[#9da6b9] text-xs truncate">{member.job_title}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.5"
                                                    value={share}
                                                    onChange={(e) => handleShareChange(member.id, e.target.value)}
                                                    className="w-full h-9 px-3 pr-8 rounded-lg bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-[#3b4354] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] transition-all"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#9da6b9] text-sm">%</span>
                                            </div>
                                            <div className="w-28 text-right">
                                                <p className={`text-sm font-medium ${earnings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {formatCurrency(earnings)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {netProfit > 0 && getTotalShare() === 100 && (
                            <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                <p className="text-green-600 dark:text-green-400 text-sm font-medium text-center">
                                    ✓ พร้อมแบ่งรายได้แล้ว!
                                </p>
                            </div>
                        )}
                    </Card>

                    {/* Quick Summary */}
                    <Card className="!bg-gradient-to-br from-blue-50 to-blue-100 dark:from-[#135bec]/20 dark:to-[#135bec]/5 border-blue-200 dark:border-[#135bec]/20">
                        <h3 className="text-gray-900 dark:text-white font-bold mb-3">สรุป</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-[#9da6b9]">รายรับ</span>
                                <span className="text-green-600 dark:text-green-400 font-medium">{formatCurrency(totalIncome)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-[#9da6b9]">ค่าใช้จ่าย</span>
                                <span className="text-red-600 dark:text-red-400 font-medium">{formatCurrency(totalExpense)}</span>
                            </div>
                            <div className="border-t border-gray-300 dark:border-white/10 pt-2 mt-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-900 dark:text-white font-medium">กำไรที่แบ่งได้</span>
                                    <span className={`font-bold ${netProfit >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatCurrency(netProfit)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            {showIncomeModal && <IncomeModal />}
            {showExpenseModal && <ExpenseModal />}
        </div>
    )
}
