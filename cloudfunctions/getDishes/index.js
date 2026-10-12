const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 查询菜品列表，可按分类筛选，置顶优先、更新时间倒序
exports.main = async (event, context) => {
  try {
    const { category } = event
    const query = {}
    if (category && category !== 'all') {
      query.category = category
    }
    const res = await db
      .collection('dishes')
      .where(query)
      .orderBy('pinned', 'desc')
      .orderBy('updatedAt', 'desc')
      .get()
    return { code: 0, message: 'success', data: res.data }
  } catch (err) {
    console.error('[getDishes] error:', err)
    return { code: -1, message: err?.errMsg || err?.message || '查询失败', data: null }
  }
}
