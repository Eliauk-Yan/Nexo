import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'
import React from 'react'
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { Header } from '@/components/ui'
import { borderRadius, colors, spacing, typography } from '@/config/theme'

import { useAuth } from '@/hooks/useAuth'

const Index = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const headerHeight = insets.top + 60
  const { user, isLogin } = useAuth()

  const actionList = [
    { label: '订单', icon: 'shopping-bag', color: '#33B5E5', onPress: () => router.push('/order') },
    {
      label: '设置',
      icon: 'settings',
      color: '#FFFFFF',
      onPress: () => router.push('/setting'),
    },
    { label: '区块链', icon: 'link', color: '#D4AF37', onPress: () => { } },
    { label: '批量转赠', icon: 'send', color: '#00C851', onPress: () => { } },
  ]

  return (
    <View style={styles.container}>
      <Header />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight }]}
        >
          <View style={styles.userContainer}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarPlaceholder}>
                {isLogin && user?.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                ) : (
                  <Feather name="user" size={32} color={colors.textSecondary} />
                )}
              </View>
            </View>
            <View style={styles.userInfo}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={
                  isLogin ? () => router.push('/setting/account') : () => router.push('/(tabs)/account/sign-in')
                }
              >
                <Text style={styles.nickName}>{user?.nickName || '未登录'}</Text>
              </TouchableOpacity>
              {!isLogin && <Text style={styles.tip}>登录后可以查看更多功能</Text>}
              {isLogin && (
                <View style={styles.addressContainer}>
                  <Text style={styles.addressText}>0x71C...9A23</Text>
                  <Feather name="copy" size={12} color={colors.textSecondary} />
                </View>
              )}
            </View>
          </View>

          <View style={styles.functionContainer}>
            {actionList.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.functionItem}
                activeOpacity={0.8}
                onPress={action.onPress}
              >
                <View style={styles.functionIcon}>
                  <Feather name={action.icon as any} size={20} color={action.color} />
                </View>
                <Text style={styles.functionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {!isLogin && (
            <View style={styles.emptyState}>
              <View style={styles.illustration}>
                <Feather name="box" size={80} color={colors.textSecondary} />
              </View>
              <Text style={styles.loginPrompt}>请登录以查看你的数字藏品</Text>
              <TouchableOpacity
                style={styles.loginButton}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/account/sign-in')}
              >
                <Text style={styles.loginButtonText}>立即登录</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  userContainer: {
    marginHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nickName: {
    fontSize: typography.fontSize.xxl,
    color: 'white',
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  tip: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  addressContainer: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.lg,
    alignSelf: 'flex-start',
  },
  addressText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    resizeMode: 'cover',
  },
  functionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundCard,
    borderRadius: 28,
    paddingVertical: spacing.sm,
  },
  functionItem: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  functionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  functionLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.md,
    paddingVertical: spacing.xxl,
  },
  illustration: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  loginPrompt: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  loginButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    minWidth: 120,
  },
  loginButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
})

export default Index
