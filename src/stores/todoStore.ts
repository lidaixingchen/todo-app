import { createStore } from 'zustand/vanilla'
import { shallowRef, triggerRef } from 'vue'
import type { Todo, Category, Priority, SortConfig, TodoStats } from '../types/todo'
import { PRIORITY_ORDER } from '../types/todo'
import * as storage from '../utils/storage'

type FilterStatus = 'all' | 'active' | 'completed'
type FilterCategory = string | 'all'
type FilterPriority = Priority | 'all'

interface FilterState {
  status: FilterStatus
  priority: FilterPriority
  category: FilterCategory
  search: string
}

interface TodoState {
  todos: Todo[]
  categories: Category[]
  filter: FilterState
  sortConfig: SortConfig
  selectedIds: string[]
  stats: TodoStats

  loadFromStorage: () => void
  addTodo: (data: Omit<Todo, 'id' | 'createdAt' | 'completed'>) => void
  updateTodo: (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void
  deleteTodo: (id: string) => void
  toggleTodo: (id: string) => void
  batchDelete: (ids: string[]) => void
  batchToggle: (ids: string[], completed: boolean) => void
  deleteCompleted: () => void

  addCategory: (data: Omit<Category, 'id'>) => void
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id'>>) => void
  deleteCategory: (id: string) => void

  setFilter: (partial: Partial<FilterState>) => void
  setSortConfig: (partial: Partial<SortConfig>) => void

  toggleSelect: (id: string) => void
  selectAll: () => void
  clearSelection: () => void

  exportToJson: () => string

  getSubtasks: (parentId: string) => Todo[]
  getFilteredTodos: () => Todo[]
}

function sortTodos(todos: Todo[], config: SortConfig): Todo[] {
  return [...todos].sort((a, b) => {
    let cmp: number
    switch (config.field) {
      case 'priority':
        cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        break
      case 'dueDate':
        cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        break
      case 'title':
        cmp = a.title.localeCompare(b.title)
        break
      case 'createdAt':
      default:
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
    }
    return config.order === 'desc' ? -cmp : cmp
  })
}

function filterTodos(todos: Todo[], filter: FilterState): Todo[] {
  return todos.filter((todo) => {
    if (filter.status === 'active' && todo.completed) return false
    if (filter.status === 'completed' && !todo.completed) return false
    if (filter.priority !== 'all' && todo.priority !== filter.priority) return false
    if (filter.category !== 'all' && todo.category !== filter.category) return false
    if (filter.search && !todo.title.toLowerCase().includes(filter.search.toLowerCase())) return false
    return true
  })
}

const DEFAULT_SORT: SortConfig = { field: 'createdAt', order: 'desc' }

const DEFAULT_FILTER: FilterState = {
  status: 'all',
  priority: 'all',
  category: 'all',
  search: '',
}

const todoStore = createStore<TodoState>()((set, get) => ({
  todos: [],
  categories: [],
  filter: { ...DEFAULT_FILTER },
  sortConfig: { ...DEFAULT_SORT },
  selectedIds: [],
  stats: { total: 0, completed: 0, pending: 0, byCategory: {}, byPriority: { low: 0, medium: 0, high: 0 } },

  loadFromStorage: () => {
    const todos = storage.getAllTodos()
    const categories = storage.getAllCategories()
    const stats = storage.computeStats()
    set({ todos, categories, stats })
  },

  addTodo: (data) => {
    const todo: Todo = {
      ...data,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString(),
      parentId: data.parentId ?? null,
    }
    storage.addTodo(todo)
    set((state) => ({
      todos: [...state.todos, todo],
      stats: storage.computeStats(),
    }))
  },

  updateTodo: (id, updates) => {
    const updated = storage.updateTodo(id, updates)
    if (!updated) return
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? updated : t)),
      stats: storage.computeStats(),
    }))
  },

  deleteTodo: (id) => {
    storage.deleteTodo(id)
    set((state) => {
      const deletedIds = new Set<string>()
      for (const t of state.todos) {
        if (t.id === id || t.parentId === id) deletedIds.add(t.id)
      }
      return {
        todos: state.todos.filter((t) => !deletedIds.has(t.id)),
        selectedIds: state.selectedIds.filter((sid) => !deletedIds.has(sid)),
        stats: storage.computeStats(),
      }
    })
  },

  toggleTodo: (id) => {
    const toggled = storage.toggleTodoCompleted(id)
    if (!toggled) return
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? toggled : t)),
      stats: storage.computeStats(),
    }))
  },

  batchDelete: (ids) => {
    storage.batchDelete(ids)
    const idSet = new Set(ids)
    set((state) => ({
      todos: state.todos.filter((t) => !idSet.has(t.id)),
      selectedIds: state.selectedIds.filter((sid) => !idSet.has(sid)),
      stats: storage.computeStats(),
    }))
  },

  batchToggle: (ids, completed) => {
    storage.batchToggleCompleted(ids, completed)
    const idSet = new Set(ids)
    set((state) => ({
      todos: state.todos.map((t) => (idSet.has(t.id) ? { ...t, completed } : t)),
      stats: storage.computeStats(),
    }))
  },

  deleteCompleted: () => {
    storage.deleteCompletedTodos()
    set((state) => {
      const completedIds = new Set(state.todos.filter((t) => t.completed).map((t) => t.id))
      const remaining = state.todos.filter((t) => !completedIds.has(t.id) && !completedIds.has(t.parentId ?? ''))
      const remainingIds = new Set(remaining.map((t) => t.id))
      return {
        todos: remaining,
        selectedIds: state.selectedIds.filter((sid) => remainingIds.has(sid)),
        stats: storage.computeStats(),
      }
    })
  },

  addCategory: (data) => {
    const category: Category = { ...data, id: crypto.randomUUID() }
    storage.addCategory(category)
    set((state) => ({ categories: [...state.categories, category] }))
  },

  updateCategory: (id, updates) => {
    const updated = storage.updateCategory(id, updates)
    if (!updated) return
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? updated : c)),
    }))
  },

  deleteCategory: (id) => {
    storage.deleteCategory(id)
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }))
  },

  setFilter: (partial) => {
    set((state) => ({ filter: { ...state.filter, ...partial } }))
  },

  setSortConfig: (partial) => {
    set((state) => ({ sortConfig: { ...state.sortConfig, ...partial } }))
  },

  toggleSelect: (id) => {
    set((state) => {
      const exists = state.selectedIds.includes(id)
      return {
        selectedIds: exists
          ? state.selectedIds.filter((sid) => sid !== id)
          : [...state.selectedIds, id],
      }
    })
  },

  selectAll: () => {
    const { todos, filter, sortConfig } = get()
    const filtered = filterTodos(todos, filter)
    const sorted = sortTodos(filtered, sortConfig)
    set({ selectedIds: sorted.map((t) => t.id) })
  },

  clearSelection: () => {
    set({ selectedIds: [] })
  },

  exportToJson: () => {
    return storage.exportTodosToJson()
  },

  getSubtasks: (parentId: string) => {
    const { todos } = get()
    return todos.filter((t) => t.parentId === parentId)
  },

  getFilteredTodos: () => {
    const { todos, filter, sortConfig } = get()
    const rootTodos = todos.filter((t) => t.parentId === null)
    const filtered = filterTodos(rootTodos, filter)
    return sortTodos(filtered, sortConfig)
  },
}))

const storeRef = shallowRef(todoStore.getState())

todoStore.subscribe((state) => {
  storeRef.value = state
  triggerRef(storeRef)
})

import type { ShallowRef } from 'vue'

export function useTodoStore(): ShallowRef<TodoState> {
  return storeRef
}