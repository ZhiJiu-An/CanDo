const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 局部更新菜品：收藏 / 置顶 / 标签
exports.main = async (event, context) => {
  try {
    const { id, favorited, pinned, tags } = event
    if (!id) {
      return { code: -1, message: '缺少菜品 id', data: null }
    }
    const data = { updatedAt: db.serverDate() }
    if (typeof favorited === 'boolean') data.favorited = favorited
    if (typeof pinned === 'boolean') data.pinned = pinned
    if (Array.isArray(tags)) data.tags = tags

    await db.collection('dishes').doc(id).update({ data })
    const res = await db.collection('dishes').doc(id).get()
    return { code: 0, message: 'success', data: { success: true, dish: res.data } }
  } catch (err) {
    console.error('[patchDish] error:', err)
    return { code: -1, message: err?.errMsg || err?.message || '更新失败', data: null }
  }
}
