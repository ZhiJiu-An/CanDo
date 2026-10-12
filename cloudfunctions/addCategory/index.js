const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 新增分类
exports.main = async (event, context) => {
  try {
    const name = (event.name || '').trim()
    if (!name) {
      return { code: -1, message: '分类名不能为空', data: null }
    }
    const dup = await db.collection('categories').where({ name }).count()
    if (dup.total > 0) {
      return { code: -1, message: '分类已存在', data: null }
    }
    await db.collection('categories').add({
      data: { name, system: false, createdAt: db.serverDate() }
    })
    return {
      code: 0,
      message: 'success',
      data: { name, count: 0, system: false }
    }
  } catch (err) {
    console.error('[addCategory] error:', err)
    return { code: -1, message: err?.errMsg || err?.message || '新增分类失败', data: null }
  }
}
