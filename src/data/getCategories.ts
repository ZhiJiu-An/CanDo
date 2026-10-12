import { listCategories } from './mockDb'

// mock: getCategories 云函数
export default () => {
  return Promise.resolve(listCategories())
}
