import Taro from '@tarojs/taro'

const isWeapp = process.env.TARO_ENV === 'weapp'

// 美食类 picsum 图 ID（用于 mock 封面图）
const FOOD_IMG_IDS = [292, 312, 326, 401, 431, 570, 580, 625, 835, 1080]

/**
 * 云函数调用封装
 * - weapp：走真实 Taro.cloud.callFunction
 * - 非微信（H5 预览等）：走 src/data/<name>.ts 的 mock
 */
export async function callFunction<T = any>(
  name: string,
  data?: Record<string, any>
): Promise<T> {
  if (!isWeapp) {
    const mockModule = await import(`../data/${name}`)
    return mockModule.default(data) as T
  }
  const res = await Taro.cloud.callFunction({ name, data })
  const result = res.result as { code?: number; message?: string; data?: T } | undefined
  if (!result || result.code !== 0) {
    // 云函数异常时 result 可能不是业务返回体（如平台错误对象），打印原始响应便于定位
    console.error(`[Cloud] ${name} raw response:`, JSON.stringify(res))
    throw new Error(result?.message || `云函数 ${name} 调用失败`)
  }
  return result.data as T
}

/**
 * 获取云数据库实例（仅 weapp 可用）
 */
export function getDatabase() {
  if (!isWeapp) {
    return null
  }
  return Taro.cloud.database()
}

/**
 * 上传文件到云存储
 * - weapp：走真实 Taro.cloud.uploadFile，返回 fileID
 * - 非微信：返回 mock 的美食图 URL
 */
export async function uploadFile(
  filePath: string,
  cloudPath: string
): Promise<string> {
  if (!isWeapp) {
    const id = FOOD_IMG_IDS[Math.floor(Math.random() * FOOD_IMG_IDS.length)]
    return `https://picsum.photos/id/${id}/600/400`
  }
  const res = await Taro.cloud.uploadFile({ cloudPath, filePath })
  return res.fileID
}
