import React, { useState, useEffect } from 'react'
import { View, Text, Input, Textarea, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { uploadFile } from '@/services/cloud'
import { useDishStore } from '@/store/useDishStore'
import type { Dish, DishInput, Ingredient, Step } from '@/types/dish'
import styles from './index.module.scss'

interface DishFormProps {
  initialDish?: Dish
  submitting?: boolean
  submitText?: string
  onSubmit: (input: DishInput) => void
}

const DishForm: React.FC<DishFormProps> = ({
  initialDish,
  submitting = false,
  submitText = '保存',
  onSubmit
}) => {
  const [name, setName] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [category, setCategory] = useState('')
  const [intro, setIntro] = useState('')
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: '' }
  ])
  const [steps, setSteps] = useState<Step[]>([{ order: 1, text: '' }])
  const [uploading, setUploading] = useState(false)

  // 分类选项动态读取（支持用户自定义分类）
  const categories = useDishStore((s) => s.categories)
  const loadCategories = useDishStore((s) => s.loadCategories)

  useEffect(() => {
    if (categories.length === 0) {
      loadCategories()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (initialDish) {
      setName(initialDish.name)
      setCoverImage(initialDish.coverImage)
      setCategory(initialDish.category)
      setIntro(initialDish.intro || '')
      setIngredients(
        initialDish.ingredients.length
          ? initialDish.ingredients.map((it) => ({ ...it }))
          : [{ name: '', amount: '' }]
      )
      setSteps(
        initialDish.steps.length
          ? initialDish.steps.map((s) => ({ ...s }))
          : [{ order: 1, text: '' }]
      )
    }
  }, [initialDish])

  // 封面图选择 + 上传
  const handleChooseCover = async () => {
    try {
      const res = await Taro.chooseImage({ count: 1, sourceType: ['album', 'camera'] })
      const tempPath = res.tempFilePaths[0]
      if (!tempPath) return
      setUploading(true)
      const fileID = await uploadFile(tempPath, `dishes/${Date.now()}.jpg`)
      setCoverImage(fileID)
    } catch (err) {
      console.error('[DishForm] chooseCover error:', err)
      Taro.showToast({ title: '选择图片失败', icon: 'none' })
    } finally {
      setUploading(false)
    }
  }

  // 食材操作
  const updateIngredient = (idx: number, field: keyof Ingredient, val: string) => {
    setIngredients((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: val } : it))
    )
  }
  const addIngredient = () => {
    setIngredients((prev) => [...prev, { name: '', amount: '' }])
  }
  const removeIngredient = (idx: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== idx))
  }

  // 步骤操作
  const updateStep = (idx: number, val: string) => {
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, text: val } : s)))
  }
  const addStep = () => {
    setSteps((prev) => [...prev, { order: prev.length + 1, text: '' }])
  }
  const removeStep = (idx: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== idx))
  }
  const moveStep = (idx: number, dir: 'up' | 'down') => {
    setSteps((prev) => {
      const next = [...prev]
      const target = dir === 'up' ? idx - 1 : idx + 1
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next.map((s, i) => ({ ...s, order: i + 1 }))
    })
  }

  // 提交
  const handleSubmit = () => {
    const finalIngredients = ingredients
      .map((it) => ({ name: it.name.trim(), amount: it.amount.trim() }))
      .filter((it) => it.name)
    const finalSteps = steps
      .map((s) => ({ ...s, text: s.text.trim() }))
      .filter((s) => s.text)
      .map((s, i) => ({ order: i + 1, text: s.text }))

    if (!name.trim()) {
      Taro.showToast({ title: '请输入菜名', icon: 'none' })
      return
    }
    if (!coverImage) {
      Taro.showToast({ title: '请上传封面图', icon: 'none' })
      return
    }
    if (!category) {
      Taro.showToast({ title: '请选择分类', icon: 'none' })
      return
    }
    if (finalSteps.length === 0) {
      Taro.showToast({ title: '请至少添加一个步骤', icon: 'none' })
      return
    }

    onSubmit({
      name: name.trim(),
      coverImage,
      category,
      intro: intro.trim(),
      ingredients: finalIngredients,
      steps: finalSteps
    })
  }

  return (
    <View className={styles.form}>
      {/* 基本信息 */}
      <View className={styles.section}>
        <View className={styles.coverBox} onClick={handleChooseCover}>
          {coverImage ? (
            <Image className={styles.coverImg} src={coverImage} mode='aspectFill' />
          ) : (
            <View className={styles.coverPlaceholder}>
              <Text className={styles.coverIcon}>📷</Text>
              <Text className={styles.coverTip}>
                {uploading ? '上传中...' : '上传封面图'}
              </Text>
            </View>
          )}
        </View>

        <View className={styles.field}>
          <Text className={styles.label}>菜名</Text>
          <Input
            className={styles.input}
            value={name}
            placeholder='如：番茄炒蛋'
            placeholderClass={styles.placeholder}
            maxlength={20}
            onInput={(e) => setName(e.detail.value)}
          />
        </View>

        <View className={styles.field}>
          <Text className={styles.label}>分类</Text>
          <ScrollView scrollX className={styles.categoryScroll} enhanced showScrollbar={false}>
            {categories.map((c) => (
              <View
                key={c.name}
                className={classnames(
                  styles.categoryItem,
                  category === c.name && styles.categoryItemActive
                )}
                onClick={() => setCategory(c.name)}
              >
                <Text
                  className={classnames(
                    styles.categoryText,
                    category === c.name && styles.categoryTextActive
                  )}
                >
                  {c.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={styles.field}>
          <Text className={styles.label}>简介</Text>
          <Textarea
            className={styles.textarea}
            value={intro}
            placeholder='简单描述这道菜（选填）'
            placeholderClass={styles.placeholder}
            maxlength={80}
            autoHeight
            onInput={(e) => setIntro(e.detail.value)}
          />
        </View>
      </View>

      {/* 食材清单 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>食材清单</Text>
          <Text className={styles.addAction} onClick={addIngredient}>+ 添加</Text>
        </View>
        {ingredients.map((it, idx) => (
          <View key={idx} className={styles.rowItem}>
            <Input
              className={classnames(styles.input, styles.rowInputName)}
              value={it.name}
              placeholder='食材名'
              placeholderClass={styles.placeholder}
              maxlength={20}
              onInput={(e) => updateIngredient(idx, 'name', e.detail.value)}
            />
            <Input
              className={classnames(styles.input, styles.rowInputAmount)}
              value={it.amount}
              placeholder='用量'
              placeholderClass={styles.placeholder}
              maxlength={20}
              onInput={(e) => updateIngredient(idx, 'amount', e.detail.value)}
            />
            <Text
              className={classnames(styles.rowAction, ingredients.length === 1 && styles.rowActionDisabled)}
              onClick={() => ingredients.length > 1 && removeIngredient(idx)}
            >
              删除
            </Text>
          </View>
        ))}
        {ingredients.length === 0 && (
          <Text className={styles.emptyTip}>还没有添加食材</Text>
        )}
      </View>

      {/* 制作步骤 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>制作步骤</Text>
          <Text className={styles.addAction} onClick={addStep}>+ 添加</Text>
        </View>
        {steps.map((s, idx) => (
          <View key={idx} className={styles.stepItem}>
            <View className={styles.stepHead}>
              <View className={styles.stepNo}>
                <Text className={styles.stepNoText}>{idx + 1}</Text>
              </View>
              <View className={styles.stepOps}>
                <Text
                  className={classnames(styles.stepOp, idx === 0 && styles.stepOpDisabled)}
                  onClick={() => moveStep(idx, 'up')}
                >
                  上移
                </Text>
                <Text
                  className={classnames(styles.stepOp, idx === steps.length - 1 && styles.stepOpDisabled)}
                  onClick={() => moveStep(idx, 'down')}
                >
                  下移
                </Text>
                <Text
                  className={classnames(styles.stepOp, steps.length === 1 && styles.stepOpDisabled)}
                  onClick={() => steps.length > 1 && removeStep(idx)}
                >
                  删除
                </Text>
              </View>
            </View>
            <Textarea
              className={styles.stepTextarea}
              value={s.text}
              placeholder='描述这一步怎么做...'
              placeholderClass={styles.placeholder}
              maxlength={200}
              autoHeight
              onInput={(e) => updateStep(idx, e.detail.value)}
            />
          </View>
        ))}
      </View>

      {/* 提交按钮 */}
      <View className={styles.submitWrap}>
        <View
          className={classnames(styles.submitBtn, (submitting || uploading) && styles.submitBtnDisabled)}
          onClick={!(submitting || uploading) ? handleSubmit : undefined}
        >
          <Text className={styles.submitText}>{submitting ? '保存中...' : submitText}</Text>
        </View>
      </View>
    </View>
  )
}

export default DishForm
