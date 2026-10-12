const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const SYSTEM_CATEGORY = '其他'

// 删除分类；系统分类不可删；该分类下菜品迁移至「其他」
exports.main = async (event, context) => {
  try {
    const name = event.name
    if (!name) {
      return { code: -1, message: '参数不完整', data: null }
    }
    if (name === SYSTEM_CATEGORY) {
      return { code: -1, message: '系统分类不可删除', data: null }
    }

    const docRes = await db.collection('categories').where({ name }).get()
    if (!docRes.data.length) {
      return { code: -1, message: '分类不存在', data: null }
    }

    // 迁移菜品至系统兜底分类
    await db
      .collection('dishes')
      .where({ category: name })
      .update({ data: { category: SYSTEM_CATEGORY, updatedAt: db.serverDate() } })

    // 删除分类文档
    await db.collection('categories').doc(docRes.data[0]._id).remove()

    return { code: 0, message: 'success', data: { success: true } }
  } catch (err) {
    console.error('[deleteCategory] error:', err)
    return { code: -1, message: err?.errMsg || err?.message || '删除分类失败', data: null }
  }
}
