import { create } from 'zustand'
import {
  fetchDishes,
  fetchDish,
  createDish,
  updateDish,
  deleteDish,
  patchDish,
  fetchCategories,
  addCategory as apiAddCategory,
  renameCategory as apiRenameCategory,
  deleteCategory as apiDeleteCategory
} from '@/services/dish'
import type { Dish, DishInput, DishPatch, CategoryInfo } from '@/types/dish'

// 菜品全局状态：作为可订阅的单一事实源，
// 解决 TabBar 页面缓存下「新增/删除后列表不即时更新」的问题。
interface DishStore {
  dishes: Dish[]
  category: string
  loading: boolean
  // 列表加载失败信息；null 表示无错误（区分「空数据」与「加载失败」）
  error: string | null
  categories: CategoryInfo[]
  changeCategory: (category: string) => Promise<void>
  loadDishes: (force?: boolean) => Promise<void>
  loadCategories: (force?: boolean) => Promise<void>
  addDish: (input: DishInput) => Promise<string>
  editDish: (id: string, input: DishInput) => Promise<void>
  removeDish: (id: string) => Promise<void>
  patchDish: (id: string, patch: DishPatch) => Promise<Dish>
  createCategory: (name: string) => Promise<void>
  renameCategory: (name: string, newName: string) => Promise<void>
  removeCategory: (name: string) => Promise<void>
  getDishById: (id: string) => Promise<Dish>
}

// 分类维度的内存缓存：进入首页/切换分类时先展示缓存，后台静默刷新，
// 避免每次都白屏等待。增删改时通过 patchCacheDish/removeCacheDish 保持一致。
const categoryCache = new Map<string, Dish[]>()

// 用最新数据替换所有缓存分类中的对应菜品
function patchCacheDish(id: string, updated: Dish) {
  categoryCache.forEach((list, key) => {
    const idx = list.findIndex((d) => d._id === id)
    if (idx === -1) return
    const next = [...list]
    next[idx] = updated
    categoryCache.set(key, next)
  })
}

// 从所有缓存分类中移除指定菜品
function removeCacheDish(id: string) {
  categoryCache.forEach((list, key) => {
    if (list.some((d) => d._id === id)) {
      categoryCache.set(key, list.filter((d) => d._id !== id))
    }
  })
}

// 静默刷新节流：距上次成功加载不足 TTL 时直接用缓存，不再发请求；
// 增删改等需要立即看到最新数据的路径传 force=true 绕过
const LIST_TTL = 30_000
const loadedAt = new Map<string, number>()
// 请求去重：同分类进行中的请求共享同一个 Promise，避免并发重复请求
const pendingDishes = new Map<string, Promise<void>>()
let categoriesLoadedAt = 0
let pendingCategories: Promise<void> | null = null

