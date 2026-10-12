import { addDish } from './mockDb'
import type { DishInput } from '@/types/dish'

// mock: createDish 云函数
export default (data?: DishInput) => {
  const id = addDish(data || ({} as DishInput))
  return Promise.resolve({ id })
}
