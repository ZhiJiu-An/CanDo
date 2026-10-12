const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 模糊搜索：菜名 / 简介 / 标签 / 食材名（不区分大小写包含匹配）
exports.main = async (event, context) => {
  try {
    const keyword = (event.keyword || '').trim().toLowerCase()
    if (!keyword) {
      return { code: 0, message: 'success', data: [] }
    }
    const res = await db
      .collection('dishes')
      .orderBy('pinned', 'desc')
      .orderBy('updatedAt', 'desc')
      .get()

    const list = res.data.filter((d) => {
      if (d.name && d.name.toLowerCase().includes(keyword)) return true
      if (d.intro && d.intro.toLowerCase().includes(keyword)) return true
      if (Array.isArray(d.tags) && d.tags.some((t) => t.toLowerCase().includes(keyword))) {
        return true
      }
      if (
        Array.isArray(d.ingredients) &&
        d.ingredients.some((it) => it.name && it.name.toLowerCase().includes(keyword))
      ) {
        return true
      }
      return false
    })

    return { code: 0, message: 'success', data: list }
  } catch (err) {
    console.error('[searchDishes] error:', err)
    return { code: -1, message: err?.errMsg || err?.message || '搜索失败', data: null }
  }
}
