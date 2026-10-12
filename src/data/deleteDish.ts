import { removeDish } from './mockDb'

// mock: deleteDish 云函数
export default (data?: { id?: string }) => {
  const success = data?.id ? removeDish(data.id) : false
  return Promise.resolve({ success })
}
