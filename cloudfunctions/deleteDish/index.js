const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 删除菜品（仅创建者可删），并同步清理封面图云存储文件
exports.main = async (event, context) => {
  try {
    const { id } = event
    if (!id) {
      return { code: -1, message: '缺少菜品 id', data: null }
    }

    // 先查记录，拿到封面图 fileID
    const docRes = await db.collection('dishes').doc(id).get()
    const doc = docRes.data

    await db.collection('dishes').doc(id).remove()

    // 删除云存储中的封面图（记录已删，文件清理失败不影响删除结果）
    if (doc && doc.coverImage) {
      try {
        await cloud.deleteFile({ fileList: [doc.coverImage] })
      } catch (fileErr) {
        console.error('[deleteDish] deleteFile error:', fileErr)
      }
    }

    return { code: 0, message: 'success', data: { success: true } }
  } catch (err) {
    console.error('[deleteDish] error:', err)
    return { code: -1, message: err?.errMsg || err?.message || '删除失败', data: null }
  }
}
