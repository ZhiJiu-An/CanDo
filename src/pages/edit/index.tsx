import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import DishForm from '@/components/DishForm'
import { useDishStore } from '@/store/useDishStore'
import type { Dish, DishInput } from '@/types/dish'
import styles from './index.module.scss'

const EditPage: React.FC = () => {
  const router = useRouter()
  const id = router.params.id

  const getDishById = useDishStore((s) => s.getDishById)
  const editDish = useDishStore((s) => s.editDish)

  const [dish, setDish] = useState<Dish | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) {
      setError(true)
      setLoading(false)
      return
    }
    getDishById(id)
      .then((data) => {
        setDish(data)
        Taro.setNavigationBarTitle({ title: `编辑·${data.name}` })
      })
      .catch((err) => {
        console.error('[EditPage] load error:', err)
        setError(true)
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleSubmit = async (input: DishInput) => {
    if (!dish) return
    setSubmitting(true)
    try {
      await editDish(dish._id, input)
      Taro.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 500)
    } catch (err) {
      console.error('[EditPage] submit error:', err)
      Taro.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
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
      <DishForm
        initialDish={dish}
        submitText='保存修改'
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </View>
  )
}

export default EditPage
