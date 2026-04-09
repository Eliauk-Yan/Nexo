import { artworkApi, authApi, orderApi, tradeApi } from '@/api'
import { ArtworkDetail } from '@/api/artwork'
import { ENABLE_MOCK_IAP, getNftIapProductId } from '@/config/iap'
import { useSession } from '@/utils/ctx'
import {
  Host,
  HStack,
  Image as SwiftImage,
  List,
  RNHostView,
  Section,
  Text,
} from '@expo/ui/swift-ui'
import { foregroundStyle, listStyle } from '@expo/ui/swift-ui/modifiers'
import { Image } from 'expo-image'
import { GlassView } from 'expo-glass-effect'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useIAP } from 'expo-iap'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Platform,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native'
import Spinner from 'react-native-loading-spinner-overlay'

const STATUS_MAP = {
  NOT_FOR_SALE: { text: '不可售', color: '#8E8E93' },
  SELLING: { text: '在售', color: '#007AFF' },
  SOLD_OUT: { text: '已售罄', color: '#FF3B30' },
  COMING_SOON: { text: '即将开售', color: '#FF9500' },
  WAIT_FOR_SALE: { text: '待开售', color: '#5AC8FA' },
} as const

const getStoreProductId = (product: any) => product?.id || product?.productId || ''

const isUserCancelledError = (error: any) => {
  const code = String(error?.code || '').toLowerCase()
  const message = String(error?.message || '').toLowerCase()
  return code.includes('cancel') || message.includes('cancel')
}

const InfoRow = ({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof SwiftImage>['systemName']
  iconColor: string
  label: string
  value: string
}) => {
  return (
    <HStack spacing={12}>
      <HStack spacing={10}>
        <SwiftImage systemName={icon} size={16} color={iconColor} />
        <Text modifiers={[foregroundStyle('#1C1C1E')]}>{label}</Text>
      </HStack>
      <Text modifiers={[foregroundStyle('#8E8E93')]}>{value}</Text>
    </HStack>
  )
}

const HeroImage = ({ cover }: { cover?: string }) => {
  return (
    <View style={styles.heroSection}>
      <View style={styles.heroCard}>
        <Image source={cover} style={styles.heroImage} contentFit="cover" transition={250} />
      </View>
    </View>
  )
}

