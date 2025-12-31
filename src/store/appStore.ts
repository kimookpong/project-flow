import { create } from 'zustand'
import type {
    Project,
    ProjectMember,
    Task,
    Profile,
    Notification,
    ProjectIncome,
    ProjectExpense,
    MemberRevenueShare,
    Database
} from '@/lib/database.types'
import * as api from '@/lib/supabase-service'

type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']
type IncomeInsert = Database['public']['Tables']['project_income']['Insert']
type ExpenseInsert = Database['public']['Tables']['project_expenses']['Insert']

// Demo data for development (when Supabase is not configured)
const DEMO_MEMBERS: Profile[] = [
    {
        id: '1',
        full_name: 'สมชาย ใจดี',
        email: 'somchai@example.com',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=somchai',
        job_title: 'Product Manager',
        bio: 'ดูแลภาพรวมของโปรเจกต์',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString(), // Online
    },
    {
        id: '2',
        full_name: 'วิภาวี สุขใจ',
        email: 'wipawee@example.com',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wipawee',
        job_title: 'UI/UX Designer',
        bio: 'ออกแบบ UI/UX ของแอปพลิเคชัน',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // Online (2 mins ago)
    },
    {
        id: '3',
        full_name: 'กานดา พรมมา',
        email: 'kanda@example.com',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kanda',
        job_title: 'Frontend Developer',
        bio: 'พัฒนาส่วน Frontend',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // Away (45 mins ago)
    },
    {
        id: '4',
        full_name: 'David Chen',
        email: 'david@example.com',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
        job_title: 'Backend Developer',
        bio: 'พัฒนาส่วน Backend และ API',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // Offline (5 hours ago)
    },
    {
        id: '5',
        full_name: 'Sarah Miller',
        email: 'sarah@example.com',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        job_title: 'QA Engineer',
        bio: 'ทดสอบและประกันคุณภาพ',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: null, // Offline (Never)
    },
]

const DEMO_PROJECTS: Project[] = [
    {
        id: 'project-1',
        name: 'Website Redesign Q3',
        description: 'ปรับปรุงเว็บไซต์องค์กรสำหรับแคมเปญการตลาด Q3',
        status: 'active',
        start_date: '2024-09-01',
        end_date: '2024-10-31',
        created_by: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        demo_url: 'https://demo.example.com',
        production_url: 'https://example.com',
        github_url: 'https://github.com/example/project',
    },
    {
        id: 'project-2',
        name: 'Mobile App Phase 1',
        description: 'พัฒนาแอปพลิเคชันมือถือสำหรับลูกค้า',
        status: 'active',
        start_date: '2024-08-15',
        end_date: '2024-12-15',
        created_by: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        demo_url: null,
        production_url: null,
        github_url: null,
    },
    {
        id: 'project-3',
        name: 'Marketing Campaign Q4',
        description: 'วางแผนและดำเนินการแคมเปญการตลาดสำหรับ Q4',
        status: 'active',
        start_date: '2024-10-01',
        end_date: '2024-12-31',
        created_by: '2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        demo_url: null,
        production_url: null,
        github_url: null,
    },
]

