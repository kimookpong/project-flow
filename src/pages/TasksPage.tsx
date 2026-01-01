import { useState, useMemo } from 'react'
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    useDroppable,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAppStore } from '@/store/appStore'
import { useAuth } from '@/contexts/AuthContext'
import { Card, Button, Avatar, Badge, Modal, Input } from '@/components/ui'
import type { Task, Project } from '@/lib/database.types'

type TaskStatus = Task['status']

const statusConfig = {
    todo: { label: 'รอดำเนินการ', color: 'bg-gray-400' },
    in_progress: { label: 'กำลังดำเนินการ', color: 'bg-[#135bec]' },
    review: { label: 'ตรวจสอบ', color: 'bg-yellow-400' },
    done: { label: 'เสร็จสิ้น', color: 'bg-green-500' },
}

const statusIds: TaskStatus[] = ['todo', 'in_progress', 'review', 'done']

// --- Components ---

interface DroppableColumnProps {
    id: TaskStatus
    children: React.ReactNode
    count: number
    onAddClick: () => void
}

function DroppableColumn({ id, children, count, onAddClick }: DroppableColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id
    })

    const config = statusConfig[id]

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col w-80 h-full flex-shrink-0 transition-colors rounded-xl ${isOver ? 'bg-gray-100 dark:bg-[#1c222e]' : ''}`}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
                    <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 dark:text-gray-300">
                        {config.label}
                    </h3>
                    <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs font-medium">
                        {count}
                    </span>
                </div>
                <button
                    onClick={onAddClick}
                    className="text-gray-400 hover:text-[#135bec] hover:bg-[#135bec]/10 p-1 rounded transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
            </div>

            {/* Column Content */}
            <div className={`flex-1 overflow-y-auto pr-2 bg-gray-100/50 dark:bg-[#161b24] rounded-xl p-2 ${isOver ? 'ring-2 ring-[#135bec]/20' : ''}`}>
                <div className="flex flex-col gap-3 min-h-[100px]">
                    {children}
                </div>
            </div>


        </div>
    )
}

interface SortableTaskCardProps {
    task: Task
    project?: Project
    assignee?: any
    onClick: () => void
}

