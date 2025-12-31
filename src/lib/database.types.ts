// Database types for Supabase
// These match the SQL schema in the implementation plan

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    password?: string | null
                    full_name: string | null
                    avatar_url: string | null
                    job_title: string | null
                    bio: string | null
                    last_login?: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    password?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    job_title?: string | null
                    bio?: string | null
                    last_login?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    password?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    job_title?: string | null
                    bio?: string | null
                    last_login?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    status: 'active' | 'completed' | 'on_hold'
                    start_date: string | null
                    end_date: string | null
                    created_by: string | null
                    demo_url: string | null
                    production_url: string | null
                    github_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    status?: 'active' | 'completed' | 'on_hold'
                    start_date?: string | null
                    end_date?: string | null
                    created_by?: string | null
                    demo_url?: string | null
                    production_url?: string | null
                    github_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    status?: 'active' | 'completed' | 'on_hold'
                    start_date?: string | null
                    end_date?: string | null
                    created_by?: string | null
                    demo_url?: string | null
                    production_url?: string | null
                    github_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            project_members: {
                Row: {
                    id: string
                    project_id: string
                    user_id: string
                    role: 'owner' | 'admin' | 'member'
                    joined_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    user_id: string
                    role?: 'owner' | 'admin' | 'member'
                    joined_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    user_id?: string
                    role?: 'owner' | 'admin' | 'member'
                    joined_at?: string
                }
            }
            tasks: {
                Row: {
                    id: string
                    project_id: string
                    title: string
                    description: string | null
                    status: 'todo' | 'in_progress' | 'review' | 'done'
                    priority: 'low' | 'medium' | 'high'
                    due_date: string | null
                    assignee_id: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    title: string
                    description?: string | null
                    status?: 'todo' | 'in_progress' | 'review' | 'done'
                    priority?: 'low' | 'medium' | 'high'
                    due_date?: string | null
                    assignee_id?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    title?: string
                    description?: string | null
                    status?: 'todo' | 'in_progress' | 'review' | 'done'
                    priority?: 'low' | 'medium' | 'high'
                    due_date?: string | null
                    assignee_id?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            task_comments: {
                Row: {
                    id: string
                    task_id: string
                    user_id: string
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    task_id: string
                    user_id: string
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    task_id?: string
                    user_id?: string
                    content?: string
                    created_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    type: 'task_assigned' | 'comment' | 'mention' | 'status_change'
                    title: string
                    content: string | null
                    reference_id: string | null
                    reference_type: 'task' | 'project' | null
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: 'task_assigned' | 'comment' | 'mention' | 'status_change'
                    title: string
                    content?: string | null
                    reference_id?: string | null
                    reference_type?: 'task' | 'project' | null
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: 'task_assigned' | 'comment' | 'mention' | 'status_change'
                    title?: string
                    content?: string | null
                    reference_id?: string | null
                    reference_type?: 'task' | 'project' | null
                    is_read?: boolean
                    created_at?: string
                }
            }
            project_files: {
                Row: {
                    id: string
                    project_id: string
                    name: string
                    file_path: string
                    file_size: number | null
                    uploaded_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    name: string
                    file_path: string
                    file_size?: number | null
                    uploaded_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    name?: string
                    file_path?: string
                    file_size?: number | null
                    uploaded_by?: string | null
                    created_at?: string
                }
            }
            project_income: {
                Row: {
                    id: string
                    project_id: string
                    title: string
                    description: string | null
                    amount: number
                    date: string
                    category: 'contract' | 'milestone' | 'bonus' | 'other'
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    title: string
                    description?: string | null
                    amount: number
                    date: string
                    category: 'contract' | 'milestone' | 'bonus' | 'other'
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    title?: string
                    description?: string | null
                    amount?: number
                    date?: string
                    category?: 'contract' | 'milestone' | 'bonus' | 'other'
                    created_by?: string | null
                    created_at?: string
                }
            }
            project_expenses: {
                Row: {
                    id: string
                    project_id: string
                    title: string
                    description: string | null
                    amount: number
                    date: string
                    category: 'salary' | 'software' | 'hardware' | 'marketing' | 'travel' | 'other'
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    title: string
                    description?: string | null
                    amount: number
                    date: string
                    category: 'salary' | 'software' | 'hardware' | 'marketing' | 'travel' | 'other'
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    title?: string
                    description?: string | null
                    amount?: number
                    date?: string
                    category?: 'salary' | 'software' | 'hardware' | 'marketing' | 'travel' | 'other'
                    created_by?: string | null
                    created_at?: string
                }
            }
            member_revenue_shares: {
                Row: {
                    id: string
                    project_id: string
                    user_id: string
                    share_percentage: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    user_id: string
                    share_percentage: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    user_id?: string
                    share_percentage?: number
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectMember = Database['public']['Tables']['project_members']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskComment = Database['public']['Tables']['task_comments']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type ProjectFile = Database['public']['Tables']['project_files']['Row']
export type ProjectIncome = Database['public']['Tables']['project_income']['Row']
export type ProjectExpense = Database['public']['Tables']['project_expenses']['Row']
export type MemberRevenueShare = Database['public']['Tables']['member_revenue_shares']['Row']
