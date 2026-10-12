import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { useDishStore } from '@/store/useDishStore'
import type { Dish } from '@/types/dish'
import InputModal from '@/components/InputModal'
import styles from './index.module.scss'

const DetailPage: React.FC = () => {
  const router = useRouter()
  const id = router.params.id

  const getDishById = useDishStore((s) => s.getDishById)
  const removeDish = useDishStore((s) => s.removeDish)
  const patchDish = useDishStore((s) => s.patchDish)

  const [dish, setDish] = useState<Dish | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [tagModalVisible, setTagModalVisible] = useState(false)

  const loadDish = (dishId: string) => {
    setLoading(true)
    getDishById(dishId)
      .then((data) => {
        setDish(data)
        setError(false)
        Taro.setNavigationBarTitle({ title: data.name })
      })
      .catch((err) => {
        console.error('[DetailPage] loadDish error:', err)
        setError(true)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (id) {
      loadDish(id)
    } else {
      setError(true)
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useDidShow(() => {
    if (id && dish) {
      loadDish(id)
    }
  })

  // 收藏切换
  const handleToggleFav = () => {
    if (!dish) return
    const next = !dish.favorited
    patchDish(dish._id, { favorited: next })
      .then((updated) => {
        setDish(updated)
        Taro.showToast({ title: next ? '已收藏' : '已取消收藏', icon: 'none' })
      })
      .catch((err) => {
        console.error('[DetailPage] toggleFav error:', err)
        Taro.showToast({ title: '操作失败', icon: 'none' })
      })
  }

  // 置顶切换
  const handleTogglePin = () => {
    if (!dish) return
    const next = !dish.pinned
    patchDish(dish._id, { pinned: next })
      .then((updated) => {
        setDish(updated)
        Taro.showToast({ title: next ? '已置顶' : '已取消置顶', icon: 'none' })
      })
      .catch((err) => {
        console.error('[DetailPage] togglePin error:', err)
        Taro.showToast({ title: '操作失败', icon: 'none' })
      })
  }

  // 打开「添加标签」弹层
  const handleAddTag = () => {
    setTagModalVisible(true)
  }

  // 确认添加标签
  const handleTagConfirm = (tag: string) => {
    if (!dish) return
    if (dish.tags.includes(tag)) {
      Taro.showToast({ title: '标签已存在', icon: 'none' })
      return
    }
    if (tag.length > 8) {
      Taro.showToast({ title: '标签最多 8 个字', icon: 'none' })
      return
    }
    patchDish(dish._id, { tags: [...dish.tags, tag] })
      .then((updated) => {
        setDish(updated)
        setTagModalVisible(false)
      })
      .catch((err) => {
        console.error('[DetailPage] addTag error:', err)
        Taro.showToast({ title: '添加失败', icon: 'none' })
      })
  }

  // 删除标签
  const handleRemoveTag = (tag: string) => {
    if (!dish) return
    patchDish(dish._id, { tags: dish.tags.filter((t) => t !== tag) })
      .then(setDish)
      .catch((err) => {
        console.error('[DetailPage] removeTag error:', err)
        Taro.showToast({ title: '删除失败', icon: 'none' })
      })
  }

  const handleEdit = () => {
    if (!dish) return
    Taro.navigateTo({ url: `/pages/edit/index?id=${dish._id}` })
  }

  const handleDelete = () => {
    if (!dish) return
    Taro.showModal({
      title: '确认删除',
      content: `确定删除「${dish.name}」吗？删除后不可恢复。`,
      confirmText: '删除',
      confirmColor: '#f53f3f'
    }).then((res) => {
      if (!res.confirm) return
      Taro.showLoading({ title: '删除中...' })
      removeDish(dish._id)
        .then(() => {
          Taro.hideLoading()
          Taro.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => Taro.navigateBack(), 500)
        })
        .catch((err) => {
          Taro.hideLoading()
          console.error('[DetailPage] delete error:', err)
          Taro.showToast({ title: '删除失败', icon: 'none' })
        })
    })
  }

  if (loading) {
    return (
      <View className={styles.centerWrap}>
        <Text className={styles.tipText}>加载中...</Text>
      </View>
    )
  }

  if (error || !dish) {
    return (
      <View className={styles.centerWrap}>
        <Text className={styles.tipIcon}>🍽️</Text>
        <Text className={styles.tipText}>菜品不存在或已删除</Text>
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.content}>
        <View className={styles.coverWrap}>
          <Image className={styles.cover} src={dish.coverImage} mode='aspectFill' />
          {/* 悬浮操作：收藏 / 置顶 */}
          <View className={styles.floatOps}>
            <View
              className={classnames(styles.floatBtn, dish.pinned && styles.floatBtnActive)}
              onClick={handleTogglePin}
            >
              <Text className={styles.floatIcon}>📌</Text>
            </View>
            <View
              className={classnames(styles.floatBtn, dish.favorited && styles.floatBtnFav)}
              onClick={handleToggleFav}
            >
              <Text className={styles.floatIcon}>{dish.favorited ? '♥' : '♡'}</Text>
            </View>
          </View>
        </View>

        <View className={styles.infoSection}>
          <View className={styles.infoHead}>
            <Text className={styles.name}>{dish.name}</Text>
            <View className={styles.tag}>
              <Text className={styles.tagText}>{dish.category}</Text>
            </View>
          </View>
          {dish.intro ? <Text className={styles.intro}>{dish.intro}</Text> : null}
        </View>

        {/* 标签 */}
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>标签</Text>
          <View className={styles.tagList}>
            {dish.tags.map((t) => (
              <View key={t} className={styles.tagChip}>
                <Text className={styles.tagChipText}>{t}</Text>
                <Text className={styles.tagChipClose} onClick={() => handleRemoveTag(t)}>
                  ✕
                </Text>
              </View>
            ))}
            <View className={styles.tagAdd} onClick={handleAddTag}>
              <Text className={styles.tagAddText}>+ 添加</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>食材清单</Text>
          {dish.ingredients.length === 0 ? (
            <Text className={styles.emptyTip}>未填写食材</Text>
          ) : (
            <View className={styles.ingredientList}>
              {dish.ingredients.map((it, i) => (
                <View key={i} className={styles.ingredientRow}>
                  <Text className={styles.ingredientName}>{it.name}</Text>
                  <Text className={styles.ingredientAmount}>{it.amount}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>制作步骤</Text>
          {dish.steps.length === 0 ? (
            <Text className={styles.emptyTip}>未填写步骤</Text>
          ) : (
            <View className={styles.stepList}>
              {dish.steps.map((s, i) => (
                <View key={i} className={styles.stepItem}>
                  <View className={styles.stepNo}>
                    <Text className={styles.stepNoText}>{i + 1}</Text>
                  </View>
                  <Text className={styles.stepText}>{s.text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View className={styles.actionBar}>
        <View className={classnames(styles.btn, styles.btnEdit)} onClick={handleEdit}>
          <Text className={styles.btnEditText}>编辑</Text>
        </View>
        <View className={classnames(styles.btn, styles.btnDelete)} onClick={handleDelete}>
          <Text className={styles.btnDeleteText}>删除</Text>
        </View>
      </View>

      <InputModal
        visible={tagModalVisible}
        title='添加标签'
        placeholder='如：下饭、宴客、清淡'
        confirmText='添加'
        maxLength={8}
        onConfirm={handleTagConfirm}
        onCancel={() => setTagModalVisible(false)}
      />
    </View>
  )
}

export default DetailPage