function SortableTaskCard({ task, project, assignee, onClick }: SortableTaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task
        }
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const priorityColors = {
        high: 'text-red-500 bg-red-500/10',
        medium: 'text-yellow-500 bg-yellow-500/10',
        low: 'text-green-500 bg-green-500/10',
    }

    const categoryColors: Record<string, string> = {
        'Design': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        'Development': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
        'Marketing': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
        'Research': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    }

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 bg-gray-50 dark:bg-[#1c1f27] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl h-[120px] w-full"
            />
        )
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick}>
            <Card
                hover
                className={`flex flex-col gap-3 cursor-grab active:cursor-grabbing touch-none ${task.status === 'done' ? 'opacity-60' : ''}`}
            >
                <div className="flex justify-between items-start">
                    <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {project?.name || 'General'}
                    </Badge>
                </div>

                <h4 className={`font-semibold text-gray-900 dark:text-white text-sm leading-snug ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
                    {task.title}
                </h4>

                {task.description && (
                    <p className="text-xs text-gray-500 dark:text-[#9da6b9] line-clamp-2">
                        {task.description}
                    </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center -space-x-1.5">
                        {assignee ? (
                            <Avatar
                                src={assignee.avatar_url}
                                name={assignee.full_name || ''}
                                size="xs"
                            />
                        ) : (
                            <div className="h-6 w-6 rounded-full border border-dashed border-gray-400 flex items-center justify-center text-gray-400">
                                <span className="material-symbols-outlined text-[14px]">person_add</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {task.due_date && (
                            <div className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded ${task.priority === 'high' ? priorityColors.high : 'text-gray-500 dark:text-[#9da6b9]'
                                }`}>
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                {new Date(task.due_date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}

// --- Main Page Component ---

export function TasksPage() {
    const { user } = useAuth()
    const { tasks, members, projects, updateTask, createTask, deleteTask } = useAppStore()
    const [filter, setFilter] = useState<'all' | 'my' | 'due'>('all')
    const [activeId, setActiveId] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'todo' as TaskStatus,
        priority: 'medium' as 'low' | 'medium' | 'high',
        projectId: '',
        assigneeId: '',
        dueDate: ''
    })

    // Filter Tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            if (filter === 'my') return task.assignee_id === user?.id
            if (filter === 'due') {
                if (!task.due_date) return false
                const dueDate = new Date(task.due_date)
                const today = new Date()
                const threeDaysFromNow = new Date()
                threeDaysFromNow.setDate(today.getDate() + 3)
                return dueDate <= threeDaysFromNow && task.status !== 'done'
            }
            return true
        })
    }, [tasks, filter, user?.id])

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        // Find the containers
        const activeTask = tasks.find(t => t.id === activeId)
        const overTask = tasks.find(t => t.id === overId)

        if (!activeTask) return

        // Dropping over a column
        if (statusIds.includes(overId as TaskStatus)) {
            const overStatus = overId as TaskStatus
            if (activeTask.status !== overStatus) {
                // Determine new index? For strict Kanban, we might want to allow reordering.
                // For now, let's just update status visually? 
                // Actually dnd-kit handles sorting array updates best in dragEnd.
                // But we need to update state if we want real-time preview across columns.
                // Simpler approach: Create a local state for optimistic UI or just handle on DragEnd.
                // Dnd-kit examples use local state.

                // Since our store is global, let's just handle final update in DragEnd to avoid excessive store updates.
            }
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        const activeTask = tasks.find(t => t.id === activeId)

        if (!activeTask) return

        // Case 1: Dropped over a column directly
        if (statusIds.includes(overId as TaskStatus)) {
            const newStatus = overId as TaskStatus
            if (activeTask.status !== newStatus) {
                updateTask(activeId, { status: newStatus })
            }
            return
        }

        // Case 2: Dropped over another task
        const overTask = tasks.find(t => t.id === overId)
        if (overTask) {
            const newStatus = overTask.status
            if (activeTask.status !== newStatus) {
                updateTask(activeId, { status: newStatus })
            }
            // Todo: Implement reordering within the same column (requires 'order' field in DB)
        }
    }

    const openCreateModal = (initialStatus: TaskStatus = 'todo') => {
        setEditingTask(null)
        setFormData({
            title: '',
            description: '',
            status: typeof initialStatus === 'string' ? initialStatus : 'todo',
            priority: 'medium',
            projectId: projects[0]?.id || '',
            assigneeId: user?.id || '',
            dueDate: ''
        })
        setIsModalOpen(true)
    }

    const openEditModal = (task: Task) => {
        setEditingTask(task)
        setFormData({
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            projectId: task.project_id,
            assigneeId: task.assignee_id || '',
            dueDate: task.due_date ? task.due_date.split('T')[0] : ''
        })
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (!formData.title || !formData.projectId) return

        try {
            if (editingTask) {
                await updateTask(editingTask.id, {
                    title: formData.title,
                    description: formData.description,
                    status: formData.status,
                    priority: formData.priority,
                    project_id: formData.projectId,
                    assignee_id: formData.assigneeId || null,
                    due_date: formData.dueDate || null
                })
            } else {
                await createTask({
                    title: formData.title,
                    description: formData.description,
                    status: formData.status,
                    priority: formData.priority,
                    project_id: formData.projectId,
                    assignee_id: formData.assigneeId || null,
                    due_date: formData.dueDate || null,
                    created_by: user?.id
                })
            }
            setIsModalOpen(false)
        } catch (error) {
            console.error('Error saving task:', error)
        }
    }

    const handleDelete = async () => {
        if (!editingTask) return
        if (confirm('Are you sure you want to delete this task?')) {
            await deleteTask(editingTask.id)
            setIsModalOpen(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-[#101622]">
            {/* Filter Section */}
            <div className="px-4 md:px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#101622] border-b border-gray-200 dark:border-[#282e39]">
                <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {/* ... Existing Filters ... */}
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#1c2333] border border-gray-200 dark:border-[#282e39] rounded-lg px-3 py-1.5 shadow-sm">
                        <span className="material-symbols-outlined text-[18px] text-gray-400">filter_list</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">ตัวกรอง</span>
                    </div>

                    <button
                        onClick={() => setFilter('my')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${filter === 'my'
                            ? 'bg-[#135bec]/10 border-[#135bec]/20 text-[#135bec]'
                            : 'bg-white dark:bg-[#1c2333] border-gray-200 dark:border-[#282e39] text-gray-500 dark:text-gray-400 hover:border-[#135bec]/50'
                            }`}
                    >
                        งานของฉัน
                    </button>
                    {/* ... Add other filters if needed ... */}
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${filter === 'all'
                            ? 'bg-[#135bec]/10 border-[#135bec]/20 text-[#135bec]'
                            : 'bg-white dark:bg-[#1c2333] border-gray-200 dark:border-[#282e39] text-gray-500 dark:text-gray-400 hover:border-[#135bec]/50'
                            }`}
                    >
                        ทั้งหมด
                    </button>
                </div>

                <Button icon="add" onClick={() => openCreateModal('todo')}>สร้างงานใหม่</Button>
            </div>

            {/* Kanban Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
            >
                <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 md:px-6 pb-6 bg-gray-50 dark:bg-[#101622]">
                    <div className="flex h-full gap-6 min-w-max py-4">
                        {statusIds.map(status => {
                            const config = statusConfig[status]
                            const statusTasks = filteredTasks.filter(t => t.status === status)

                            return (
                                <DroppableColumn
                                    key={status}
                                    id={status}
                                    count={statusTasks.length}
                                    onAddClick={() => openCreateModal(status)}
                                >
                                    <SortableContext
                                        id={status}
                                        items={statusTasks.map(t => t.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="flex flex-col gap-3 min-h-[100px]">
                                            {statusTasks.map(task => (
                                                <SortableTaskCard
                                                    key={task.id}
                                                    task={task}
                                                    project={projects.find(p => p.id === task.project_id)}
                                                    assignee={members.find(m => m.id === task.assignee_id)}
                                                    onClick={() => openEditModal(task)}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DroppableColumn>
                            )
                        })}
                    </div>
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="transform rotate-3 cursor-grabbing">
                            {/* Simplified overlay for better performance */}
                            <Card className="shadow-2xl">
                                <div className="p-3">
                                    <span className="font-semibold text-gray-900 dark:text-white">Processing...</span>
                                </div>
                            </Card>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Task Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTask ? 'แก้ไขงาน' : 'สร้างงานใหม่'}
                width="max-w-2xl"
            >
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <Input
                                label="หัวข้อ *"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 block mb-2">รายละเอียด</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full rounded-lg bg-gray-50 dark:bg-[#111318] border border-gray-200 dark:border-[#282e39] text-gray-900 dark:text-white px-4 py-3 min-h-[100px] focus:ring-2 focus:ring-[#135bec] dark:[color-scheme:dark]"
                                placeholder="รายละเอียดงาน..."
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 block mb-2">โปรเจกต์ *</label>
                            <select
                                value={formData.projectId}
                                onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                                className="w-full rounded-lg bg-gray-50 dark:bg-[#111318] border border-gray-200 dark:border-[#282e39] text-gray-900 dark:text-white px-4 py-3"
                                disabled={!!editingTask} // Maybe allow moving projects?
                            >
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 block mb-2">สถานะ</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                                className="w-full rounded-lg bg-gray-50 dark:bg-[#111318] border border-gray-200 dark:border-[#282e39] text-gray-900 dark:text-white px-4 py-3"
                            >
                                {Object.entries(statusConfig).map(([value, config]) => (
                                    <option key={value} value={value}>{config.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 block mb-2">ความสำคัญ</label>
                            <select
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                                className="w-full rounded-lg bg-gray-50 dark:bg-[#111318] border border-gray-200 dark:border-[#282e39] text-gray-900 dark:text-white px-4 py-3"
                            >
                                <option value="low">ต่ำ</option>
                                <option value="medium">ปานกลาง</option>
                                <option value="high">สูง</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 block mb-2">ผู้รับผิดชอบ</label>
                            <select
                                value={formData.assigneeId}
                                onChange={e => setFormData({ ...formData, assigneeId: e.target.value })}
                                className="w-full rounded-lg bg-gray-50 dark:bg-[#111318] border border-gray-200 dark:border-[#282e39] text-gray-900 dark:text-white px-4 py-3"
                            >
                                <option value="">ไม่ระบุ</option>
                                {members.map(m => (
                                    <option key={m.id} value={m.id}>{m.full_name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 block mb-2">วันครบกำหนด</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full rounded-lg bg-gray-50 dark:bg-[#111318] border border-gray-200 dark:border-[#282e39] text-gray-900 dark:text-white px-4 py-3 dark:[color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-[#282e39]">
                        {editingTask ? (
                            <Button
                                type="button"
                                variant="outline"
                                className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 dark:border-red-900/30 dark:hover:bg-red-900/10"
                                onClick={handleDelete}
                            >
                                ลบงาน
                            </Button>
                        ) : <div />}

                        <div className="flex items-center gap-3">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                ยกเลิก
                            </Button>
                            <Button type="button" onClick={handleSave}>
                                {editingTask ? 'บันทึก' : 'สร้างงาน'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
