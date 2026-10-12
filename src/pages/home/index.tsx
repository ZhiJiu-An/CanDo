import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { useDishStore } from '@/store/useDishStore'
import { ALL_FILTER } from '@/constants/category'
import DishCard from '@/components/DishCard'
import Empty from '@/components/Empty'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const dishes = useDishStore((s) => s.dishes)
  const loading = useDishStore((s) => s.loading)
  const error = useDishStore((s) => s.error)
  const category = useDishStore((s) => s.category)
  const categories = useDishStore((s) => s.categories)
  const changeCategory = useDishStore((s) => s.changeCategory)
  const loadDishes = useDishStore((s) => s.loadDishes)
  const loadCategories = useDishStore((s) => s.loadCategories)

  // TabBar 页常驻缓存，用 useDidShow 在每次进入/返回时刷新即可，
  // 不要叠加 useEffect，否则首次进入会重复请求
  useDidShow(() => {
    loadDishes()
    loadCategories()
  })

  const handleSelectCategory = (val: string) => {
    changeCategory(val)
  }

  const handleOpenSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index' })
  }

  const handleOpenDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` })
  }

  const handleCreate = () => {
    Taro.switchTab({ url: '/pages/create/index' })
  }

  return (
    <View className={styles.page}>
      {/* 顶部：标题 + 搜索入口 */}
      <View className={styles.header}>
        <Text className={styles.title}>我的厨房</Text>
        <View className={styles.searchBox} onClick={handleOpenSearch}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Text className={styles.searchPlaceholder}>搜菜名、食材、标签</Text>
        </View>
      </View>

      {/* 分类筛选（动态） */}
      <ScrollView scrollX className={styles.categoryBar} enhanced showScrollbar={false}>
        <View
          className={classnames(
            styles.tab,
            category === ALL_FILTER.value && styles.tabActive
          )}
          onClick={() => handleSelectCategory(ALL_FILTER.value)}
        >
          <Text
            className={classnames(
              styles.tabText,
              category === ALL_FILTER.value && styles.tabTextActive
            )}
          >
            {ALL_FILTER.label}
          </Text>
        </View>
        {categories.map((c) => (
          <View
            key={c.name}
            className={classnames(
              styles.tab,
              category === c.name && styles.tabActive
            )}
            onClick={() => handleSelectCategory(c.name)}
          >
            <Text
              className={classnames(
                styles.tabText,
                category === c.name && styles.tabTextActive
              )}
            >
              {c.name}
            </Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView scrollY className={styles.content}>
        {loading ? (
          <View className={styles.center}>
            <Text className={styles.tipText}>加载中...</Text>
          </View>
        ) : error ? (
          <View className={styles.errorWrap}>
            <Text className={styles.errorIcon}>⚠️</Text>
            <Text className={styles.errorText}>{error}</Text>
            <View className={styles.retryBtn} onClick={() => { loadDishes(); loadCategories() }}>
              <Text className={styles.retryText}>重新加载</Text>
            </View>
          </View>
        ) : dishes.length === 0 ? (
          <Empty text='还没有菜谱，点击右下角添加吧' />
        ) : (
          <View className={styles.grid}>
            {dishes.map((d) => (
              <View key={d._id} className={styles.col}>
                <DishCard dish={d} onClick={handleOpenDetail} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View className={styles.fab} onClick={handleCreate}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </View>
  )
}

export default HomePage
