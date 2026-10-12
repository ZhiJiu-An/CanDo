const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 新增菜品
exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    const { name, coverImage, category, intro, ingredients, steps } = event

    if (!name || !coverImage || !category) {
      return { code: -1, message: '菜名、封面图、分类为必填项', data: null }
    }

    const now = db.serverDate()
    const res = await db.collection('dishes').add({
      data: {
        _openid: openid,
        name,
        coverImage,
        category,
        intro: intro || '',
        ingredients: ingredients || [],
        steps: steps || [],
        favorited: false,
        pinned: false,
        tags: [],
        createdAt: now,
        updatedAt: now
      }
    })
    return { code: 0, message: 'success', data: { id: res._id } }
  } catch (err) {
    console.error('[createDish] error:', err)
    return { code: -1, message: err?.errMsg || err?.message || '新增失败', data: null }
  }
}
