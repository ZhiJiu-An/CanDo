import React, { useState, useRef, useCallback } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { searchDishes } from '@/services/dish'
import type { Dish } from '@/types/dish'
import DishCard from '@/components/DishCard'
import Empty from '@/components/Empty'
import styles from './index.module.scss'

const SearchPage: React.FC = () => {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<Dish[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 防抖搜索
  const doSearch = useCallback((kw: string) => {
    const trimmed = kw.trim()
    if (!trimmed) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    searchDishes(trimmed)
      .then((list) => {
        setResults(list)
        setSearched(true)
      })
      .catch((err) => {
        console.error('[SearchPage] search error:', err)
        setResults([])
        setSearched(true)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleInput = (val: string) => {
    setKeyword(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(val), 300)
  }

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setKeyword('')
    setResults([])
    setSearched(false)
  }

  const handleCancel = () => {
    Taro.navigateBack()
  }

  const handleOpenDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` })
  }

  return (
    <View className={styles.page}>
      <View className={styles.searchBar}>
        <View className={styles.inputWrap}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.input}
            value={keyword}
            placeholder='搜菜名、食材、标签'
            placeholderClass={styles.placeholder}
            focus
            confirmType='search'
            onInput={(e) => handleInput(e.detail.value)}
          />
          {keyword ? (
            <Text className={styles.clearIcon} onClick={handleClear}>
              ✕
            </Text>
          ) : null}
        </View>
        <Text className={styles.cancelText} onClick={handleCancel}>
          取消
        </Text>
      </View>

      <ScrollView scrollY className={styles.content}>
        {loading ? (
          <View className={styles.center}>
            <Text className={styles.tipText}>搜索中...</Text>
          </View>
        ) : searched && results.length === 0 ? (
          <Empty text={`没有找到与「${keyword.trim()}」相关的菜谱`} />
        ) : searched ? (
          <View className={styles.resultWrap}>
            <Text className={styles.resultCount}>共 {results.length} 道相关菜谱</Text>
            <View className={styles.grid}>
              {results.map((d) => (
                <View key={d._id} className={styles.col}>
                  <DishCard dish={d} onClick={handleOpenDetail} />
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className={styles.hintWrap}>
            <Text className={styles.hintIcon}>🍳</Text>
            <Text className={styles.hintText}>输入菜名、食材或标签开始搜索</Text>
            <Text className={styles.hintSub}>例如：番茄、排骨、下饭</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default SearchPage
