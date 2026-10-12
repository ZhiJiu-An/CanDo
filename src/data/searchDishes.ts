import { searchDishesByKeyword } from './mockDb'

// mock: searchDishes 云函数
export default (data?: { keyword?: string }) => {
  return Promise.resolve(searchDishesByKeyword(data?.keyword || ''))
}
