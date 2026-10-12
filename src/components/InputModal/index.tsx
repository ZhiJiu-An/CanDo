import React, { useState, useEffect } from 'react'
import { View, Text, Input } from '@tarojs/components'
import styles from './index.module.scss'

interface InputModalProps {
  visible: boolean
  title: string
  placeholder?: string
  initialValue?: string
  confirmText?: string
  cancelText?: string
  maxLength?: number
  // 支持返回 Promise：确认期间按钮自动禁用，防止重复提交
  onConfirm: (value: string) => void | Promise<void>
  onCancel: () => void
}

/**
 * 通用文本输入弹层
 * 三端一致的输入弹窗（不依赖 showModal editable，H5 下也能正常输入）
 */
const InputModal: React.FC<InputModalProps> = ({
  visible,
  title,
  placeholder = '请输入',
  initialValue = '',
  confirmText = '确定',
  cancelText = '取消',
  maxLength = 20,
  onConfirm,
  onCancel
}) => {
  const [value, setValue] = useState(initialValue)
  const [confirming, setConfirming] = useState(false)

  // 每次打开时同步初始值
  useEffect(() => {
    if (visible) {
      setValue(initialValue)
      setConfirming(false)
    }
  }, [visible, initialValue])

  if (!visible) return null

  const handleConfirm = async () => {
    // 提交中禁止重复触发（防连点）
    if (confirming) return
    const trimmed = value.trim()
    if (!trimmed) return
    setConfirming(true)
    try {
      await onConfirm(trimmed)
    } finally {
      setConfirming(false)
    }
  }

  const disabled = confirming || !value.trim()

  return (
    <View className={styles.mask} catchMove>
      <View className={styles.modal}>
        <Text className={styles.title}>{title}</Text>
        <View className={styles.inputWrap}>
          <Input
            className={styles.input}
            value={value}
            placeholder={placeholder}
            placeholderClass={styles.placeholder}
            focus
            maxlength={maxLength}
            onInput={(e) => setValue(e.detail.value)}
          />
        </View>
        <View className={styles.footer}>
          <View className={styles.cancelBtn} onClick={onCancel}>
            <Text className={styles.cancelText}>{cancelText}</Text>
          </View>
          <View
            className={`${styles.confirmBtn} ${disabled ? styles.confirmBtnDisabled : ''}`}
            onClick={disabled ? undefined : handleConfirm}
          >
            <Text
              className={`${styles.confirmText} ${disabled ? styles.confirmTextDisabled : ''}`}
            >
              {confirming ? '保存中...' : confirmText}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default InputModal
