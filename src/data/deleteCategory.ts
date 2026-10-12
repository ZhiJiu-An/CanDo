import { deleteCategoryByName } from './mockDb'

// mock: deleteCategory 云函数
export default (data?: { name?: string }) => {
  if (!data?.name) {
    return Promise.reject(new Error('参数不完整'))
  }
  try {
    const success = deleteCategoryByName(data.name)
    return Promise.resolve({ success })
  } catch (err) {
    return Promise.reject(err)
  }
}
