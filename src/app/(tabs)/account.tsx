import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import { borderRadius, colors, spacing, typography } from '@/config/theme'

// 获取屏幕高度
const { height: SCREEN_HEIGHT } = Dimensions.get('window')

const Account = () => {
  const router = useRouter()
  const [avatar] = useState('')

  const userStats = useMemo(
    () => [
      { label: '藏品', value: 0, icon: 'grid' },
      { label: '关注', value: 0, icon: 'user-plus' },
      { label: '粉丝', value: 0, icon: 'users' },
    ],
    [],
  )

  const actionList = useMemo(
    () => [
      { label: '登录 / 注册', icon: 'log-in', onPress: () => {} },
      { label: '完善资料', icon: 'user', onPress: () => {} },
      { label: '我的钱包', icon: 'credit-card', onPress: () => {} },
      { label: '我的藏品', icon: 'package', onPress: () => {} },
      { label: '收藏夹', icon: 'heart', onPress: () => {} },
      { label: '设置', icon: 'settings', onPress: () => {} },
    ],
    [],
  )

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.userContainer}>
          <View>
          <Text style={styles.nickName}>未登录</Text>
          <Text style={styles.tip}>登录后可以查看你的数字藏品</Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.8}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.primaryBtnText}>立即登录</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.avatarWrapper}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={32} color={colors.textSecondary} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          {userStats.map((item) => (
            <View key={item.label} style={styles.statItem}>
              <View style={styles.statIcon}>
                <Feather name={item.icon as any} size={16} color={colors.text} />
              </View>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>快捷操作</Text>
          <View style={styles.actionList}>
            {actionList.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionItem}
                activeOpacity={0.8}
                onPress={action.onPress}
              >
                <View style={styles.actionLeft}>
                  <View style={styles.actionIcon}>
                    <Feather name={action.icon as any} size={18} color={colors.text} />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
      </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: 'transparent',
  },
  glassButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  touchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  userContainer: {
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    minHeight: SCREEN_HEIGHT * 0.2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContainer: {
    marginBottom: spacing.md,
  },
  nickName: {
    fontSize: typography.fontSize.xxl,
    color: colors.text,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  tip: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  primaryBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    alignSelf: 'flex-start',
  },
  primaryBtnText: {
    color: colors.text,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.md,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  actionList: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
})

export default Account
