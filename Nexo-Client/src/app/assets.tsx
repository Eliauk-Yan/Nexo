import React, { useCallback, useEffect, useState } from 'react'
import Feather from '@expo/vector-icons/Feather'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Stack, useFocusEffect, useRouter } from 'expo-router'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image as RNImage,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import * as Haptics from 'expo-haptics'

import { nftApi, Asset, AssetState } from '@/api/nft'
import { borderRadius, colors, spacing, typography } from '@/config/theme'
import { showErrorAlert } from '@/utils/error'
import { useSession } from '@/utils/ctx'

function EmptyAssets({ message = '暂无相关资产', textColor = '#8E8E93' }: { message?: string; textColor?: string }) {
  return (
    <View style={styles.emptyContainer}>
      <Feather name="inbox" size={46} color="#8E8E93" />
      <Text style={[styles.emptyText, { color: textColor }]}>{message}</Text>
    </View>
  )
}

function formatShortText(value?: string | null, head = 8, tail = 6) {
  if (!value) return '-'
  if (value.length <= head + tail + 3) return value
  return `${value.substring(0, head)}...${value.slice(-tail)}`
}

function getAssetStateLabel(state?: string) {
  switch (state) {
    case 'INIT':
      return '铸造中'
    case 'ACTIVE':
      return '已持有'
    case 'DESTROYING':
      return '销毁中'
    case 'DESTROYED':
      return '已销毁'
    default:
      return '已失效'
  }
}

const ASSET_TABS: { id: string; label: string; state?: AssetState }[] = [
  { id: 'all', label: '全部' },
  { id: 'active', label: '已持有', state: 'ACTIVE' },
  { id: 'minting', label: '铸造中', state: 'INIT' },
  { id: 'destroying', label: '销毁中', state: 'DESTROYING' },
  { id: 'destroyed', label: '已销毁', state: 'DESTROYED' },
]

const PAGE_PADDING = spacing.md
const CARD_GAP = 12
const CARD_WIDTH = (Dimensions.get('window').width - PAGE_PADDING * 2 - CARD_GAP) / 2

function getAssetStateStyle(state?: string, isDark = false) {
  switch (state) {
    case 'INIT':
      return {
        text: '#FF9500',
        background: isDark ? 'rgba(255,149,0,0.18)' : 'rgba(255,149,0,0.12)',
        border: isDark ? 'rgba(255,149,0,0.38)' : 'rgba(255,149,0,0.28)',
      }
    case 'ACTIVE':
      return {
        text: '#22C55E',
        background: isDark ? 'rgba(34,197,94,0.18)' : 'rgba(34,197,94,0.12)',
        border: isDark ? 'rgba(34,197,94,0.38)' : 'rgba(34,197,94,0.28)',
      }
    case 'DESTROYING':
      return {
        text: '#5856D6',
        background: isDark ? 'rgba(88,86,214,0.2)' : 'rgba(88,86,214,0.12)',
        border: isDark ? 'rgba(88,86,214,0.42)' : 'rgba(88,86,214,0.28)',
      }
    case 'DESTROYED':
      return {
        text: '#FF3B30',
        background: isDark ? 'rgba(255,59,48,0.18)' : 'rgba(255,59,48,0.12)',
        border: isDark ? 'rgba(255,59,48,0.38)' : 'rgba(255,59,48,0.28)',
      }
    default:
      return {
        text: '#8E8E93',
        background: isDark ? 'rgba(142,142,147,0.18)' : 'rgba(142,142,147,0.12)',
        border: isDark ? 'rgba(142,142,147,0.34)' : 'rgba(142,142,147,0.24)',
      }
  }
}

function AssetCard({
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
  const stateStyle = getAssetStateStyle(asset.state, isDark)

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
            <Text style={[styles.assetStatusText, { color: stateStyle.text }]}>{getAssetStateLabel(asset.state)}</Text>
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

function DetailRow({
  icon,
  iconColor,
  label,
  value,
  borderColor,
  textColor,
  subTextColor,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name']
  iconColor: string
  label: string
  value: string
  borderColor: string
  textColor: string
  subTextColor: string
  onPress?: () => void
}) {
  const content = (
    <View style={[styles.detailRow, { borderBottomColor: borderColor }]}>
      <View style={[styles.detailIcon, { backgroundColor: `${iconColor}1F` }]}>
        <Feather name={icon} size={16} color={iconColor} />
      </View>
      <Text style={[styles.detailLabel, { color: textColor }]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.detailValue, { color: subTextColor }]}>
        {value}
      </Text>
      {onPress ? <Feather name="copy" size={15} color={subTextColor} /> : null}
    </View>
  )

  if (!onPress) return content
  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress}>
      {content}
    </TouchableOpacity>
  )
}

