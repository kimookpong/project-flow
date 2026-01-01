import { supabase } from './supabase'
import type {
    Profile,
    Project,
    ProjectMember,
    Task,
    Notification,
    ProjectIncome,
    ProjectExpense,
    MemberRevenueShare,
    Database
} from './database.types'

type TableUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
type TableInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']

// =============================================
// Profiles
// =============================================
export async function getProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name')

    if (error) throw error
    return (data || [])
}

export async function getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        return null
    }
    return data
}

export async function updateProfile(userId: string, updates: TableUpdate<'profiles'>): Promise<Profile | null> {
    const { data, error } = await (supabase
        .from('profiles') as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function createProfile(profile: Partial<Profile> & { email?: string }) {
    const { data, error } = await (supabase
        .from('profiles') as any)
        .insert({
            ...profile,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteProfile(userId: string): Promise<void> {
    const { error } = await (supabase
        .from('profiles') as any)
        .delete()
        .eq('id', userId)

    if (error) throw error
}

// =============================================
// Projects
// =============================================
export async function getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return (data || [])
}

export async function getProject(projectId: string): Promise<Project | null> {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

    if (error) return null
    return data
}

export async function createProject(project: TableInsert<'projects'>): Promise<Project> {
    const { data, error } = await (supabase
        .from('projects') as any)
        .insert(project)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateProject(projectId: string, updates: TableUpdate<'projects'>): Promise<Project> {
    const { data, error } = await (supabase
        .from('projects') as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', projectId)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteProject(projectId: string): Promise<void> {
    const { error } = await (supabase
        .from('projects') as any)
        .delete()
        .eq('id', projectId)

    if (error) throw error
}
// =============================================
// Project Members
// =============================================
export async function getAllProjectMembers(): Promise<ProjectMember[]> {
    const { data, error } = await supabase
        .from('project_members')
        .select('*')

    if (error) throw error
    return (data || [])
}

export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const { data, error } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)

    if (error) throw error
    return (data || [])
}

export async function addProjectMember(member: TableInsert<'project_members'>): Promise<ProjectMember> {
    const { data, error } = await (supabase
        .from('project_members') as any)
        .insert(member)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function removeProjectMember(projectId: string, userId: string): Promise<void> {
    const { error } = await (supabase
        .from('project_members') as any)
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)

    if (error) throw error
}
// =============================================
export async function getTasks(projectId?: string): Promise<Task[]> {
    let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

    if (projectId) {
        query = query.eq('project_id', projectId)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || [])
}

export async function createTask(task: TableInsert<'tasks'>): Promise<Task> {
    const { data, error } = await (supabase
        .from('tasks') as any)
        .insert(task)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateTask(taskId: string, updates: TableUpdate<'tasks'>): Promise<Task> {
    const { data, error } = await (supabase
        .from('tasks') as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteTask(taskId: string): Promise<void> {
    const { error } = await (supabase
        .from('tasks') as any)
        .delete()
        .eq('id', taskId)

    if (error) throw error
}

// =============================================
// Notifications
// =============================================
export async function getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return (data || [])
}

export async function markNotificationRead(notificationId: string): Promise<void> {
    const { error } = await (supabase
        .from('notifications') as any)
        .update({ is_read: true })
        .eq('id', notificationId)

    if (error) throw error
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
    const { error } = await (supabase
        .from('notifications') as any)
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

    if (error) throw error
}

export async function createNotification(notification: TableInsert<'notifications'>): Promise<Notification> {
    const { data, error } = await (supabase
        .from('notifications') as any)
        .insert({
            ...notification,
            created_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) throw error
    return data
}

// =============================================
// Project Income
// =============================================
export async function getProjectIncome(projectId: string): Promise<ProjectIncome[]> {
    const { data, error } = await supabase
        .from('project_income')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false })

    if (error) throw error
    return (data || [])
}

export async function getAllProjectIncomes(): Promise<ProjectIncome[]> {
    const { data, error } = await supabase
        .from('project_income')
        .select('*')
        .order('date', { ascending: false })

    if (error) throw error
    return (data || [])
}

export async function createIncome(income: TableInsert<'project_income'>): Promise<ProjectIncome> {
    const { data, error } = await (supabase
        .from('project_income') as any)
        .insert(income)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteIncome(incomeId: string): Promise<void> {
    const { error } = await (supabase
        .from('project_income') as any)
        .delete()
        .eq('id', incomeId)

    if (error) throw error
}

export async function updateIncome(incomeId: string, updates: TableUpdate<'project_income'>): Promise<ProjectIncome> {
    const { data, error } = await (supabase
        .from('project_income') as any)
        .update(updates)
        .eq('id', incomeId)
        .select()
        .single()

    if (error) throw error
    return data
}

// =============================================
// Project Expenses
// =============================================
export async function getAllProjectExpenses(): Promise<ProjectExpense[]> {
    const { data, error } = await supabase
        .from('project_expenses')
        .select('*')
        .order('date', { ascending: false })

    if (error) throw error
    return (data || [])
}

export async function getProjectExpenses(projectId: string): Promise<ProjectExpense[]> {
    const { data, error } = await supabase
        .from('project_expenses')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false })

    if (error) throw error
    return (data || [])
}

export async function createExpense(expense: TableInsert<'project_expenses'>): Promise<ProjectExpense> {
    const { data, error } = await (supabase
        .from('project_expenses') as any)
        .insert(expense)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteExpense(expenseId: string): Promise<void> {
    const { error } = await (supabase
        .from('project_expenses') as any)
        .delete()
        .eq('id', expenseId)

    if (error) throw error
}

export async function updateExpense(expenseId: string, updates: TableUpdate<'project_expenses'>): Promise<ProjectExpense> {
    const { data, error } = await (supabase
        .from('project_expenses') as any)
        .update(updates)
        .eq('id', expenseId)
        .select()
        .single()

    if (error) throw error
    return data
}

// =============================================
// Member Revenue Shares
// =============================================
export async function getAllRevenueShares(): Promise<MemberRevenueShare[]> {
    const { data, error } = await supabase
        .from('member_revenue_shares')
        .select('*')

    if (error) throw error
    return (data || [])
}

export async function getRevenueShares(projectId: string): Promise<MemberRevenueShare[]> {
    const { data, error } = await supabase
        .from('member_revenue_shares')
        .select('*')
        .eq('project_id', projectId)

    if (error) throw error
    return (data || [])
}

export async function upsertRevenueShare(
    projectId: string,
    userId: string,
    sharePercentage: number
): Promise<MemberRevenueShare> {
    const { data, error } = await supabase
        .from('member_revenue_shares')
        .upsert({
            project_id: projectId,
            user_id: userId,
            share_percentage: sharePercentage,
            updated_at: new Date().toISOString()
        } as any, {
            onConflict: 'project_id,user_id'
        })
        .select()
        .single()

    if (error) throw error
    return data
}

// =============================================
// Get All Finance Data for a Project
// =============================================
export async function getProjectFinanceData(projectId: string) {
    const [incomes, expenses, shares] = await Promise.all([
        getProjectIncome(projectId),
        getProjectExpenses(projectId),
        getRevenueShares(projectId)
    ])

    return { incomes, expenses, shares }
}

// =============================================
// Auth (Future Integration)
// =============================================
// =============================================
// Auth (Custom Profile-Based)
// =============================================

/**
 * Creates a new member directly in the profiles table.
 * NO Supabase Auth user is created.
 */
export async function createProfileMember(profileData: Partial<Profile> & { email?: string; password?: string }) {
    // 1. Prepare data
    const newProfile = {
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }

    // 2. Insert into profiles
    const { data, error } = await (supabase
        .from('profiles') as any)
        .insert(newProfile)
        .select()
        .single()

    if (error) {
        console.error('Error creating profile member:', error)
        throw error
    }

    return data
}

// Deprecated: Kept for compatibility but unused
export async function signUpMember(email?: string, password?: string) {
    return null
}

export async function updateUserEmail(userId: string, email: string) {
    if (!userId || !email) return null

    const { error } = await (supabase
        .from('profiles') as any)
        .update({ email })
        .eq('id', userId)

    if (error) {
        console.error('Error updating profile email:', error)
        throw error
    }

    return { success: true }
}

export async function resetUserPassword(userId: string, password: string) {
    if (!userId || !password) return null

    // Update password field directly in profiles
    const { error } = await (supabase
        .from('profiles') as any)
        .update({ password }) // Should be hashed in real app
        .eq('id', userId)

    if (error) {
        console.error('Error resetting password:', error)
        throw error
    }

    return { success: true }
}