export const useDishStore = create<DishStore>((set, get) => ({
  dishes: [],
  category: 'all',
  loading: false,
  error: null,
  categories: [],

  // 切换分类并加载
  changeCategory: async (category: string) => {
    if (category === get().category) return
    set({ category })
    await get().loadDishes()
  },

  // 加载当前分类下的菜品：
  // 有缓存先展示再静默刷新；TTL 内不发请求；同分类并发请求去重复用
  loadDishes: async (force = false) => {
    const category = get().category
    const inFlight = pendingDishes.get(category)
    if (inFlight) return inFlight

    const cached = categoryCache.get(category)
    if (!force && cached && Date.now() - (loadedAt.get(category) || 0) < LIST_TTL) {
      set({ dishes: cached, loading: false })
      return
    }

    const task = (async () => {
      if (cached) {
        set({ dishes: cached, loading: false })
      } else {
        set({ loading: true })
      }
      try {
        const list = await fetchDishes(category)
        categoryCache.set(category, list)
        loadedAt.set(category, Date.now())
        // 请求期间用户可能已切换分类，仅在分类未变时应用结果
        if (get().category === category) {
          set({ dishes: list, error: null })
        }
      } catch (err) {
        console.error('[DishStore] loadDishes error:', err)
        // 无缓存兜底时才提示错误，静默刷新失败不打扰用户
        if (!cached) set({ error: '加载失败，请检查网络后重试' })
      } finally {
        // 仅在仍停留在该分类时收起 loading，避免干扰新分类的加载态
        if (get().category === category) set({ loading: false })
      }
    })()
    pendingDishes.set(category, task)
    try {
      await task
    } finally {
      pendingDishes.delete(category)
    }
  },

  // 加载分类列表：TTL 内跳过，并发请求去重复用
  loadCategories: async (force = false) => {
    if (pendingCategories) return pendingCategories
    if (!force && Date.now() - categoriesLoadedAt < LIST_TTL) return
    const task = (async () => {
      try {
        const list = await fetchCategories()
        set({ categories: list })
        categoriesLoadedAt = Date.now()
      } catch (err) {
        console.error('[DishStore] loadCategories error:', err)
      }
    })()
    pendingCategories = task
    try {
      await task
    } finally {
      pendingCategories = null
    }
  },

  // 新增：写入云端后刷新列表，并切到「全部」确保新菜品立即可见
  addDish: async (input: DishInput) => {
    const id = await createDish(input)
    // 新菜品会影响「全部」及所属分类的缓存，直接清空由加载时重建
    categoryCache.clear()
    set({ category: 'all' })
    await Promise.all([get().loadDishes(true), get().loadCategories(true)])
    return id
  },

  // 编辑：写入云端并同步更新本地缓存项（保留收藏/置顶/标签）
  editDish: async (id: string, input: DishInput) => {
    const old = get().dishes.find((d) => d._id === id)
    // 表单不管理收藏/置顶/标签，全量更新时需保留原值，避免被清空
    const preserved: DishPatch = old
      ? { favorited: old.favorited, pinned: old.pinned, tags: old.tags }
      : {}
    await updateDish(id, input)
    const updated: Dish = old
      ? {
          ...old,
          name: input.name,
          coverImage: input.coverImage,
          category: input.category,
          intro: input.intro || '',
          ingredients: input.ingredients,
          steps: input.steps,
          ...preserved,
          updatedAt: Date.now()
        }
      : ({
          ...(await fetchDish(id))
        } as Dish)
    set((state) => ({
      dishes: state.dishes.map((d) => (d._id === id ? updated : d))
    }))
    patchCacheDish(id, updated)
  },

  // 删除：写入云端后从本地列表与缓存中移除
  removeDish: async (id: string) => {
    await deleteDish(id)
    removeCacheDish(id)
    set((state) => ({
      dishes: state.dishes.filter((d) => d._id !== id)
    }))
    await get().loadCategories(true)
  },

  // 局部更新：收藏 / 置顶 / 标签，返回更新后的菜品
  patchDish: async (id: string, patch: DishPatch) => {
    const updated = await patchDish(id, patch)
    patchCacheDish(id, updated)
    set((state) => {
      const exists = state.dishes.some((d) => d._id === id)
      if (!exists) return {}
      return {
        dishes: state.dishes.map((d) => (d._id === id ? { ...updated } : d))
      }
    })
    return updated
  },

  // 分类管理（分类名是缓存 key，增删改后清空缓存强制重建）
  createCategory: async (name: string) => {
    await apiAddCategory(name)
    categoryCache.clear()
    await get().loadCategories(true)
  },

  renameCategory: async (name: string, newName: string) => {
    await apiRenameCategory(name, newName)
    categoryCache.clear()
    await Promise.all([get().loadCategories(true), get().loadDishes(true)])
  },

  removeCategory: async (name: string) => {
    await apiDeleteCategory(name)
    categoryCache.clear()
    // 当前正按被删分类筛选时，回到「全部」
    const state = get()
    if (state.category === name) {
      set({ category: 'all' })
    }
    await Promise.all([get().loadCategories(true), get().loadDishes(true)])
  },

  // 详情：优先读本地缓存，未命中再请求云端
  getDishById: async (id: string) => {
    const cached = get().dishes.find((d) => d._id === id)
    if (cached) return cached
    const remote = await fetchDish(id)
    return remote
  }
}))
