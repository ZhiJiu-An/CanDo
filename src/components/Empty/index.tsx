import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface EmptyProps {
  text?: string
}

const Empty: React.FC<EmptyProps> = ({ text = '还没有内容哦' }) => {
  return (
    <View className={styles.wrap}>
      <Text className={styles.icon}>🍳</Text>
      <Text className={styles.text}>{text}</Text>
    </View>
  )
}

export default Empty
