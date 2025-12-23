import React, { useRef, useState } from 'react'
import {
  StyleSheet,
  TextInput,
  View,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
} from 'react-native'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import { GlassContainer, GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'
import { LiquidGlassButton } from '@/components/ui'

type LiquidGlassSearchBarProps = {
  value?: string
  onChangeText?: (text: string) => void
  onSubmit?: (text: string) => void
  onPressAction?: () => void
  placeholder?: string
  actionIcon?: keyof typeof FontAwesome6.glyphMap
  interactive?: boolean
  glassStyle?: 'regular' | 'clear'
  tintColor?: string
  search?: boolean
}

const LiquidGlassSearchBar: React.FC<LiquidGlassSearchBarProps> = ({
  value,
  onChangeText,
  onSubmit,
  onPressAction,
  placeholder = 'Search',
  actionIcon = 'sliders',
  interactive = true,
  glassStyle = 'regular',
  search = false,
}) => {
  const inputRef = useRef<TextInput>(null)
  const [inner, setInner] = useState('')
  const text = value ?? inner

  const handleChange = (t: string) => {
    if (value === undefined) setInner(t)
    onChangeText?.(t)
  }

  const handleSubmit = (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    const t = e.nativeEvent.text
    onSubmit?.(t)
  }

  const showClear = text.length > 0

  return (
    <GlassContainer spacing={5} style={styles.container}>
      {search ? (
        <GlassView
          style={styles.searchGlass}
          isInteractive={interactive}
          glassEffectStyle={glassStyle}
        >
          <View style={styles.searchInner}>
            <FontAwesome6 name="magnifying-glass" size={16} color="#fff" style={styles.leftIcon} />
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={handleChange}
              placeholder={placeholder}
              placeholderTextColor="rgba(255,255,255,0.55)"
              style={styles.input}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              onSubmitEditing={handleSubmit}
            />

            {showClear && (
              <View style={styles.clearHit}>
                <LiquidGlassButton
                  icon="xmark"
                  onPress={() => {
                    handleChange('')
                    requestAnimationFrame(() => inputRef.current?.focus())
                  }}
                  size={16}
                  color="#fff"
                  glassStyle="clear"
                />
              </View>
            )}
          </View>
        </GlassView>
      ) : (
        // 搜索框不显示时，用占位把右侧按钮顶到最右
        <View style={styles.spacer} />
      )}

      <LiquidGlassButton
        icon={actionIcon}
        onPress={onPressAction}
        size={18}
        color="#fff"
        glassStyle={glassStyle}
      />
    </GlassContainer>
  )
}

const HEIGHT = 44

const styles = StyleSheet.create({
  container: {
    width: '100%', // 关键：占满一行
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  spacer: {
    flex: 1, // 把按钮推到右侧
  },
  searchGlass: {
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    flex: 1,
    minWidth: 180,
  },
  searchInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 10,
  },
  leftIcon: {
    marginRight: 8,
    opacity: 0.9,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#fff',
    fontSize: 15,
    paddingVertical: 0, // Android/iOS 对齐更稳
  },
  clearHit: {
    marginLeft: 8,
  },
})

export default LiquidGlassSearchBar
