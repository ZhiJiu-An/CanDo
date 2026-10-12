import { patchDishById } from './mockDb'
import type { DishPatch } from '@/types/dish'

// mock: patchDish 云函数（收藏 / 置顶 / 标签局部更新）
export default (data?: { id?: string } & DishPatch) => {
  const { id, ...patch } = data || ({} as any)
  const dish = id ? patchDishById(id, patch) : null
  if (!dish) {
    return Promise.reject(new Error('菜品不存在'))
  }
  return Promise.resolve({ success: true, dish })
}
