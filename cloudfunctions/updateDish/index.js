const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 更新菜品（全量，前端负责保留收藏/置顶/标签字段）
exports.main = async (event, context) => {
  try {
    const {
      id,
      name,
      coverImage,
      category,
      intro,
      ingredients,
      steps,
      favorited,
      pinned,
      tags
    } = event
    if (!id) {
      return { code: -1, message: '缺少菜品 id', data: null }
    }
    const data = {
      name,
      coverImage,
      category,
      intro,
      ingredients,
      steps,
      updatedAt: db.serverDate()
    }
    // 仅当前端显式传入时更新，避免误清空
    if (typeof favorited === 'boolean') data.favorited = favorited
    if (typeof pinned === 'boolean') data.pinned = pinned
    if (Array.isArray(tags)) data.tags = tags

    await db.collection('dishes').doc(id).update({ data })
    return { code: 0, message: 'success', data: { success: true } }
  } catch (err) {
    console.error('[updateDish] error:', err)
    return { code: -1, message: err?.errMsg || err?.message || '更新失败', data: null }
  }
}
