import { LiquidGlassButton } from '@/components/ui'
import { colors, spacing, typography, borderRadius } from '@/config/theme'
import { useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const About = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const buttonTop = insets.top + spacing.md

  const tapCountRef = useRef(0)
  const [easterEgg, setEasterEgg] = useState<string | null>(null)
  const logoScale = useRef(new Animated.Value(1)).current

  // NEXO 标题轻微呼吸动画
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.05,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [logoScale])

  const handleLogoPress = () => {
    tapCountRef.current += 1
    if (tapCountRef.current === 5) {
      setEasterEgg('你已经解锁了 NFTurbo 的隐藏成就：真正点进关于页的开发者。祝毕业答辩一次通过！')
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.backButton, { top: buttonTop }]}>
        <LiquidGlassButton icon="chevron-left" onPress={() => router.back()} />
      </View>
      <View style={[styles.content, { paddingTop: buttonTop + 50 + spacing.lg }]}>
        <TouchableOpacity activeOpacity={0.8} onPress={handleLogoPress} style={styles.logoCard}>
          <Animated.Text style={[styles.logoText, { transform: [{ scale: logoScale }] }]}>
            NEXO
          </Animated.Text>
          <Text style={styles.logoSub}>毕业设计 · 数字藏品体验站</Text>
        </TouchableOpacity>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>项目说明</Text>
          <Text style={styles.blockText}>
            本项目仅用于毕业设计演示，模拟一个完整的 NFT 数字藏品平台，包括管理端、客户端和高并发下单后端。
          </Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>技术彩蛋</Text>
          <Text style={styles.blockText}>
            后端基于 RocketMQ 事务消息实现“秒杀级”下单链路，前端则使用 Expo + 液态玻璃 UI 构建沉浸式体验。
          </Text>
        </View>

        {easterEgg && (
          <View style={styles.easterEggCard}>
            <Text style={styles.easterEggTitle}>🎉 小彩蛋</Text>
            <Text style={styles.easterEggText}>{easterEgg}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 10,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  logoCard: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 40,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: 2,
  },
  logoSub: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  block: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  blockTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  blockText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  easterEggCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  easterEggTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  easterEggText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
})

export default About
