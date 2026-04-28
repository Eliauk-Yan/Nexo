import React, { useMemo, useState } from 'react'
import Feather from '@expo/vector-icons/Feather'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Stack, useFocusEffect, useRouter } from 'expo-router'
import {
  Alert,
  Dimensions,
  Image as RNImage,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import * as Haptics from 'expo-haptics'

import { useSession } from '@/utils/ctx'
import { userApi } from '@/api/user'
import { nftApi, Asset } from '@/api/nft'
import { showErrorAlert } from '@/utils/error'
import { borderRadius, colors, spacing, typography } from '@/config/theme'

const PAGE_PADDING = 16
const CARD_GAP = 12
const CARD_WIDTH = (Dimensions.get('window').width - PAGE_PADDING * 2 - CARD_GAP) / 2

const FunctionItem = ({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name']
  label: string
  color: string
  onPress: () => void
}) => (
  <TouchableOpacity activeOpacity={0.82} style={styles.functionItem} onPress={onPress}>
    <View style={[styles.functionIcon, { backgroundColor: `${color}1F` }]}>
      <Feather name={icon} size={24} color={color} />
    </View>
    <Text style={styles.functionLabel}>{label}</Text>
  </TouchableOpacity>
)

function ProfileAssetCard({
  asset,
  onPress,
}: {
  asset: Asset
  onPress: () => void
}) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const cardBg = isDark ? colors.backgroundCard : '#FFFFFF'
  const cardBorder = isDark ? colors.border : 'rgba(15, 23, 42, 0.08)'
  const frameBg = isDark ? colors.backgroundSecondary : '#F3F4F6'
  const titleColor = isDark ? colors.text : '#111827'
  const secondaryText = isDark ? colors.textSecondary : '#6B7280'
  const stateStyle = {
    text: '#22C55E',
    background: isDark ? 'rgba(34,197,94,0.18)' : 'rgba(34,197,94,0.12)',
    border: isDark ? 'rgba(34,197,94,0.38)' : 'rgba(34,197,94,0.28)',
  }

  return (
    <Pressable style={styles.assetCardWrap} onPress={onPress}>
      <View style={[styles.assetCardContainer, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <View style={styles.assetImageContainer}>
          <View style={[styles.assetImageFrame, { backgroundColor: frameBg }]}>
            {asset.artworkCover ? (
              <RNImage source={{ uri: asset.artworkCover }} style={styles.assetImage} />
            ) : (
              <Feather name="image" size={30} color="#8E8E93" />
            )}
          </View>
          <View style={[styles.assetStatusBadge, { backgroundColor: stateStyle.background, borderColor: stateStyle.border }]}>
            <Text style={[styles.assetStatusText, { color: stateStyle.text }]}>已持有</Text>
          </View>
        </View>

        <Text style={[styles.assetTitle, { color: titleColor }]} numberOfLines={1}>
          {asset.artworkName || '未命名藏品'}
        </Text>
        <View style={styles.assetSerialContainer}>
          <MaterialCommunityIcons name="barcode-scan" size={12} color={secondaryText} />
          <Text style={[styles.assetSerialText, { color: secondaryText }]} numberOfLines={1}>
            #{asset.serialNumber ? asset.serialNumber.substring(0, 8) : '-'}
          </Text>
        </View>
        <View style={styles.assetFooter}>
          <Text style={[styles.assetPriceLabel, { color: secondaryText }]}>买入价</Text>
          <Text style={styles.assetPriceValue}>¥{asset.purchasePrice}</Text>
        </View>
      </View>
    </Pressable>
  )
}

export default function ProfileScreen() {
  const router = useRouter()
  const { user, session, signIn } = useSession()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isLogin = !!session
  const [assets, setAssets] = useState<Asset[]>([])

  const background = isDark ? '#000000' : '#F2F2F7'
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF'
  const textMain = isDark ? '#FFFFFF' : '#111111'
  const textSub = isDark ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.5)'
  const avatarBg = isDark ? 'rgba(255,255,255,0.08)' : '#EDEDED'

  useFocusEffect(
    React.useCallback(() => {
      if (!session) return

      let isActive = true
      userApi
        .getUserProfile()
        .then((profile) => {
          if (isActive) {
            signIn(session, profile)
          }
        })
        .catch((error) => {
          showErrorAlert(error, '刷新用户信息失败，请稍后重试。')
        })

      return () => {
        isActive = false
      }
    }, [session, signIn]),
  )

  useFocusEffect(
    React.useCallback(() => {
      if (!session) {
        setAssets([])
        return
      }

      let isActive = true
      nftApi
        .getMyAssets({
          currentPage: 1,
          pageSize: 4,
          state: 'ACTIVE',
        })
        .then((items) => {
          if (isActive) {
            setAssets(Array.isArray(items) ? items : [])
          }
        })
        .catch((error) => {
          showErrorAlert(error, '加载资产失败，请稍后重试。')
        })

      return () => {
        isActive = false
      }
    }, [session]),
  )

  const handleCopy = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text)
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } catch {
        // Haptics might not be available
      }
      Alert.alert('提示', `${label}已复制到剪贴板`)
    } catch (error) {
      Alert.alert('复制失败', '无法自动复制，请长按文本进行手动选择复制。')
    }
  }

  const shortAccount = useMemo(() => {
    if (!user?.account) return '暂未绑定链地址'
    if (user.account.length <= 18) return user.account
    return `${user.account.slice(0, 8)}...${user.account.slice(-6)}`
  }, [user?.account])

  return (
    <>
      <Stack.Screen
        options={{
          title: '我的',
          headerLargeTitle: true,
          headerRight: () => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.headerButton}
              onPress={() => router.push('/setting')}
            >
              <Feather name="settings" size={20} color="#0A84FF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={[styles.scroll, { backgroundColor: background }]}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileCard, { backgroundColor: cardBg }]}>
          <View style={[styles.avatarWrap, { backgroundColor: avatarBg }]}>
            {isLogin && user?.avatarUrl ? (
              <RNImage source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <Feather name="user" size={30} color="#8E8E93" />
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.nickName, { color: textMain }]} numberOfLines={1}>
              {user?.nickName || '未登录'}
            </Text>
            {!isLogin ? (
              <Text style={[styles.profileHint, { color: textSub }]}>登录后可以查看更多功能</Text>
            ) : (
              <TouchableOpacity
                activeOpacity={0.78}
                style={styles.accountPill}
                onPress={() => {
                  if (user?.account) {
                    handleCopy(user.account, '链账户地址')
                  }
                }}
              >
                <Feather name="link" size={12} color="#8E8E93" />
                <Text style={styles.accountText} numberOfLines={1}>
                  {shortAccount}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.primaryButton}
            onPress={() => (isLogin ? router.push('/setting/account') : router.push('/(auth)/sign-in'))}
          >
            <Text style={styles.primaryButtonText}>{isLogin ? '编辑资料' : '去登录'}</Text>
          </TouchableOpacity>

        </View>

        <View style={styles.section}>
          <View style={[styles.functionCard, { backgroundColor: cardBg }]}>
            <FunctionItem
              icon="shopping-bag"
              label="订单"
              color="#0A84FF"
              onPress={() => router.push('/order')}
            />
            <FunctionItem
              icon="settings"
              label="设置"
              color="#8E8E93"
              onPress={() => router.push('/setting')}
            />
            <FunctionItem
              icon="layers"
              label="我的资产"
              color="#5E5CE6"
              onPress={() => router.push('/assets')}
            />
            <FunctionItem
              icon="send"
              label="资产转赠"
              color="#22C55E"
              onPress={() => router.push('/transfer')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.assetsHeader}>
            <View style={styles.assetsTitleGroup}>
              <Text style={[styles.assetsTitle, { color: textMain }]}>我的藏品</Text>
              <View style={styles.assetsCountBadge}>
                <Text style={styles.assetsCountText}>{assets.length}</Text>
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.78} style={styles.assetsMoreButton} onPress={() => router.push('/assets')}>
              <Text style={styles.assetsMoreText}>查看全部</Text>
              <Feather name="chevron-right" size={15} color="#0A84FF" />
            </TouchableOpacity>
          </View>

          {isLogin && assets.length > 0 ? (
            <View style={styles.assetPreviewGrid}>
              {assets.map((asset) => (
                <ProfileAssetCard
                  key={String(asset.id)}
                  asset={asset}
                  onPress={() => router.push('/assets')}
                />
              ))}
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.82}
              style={[styles.assetEmptyCard, { backgroundColor: cardBg }]}
              onPress={() => (isLogin ? router.push('/assets') : router.push('/(auth)/sign-in'))}
            >
              <Feather name="box" size={22} color="#8E8E93" />
              <Text style={[styles.assetEmptyText, { color: textSub }]}>
                {isLogin ? '暂无藏品' : '登录后查看藏品'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    minHeight: 116,
    borderRadius: 28,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 10,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
  },
  nickName: {
    fontSize: 24,
    fontWeight: '800',
  },
  profileHint: {
    fontSize: 13,
    marginTop: 6,
  },
  accountPill: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    marginTop: 8,
    borderRadius: 18,
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(142,142,147,0.14)',
  },
  accountText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '700',
  },
  primaryButton: {
    minWidth: 78,
    height: 38,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#0A84FF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 2,
    marginBottom: 12,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  functionCard: {
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  functionItem: {
    flex: 1,
    alignItems: 'center',
  },
  functionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  functionLabel: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  assetsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  assetsTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assetsTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  assetsCountBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,132,255,0.14)',
  },
  assetsCountText: {
    color: '#0A84FF',
    fontSize: 13,
    fontWeight: '900',
  },
  assetsMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  assetsMoreText: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '700',
  },
  assetPreviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  assetCardWrap: {
    width: CARD_WIDTH,
  },
  assetCardContainer: {
    borderRadius: 20,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
  },
  assetImageContainer: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: spacing.sm,
    position: 'relative' as const,
  },
  assetImageFrame: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  assetImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover' as const,
  },
  assetStatusBadge: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  assetStatusText: {
    fontSize: 11,
    fontWeight: '800' as const,
  },
  assetTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 6,
  },
  assetSerialContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    marginBottom: 10,
  },
  assetSerialText: {
    fontSize: typography.fontSize.xs,
    fontFamily: 'monospace',
  },
  assetFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  assetPriceLabel: {
    fontSize: 11,
  },
  assetPriceValue: {
    color: '#0A84FF',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  assetEmptyCard: {
    minHeight: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetEmptyText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
  },
  shortcutIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,132,255,0.12)',
  },
})
