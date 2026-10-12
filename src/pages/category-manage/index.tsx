import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { useDishStore } from '@/store/useDishStore'
import { SYSTEM_CATEGORY } from '@/constants/category'
import Empty from '@/components/Empty'
import InputModal from '@/components/InputModal'
import styles from './index.module.scss'

type ModalMode = 'add' | 'rename'

const CategoryManagePage: React.FC = () => {
  const categories = useDishStore((s) => s.categories)
  const loadCategories = useDishStore((s) => s.loadCategories)
  const createCategory = useDishStore((s) => s.createCategory)
  const renameCategory = useDishStore((s) => s.renameCategory)
  const removeCategory = useDishStore((s) => s.removeCategory)

  // 输入弹层状态
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('add')
  const [modalValue, setModalValue] = useState('')
  const [renamingName, setRenamingName] = useState('')

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  useDidShow(() => {
    loadCategories()
  })

  // 打开「新增」弹层
  const handleOpenAdd = () => {
    setModalMode('add')
    setModalValue('')
    setModalVisible(true)
  }

  // 打开「重命名」弹层
  const handleOpenRename = (oldName: string) => {
    setModalMode('rename')
    setRenamingName(oldName)
    setModalValue(oldName)
    setModalVisible(true)
  }

  // 弹层确认：新增或重命名
  const handleModalConfirm = async (value: string) => {
    Taro.showLoading({ title: '保存中...' })
    try {
      if (modalMode === 'add') {
        await createCategory(value)
        Taro.showToast({ title: '已添加', icon: 'success' })
      } else {
        await renameCategory(renamingName, value)
        Taro.showToast({ title: '已保存', icon: 'success' })
      }
      setModalVisible(false)
    } catch (err) {
      console.error('[CategoryManage] save error:', err)
      Taro.showToast({ title: (err as Error).message || '操作失败', icon: 'none' })
    } finally {
      Taro.hideLoading()
    }
  }

  // 删除（菜品迁移至「其他」）
  const handleDelete = (name: string, count: number) => {
    const content =
      count > 0
        ? `分类「${name}」下有 ${count} 道菜，删除后将移至「${SYSTEM_CATEGORY}」。`
        : `确定删除分类「${name}」吗？`
    Taro.showModal({
      title: '删除分类',
      content,
      confirmText: '删除',
      confirmColor: '#f53f3f'
    }).then((res) => {
      if (!res.confirm) return
      Taro.showLoading({ title: '删除中...' })
      removeCategory(name)
        .then(() => {
          Taro.hideLoading()
          Taro.showToast({ title: '已删除', icon: 'success' })
        })
        .catch((err) => {
          Taro.hideLoading()
          console.error('[CategoryManage] delete error:', err)
          Taro.showToast({ title: err.message || '删除失败', icon: 'none' })
        })
    })
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.content}>
        {categories.length === 0 ? (
          <Empty text='暂无分类' />
        ) : (
          <View className={styles.list}>
            {categories.map((c) => (
              <View key={c.name} className={styles.item}>
                <View className={styles.itemInfo}>
                  <Text className={styles.itemName}>{c.name}</Text>
                  {c.system ? (
                    <View className={styles.systemBadge}>
                      <Text className={styles.systemBadgeText}>系统</Text>
                    </View>
                  ) : null}
                </View>
                <Text className={styles.itemCount}>{c.count} 道</Text>
                {!c.system ? (
                  <View className={styles.itemOps}>
                    <Text
                      className={styles.opText}
                      onClick={() => handleOpenRename(c.name)}
                    >
                      重命名
                    </Text>
                    <Text
                      className={classnames(styles.opText, styles.opDanger)}
                      onClick={() => handleDelete(c.name, c.count)}
                    >
                      删除
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View className={styles.footer}>
        <View className={styles.addBtn} onClick={handleOpenAdd}>
          <Text className={styles.addBtnText}>+ 新增分类</Text>
        </View>
      </View>

      <InputModal
        visible={modalVisible}
        title={modalMode === 'add' ? '新增分类' : '重命名分类'}
        placeholder='输入分类名称'
        initialValue={modalValue}
        confirmText={modalMode === 'add' ? '添加' : '保存'}
        maxLength={8}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalVisible(false)}
      />
    </View>
  )
}

export default CategoryManagePage
