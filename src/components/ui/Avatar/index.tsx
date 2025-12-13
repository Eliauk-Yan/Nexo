import React from 'react'
import { Image, StyleSheet } from 'react-native'
import { colors } from '@/config/theme'

type AvatarProps = {
  url?: string // 图片地址，可空
  color?: string // 边框颜色
  size?: number // 尺寸，默认 100
}

const Index = ({ url, color = colors.primary, size = 100 }: AvatarProps) => {
  return (
    <Image
      source={{ uri: url }}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color, // 动态边框颜色
        },
      ]}
      // 没图时显示默认占位（强烈建议加）
      // defaultSource={require('../../assets/images/avatar.png')}
    />
  )
}

const styles = StyleSheet.create({
  avatar: {
    borderWidth: 3,
    marginBottom: 12,
  },
})

export default Index
