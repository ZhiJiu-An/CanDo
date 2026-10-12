import { listDishes } from './mockDb'

// mock: getDishes 云函数
export default (data?: { category?: string }) => {
  return Promise.resolve(listDishes(data?.category))
}
