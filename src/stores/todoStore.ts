import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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

const DEFAULT_SORT: SortConfig = { field: 'createdAt', order: 'desc' }

const DEFAULT_FILTER: FilterState = {
  status: 'all',
  priority: 'all',
  category: 'all',
  search: '',
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

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<Todo[]>([])
  const categories = ref<Category[]>([])
  const filter = ref<FilterState>({ ...DEFAULT_FILTER })
  const sortConfig = ref<SortConfig>({ ...DEFAULT_SORT })
  const selectedIds = ref<string[]>([])

  const stats = computed<TodoStats>(() => storage.computeStats())

  const filteredTodos = computed(() => {
    const rootTodos = todos.value.filter((t) => t.parentId === null)
    const filtered = filterTodos(rootTodos, filter.value)
    return sortTodos(filtered, sortConfig.value)
  })

  function loadFromStorage() {
    todos.value = storage.getAllTodos()
    categories.value = storage.getAllCategories()
  }

  function addTodo(data: Omit<Todo, 'id' | 'createdAt' | 'completed'>) {
    const todo: Todo = {
      ...data,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString(),
      parentId: data.parentId ?? null,
    }
    storage.addTodo(todo)
    todos.value.push(todo)
  }

  function updateTodo(id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) {
    const updated = storage.updateTodo(id, updates)
    if (!updated) return
    const index = todos.value.findIndex((t) => t.id === id)
    if (index !== -1) todos.value[index] = updated
  }

  function deleteTodo(id: string) {
    storage.deleteTodo(id)
    const deletedIds = new Set<string>()
    for (const t of todos.value) {
      if (t.id === id || t.parentId === id) deletedIds.add(t.id)
    }
    todos.value = todos.value.filter((t) => !deletedIds.has(t.id))
    selectedIds.value = selectedIds.value.filter((sid) => !deletedIds.has(sid))
  }

  function toggleTodo(id: string) {
    const toggled = storage.toggleTodoCompleted(id)
    if (!toggled) return
    const index = todos.value.findIndex((t) => t.id === id)
    if (index !== -1) todos.value[index] = toggled
  }

  function batchDelete(ids: string[]) {
    storage.batchDelete(ids)
    const idSet = new Set(ids)
    const deletedIds = new Set<string>()
    for (const t of todos.value) {
      if (idSet.has(t.id) || idSet.has(t.parentId ?? '')) {
        deletedIds.add(t.id)
      }
    }
    todos.value = todos.value.filter((t) => !deletedIds.has(t.id))
    selectedIds.value = selectedIds.value.filter((sid) => !deletedIds.has(sid))
  }

  function batchToggle(ids: string[], completed: boolean) {
    storage.batchToggleCompleted(ids, completed)
    const idSet = new Set(ids)
    todos.value = todos.value.map((t) => (idSet.has(t.id) ? { ...t, completed } : t))
  }

  function deleteCompleted() {
    storage.deleteCompletedTodos()
    const completedIds = new Set(todos.value.filter((t) => t.completed).map((t) => t.id))
    const remaining = todos.value.filter((t) => !completedIds.has(t.id) && !completedIds.has(t.parentId ?? ''))
    const remainingIds = new Set(remaining.map((t) => t.id))
    todos.value = remaining
    selectedIds.value = selectedIds.value.filter((sid) => remainingIds.has(sid))
  }

  function addCategory(data: Omit<Category, 'id'>) {
    const category: Category = { ...data, id: crypto.randomUUID() }
    storage.addCategory(category)
    categories.value.push(category)
  }

  function updateCategory(id: string, updates: Partial<Omit<Category, 'id'>>) {
    const updated = storage.updateCategory(id, updates)
    if (!updated) return
    const index = categories.value.findIndex((c) => c.id === id)
    if (index !== -1) categories.value[index] = updated
  }

  function deleteCategory(id: string) {
    storage.deleteCategory(id)
    categories.value = categories.value.filter((c) => c.id !== id)
  }

  function setFilter(partial: Partial<FilterState>) {
    filter.value = { ...filter.value, ...partial }
  }

  function setSortConfig(partial: Partial<SortConfig>) {
    sortConfig.value = { ...sortConfig.value, ...partial }
  }

  function toggleSelect(id: string) {
    const exists = selectedIds.value.includes(id)
    selectedIds.value = exists
      ? selectedIds.value.filter((sid) => sid !== id)
      : [...selectedIds.value, id]
  }

  function selectAll() {
    const filtered = filterTodos(todos.value.filter((t) => t.parentId === null), filter.value)
    const sorted = sortTodos(filtered, sortConfig.value)
    selectedIds.value = sorted.map((t) => t.id)
  }

  function clearSelection() {
    selectedIds.value = []
  }

  function exportToJson() {
    return storage.exportTodosToJson()
  }

  function getSubtasks(parentId: string) {
    return todos.value.filter((t) => t.parentId === parentId)
  }

  return {
    todos,
    categories,
    filter,
    sortConfig,
    selectedIds,
    stats,
    filteredTodos,
    loadFromStorage,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    batchDelete,
    batchToggle,
    deleteCompleted,
    addCategory,
    updateCategory,
    deleteCategory,
    setFilter,
    setSortConfig,
    toggleSelect,
    selectAll,
    clearSelection,
    exportToJson,
    getSubtasks,
  }
})
