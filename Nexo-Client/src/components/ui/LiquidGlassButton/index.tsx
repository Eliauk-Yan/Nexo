import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import { GlassView } from 'expo-glass-effect'
import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

type LiquidGlassButtonProps = {
  icon: keyof typeof FontAwesome6.glyphMap
  onPress?: () => void
  size?: number
  color?: string
  glassStyle?: 'regular' | 'clear'
  tintColor?: string
}

const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  icon,
  onPress,
  size = 20,
  color = '#fff',
  glassStyle = 'regular',
}) => {
  return (
    <GlassView style={styles.glass} isInteractive glassEffectStyle={glassStyle}>
      <TouchableOpacity style={styles.touch} onPress={onPress} activeOpacity={0.7}>
        <FontAwesome6 name={icon} size={size} color={color} />
      </TouchableOpacity>
    </GlassView>
  )
}

const SIZE = 44

const styles = StyleSheet.create({
  glass: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },
  touch: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default LiquidGlassButton