const DEMO_TASKS: Task[] = [
    { id: 'task-1', project_id: 'project-1', title: 'ออกแบบ Design System', description: '', status: 'in_progress', priority: 'high', due_date: '2024-10-12', assignee_id: '2', created_by: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'task-2', project_id: 'project-1', title: 'Wireframes หน้า Homepage', description: '', status: 'done', priority: 'high', due_date: '2024-10-10', assignee_id: '2', created_by: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'task-3', project_id: 'project-1', title: 'พัฒนา Responsive Layout', description: '', status: 'todo', priority: 'medium', due_date: '2024-10-18', assignee_id: '3', created_by: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'task-4', project_id: 'project-2', title: 'พัฒนา Landing Page', description: '', status: 'in_progress', priority: 'high', due_date: '2024-10-26', assignee_id: '3', created_by: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'task-5', project_id: 'project-2', title: 'SEO Audit', description: '', status: 'review', priority: 'medium', due_date: '2024-10-20', assignee_id: '4', created_by: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

const DEMO_NOTIFICATIONS: Notification[] = [
    { id: 'notif-1', user_id: 'demo-user-id', type: 'task_assigned', title: 'มอบหมายงานใหม่', content: 'สมชาย มอบหมายงาน "ออกแบบ Design System" ให้คุณ', reference_id: 'task-1', reference_type: 'task', is_read: false, created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
    { id: 'notif-2', user_id: 'demo-user-id', type: 'comment', title: 'คอมเมนต์ใหม่', content: 'วิภาวี แสดงความคิดเห็นในงาน', reference_id: 'task-2', reference_type: 'task', is_read: false, created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
]

const DEMO_INCOMES: ProjectIncome[] = [
    { id: 'income-1', project_id: 'project-1', title: 'เงินมัดจำโปรเจกต์', description: 'รับเงินมัดจำ 50%', amount: 150000, date: '2024-09-01', category: 'contract', created_by: '1', created_at: new Date().toISOString() },
    { id: 'income-2', project_id: 'project-1', title: 'งวดที่ 1 - ส่งมอบ Design', description: '', amount: 75000, date: '2024-09-20', category: 'milestone', created_by: '1', created_at: new Date().toISOString() },
    { id: 'income-3', project_id: 'project-2', title: 'สัญญาพัฒนา Mobile App', description: '', amount: 500000, date: '2024-08-15', category: 'contract', created_by: '1', created_at: new Date().toISOString() },
]

const DEMO_EXPENSES: ProjectExpense[] = [
    { id: 'expense-1', project_id: 'project-1', title: 'ค่า License Figma', description: '', amount: 5000, date: '2024-09-05', category: 'software', created_by: '2', created_at: new Date().toISOString() },
    { id: 'expense-2', project_id: 'project-1', title: 'เงินเดือนทีม Design', description: '', amount: 80000, date: '2024-09-30', category: 'salary', created_by: '1', created_at: new Date().toISOString() },
    { id: 'expense-3', project_id: 'project-2', title: 'ค่า Apple Developer', description: '', amount: 3500, date: '2024-08-20', category: 'software', created_by: '1', created_at: new Date().toISOString() },
]

const DEMO_REVENUE_SHARES: MemberRevenueShare[] = [
    { id: 'share-1', project_id: 'project-1', user_id: '1', share_percentage: 30, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'share-2', project_id: 'project-1', user_id: '2', share_percentage: 35, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'share-3', project_id: 'project-1', user_id: '3', share_percentage: 25, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'share-4', project_id: 'project-1', user_id: '5', share_percentage: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    // Project 2 (Owner gets 100%)
    { id: 'share-5', project_id: 'project-2', user_id: '1', share_percentage: 100, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

// Check if running in demo mode
const isDemoMode = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    return !supabaseUrl || supabaseUrl === 'your-supabase-project-url'
}

interface AppState {
    // Data
    projects: Project[]
    projectMembers: ProjectMember[]
    tasks: Task[]
    members: Profile[]
    notifications: Notification[]
    incomes: ProjectIncome[]
    expenses: ProjectExpense[]
    revenueShares: MemberRevenueShare[]
    isLoading: boolean
    error: string | null

    // Actions
    loadAllData: () => Promise<void>
    loadProjects: () => Promise<void>
    loadTasks: (projectId?: string) => Promise<void>
    loadMembers: () => Promise<void>
    loadNotifications: (userId: string) => Promise<void>
    loadProjectFinance: (projectId: string) => Promise<void>
    loadProjectMembers: (projectId: string) => Promise<void>

    // Project CRUD
    createProject: (project: ProjectInsert) => Promise<Project>
    updateProject: (id: string, data: ProjectUpdate) => Promise<void>
    deleteProject: (id: string) => Promise<void>
    addProjectMember: (projectId: string, userId: string, role?: 'owner' | 'admin' | 'member') => Promise<void>
    removeProjectMember: (projectId: string, userId: string) => Promise<void>

    // Task CRUD
    createTask: (task: TaskInsert) => Promise<Task>
    updateTask: (id: string, data: TaskUpdate) => Promise<void>
    deleteTask: (id: string) => Promise<void>

    // Notifications
    markNotificationRead: (id: string) => Promise<void>
    markAllNotificationsRead: (userId: string) => Promise<void>

    // Finance
    addIncome: (income: IncomeInsert) => Promise<void>
    updateIncome: (id: string, data: ProjectUpdate) => Promise<void>
    deleteIncome: (id: string) => Promise<void>
    addExpense: (expense: ExpenseInsert) => Promise<void>
    updateExpense: (id: string, data: ProjectUpdate) => Promise<void>
    deleteExpense: (id: string) => Promise<void>
    updateRevenueShare: (projectId: string, userId: string, percentage: number) => Promise<void>

    // Demo data
    initDemoData: () => void

    // Member CRUD
    createMember: (member: Partial<Profile> & { email?: string; password?: string }) => Promise<Profile>
    updateMember: (id: string, data: Partial<Profile> & { email?: string; password?: string }) => Promise<void>
    deleteMember: (id: string) => Promise<void>

    // Global Reset
    resetData: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
    projects: [],
    projectMembers: [],
    tasks: [],
    members: [],
    notifications: [],
    incomes: [],
    expenses: [],
    revenueShares: [],
    isLoading: false,
    error: null,

    // Load all data
    loadAllData: async () => {
        if (isDemoMode()) {
            get().initDemoData()
            return
        }

        set({ isLoading: true, error: null })
        try {
            const [projects, tasks, members, projectMembers, incomes, expenses, revenueShares] = await Promise.all([
                api.getProjects(),
                api.getTasks(),
                api.getProfiles(),
                api.getAllProjectMembers(),
                api.getAllProjectIncomes(),
                api.getAllProjectExpenses(),
                api.getAllRevenueShares()
            ])
            set({ projects, tasks, members, projectMembers, incomes, expenses, revenueShares, isLoading: false })
        } catch (error) {
            console.error('Error loading data:', error)
            set({ error: 'Failed to load data', isLoading: false })
            // Fallback to demo data
            get().initDemoData()
        }
    },

    loadProjects: async () => {
        if (isDemoMode()) return
        try {
            const projects = await api.getProjects()
            set({ projects })
        } catch (error) {
            console.error('Error loading projects:', error)
        }
    },

    loadTasks: async (projectId?: string) => {
        if (isDemoMode()) return
        try {
            const tasks = await api.getTasks(projectId)
            if (projectId) {
                // Merge with existing tasks from other projects
                set(state => ({
                    tasks: [
                        ...state.tasks.filter(t => t.project_id !== projectId),
                        ...tasks
                    ]
                }))
            } else {
                set({ tasks })
            }
        } catch (error) {
            console.error('Error loading tasks:', error)
        }
    },

    loadMembers: async () => {
        if (isDemoMode()) return
        try {
            const members = await api.getProfiles()
            set({ members })
        } catch (error) {
            console.error('Error loading members:', error)
        }
    },

    loadNotifications: async (userId: string) => {
        if (isDemoMode()) return
        try {
            const notifications = await api.getNotifications(userId)
            set({ notifications })
        } catch (error) {
            console.error('Error loading notifications:', error)
        }
    },

    loadProjectFinance: async (projectId: string) => {
        if (isDemoMode()) return
        try {
            const { incomes, expenses, shares } = await api.getProjectFinanceData(projectId)
            set(state => ({
                incomes: [...state.incomes.filter(i => i.project_id !== projectId), ...incomes],
                expenses: [...state.expenses.filter(e => e.project_id !== projectId), ...expenses],
                revenueShares: [...state.revenueShares.filter(s => s.project_id !== projectId), ...shares],
            }))
        } catch (error) {
            console.error('Error loading finance data:', error)
        }
    },

    // Project CRUD
    createProject: async (project) => {
        if (isDemoMode()) {
            const newProject: Project = {
                name: project.name,
                description: project.description ?? null,
                status: project.status ?? 'active',
                start_date: project.start_date ?? null,
                end_date: project.end_date ?? null,
                created_by: project.created_by ?? null,
                demo_url: project.demo_url ?? null,
                production_url: project.production_url ?? null,
                github_url: project.github_url ?? null,
                id: `project-${Date.now()}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
            set(state => ({ projects: [...state.projects, newProject] }))
            return newProject
        }

        const newProject = await api.createProject(project)
        set(state => ({ projects: [...state.projects, newProject] }))
        return newProject
    },

    updateProject: async (id, data) => {
        if (isDemoMode()) {
            set(state => ({
                projects: state.projects.map(p => p.id === id ? { ...p, ...(data as any) } : p)
            }))
            return
        }

        await api.updateProject(id, data)
        set(state => ({
            projects: state.projects.map(p => p.id === id ? { ...p, ...(data as any) } : p)
        }))
    },

    deleteProject: async (id) => {
        if (isDemoMode()) {
            set(state => ({ projects: state.projects.filter(p => p.id !== id) }))
            return
        }

        await api.deleteProject(id)
        set(state => ({ projects: state.projects.filter(p => p.id !== id) }))
    },

    loadProjectMembers: async (projectId: string) => {
        if (isDemoMode()) {
            const demoMembers = get().members.map(m => ({
                id: `pm-${projectId}-${m.id}`,
                project_id: projectId,
                user_id: m.id,
                role: 'member' as const,
                joined_at: new Date().toISOString()
            }))
            set(state => ({
                projectMembers: [
                    ...state.projectMembers.filter(pm => pm.project_id !== projectId),
                    ...demoMembers
                ]
            }))
            return
        }

        try {
            const members = await api.getProjectMembers(projectId)
            set(state => ({
                projectMembers: [
                    ...state.projectMembers.filter(pm => pm.project_id !== projectId),
                    ...members
                ]
            }))
        } catch (error) {
            console.error('Error loading project members:', error)
        }
    },

    addProjectMember: async (projectId, userId, role = 'member') => {
        if (isDemoMode()) {
            const newMember: ProjectMember = {
                id: `pm-${projectId}-${userId}`,
                project_id: projectId,
                user_id: userId,
                role,
                joined_at: new Date().toISOString()
            }
            set(state => ({
                projectMembers: [...state.projectMembers, newMember]
            }))
            return
        }

        try {
            const newMember = await api.addProjectMember({
                project_id: projectId,
                user_id: userId,
                role
            })
            set(state => ({
                projectMembers: [...state.projectMembers, newMember]
            }))
        } catch (error) {
            console.error('Error adding project member:', error)
            throw error
        }
    },

    removeProjectMember: async (projectId, userId) => {
        if (isDemoMode()) {
            set(state => ({
                projectMembers: state.projectMembers.filter(
                    pm => !(pm.project_id === projectId && pm.user_id === userId)
                )
            }))
            return
        }

        try {
            await api.removeProjectMember(projectId, userId)
            set(state => ({
                projectMembers: state.projectMembers.filter(
                    pm => !(pm.project_id === projectId && pm.user_id === userId)
                )
            }))
        } catch (error) {
            console.error('Error removing project member:', error)
            throw error
        }
    },

    // Task CRUD
    createTask: async (task) => {
        if (isDemoMode()) {
            const newTask: Task = {
                project_id: task.project_id,
                title: task.title,
                description: task.description ?? null,
                status: task.status ?? 'todo',
                priority: task.priority ?? 'medium',
                due_date: task.due_date ?? null,
                assignee_id: task.assignee_id ?? null,
                created_by: task.created_by ?? null,
                id: `task-${Date.now()}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
            set(state => ({ tasks: [...state.tasks, newTask] }))
            return newTask
        }

        const newTask = await api.createTask(task)
        set(state => ({ tasks: [...state.tasks, newTask] }))
        return newTask
    },

    updateTask: async (id, data) => {
        if (isDemoMode()) {
            set(state => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, ...(data as any) } : t)
            }))
            return
        }

        await api.updateTask(id, data)
        set(state => ({
            tasks: state.tasks.map(t => t.id === id ? { ...t, ...(data as any) } : t)
        }))
    },

    deleteTask: async (id) => {
        if (isDemoMode()) {
            set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }))
            return
        }

        await api.deleteTask(id)
        set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }))
    },

    // Notifications
    markNotificationRead: async (id) => {
        if (isDemoMode()) {
            set(state => ({
                notifications: state.notifications.map(n =>
                    n.id === id ? { ...n, is_read: true } : n
                )
            }))
            return
        }

        await api.markNotificationRead(id)
        set(state => ({
            notifications: state.notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            )
        }))
    },

    markAllNotificationsRead: async (userId) => {
        if (isDemoMode()) {
            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, is_read: true }))
            }))
            return
        }

        await api.markAllNotificationsRead(userId)
        set(state => ({
            notifications: state.notifications.map(n => ({ ...n, is_read: true }))
        }))
    },

    // Finance
    addIncome: async (income) => {
        if (isDemoMode()) {
            const newIncome: ProjectIncome = {
                project_id: income.project_id,
                title: income.title,
                description: income.description ?? null,
                amount: income.amount,
                date: income.date,
                category: income.category,
                created_by: income.created_by ?? null,
                id: `income-${Date.now()}`,
                created_at: new Date().toISOString(),
            }
            set(state => ({ incomes: [...state.incomes, newIncome] }))
            return
        }

        const newIncome = await api.createIncome(income)
        set(state => ({ incomes: [...state.incomes, newIncome] }))
    },

    updateIncome: async (id, data) => {
        if (isDemoMode()) {
            set(state => ({
                incomes: state.incomes.map(i => i.id === id ? { ...i, ...(data as any) } : i)
            }))
            return
        }

        const updated = await api.updateIncome(id, data as any)
        set(state => ({
            incomes: state.incomes.map(i => i.id === id ? updated : i)
        }))
    },

    deleteIncome: async (id) => {
        if (isDemoMode()) {
            set(state => ({ incomes: state.incomes.filter(i => i.id !== id) }))
            return
        }

        await api.deleteIncome(id)
        set(state => ({ incomes: state.incomes.filter(i => i.id !== id) }))
    },

    addExpense: async (expense) => {
        if (isDemoMode()) {
            const newExpense: ProjectExpense = {
                project_id: expense.project_id,
                title: expense.title,
                description: expense.description ?? null,
                amount: expense.amount,
                date: expense.date,
                category: expense.category,
                created_by: expense.created_by ?? null,
                id: `expense-${Date.now()}`,
                created_at: new Date().toISOString(),
            }
            set(state => ({ expenses: [...state.expenses, newExpense] }))
            return
        }

        const newExpense = await api.createExpense(expense)
        set(state => ({ expenses: [...state.expenses, newExpense] }))
    },

    updateExpense: async (id, data) => {
        if (isDemoMode()) {
            set(state => ({
                expenses: state.expenses.map(e => e.id === id ? { ...e, ...(data as any) } : e)
            }))
            return
        }

        const updated = await api.updateExpense(id, data as any)
        set(state => ({
            expenses: state.expenses.map(e => e.id === id ? updated : e)
        }))
    },

    deleteExpense: async (id) => {
        if (isDemoMode()) {
            set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }))
            return
        }

        await api.deleteExpense(id)
        set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }))
    },

    updateRevenueShare: async (projectId, userId, percentage) => {
        if (isDemoMode()) {
            set(state => {
                const existing = state.revenueShares.find(
                    s => s.project_id === projectId && s.user_id === userId
                )
                if (existing) {
                    return {
                        revenueShares: state.revenueShares.map(s =>
                            s.project_id === projectId && s.user_id === userId
                                ? { ...s, share_percentage: percentage }
                                : s
                        )
                    }
                } else {
                    return {
                        revenueShares: [...state.revenueShares, {
                            id: `share-${Date.now()}`,
                            project_id: projectId,
                            user_id: userId,
                            share_percentage: percentage,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        }]
                    }
                }
            })
            return
        }

        await api.upsertRevenueShare(projectId, userId, percentage)
        // Refresh finance data
        await get().loadProjectFinance(projectId)
    },

    // Member CRUD
    createMember: async (member) => {
        if (isDemoMode()) {
            const newMember: Profile = {
                id: `member-${Date.now()}`,
                full_name: member.full_name || 'New Member',
                email: member.email || 'new@member.com',
                avatar_url: member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
                job_title: member.job_title || 'Team Member',
                bio: member.bio || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
            // Simulate auth creation in demo mode
            if (member.email && member.password) {
                console.log('Demo Mode: Simulating auth account creation for', member.email)
            }
            set(state => ({ members: [...state.members, newMember] }))
            return newMember
        }

        // Real Mode: Direct Profile Creation (Custom Auth)

        // Generate a random ID (in real app, let DB generate default or use uuid lib)
        const newId = crypto.randomUUID()

        const { confirmPassword, ...memberData } = member as any

        const profileData = {
            ...memberData,
            id: newId
        }

        const newMember = await api.createProfileMember(profileData as any)
        set(state => ({ members: [...state.members, newMember] }))
        return newMember
    },

    updateMember: async (id, data) => {
        if (isDemoMode()) {
            set(state => ({
                members: state.members.map(m => m.id === id ? { ...m, ...data } : m)
            }))
            if (data.email || data.password) {
                console.log('Demo Mode: Simulating auth update for member', id, { email: data.email, password: data.password ? '******' : undefined })
            }
            return
        }

        // Handle Auth Updates
        if (data.email) {
            await api.updateUserEmail(id, data.email)
        }
        if (data.password) {
            await api.resetUserPassword(id, data.password)
        }

        const { email, password, confirmPassword, ...profileData } = data as any

        if (Object.keys(profileData).length > 0) {
            const updated = await api.updateProfile(id, profileData as any)
            if (updated) {
                set(state => ({
                    members: state.members.map(m => m.id === id ? updated : m)
                }))
            }
        }
    },

    deleteMember: async (id) => {
        if (isDemoMode()) {
            set(state => ({ members: state.members.filter(m => m.id !== id) }))
            return
        }

        await api.deleteProfile(id)
        set(state => ({ members: state.members.filter(m => m.id !== id) }))
    },

    // Global Reset
    resetData: async () => {
        // In demo mode, just re-init everything
        if (isDemoMode()) {
            get().initDemoData()
            return
        }

        // In real mode, we might want to reload from API
        await get().loadAllData()
    },

    // Demo data initialization
    initDemoData: () => set({
        projects: DEMO_PROJECTS,
        tasks: DEMO_TASKS,
        members: DEMO_MEMBERS,
        notifications: DEMO_NOTIFICATIONS,
        incomes: DEMO_INCOMES,
        expenses: DEMO_EXPENSES,
        revenueShares: DEMO_REVENUE_SHARES,
        isLoading: false,
    }),
}))
