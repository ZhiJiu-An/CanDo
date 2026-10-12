import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import type { Dish } from '@/types/dish'
import styles from './index.module.scss'

interface DishCardProps {
  dish: Dish
  onClick?: (id: string) => void
}

const DishCard: React.FC<DishCardProps> = ({ dish, onClick }) => {
  const handleClick = () => {
    onClick?.(dish._id)
  }

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.coverWrap}>
        <Image
          className={styles.cover}
          src={dish.coverImage}
          mode='aspectFill'
          lazyLoad
        />
        <View className={styles.tag}>
          <Text className={styles.tagText}>{dish.category}</Text>
        </View>
        {dish.pinned ? (
          <View className={styles.pinBadge}>
            <Text className={styles.pinBadgeText}>置顶</Text>
          </View>
        ) : null}
        {dish.favorited ? <Text className={styles.favIcon}>♥</Text> : null}
      </View>
      <View className={styles.info}>
        <Text className={styles.name}>{dish.name}</Text>
        <Text className={styles.intro}>{dish.intro || '暂无简介'}</Text>
        {dish.tags.length > 0 ? (
          <View className={styles.tags}>
            {dish.tags.slice(0, 2).map((t) => (
              <View key={t} className={styles.tagChip}>
                <Text className={styles.tagChipText}>{t}</Text>
              </View>
            ))}
            {dish.tags.length > 2 ? (
              <Text className={styles.tagMore}>+{dish.tags.length - 2}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  )
}

export default DishCard
