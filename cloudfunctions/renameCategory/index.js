const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 重命名分类，并同步迁移该分类下全部菜品
exports.main = async (event, context) => {
  try {
    const oldName = event.name
    const newName = (event.newName || '').trim()
    if (!oldName || !newName) {
      return { code: -1, message: '参数不完整', data: null }
    }

    const docRes = await db.collection('categories').where({ name: oldName }).get()
    if (!docRes.data.length) {
      return { code: -1, message: '分类不存在', data: null }
    }
    const doc = docRes.data[0]
    if (doc.system) {
      return { code: -1, message: '系统分类不可重命名', data: null }
    }
    const dup = await db.collection('categories').where({ name: newName }).count()
    if (dup.total > 0) {
      return { code: -1, message: '分类已存在', data: null }
    }

    // 更新分类名
    await db.collection('categories').doc(doc._id).update({
      data: { name: newName }
    })
    // 迁移菜品（云函数内具备管理员权限，可 where 批量更新）
    await db
      .collection('dishes')
      .where({ category: oldName })
      .update({ data: { category: newName, updatedAt: db.serverDate() } })

    return { code: 0, message: 'success', data: { success: true } }
  } catch (err) {
    console.error('[renameCategory] error:', err)
    return { code: -1, message: err?.errMsg || err?.message || '重命名失败', data: null }
  }
}