export default function MyAssetsScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { session } = useSession()
  const isLogin = !!session

  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [destroyingAssetId, setDestroyingAssetId] = useState<number | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [searchText, setSearchText] = useState('')

  const ui = {
    background: isDark ? '#000000' : '#F2F2F7',
    card: isDark ? colors.backgroundCard : '#FFFFFF',
    cardMuted: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
    text: isDark ? colors.text : '#111827',
    textSecondary: isDark ? colors.textSecondary : '#6B7280',
    border: isDark ? colors.border : 'rgba(15, 23, 42, 0.08)',
    search: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(118,118,128,0.12)',
  }

  const handleCopy = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text)
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } catch {
        // Haptics might not be available.
      }
      Alert.alert('提示', `${label}已复制到剪贴板`)
    } catch {
      Alert.alert('复制失败', '无法自动复制，请长按文本进行手动选择复制。')
    }
  }

  const fetchMyAssets = useCallback(async (tabId = activeTab, searchKeyword = keyword) => {
    if (!isLogin) {
      setAssets([])
      return
    }

    try {
      setLoading(true)
      const state = ASSET_TABS.find((tab) => tab.id === tabId)?.state
      const response = await nftApi.getMyAssets({
        currentPage: 1,
        pageSize: 20,
        keyword: searchKeyword.trim() || undefined,
        state,
      })
      setAssets(Array.isArray(response) ? response : [])
    } catch (error) {
      showErrorAlert(error, '加载资产失败，请稍后重试。')
    } finally {
      setLoading(false)
    }
  }, [activeTab, isLogin, keyword])

  const handleDestroyAsset = useCallback(
    (asset: Asset) => {
      if (asset.state !== 'ACTIVE') {
        Alert.alert('提示', '只有已持有的资产可以销毁。')
        return
      }

      Alert.alert('销毁确认', '销毁会提交链上处理，确认后不可恢复。', [
        { text: '取消', style: 'cancel' },
        {
          text: '确认销毁',
          style: 'destructive',
          onPress: async () => {
            if (!asset.id) {
              Alert.alert('提示', '资产ID为空，请刷新资产列表后重试。')
              return
            }
            try {
              setDestroyingAssetId(asset.id)
              await nftApi.destroyAsset(asset.id)
              try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
              } catch {
                // Haptics might not be available.
              }
              Alert.alert('提示', '销毁请求已提交')
              setSelectedAsset(null)
              await fetchMyAssets(activeTab, keyword)
            } catch (error) {
              showErrorAlert(error, '销毁资产失败，请稍后重试。')
            } finally {
              setDestroyingAssetId(null)
            }
          },
        },
      ])
    },
    [activeTab, fetchMyAssets, keyword],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(searchText)
    }, 350)

    return () => clearTimeout(timer)
  }, [searchText])

  useFocusEffect(
    useCallback(() => {
      fetchMyAssets(activeTab, keyword).catch(() => {})
    }, [activeTab, fetchMyAssets, keyword]),
  )

  const selectedStateStyle = getAssetStateStyle(selectedAsset?.state, isDark)

  const renderHeader = () => (
    <View>
      <View style={[styles.searchBox, { backgroundColor: ui.search, borderColor: ui.border }]}>
        <Feather name="search" size={18} color={ui.textSecondary} />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="搜索资产"
          placeholderTextColor={ui.textSecondary}
          style={[styles.searchInput, { color: ui.text }]}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchText ? (
          <TouchableOpacity activeOpacity={0.72} onPress={() => setSearchText('')}>
            <Feather name="x-circle" size={17} color={ui.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filterContent}>
        {ASSET_TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.82}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? '#0A84FF' : ui.cardMuted,
                  borderColor: active ? '#0A84FF' : ui.border,
                },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.filterChipText, { color: active ? '#FFFFFF' : ui.textSecondary }]}>{tab.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <View style={styles.listTitleRow}>
        <Text style={[styles.listTitle, { color: ui.text }]}>资产列表</Text>
        <Text style={[styles.listCount, { color: ui.textSecondary }]}>{assets.length} 件</Text>
      </View>
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: ui.background }]}>
      <Stack.Screen
        options={{
          headerTitle: '我的资产',
          headerTransparent: true,
        }}
      />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.left" onPress={() => router.back()} />
      </Stack.Toolbar>

      {!isLogin ? (
        <View style={styles.loginContainer}>
          {renderHeader()}
          <View style={[styles.loginCard, { backgroundColor: ui.card, borderColor: ui.border }]}>
            <EmptyAssets message="登录后查看我的数字资产" textColor={ui.textSecondary} />
            <TouchableOpacity activeOpacity={0.85} style={styles.loginButton} onPress={() => router.push('/(auth)/sign-in')}>
              <Text style={styles.loginButtonText}>去登录</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={assets}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <AssetCard
              asset={item}
              onPress={() => {
                setSelectedAsset(item)
              }}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator size="small" />
              </View>
            ) : (
              <EmptyAssets textColor={ui.textSecondary} />
            )
          }
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={assets.length > 0 ? styles.assetRow : undefined}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={Boolean(selectedAsset)}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedAsset(null)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismissArea} onPress={() => setSelectedAsset(null)} />
          {selectedAsset ? (
            <View style={[styles.detailSheet, { backgroundColor: ui.background }]}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: ui.text }]}>资产详情</Text>
                <TouchableOpacity activeOpacity={0.78} style={[styles.closeButton, { backgroundColor: ui.search }]} onPress={() => setSelectedAsset(null)}>
                  <Feather name="x" size={18} color={ui.text} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.detailHeroCard, { backgroundColor: ui.card, borderColor: ui.border }]}>
                  <View style={[styles.detailCoverWrap, { backgroundColor: ui.search }]}>
                    {selectedAsset.artworkCover ? (
                      <RNImage source={{ uri: selectedAsset.artworkCover }} style={styles.detailCover} />
                    ) : (
                      <Feather name="image" size={34} color="#8E8E93" />
                    )}
                  </View>
                  <View style={styles.detailHeroText}>
                    <Text style={[styles.detailAssetTitle, { color: ui.text }]} numberOfLines={2}>
                      {selectedAsset.artworkName || '未命名藏品'}
                    </Text>
                    <View style={[styles.detailStatus, { backgroundColor: selectedStateStyle.background, borderColor: selectedStateStyle.border }]}>
                      <Text style={[styles.detailStatusText, { color: selectedStateStyle.text }]}>
                        {getAssetStateLabel(selectedAsset.state)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.detailCard, { backgroundColor: ui.card }]}>
                  <DetailRow
                    icon="hash"
                    iconColor="#0A84FF"
                    label="标识符"
                    value={formatShortText(selectedAsset.serialNumber)}
                    borderColor={ui.border}
                    textColor={ui.text}
                    subTextColor={ui.textSecondary}
                    onPress={() => {
                      if (selectedAsset.serialNumber) handleCopy(selectedAsset.serialNumber, '资产唯一标识')
                    }}
                  />
                  <DetailRow
                    icon="dollar-sign"
                    iconColor="#22C55E"
                    label="买入价"
                    value={`¥${selectedAsset.purchasePrice}`}
                    borderColor={ui.border}
                    textColor={ui.text}
                    subTextColor={ui.textSecondary}
                  />
                  <DetailRow
                    icon="calendar"
                    iconColor="#FF9500"
                    label="获得时间"
                    value={new Date(selectedAsset.createdAt).toLocaleString('zh-CN')}
                    borderColor={selectedAsset.transactionHash ? ui.border : 'transparent'}
                    textColor={ui.text}
                    subTextColor={ui.textSecondary}
                  />
                  {selectedAsset.transactionHash ? (
                    <DetailRow
                      icon="link"
                      iconColor="#5856D6"
                      label="交易哈希"
                      value={formatShortText(selectedAsset.transactionHash, 10, 6)}
                      borderColor="transparent"
                      textColor={ui.text}
                      subTextColor={ui.textSecondary}
                      onPress={() => handleCopy(selectedAsset.transactionHash, '交易哈希')}
                    />
                  ) : null}
                </View>

                {selectedAsset.state === 'ACTIVE' ? (
                  <TouchableOpacity
                    activeOpacity={0.86}
                    disabled={destroyingAssetId === selectedAsset.id}
                    style={[styles.destroyButton, destroyingAssetId === selectedAsset.id && styles.disabledButton]}
                    onPress={() => handleDestroyAsset(selectedAsset)}
                  >
                    <Text style={styles.destroyButtonText}>
                      {destroyingAssetId === selectedAsset.id ? '提交中...' : '销毁资产'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loginContainer: {
    flex: 1,
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 12,
  },
  loginCard: {
    marginTop: 18,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  loginButton: {
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 12,
    paddingBottom: 34,
    flexGrow: 1,
  },
  searchBox: {
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 0,
  },
  filterContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 14,
    paddingBottom: 12,
    gap: 10,
  },
  filterChip: {
    height: 32,
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 58,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  listTitleRow: {
    marginTop: 4,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  listCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  assetRow: {
    gap: 12,
  },
  assetCardWrap: {
    width: CARD_WIDTH,
    marginBottom: 12,
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
    position: 'relative',
  },
  assetImageFrame: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  assetStatusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  assetStatusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  assetTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 6,
  },
  assetSerialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  assetSerialText: {
    fontSize: typography.fontSize.xs,
    fontFamily: 'monospace',
  },
  assetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetPriceLabel: {
    fontSize: 11,
  },
  assetPriceValue: {
    color: '#0A84FF',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    minHeight: 280,
    paddingTop: 150,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    marginTop: 12,
    fontWeight: '600',
  },
  loadingWrapper: {
    minHeight: 280,
    paddingTop: 150,
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  modalDismissArea: {
    flex: 1,
  },
  detailSheet: {
    maxHeight: '82%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: 30,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(142,142,147,0.42)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 21,
    fontWeight: '900',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailHeroCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  detailCoverWrap: {
    width: 92,
    height: 92,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailHeroText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  detailAssetTitle: {
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
    marginBottom: 10,
  },
  detailStatus: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  detailStatusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  detailCard: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  detailRow: {
    minHeight: 58,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  detailValue: {
    flex: 1,
    marginLeft: 12,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
  },
  destroyButton: {
    marginTop: 18,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    opacity: 0.62,
  },
  destroyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
})
