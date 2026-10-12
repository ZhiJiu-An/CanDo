const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 查询单个菜品详情
exports.main = async (event, context) => {
  try {
    const { id } = event
    if (!id) {
      return { code: -1, message: '缺少菜品 id', data: null }
    }
    const res = await db.collection('dishes').doc(id).get()
    return { code: 0, message: 'success', data: res.data }
  } catch (err) {
    console.error('[getDish] error:', err)
    return { code: -1, message: err?.errMsg || err?.message || '查询失败', data: null }
  }
}
