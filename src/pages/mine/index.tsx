import React, { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { fetchDishes, fetchCategories } from '@/services/dish'
import type { Dish, CategoryInfo } from '@/types/dish'
import DishCard from '@/components/DishCard'
import Empty from '@/components/Empty'
import styles from './index.module.scss'

const MinePage: React.FC = () => {
  const [allDishes, setAllDishes] = useState<Dish[]>([])
  const [categories, setCategories] = useState<CategoryInfo[]>([])

  const loadData = () => {
    fetchDishes('all')
      .then(setAllDishes)
      .catch((err) => console.error('[MinePage] dishes error:', err))
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error('[MinePage] categories error:', err))
  }

  useDidShow(() => {
    loadData()
  })

  const favorites = allDishes.filter((d) => d.favorited)

  const handleOpenCategory = () => {
    Taro.navigateTo({ url: '/pages/category-manage/index' })
  }

  const handleOpenDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` })
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.content}>
        {/* 头部欢迎区 */}
        <View className={styles.hero}>
          <Text className={styles.heroTitle}>我的厨房</Text>
          <Text className={styles.heroSub}>记录每一道拿手菜</Text>
        </View>

        {/* 统计卡片 */}
        <View className={styles.statsCard}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{allDishes.length}</Text>
            <Text className={styles.statLabel}>菜品</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{favorites.length}</Text>
            <Text className={styles.statLabel}>收藏</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{categories.length}</Text>
            <Text className={styles.statLabel}>分类</Text>
          </View>
        </View>

        {/* 功能入口 */}
        <View className={styles.menuCard} onClick={handleOpenCategory}>
          <Text className={styles.menuIcon}>🗂️</Text>
          <Text className={styles.menuText}>分类管理</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>

        {/* 我的收藏 */}
        <View className={styles.sectionHead}>
          <Text className={styles.sectionTitle}>我的收藏</Text>
        </View>
        {favorites.length === 0 ? (
          <Empty text='还没有收藏，去详情页点 ♥ 收藏吧' />
        ) : (
          <View className={styles.grid}>
            {favorites.map((d) => (
              <View key={d._id} className={styles.col}>
                <DishCard dish={d} onClick={handleOpenDetail} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default MinePage
