import { renameCategoryByName } from './mockDb'

// mock: renameCategory 云函数
export default (data?: { name?: string; newName?: string }) => {
  if (!data?.name || !data?.newName?.trim()) {
    return Promise.reject(new Error('参数不完整'))
  }
  try {
    const success = renameCategoryByName(data.name, data.newName)
    return Promise.resolve({ success })
  } catch (err) {
    return Promise.reject(err)
  }
}
