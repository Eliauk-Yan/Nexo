import Feather from '@expo/vector-icons/Feather'
import { useRouter, useFocusEffect } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import LiquidGlassSearchBar from '@/components/ui/LiquidGlassSearch'
import { AssetCard } from '@/components/ui/AssetCard'
import { borderRadius, colors, spacing, typography } from '@/config/theme'
import { artworkApi, Asset } from '@/api/artwork'
import { useSession } from '@/utils/ctx'

const Index = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user, session } = useSession()
  const isLogin = !!session

  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)

  const fetchMyAssets = useCallback(async () => {
    if (!isLogin) return
    try {
      setLoading(true)
      const response = await artworkApi.getMyAssets(1, 20)
      const items = (response as any).records || response || []
      setAssets(Array.isArray(items) ? items : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [isLogin])

  // 页面重新获得焦点时刷新“我的数字资产”
  useFocusEffect(
    useCallback(() => {
      if (isLogin) {
        fetchMyAssets()
      }
    }, [isLogin, fetchMyAssets]),
  )

  useEffect(() => {
    if (isLogin) {
      fetchMyAssets()
    } else {
      setAssets([])
    }
  }, [isLogin, fetchMyAssets])

  const actionList = [
    { label: '订单', icon: 'shopping-bag', color: '#33B5E5', onPress: () => router.push('/order') },
    {
      label: '设置',
      icon: 'settings',
      color: '#FFFFFF',
      onPress: () => router.push('/setting'),
    },
    {
      label: '区块链',
      icon: 'link',
      color: '#D4AF37',
      onPress: () => {
        if (!isLogin) {
          router.push('/(auth)/sign-in')
          return
        }
        Alert.alert(
          '链上身份信息',
          `昵称：${user?.nickName || '未设置'}\n链地址：${user?.account || '暂未绑定'}\n实名状态：${
            user?.certification ? '已实名认证' : '未实名认证'
          }`,
          [{ text: '知道了', style: 'default' }],
        )
      },
    },
    {
      label: '批量转赠',
      icon: 'send',
      color: '#00C851',
      onPress: () => {
        Alert.alert(
          '暂不支持批量转赠',
          '受当前法规及合规要求限制，本项目仅用于毕业设计演示，不开放二级市场交易与批量转赠功能。',
          [{ text: '知道了', style: 'default' }],
        )
      },
    },
  ]

  const renderHeader = () => (
    <View style={styles.headerContainer}>
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
              isLogin
                ? () => router.push('/setting/account')
                : () => router.push('/(auth)/sign-in')
            }
          >
            <Text style={styles.nickName}>{user?.nickName || '未登录'}</Text>
          </TouchableOpacity>
          {!isLogin && <Text style={styles.tip}>登录后可以查看更多功能</Text>}
          {isLogin && user?.account && (
            <View style={styles.addressContainer}>
              <Text style={styles.addressText} numberOfLines={1}>
                {user.account}
              </Text>
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

      {isLogin && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>我的数字资产</Text>
          <View style={styles.sectionUnderline} />
        </View>
      )}
    </View>
  )

  const renderItem = ({ item }: { item: Asset }) => (
    <View style={styles.itemContainer}>
      <AssetCard asset={item} />
    </View>
  )

  return (
  <View style={styles.container}>
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <LiquidGlassSearchBar
          onSubmit={(t) => console.log('submit:', t)}
          onPressAction={() => router.push('/notification')}
          actionIcon="bell"
          glassStyle="regular"
          tintColor="rgba(255,255,255,0.12)"
        />
      </View>

      {/* 未登录：仅展示登录引导块，居中显示 */}
      {!isLogin && (
        <View style={[styles.loggedOutWrapper, { marginTop: insets.top + 40 }]}>
          {renderHeader()}
          <View style={styles.emptyState}>
            <View style={styles.illustration}>
              <Feather name="box" size={80} color={colors.textSecondary} />
            </View>
            <Text style={styles.loginPrompt}>请登录以查看你的数字藏品</Text>
            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.8}
              onPress={() => router.push('/(auth)/sign-in')}
            >
              <Text style={styles.loginButtonText}>立即登录</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 已登录：账户信息固定，资产列表可滚动 */}
      {isLogin && (
        <>
          <View style={{ marginTop: insets.top + 60 }}>
            {renderHeader()}
          </View>
          <FlatList
            data={assets}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            columnWrapperStyle={styles.row}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyAssetContainer}>
                  <Feather name="inbox" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyAssetText}>暂无数字资产</Text>
                </View>
              ) : null
            }
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loggedOutWrapper: {
    flex: 1,
  },
  headerWrap: {
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerContainer: {
    gap: spacing.lg,
    paddingBottom: spacing.lg,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    // 减小头部和资产列表之间的间距，让区块更连贯
    gap: spacing.sm,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  itemContainer: {
    flex: 1,
    margin: spacing.xs,
    maxWidth: '48%',
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  sectionUnderline: {
    marginTop: spacing.xs,
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  emptyAssetContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  emptyAssetText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
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
