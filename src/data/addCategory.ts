import { addCategoryByName } from './mockDb'

// mock: addCategory 云函数
export default (data?: { name?: string }) => {
  if (!data?.name?.trim()) {
    return Promise.reject(new Error('分类名不能为空'))
  }
  try {
    const category = addCategoryByName(data.name)
    return Promise.resolve(category)
  } catch (err) {
    return Promise.reject(err)
  }
}
