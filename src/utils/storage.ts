import type { Todo, Category, TodoStats, Priority } from '../types/todo'

const TODOS_KEY = 'todo-app-todos'
const CATEGORIES_KEY = 'todo-app-categories'

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    console.error(`Failed to write to localStorage key: ${key}`)
  }
}

export function getAllTodos(): Todo[] {
  return safeGet<Todo[]>(TODOS_KEY, [])
}

function saveTodos(todos: Todo[]): void {
  safeSet(TODOS_KEY, todos)
}

export function getTodoById(id: string): Todo | undefined {
  return getAllTodos().find((t) => t.id === id)
}

export function addTodo(todo: Todo): void {
  const todos = getAllTodos()
  todos.push(todo)
  saveTodos(todos)
}

export function updateTodo(id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>): Todo | undefined {
  const todos = getAllTodos()
  const index = todos.findIndex((t) => t.id === id)
  if (index === -1) return undefined
  todos[index] = { ...todos[index], ...updates }
  saveTodos(todos)
  return todos[index]
}

export function deleteTodo(id: string): boolean {
  const todos = getAllTodos()
  const filtered = todos.filter((t) => t.id !== id)
  if (filtered.length === todos.length) return false
  saveTodos(filtered)
  return true
}

export function toggleTodoCompleted(id: string): Todo | undefined {
  const todos = getAllTodos()
  const index = todos.findIndex((t) => t.id === id)
  if (index === -1) return undefined
  todos[index] = { ...todos[index], completed: !todos[index].completed }
  saveTodos(todos)
  return todos[index]
}

export function deleteCompletedTodos(): number {
  const todos = getAllTodos()
  const remaining = todos.filter((t) => !t.completed)
  const deletedCount = todos.length - remaining.length
  saveTodos(remaining)
  return deletedCount
}

export function batchDelete(ids: string[]): number {
  const idSet = new Set(ids)
  const todos = getAllTodos()
  const remaining = todos.filter((t) => !idSet.has(t.id))
  const deletedCount = todos.length - remaining.length
  saveTodos(remaining)
  return deletedCount
}

export function batchToggleCompleted(ids: string[], completed: boolean): number {
  const idSet = new Set(ids)
  const todos = getAllTodos()
  let updatedCount = 0
  const updated = todos.map((t) => {
    if (idSet.has(t.id) && t.completed !== completed) {
      updatedCount++
      return { ...t, completed }
    }
    return t
  })
  saveTodos(updated)
  return updatedCount
}

export function exportTodosToJson(): string {
  const todos = getAllTodos()
  const categories = getAllCategories()
  const data = {
    exportedAt: new Date().toISOString(),
    todos,
    categories,
  }
  return JSON.stringify(data, null, 2)
}

export function getAllCategories(): Category[] {
  return safeGet<Category[]>(CATEGORIES_KEY, [])
}

function saveCategories(categories: Category[]): void {
  safeSet(CATEGORIES_KEY, categories)
}

export function addCategory(category: Category): void {
  const categories = getAllCategories()
  categories.push(category)
  saveCategories(categories)
}

export function updateCategory(id: string, updates: Partial<Omit<Category, 'id'>>): Category | undefined {
  const categories = getAllCategories()
  const index = categories.findIndex((c) => c.id === id)
  if (index === -1) return undefined
  categories[index] = { ...categories[index], ...updates }
  saveCategories(categories)
  return categories[index]
}

export function deleteCategory(id: string): boolean {
  const categories = getAllCategories()
  const filtered = categories.filter((c) => c.id !== id)
  if (filtered.length === categories.length) return false
  saveCategories(filtered)
  return true
}

export function getCategoryById(id: string): Category | undefined {
  return getAllCategories().find((c) => c.id === id)
}

export function computeStats(): TodoStats {
  const todos = getAllTodos()
  const completed = todos.filter((t) => t.completed).length

  const byCategory: Record<string, number> = {}
  for (const todo of todos) {
    byCategory[todo.category] = (byCategory[todo.category] || 0) + 1
  }

  const byPriority: Record<Priority, number> = { low: 0, medium: 0, high: 0 }
  for (const todo of todos) {
    byPriority[todo.priority]++
  }

  return {
    total: todos.length,
    completed,
    pending: todos.length - completed,
    byCategory,
    byPriority,
  }
}