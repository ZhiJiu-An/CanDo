import { callFunction } from './cloud'
import type { Dish, DishInput, DishPatch, CategoryInfo } from '@/types/dish'

/** 获取菜品列表（可按分类筛选，category=all 或空表示全部） */
export async function fetchDishes(category?: string): Promise<Dish[]> {
  return callFunction<Dish[]>('getDishes', { category: category || 'all' })
}

/** 获取菜品详情 */
export async function fetchDish(id: string): Promise<Dish> {
  return callFunction<Dish>('getDish', { id })
}

/** 新增菜品，返回新菜品 id */
export async function createDish(input: DishInput): Promise<string> {
  return callFunction<{ id: string }>('createDish', input as any).then(
    (r) => r.id
  )
}

/** 更新菜品（全量） */
export async function updateDish(id: string, input: DishInput): Promise<boolean> {
  return callFunction<{ success: boolean }>('updateDish', {
    id,
    ...input
  } as any).then((r) => r.success)
}

/** 删除菜品 */
export async function deleteDish(id: string): Promise<boolean> {
  return callFunction<{ success: boolean }>('deleteDish', { id }).then(
    (r) => r.success
  )
}

/** 局部更新菜品（收藏 / 置顶 / 标签） */
export async function patchDish(id: string, patch: DishPatch): Promise<Dish> {
  return callFunction<{ success: boolean; dish: Dish }>('patchDish', {
    id,
    ...patch
  } as any).then((r) => r.dish)
}

/** 模糊搜索菜品（菜名 / 简介 / 食材 / 标签） */
export async function searchDishes(keyword: string): Promise<Dish[]> {
  return callFunction<Dish[]>('searchDishes', { keyword })
}

/** 获取分类列表（含菜品数量） */
export async function fetchCategories(): Promise<CategoryInfo[]> {
  return callFunction<CategoryInfo[]>('getCategories')
}

/** 新增分类 */
export async function addCategory(name: string): Promise<CategoryInfo> {
  return callFunction<CategoryInfo>('addCategory', { name })
}

/** 重命名分类（同步迁移该分类下菜品） */
export async function renameCategory(name: string, newName: string): Promise<boolean> {
  return callFunction<{ success: boolean }>('renameCategory', {
    name,
    newName
  }).then((r) => r.success)
}

/** 删除分类（该分类下菜品迁移至「其他」） */
export async function deleteCategory(name: string): Promise<boolean> {
  return callFunction<{ success: boolean }>('deleteCategory', { name }).then(
    (r) => r.success
  )
}
