import { updateDishById } from './mockDb'
import type { DishInput } from '@/types/dish'

// mock: updateDish 云函数
export default (data?: { id?: string } & DishInput) => {
  const { id, ...input } = data || ({} as any)
  const success = id ? updateDishById(id, input) : false
  return Promise.resolve({ success })
}
