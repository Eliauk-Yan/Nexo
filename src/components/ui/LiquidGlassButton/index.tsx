import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import { GlassView } from 'expo-glass-effect'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

type GlassViewProps = {
  icon: keyof typeof FontAwesome6.glyphMap // 确保 icon 是 FontAwesome6 支持的名字
  onPress?: () => void // 可选点击事件
  size?: number // 图标大小，可选
  color?: string // 图标颜色，可选
}

const LiquidGlassButton = (props: GlassViewProps) => {
  const { icon, onPress, size = 24, color = '#FFF' } = props

  return (
    <View>
      <GlassView style={styles.liquidButton} isInteractive={true}>
        <TouchableOpacity style={styles.touchable} onPress={onPress}>
          <FontAwesome6 name={icon} size={size} color={color} />
        </TouchableOpacity>
      </GlassView>
    </View>
  )
}

const styles = StyleSheet.create({
  liquidButton: {
    width: 50,
    height: 50,
    borderRadius: 30,
  },
  touchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
})

export default LiquidGlassButton
