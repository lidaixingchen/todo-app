export type Priority = 'low' | 'medium' | 'high'

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: '低',
  medium: '中',
  high: '高',
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
}

export interface Todo {
  id: string
  title: string
  description: string
  category: string
  priority: Priority
  dueDate: string
  completed: boolean
  createdAt: string
  parentId: string | null
}

export interface Category {
  id: string
  name: string
  color: string
}

export type SortField = 'createdAt' | 'dueDate' | 'priority' | 'title'

export type SortOrder = 'asc' | 'desc'

export interface SortConfig {
  field: SortField
  order: SortOrder
}

export interface TodoStats {
  total: number
  completed: number
  pending: number
  byCategory: Record<string, number>
  byPriority: Record<Priority, number>
}