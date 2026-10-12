const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 默认分类（与前端常量保持一致），「其他」为系统兜底分类
const DEFAULT_CATEGORIES = ['家常菜', '汤品', '主食', '小吃', '其他']
const SYSTEM_CATEGORY = '其他'

// 查询分类列表（含菜品数量、系统标记）；集合为空时自动播种默认分类
exports.main = async (event, context) => {
  try {
    const col = db.collection('categories')
    let res = await col.orderBy('createdAt', 'asc').get()
    let docs = res.data

    if (!docs.length) {
      const now = db.serverDate()
      for (const name of DEFAULT_CATEGORIES) {
        // 并发 add 在小数据量下可能乱序，逐个写入保证顺序
        await col.add({
          data: { name, system: name === SYSTEM_CATEGORY, createdAt: now }
        })
      }
      res = await col.orderBy('createdAt', 'asc').get()
      docs = res.data
    }

    // 统计每个分类下菜品数量
    const list = await Promise.all(
      docs.map(async (doc) => {
        const countRes = await db
          .collection('dishes')
          .where({ category: doc.name })
          .count()
        return { name: doc.name, count: countRes.total, system: !!doc.system }
      })
    )

    return { code: 0, message: 'success', data: list }
  } catch (err) {
    console.error('[getCategories] error:', err)
    return { code: -1, message: err?.errMsg || err?.message || '查询分类失败', data: null }
  }
}