export default function NftDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const colorScheme = useColorScheme()
  const { session, isLoading: isSessionLoading } = useSession()
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pendingOrderIdRef = useRef('')
  const expectedProductIdRef = useRef('')

  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [artwork, setArtwork] = useState<ArtworkDetail>({
    id: 0,
    name: '',
    cover: '',
    price: 0,
    quantity: 0,
    inventory: 0,
    saleTime: '',
    productState: 'WAIT_FOR_SALE',
    description: '',
  })

  const iapProductId = useMemo(
    () => (artwork.id ? getNftIapProductId(artwork.id) : ''),
    [artwork.id],
  )

  const status = STATUS_MAP[artwork.productState as keyof typeof STATUS_MAP] ?? {
    text: '加载中',
    color: '#C7C7CC',
  }

  const fetchData = useCallback(async () => {
    if (!id) return

    setLoading(true)
    try {
      const res = await artworkApi.getDetail(Number(id))
      const t = await authApi.getToken({ scene: 'artwork', key: id })
      setToken(t)
      setArtwork(res as ArtworkDetail)
    } finally {
      setLoading(false)
    }
  }, [id])

  const getErrorMessage = useCallback((error: unknown) => {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    return ''
  }, [])

  const isOrderSyncingError = useCallback(
    (error: unknown) => {
      const message = getErrorMessage(error)
      return (
        message.includes('订单不存在') ||
        message.includes('not found') ||
        message.includes('订单创建后尚未完成同步')
      )
    },
    [getErrorMessage],
  )

  const sleep = useCallback((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)), [])

  const pollOrderStatus = useCallback(
    (orderId: string) => {
      let attempts = 0
      const maxAttempts = 20

      pollingRef.current = setInterval(async () => {
        attempts += 1
        try {
          const order = await orderApi.getOrder(orderId)
          if (!order) return

          if (order.orderState === 'PAID' || order.orderState === 'FINISH') {
            if (pollingRef.current) {
              clearInterval(pollingRef.current)
              pollingRef.current = null
            }

            await fetchData()
            setPurchasing(false)
            Alert.alert('提示', '购买完成，订单已更新。', [
              {
                text: '查看订单',
                onPress: () => router.push('/order'),
              },
            ])
            return
          }
        } catch (error) {
          if (isOrderSyncingError(error)) {
            return
          }
          console.error('轮询订单状态失败:', error)
        }

        if (attempts >= maxAttempts) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }

          setPurchasing(false)
        }
      }, 2000)
    },
    [fetchData, isOrderSyncingError, router],
  )

  const waitForOrderReady = useCallback(async (orderId: string) => {
    const maxAttempts = 10

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const order = await orderApi.getOrder(orderId)
        if (order?.orderId) {
          return order
        }
      } catch (error) {
        if (isOrderSyncingError(error)) {
          await sleep(500)
          continue
        }
        console.log('等待订单落库中:', orderId, attempt + 1, error)
      }

      await sleep(500)
    }

    throw new Error('订单创建后尚未完成同步，请稍后再试')
  }, [isOrderSyncingError, sleep])

  const payWithRetry = useCallback(
    async (orderId: string) => {
      const maxAttempts = 5

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
          await tradeApi.pay({
            orderId,
            paymentType: 'MOCK',
          })
          return
        } catch (error) {
          if (isOrderSyncingError(error) && attempt < maxAttempts - 1) {
            await sleep(800)
            continue
          }
          throw error
        }
      }
    },
    [isOrderSyncingError, sleep],
  )

  const { connected, products, fetchProducts, requestPurchase, finishTransaction } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      const pendingOrderId = pendingOrderIdRef.current
      const expectedProductId = expectedProductIdRef.current
      const purchasedProductId = getStoreProductId(purchase)

      if (!pendingOrderId || !expectedProductId) return
      if (purchasedProductId && purchasedProductId !== expectedProductId) return

      try {
        await waitForOrderReady(pendingOrderId)
        await payWithRetry(pendingOrderId)

        await finishTransaction({
          purchase,
          isConsumable: true,
        })

        pendingOrderIdRef.current = ''
        expectedProductIdRef.current = ''
        pollOrderStatus(pendingOrderId)
      } catch (error) {
        console.error('处理内购成功回调失败:', error)
        setPurchasing(false)
        if (!isOrderSyncingError(error)) {
          Alert.alert('提示', '购买已完成，但订单同步失败，请稍后到订单页查看。')
        }
      }
    },
    onPurchaseError: (error) => {
      const pendingOrderId = pendingOrderIdRef.current

      pendingOrderIdRef.current = ''
      expectedProductIdRef.current = ''
      setPurchasing(false)

      if (isUserCancelledError(error)) {
        if (pendingOrderId) {
          Alert.alert('提示', '已取消购买，这笔订单仍会保留在订单页中。')
        }
        return
      }

      console.error('内购失败:', error)
      Alert.alert('提示', error?.message || '拉起内购失败，请稍后重试。')
    },
  })

  useEffect(() => {
    if (isSessionLoading) return

    if (!session) {
      router.replace('/(auth)/sign-in')
      return
    }

    void fetchData()
  }, [fetchData, isSessionLoading, router, session])

  useEffect(() => {
    if (!connected || !iapProductId) return

    void fetchProducts({
      skus: [iapProductId],
      type: 'in-app',
    })
  }, [connected, fetchProducts, iapProductId])

  useEffect(() => {
    const fetchedProductIds = (products as any[]).map((product) => getStoreProductId(product))
    console.log('IAP products on nft page:', fetchedProductIds)
  }, [products])

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [])

  const availableProductIds = useMemo(
    () => new Set((products as any[]).map((product) => getStoreProductId(product))),
    [products],
  )

  const doBuy = useCallback(async () => {
    const simulatePurchase = async () => {
      setLoading(true)
      try {
        const orderId = await tradeApi.buy(
          {
            productId: String(artwork.id),
            nftType: 'NFT',
            itemCount: 1,
          },
          token,
        )
        pendingOrderIdRef.current = orderId
        expectedProductIdRef.current = iapProductId
        setPurchasing(true)
        await waitForOrderReady(orderId)
        await payWithRetry(orderId)
        pollOrderStatus(orderId)
      } catch (error) {
        pendingOrderIdRef.current = ''
        expectedProductIdRef.current = ''
        setPurchasing(false)
        console.error('模拟购买失败:', error)
        if (!isOrderSyncingError(error)) {
          Alert.alert('提示', error instanceof Error ? error.message : '模拟购买失败，请稍后重试。')
        }
      } finally {
        setLoading(false)
      }
    }

    if (!connected) {
      if (ENABLE_MOCK_IAP) {
        Alert.alert('模拟购买', '当前将跳过系统内购弹窗，直接模拟购买成功。', [
          { text: '取消', style: 'cancel' },
          {
            text: '继续模拟',
            onPress: () => {
              void simulatePurchase()
            },
          },
        ])
        return
      }
      Alert.alert('提示', '当前购买服务未连接，请确认你安装的是最新的 iOS IAP 测试包。')
      return
    }

    if (!iapProductId || !availableProductIds.has(iapProductId)) {
      const fetchedProductIds = (products as any[]).map((product) => getStoreProductId(product))
      console.log('Missing IAP product on nft page:', {
        expected: iapProductId,
        fetched: fetchedProductIds,
      })
      if (ENABLE_MOCK_IAP) {
        Alert.alert(
          '未找到内购商品',
          `目标商品：${iapProductId}\n已拉取到：${fetchedProductIds.join(', ') || '无'}`,
          [
            { text: '取消', style: 'cancel' },
            {
              text: '模拟购买',
              onPress: () => {
                void simulatePurchase()
              },
            },
          ],
        )
      } else {
        Alert.alert(
          '提示',
          `没有找到对应的内购商品：${iapProductId}\n已拉取到：${fetchedProductIds.join(', ') || '无'}`,
        )
      }
      return
    }

    setLoading(true)
    try {
      const orderId = await tradeApi.buy(
        {
          productId: String(artwork.id),
          nftType: 'NFT',
          itemCount: 1,
        },
        token,
      )

      pendingOrderIdRef.current = orderId
      expectedProductIdRef.current = iapProductId
      setPurchasing(true)

      await requestPurchase({
        request: {
          apple: {
            sku: iapProductId,
            quantity: 1,
          },
          google: {
            skus: [iapProductId],
          },
        },
        type: 'in-app',
      })
    } catch (error) {
      pendingOrderIdRef.current = ''
      expectedProductIdRef.current = ''
      setPurchasing(false)
      console.error('下单失败:', error)
      Alert.alert('提示', error instanceof Error ? error.message : '下单失败，请稍后重试。')
    } finally {
      setLoading(false)
    }
  }, [artwork.id, availableProductIds, connected, iapProductId, isOrderSyncingError, payWithRetry, pollOrderStatus, products, requestPurchase, token, waitForOrderReady])

  if (Platform.OS !== 'ios' || isSessionLoading || !session) {
    return (
      <View style={styles.center}>
        <Spinner visible />
      </View>
    )
  }

  const isBuyDisabled = artwork.productState !== 'SELLING' || loading || purchasing

  return (
    <View style={styles.page}>
      <Stack.Screen
        options={{
          title: '藏品详情',
          headerTransparent: true,
        }}
      />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.left" onPress={() => router.back()} />
      </Stack.Toolbar>

      <Spinner visible={loading || purchasing} />

      <Host style={styles.host}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section>
            <RNHostView matchContents>
              <HeroImage cover={artwork.cover} />
            </RNHostView>
          </Section>

          <Section title="商品简介">
            <InfoRow icon="tag.fill" iconColor="#5E5CE6" label="名称" value={artwork.name || '未命名藏品'} />
            <InfoRow icon="circle.fill" iconColor={status.color} label="状态" value={status.text} />
            <InfoRow
              icon="text.alignleft"
              iconColor="#0EA5E9"
              label="简介"
              value={artwork.description?.trim() || '暂无详情描述'}
            />
          </Section>

          <Section title="发售信息">
            <InfoRow
              icon="yensign.circle.fill"
              iconColor="#22C55E"
              label="当前价格"
              value={`￥${(artwork.price ?? 0).toFixed(2)}`}
            />
            <InfoRow
              icon="square.stack.3d.up.fill"
              iconColor="#3B82F6"
              label="发行数量"
              value={`${artwork.quantity ?? 0}`}
            />
            <InfoRow
              icon="shippingbox.fill"
              iconColor="#F59E0B"
              label="剩余库存"
              value={`${artwork.inventory ?? 0}`}
            />
            <InfoRow
              icon="calendar.badge.clock"
              iconColor="#EC4899"
              label="发售时间"
              value={
                artwork.saleTime
                  ? new Date(artwork.saleTime).toLocaleString('zh-CN', { hour12: false })
                  : '-'
              }
            />
          </Section>

          <Section title="购买须知">
            <Text modifiers={[foregroundStyle('#8E8E93')]}>
              虚拟藏品属于数字商品，购买成功后将发放至当前账号，请在下单前确认商品信息。
            </Text>
            <Text modifiers={[foregroundStyle('#8E8E93')]}>
              数字商品一经购买通常不支持退款、退换或转让，请根据自身需求谨慎购买。
            </Text>
            <Text modifiers={[foregroundStyle('#8E8E93')]}>
              如因网络波动导致到账延迟，请稍后前往订单页查看处理结果。
            </Text>
          </Section>
        </List>
      </Host>

      <View style={styles.floatingButtonBar}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => void doBuy()} disabled={isBuyDisabled}>
          <GlassView
            style={[styles.glassButton, isBuyDisabled && styles.glassButtonDisabled]}
            glassEffectStyle="regular"
            tintColor={artwork.productState === 'SELLING' ? '#007AFF' : 'rgba(142,142,147,0.18)'}
          >
            <RNText
              style={[
                styles.glassButtonText,
                { color: colorScheme === 'dark' ? '#F2F2F2' : '#000000' },
              ]}
            >
              {artwork.productState === 'SELLING'
                ? purchasing
                  ? '购买处理中...'
                  : `立即购买 ￥${(artwork.price ?? 0).toFixed(2)}`
                : status.text}
            </RNText>
          </GlassView>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  host: {
    flex: 1,
  },
  heroSection: {
    width: '100%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  heroCard: {
    width: 280,
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  floatingButtonBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 24,
  },
  glassButton: {
    minHeight: 56,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  glassButtonDisabled: {
    opacity: 0.7,
  },
  glassButtonText: {
    color: '#111111',
    fontSize: 17,
    fontWeight: '700',
  },
})
