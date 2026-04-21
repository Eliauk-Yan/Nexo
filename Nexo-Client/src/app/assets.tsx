import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Feather from '@expo/vector-icons/Feather'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Stack, useFocusEffect, useRouter } from 'expo-router'
import {
  ActivityIndicator,
  Alert,
  Image as RNImage,
  Pressable,
  StyleSheet,
  Text as RNText,
  useColorScheme,
  View,
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import * as Haptics from 'expo-haptics'

import {
  BottomSheet,
  Button,
  Group,
  HStack,
  Host,
  Image,
  List,
  RNHostView,
  ScrollView,
  Section,
  Spacer,
  Text,
  VStack,
} from '@expo/ui/swift-ui'

import {
  buttonStyle,
  controlSize,
  font,
  frame,
  foregroundStyle,
  listRowBackground,
  listStyle,
  padding,
  presentationDetents,
  presentationDragIndicator,
  tint,
} from '@expo/ui/swift-ui/modifiers'

import { nftApi, Asset } from '@/api/nft'
import { borderRadius, colors, spacing, typography } from '@/config/theme'
import { useSession } from '@/utils/ctx'

function chunk<T>(arr: T[], size: number) {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

function EmptyAssets({ message = '暂无相关藏品' }: { message?: string }) {
  return (
    <View style={styles.emptyContainer}>
      <Feather name="inbox" size={48} color="#8E8E93" />
      <RNText style={styles.emptyText}>{message}</RNText>
    </View>
  )
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

function AssetCard({ asset }: { asset: Asset }) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const cardBg = isDark ? colors.backgroundCard : '#FFFFFF'
  const cardBorder = isDark ? colors.border : 'rgba(15, 23, 42, 0.08)'
  const frameBg = isDark ? colors.backgroundSecondary : '#F3F4F6'
  const titleColor = isDark ? colors.text : '#111827'
  const secondaryText = isDark ? colors.textSecondary : '#6B7280'
  const stateStyle = getAssetStateStyle(asset.state, isDark)
  const priceColor = '#0A84FF'
  const shadowOpacity = isDark ? 0.12 : 0.06

  return (
    <View style={styles.assetCardOuter}>
      <View
        style={[
          styles.assetCardContainer,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
            shadowOpacity,
          },
        ]}
      >
        <View style={styles.assetImageContainer}>
          <View style={[styles.assetImageFrame, { backgroundColor: frameBg }]}>
            <RNImage source={{ uri: asset.artworkCover }} style={styles.assetImage} />
          </View>

          <View
            style={[
              styles.assetStatusBadge,
              {
                backgroundColor: stateStyle.background,
                borderColor: stateStyle.border,
              },
            ]}
          >
            <RNText style={[styles.assetStatusText, { color: stateStyle.text }]}>
              {getAssetStateLabel(asset.state)}
            </RNText>
          </View>
        </View>

        <View style={styles.assetInfoContainer}>
          <RNText style={[styles.assetTitle, { color: titleColor }]} numberOfLines={1}>
            {asset.artworkName}
          </RNText>

          <View style={styles.assetSerialContainer}>
            <MaterialCommunityIcons name="barcode-scan" size={12} color={secondaryText} />
            <RNText style={[styles.assetSerialText, { color: secondaryText }]} numberOfLines={1}>
              #{asset.serialNumber ? `${asset.serialNumber.substring(0, 8)}...` : '-'}
            </RNText>
          </View>

          <View style={styles.assetFooter}>
            <View style={styles.assetPriceContainer}>
              <RNText style={[styles.assetPriceLabel, { color: secondaryText }]}>买入价</RNText>
              <RNText style={[styles.assetPriceValue, { color: priceColor }]}>
                ¥{asset.purchasePrice}
              </RNText>
            </View>
          </View>
        </View>
      </View>
    </View>
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
  const [isAssetSheetPresented, setIsAssetSheetPresented] = useState(false)

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
      console.error('Clipboard error:', error)
      Alert.alert('复制失败', '无法自动复制，请长按文本进行手动选择复制。')
    }
  }

  const fetchMyAssets = useCallback(async () => {
    if (!isLogin) {
      setAssets([])
      return
    }

    try {
      setLoading(true)
      const response = await nftApi.getMyAssets(1, 20)
      const items = (response as any).records || response || []
      setAssets(Array.isArray(items) ? items : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [isLogin])

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
                // Haptics might not be available
              }
              Alert.alert('提示', '销毁请求已提交')
              setIsAssetSheetPresented(false)
              setSelectedAsset(null)
              await fetchMyAssets()
            } catch (error) {
              console.error('Destroy asset error:', error)
            } finally {
              setDestroyingAssetId(null)
            }
          },
        },
      ])
    },
    [fetchMyAssets],
  )

  useFocusEffect(
    useCallback(() => {
      fetchMyAssets().catch(() => {})
    }, [fetchMyAssets]),
  )

  useEffect(() => {
    fetchMyAssets().catch(() => {})
  }, [fetchMyAssets])

  const assetRows = useMemo(() => chunk(assets, 2), [assets])
  const selectedStateStyle = getAssetStateStyle(selectedAsset?.state, isDark)

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: '我的数字资产',
          headerTransparent: true,
        }}
      />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.left" onPress={() => router.back()} />
      </Stack.Toolbar>

      <Host style={styles.host}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section modifiers={[listRowBackground('clear')]}>
            <VStack alignment="leading" spacing={8}>
              <Text modifiers={[font({ size: 32, weight: 'bold' }), foregroundStyle('primary')]}>
                我的数字资产
              </Text>
              <Text modifiers={[font({ size: 15 }), foregroundStyle('secondary')]}>
                查看已购藏品、资产标识与链上交易信息
              </Text>
            </VStack>
          </Section>

          {!isLogin ? (
            <>
              <Section title="资产列表">
                <RNHostView matchContents>
                  <EmptyAssets message="登录后查看我的数字资产" />
                </RNHostView>
              </Section>
              <Section modifiers={[listRowBackground('clear')]}>
                <HStack>
                  <Spacer />
                  <Button
                    label="去登录"
                    onPress={() => router.push('/(auth)/sign-in')}
                    modifiers={[buttonStyle('glassProminent'), controlSize('extraLarge')]}
                  />
                  <Spacer />
                </HStack>
              </Section>
            </>
          ) : (
            <Section title="资产列表">
              {assets.length > 0 ? (
                <ScrollView>
                  <VStack spacing={12} modifiers={[padding({ vertical: 8 })]}>
                    {assetRows.map((row, rowIndex) => (
                      <HStack key={rowIndex} spacing={12}>
                        {row.map((item) => (
                          <RNHostView key={String(item.id)} matchContents>
                            <View style={styles.assetCardWrap}>
                              <Pressable
                                onPress={() => {
                                  setSelectedAsset(item)
                                  setIsAssetSheetPresented(true)
                                }}
                              >
                                <AssetCard asset={item} />
                              </Pressable>
                            </View>
                          </RNHostView>
                        ))}
                        {row.length === 1 ? <View style={styles.assetCardWrap} /> : null}
                      </HStack>
                    ))}
                  </VStack>
                </ScrollView>
              ) : loading ? (
                <View style={styles.loadingWrapper}>
                  <ActivityIndicator size="small" color="#0A84FF" />
                  <RNText style={styles.loadingText}>加载中...</RNText>
                </View>
              ) : (
                <RNHostView matchContents>
                  <EmptyAssets />
                </RNHostView>
              )}
            </Section>
          )}
        </List>

        <BottomSheet
          isPresented={isAssetSheetPresented}
          onIsPresentedChange={setIsAssetSheetPresented}
        >
          <Group
            modifiers={[
              presentationDetents([{ height: 500 }]),
              presentationDragIndicator('visible'),
            ]}
          >
            {selectedAsset && (
              <VStack spacing={0}>
                <List modifiers={[listStyle('insetGrouped')]}>
                  <Section title="基础信息">
                    <HStack spacing={12}>
                      <Image systemName="tag" size={16} color="#0A84FF" />
                      <Text modifiers={[foregroundStyle('primary')]}>藏品名称</Text>
                      <Spacer />
                      <Text modifiers={[foregroundStyle('secondary')]}>
                        {selectedAsset.artworkName}
                      </Text>
                    </HStack>

                    <HStack spacing={12}>
                      <Image systemName="info.circle" size={16} color={selectedStateStyle.text} />
                      <Text modifiers={[foregroundStyle('primary')]}>持有状态</Text>
                      <Spacer />
                      <RNHostView matchContents>
                        <View
                          style={[
                            styles.assetStatePill,
                            {
                              backgroundColor: selectedStateStyle.background,
                              borderColor: selectedStateStyle.border,
                            },
                          ]}
                        >
                          <RNText style={[styles.assetStatePillText, { color: selectedStateStyle.text }]}>
                            {getAssetStateLabel(selectedAsset.state)}
                          </RNText>
                        </View>
                      </RNHostView>
                    </HStack>
                  </Section>

                  <Section title="详细参数">
                    <HStack spacing={12}>
                      <Image systemName="barcode.viewfinder" size={16} color="#0A84FF" />
                      <Text modifiers={[foregroundStyle('primary')]}>标识符</Text>
                      <Spacer />
                      <Button
                        label={`${selectedAsset.serialNumber.substring(0, 8)}...${selectedAsset.serialNumber.slice(-6)}`}
                        onPress={() => handleCopy(selectedAsset.serialNumber, '资产唯一标识')}
                        modifiers={[buttonStyle('plain'), tint('#8E8E93'), font({ size: 13 })]}
                      />
                    </HStack>

                    <HStack spacing={12}>
                      <Image systemName="yensign.circle" size={16} color="#22C55E" />
                      <Text modifiers={[foregroundStyle('primary')]}>买入价</Text>
                      <Spacer />
                      <Text modifiers={[foregroundStyle('secondary')]}>
                        ¥{selectedAsset.purchasePrice}
                      </Text>
                    </HStack>

                    {selectedAsset.transactionHash && (
                      <HStack spacing={12}>
                        <Image systemName="link" size={16} color="#5856D6" />
                        <Text modifiers={[foregroundStyle('primary')]}>交易哈希</Text>
                        <Spacer />
                        <Button
                          label={`${selectedAsset.transactionHash.substring(0, 10)}...${selectedAsset.transactionHash.slice(-6)}`}
                          onPress={() => handleCopy(selectedAsset.transactionHash, '交易哈希')}
                          modifiers={[buttonStyle('plain'), tint('#8E8E93'), font({ size: 13 })]}
                        />
                      </HStack>
                    )}

                    <HStack spacing={12}>
                      <Image systemName="calendar" size={16} color="#FF9500" />
                      <Text modifiers={[foregroundStyle('primary')]}>获得时间</Text>
                      <Spacer />
                      <Text modifiers={[foregroundStyle('secondary')]}>
                        {new Date(selectedAsset.createdAt).toLocaleString('zh-CN')}
                      </Text>
                    </HStack>
                  </Section>

                  {selectedAsset.state === 'ACTIVE' && (
                    <Section modifiers={[listRowBackground('clear')]}>
                      <Button
                        label={destroyingAssetId === selectedAsset.id ? '提交中...' : '销毁资产'}
                        onPress={() => handleDestroyAsset(selectedAsset)}
                        modifiers={[
                          buttonStyle('glassProminent'),
                          tint('#FF3B30'),
                          controlSize('extraLarge'),
                          frame({ maxWidth: 9999 }),
                        ]}
                      />
                    </Section>
                  )}
                </List>
              </VStack>
            )}
          </Group>
        </BottomSheet>
      </Host>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  host: {
    flex: 1,
  },
  assetCardWrap: {
    width: 160,
  },
  assetCardOuter: {
    backgroundColor: 'transparent',
    width: '100%',
    padding: spacing.xs,
  },
  assetCardContainer: {
    borderRadius: 28,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
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
    borderWidth: 0,
  },
  assetImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  assetStatusBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  assetStatusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  assetStatePill: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  assetStatePillText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  assetInfoContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  assetTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  assetSerialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  assetSerialText: {
    fontSize: typography.fontSize.xs,
    fontFamily: 'monospace',
  },
  assetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  assetPriceContainer: {
    flexDirection: 'column',
  },
  assetPriceLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  assetPriceValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    marginTop: 12,
    color: '#8E8E93',
  },
  loadingWrapper: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#8E8E93',
  },
})
