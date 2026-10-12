import { getDishById } from './mockDb'

// mock: getDish 云函数
export default (data?: { id?: string }) => {
  const dish = data?.id ? getDishById(data.id) : null
  if (!dish) {
    return Promise.reject(new Error('菜品不存在'))
  }
  return Promise.resolve(dish)
}
