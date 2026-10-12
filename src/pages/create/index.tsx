import React, { useState } from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import DishForm from '@/components/DishForm'
import { useDishStore } from '@/store/useDishStore'
import type { DishInput } from '@/types/dish'
import styles from './index.module.scss'

const CreatePage: React.FC = () => {
  const addDish = useDishStore((s) => s.addDish)
  const [submitting, setSubmitting] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const handleSubmit = async (input: DishInput) => {
    setSubmitting(true)
    try {
      await addDish(input)
      Taro.showToast({ title: '保存成功', icon: 'success' })
      setFormKey((k) => k + 1) // 重置表单
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/home/index' })
      }, 600)
    } catch (err) {
      console.error('[CreatePage] submit error:', err)
      Taro.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className={styles.page}>
      <DishForm
        key={formKey}
        submitText='保存菜谱'
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </View>
  )
}

export default CreatePage
