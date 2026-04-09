import { orderApi, OrderState, OrderVO } from '@/api/order'
import { tradeApi } from '@/api/trade'
import { ENABLE_MOCK_IAP, getNftIapProductId, getNftIapProductIds } from '@/config/iap'
import { colors, spacing, typography } from '@/config/theme'
import { useSession } from '@/utils/ctx'
import Feather from '@expo/vector-icons/Feather'
import { Button, Host, HStack, Picker, Spacer, Text as SwiftUIText } from '@expo/ui/swift-ui'
import { buttonStyle, controlSize, pickerStyle, tag, tint } from '@expo/ui/swift-ui/modifiers'
import { Stack, useRouter } from 'expo-router'
import { useIAP } from 'expo-iap'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  DynamicColorIOS,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const TABS: { id: string; label: string; state?: OrderState }[] = [
  { id: 'all', label: '全部' },
  { id: 'pending', label: '待付款', state: 'CONFIRM' },
  { id: 'paid', label: '已付款', state: 'PAID' },
  { id: 'finished', label: '已完成', state: 'FINISH' },
  { id: 'closed', label: '已关闭', state: 'CLOSED' },
]

const ORDER_STATE_MAP: Record<string, { label: string; color: string; bgColor: string }> = {
  CREATE: { label: '待付款', color: '#FFB800', bgColor: 'rgba(255,184,0,0.14)' },
  CONFIRM: { label: '待付款', color: '#FFB800', bgColor: 'rgba(255,184,0,0.14)' },
  PAID: { label: '已付款', color: colors.success, bgColor: 'rgba(52,199,89,0.14)' },
  FINISH: { label: '已完成', color: colors.success, bgColor: 'rgba(52,199,89,0.14)' },
  CLOSED: { label: '已关闭', color: 'rgba(142,142,147,0.95)', bgColor: 'rgba(142,142,147,0.12)' },
}

const ui = {
  background: DynamicColorIOS({
    light: '#F2F2F7',
    dark: '#000000',
  }),
  card: DynamicColorIOS({
    light: '#FFFFFF',
    dark: 'rgba(255,255,255,0.06)',
  }),
  border: DynamicColorIOS({
    light: 'rgba(60,60,67,0.10)',
    dark: 'rgba(255,255,255,0.08)',
  }),
  textPrimary: DynamicColorIOS({
    light: '#000000',
    dark: '#FFFFFF',
  }),
  textSecondary: DynamicColorIOS({
    light: 'rgba(60,60,67,0.72)',
    dark: 'rgba(235,235,245,0.60)',
  }),
  textTertiary: DynamicColorIOS({
    light: 'rgba(60,60,67,0.50)',
    dark: 'rgba(235,235,245,0.40)',
  }),
  imageBg: DynamicColorIOS({
    light: 'rgba(60,60,67,0.05)',
    dark: 'rgba(255,255,255,0.08)',
  }),
  blue: DynamicColorIOS({
    light: '#007AFF',
    dark: '#0A84FF',
  }),
}

const formatPrice = (price?: number | null) => (price ?? 0).toFixed(2)

const getStoreProductId = (product: any) => product?.id || product?.productId || ''

const isUserCancelledError = (error: any) => {
  const code = String(error?.code || '').toLowerCase()
  const message = String(error?.message || '').toLowerCase()
  return code.includes('cancel') || message.includes('cancel')
}

const OrderPage = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { session, isLoading: isSessionLoading } = useSession()
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pendingOrderRef = useRef<OrderVO | null>(null)
  const expectedProductIdRef = useRef('')

  const [activeTab, setActiveTab] = useState('all')
  const [orders, setOrders] = useState<OrderVO[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [purchasingOrderId, setPurchasingOrderId] = useState('')

  const fetchOrders = useCallback(
    async (tabId = activeTab, silent = false) => {
      try {
        if (!silent) setLoading(true)

        const state = TABS.find((tab) => tab.id === tabId)?.state
        const res = await orderApi.list({
          current: 1,
          size: 100,
          ...(state ? { state } : {}),
        })

        setOrders(Array.isArray(res) ? res : [])
      } catch (error) {
        console.error('获取订单列表失败:', error)
        setOrders([])
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [activeTab],
  )

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

            await fetchOrders(activeTab, true)
            Alert.alert('提示', '内购完成，订单状态已更新。')
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
        }
      }, 2000)
    },
    [activeTab, fetchOrders, isOrderSyncingError],
  )

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
      const pendingOrder = pendingOrderRef.current
      const expectedProductId = expectedProductIdRef.current
      const purchasedProductId = getStoreProductId(purchase)

      if (!pendingOrder || !expectedProductId) return
      if (purchasedProductId && purchasedProductId !== expectedProductId) return

      try {
        await payWithRetry(pendingOrder.orderId)

        await finishTransaction({
          purchase,
          isConsumable: true,
        })

        setPurchasingOrderId('')
        pendingOrderRef.current = null
        expectedProductIdRef.current = ''
        pollOrderStatus(pendingOrder.orderId)
      } catch (error) {
        console.error('处理内购成功回调失败:', error)
        setPurchasingOrderId('')
        if (!isOrderSyncingError(error)) {
          Alert.alert('提示', '内购已完成，但订单同步失败，请稍后到订单页查看。')
        }
      }
    },
    onPurchaseError: (error) => {
      const pendingOrder = pendingOrderRef.current

      pendingOrderRef.current = null
      expectedProductIdRef.current = ''
      setPurchasingOrderId('')

      if (isUserCancelledError(error)) {
        if (pendingOrder) {
          Alert.alert('提示', '已取消购买，这笔订单仍会保留在待付款列表中。')
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

    void fetchOrders(activeTab)
  }, [activeTab, fetchOrders, isSessionLoading, router, session])

  useEffect(() => {
    if (!connected) return

    const skuList = getNftIapProductIds(
      orders
        .filter((order) => order.orderState === 'CREATE' || order.orderState === 'CONFIRM')
        .map((order) => order.productId),
    )

    if (skuList.length === 0) return

    void fetchProducts({
      skus: skuList,
      type: 'in-app',
    })
  }, [connected, fetchProducts, orders])

  useEffect(() => {
    const fetchedProductIds = (products as any[]).map((product) => getStoreProductId(product))
    console.log('IAP products on order page:', fetchedProductIds)
  }, [products])

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [])

  const availableProductIds = useMemo(
    () => new Set((products as any[]).map((product) => getStoreProductId(product))),
    [products],
  )

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await fetchOrders(activeTab, true)
    } finally {
      setRefreshing(false)
    }
  }, [activeTab, fetchOrders])

  const handleCancelOrder = (order: OrderVO) => {
    Alert.alert('取消订单', '确定要取消这笔订单吗？', [
      { text: '暂不取消', style: 'cancel' },
      {
        text: '取消订单',
        style: 'destructive',
        onPress: async () => {
          try {
            await tradeApi.cancel({ orderId: order.orderId })
            Alert.alert('提示', '订单已取消。')
            await fetchOrders(activeTab)
          } catch (error) {
            console.error('取消订单失败:', error)
            Alert.alert('提示', '取消订单失败，请稍后重试。')
          }
        },
      },
    ])
  }

  const handlePayOrder = async (order: OrderVO) => {
    const productId = getNftIapProductId(order.productId)

    const simulatePurchase = () => {
      Alert.alert('模拟购买', '当前将跳过系统内购弹窗，直接模拟购买成功。', [
        { text: '取消', style: 'cancel' },
        {
          text: '继续模拟',
          onPress: async () => {
            try {
              setPurchasingOrderId(order.orderId)
              await payWithRetry(order.orderId)
              pollOrderStatus(order.orderId)
            } catch (error) {
              console.error('模拟购买失败:', error)
              setPurchasingOrderId('')
              if (!isOrderSyncingError(error)) {
                Alert.alert('提示', '模拟购买失败，请稍后重试。')
              }
            }
          },
        },
      ])
    }

    if (!connected) {
      if (ENABLE_MOCK_IAP) {
        simulatePurchase()
        return
      }
      Alert.alert('提示', '当前内购服务未连接，请确认你安装的是最新的 iOS IAP 测试包。')
      return
    }

    if (!availableProductIds.has(productId)) {
      const fetchedProductIds = (products as any[]).map((product) => getStoreProductId(product))
      console.log('Missing IAP product on order page:', {
        expected: productId,
        fetched: fetchedProductIds,
      })
      if (ENABLE_MOCK_IAP) {
        Alert.alert(
          '未找到内购商品',
          `目标商品：${productId}\n已拉取到：${fetchedProductIds.join(', ') || '无'}`,
          [
            { text: '取消', style: 'cancel' },
            {
              text: '模拟购买',
              onPress: simulatePurchase,
            },
          ],
        )
      } else {
        Alert.alert(
          '提示',
          `没有找到对应的内购商品：${productId}\n已拉取到：${fetchedProductIds.join(', ') || '无'}`,
        )
      }
      return
    }

    try {
      pendingOrderRef.current = order
      expectedProductIdRef.current = productId
      setPurchasingOrderId(order.orderId)

      await requestPurchase({
        request: {
          apple: {
            sku: productId,
            quantity: 1,
          },
          google: {
            skus: [productId],
          },
        },
        type: 'in-app',
      })
    } catch (error) {
      pendingOrderRef.current = null
      expectedProductIdRef.current = ''
      setPurchasingOrderId('')
      console.error('发起内购失败:', error)
      Alert.alert('提示', error instanceof Error ? error.message : '发起内购失败，请稍后重试。')
    }
  }

  const renderEmpty = () => {
    if (loading) return null

    return (
      <View style={styles.emptyContainer}>
        <Feather name="inbox" size={48} color={ui.textSecondary} />
        <Text style={[styles.emptyText, { color: ui.textSecondary }]}>暂无相关订单</Text>
      </View>
    )
  }

  const renderOrderCard = ({ item }: { item: OrderVO }) => {
    const stateInfo = ORDER_STATE_MAP[item.orderState] || {
      label: item.orderState,
      color: ui.textSecondary as unknown as string,
      bgColor: 'rgba(142,142,147,0.10)',
    }
    const canPay = item.orderState === 'CREATE' || item.orderState === 'CONFIRM'
    const canCancel = item.orderState === 'CONFIRM'
    const isPurchasing = purchasingOrderId === item.orderId

    return (
      <View style={[styles.card, { backgroundColor: ui.card, borderColor: ui.border }]}>
        <View style={styles.rowBetween}>
          <Text numberOfLines={1} style={[styles.orderIdText, { color: ui.textSecondary }]}>
            订单号：{item.orderId}
          </Text>

          <View style={[styles.stateBadge, { backgroundColor: stateInfo.bgColor }]}>
            <Text style={[styles.stateText, { color: stateInfo.color }]}>{stateInfo.label}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: ui.border }]} />

        <View style={styles.productRow}>
          {item.productCoverUrl ? (
            <Image
              source={{ uri: item.productCoverUrl }}
              style={[styles.productImage, { backgroundColor: ui.imageBg }]}
            />
          ) : (
            <View
              style={[
                styles.productImage,
                styles.placeholderBox,
                { backgroundColor: ui.imageBg, borderColor: ui.border },
              ]}
            >
              <Text style={[styles.placeholderText, { color: ui.textTertiary }]}>藏品</Text>
            </View>
          )}

          <View style={styles.productInfo}>
            <Text numberOfLines={2} style={[styles.productName, { color: ui.textPrimary }]}>
              {item.productName || '未知商品'}
            </Text>

            <Text style={[styles.productMeta, { color: ui.textSecondary }]}>数量：{item.quantity}</Text>

            <Text style={[styles.productPrice, { color: ui.textPrimary }]}>
              单价：￥{formatPrice(item.unitPrice)}
            </Text>

            {canPay && (
              <Text style={[styles.iapText, { color: ui.textTertiary }]}>
                IAP 商品：{getNftIapProductId(item.productId)}
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: ui.border }]} />

        <View style={styles.rowBetweenEnd}>
          <Text style={[styles.timeText, { color: ui.textTertiary }]}>
            {item.confirmTime != null
              ? new Date(item.confirmTime).toLocaleString('zh-CN', { hour12: false })
              : ''}
          </Text>

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: ui.textSecondary }]}>合计</Text>
            <Text style={[styles.totalPrice, { color: ui.blue }]}>￥{formatPrice(item.totalPrice)}</Text>
          </View>
        </View>

        {(canPay || canCancel) && (
          <View style={styles.actionWrapper}>
            <Host matchContents>
              <HStack spacing={12}>
                {canCancel ? (
                  <Button
                    label="取消订单"
                    modifiers={[buttonStyle('glassProminent'), controlSize('large'), tint('#FF3B30')]}
                    onPress={() => handleCancelOrder(item)}
                  />
                ) : null}
                <Spacer />
                {canPay ? (
                  <Button
                    label={isPurchasing ? '处理中...' : '去付款'}
                    modifiers={[buttonStyle('glassProminent'), controlSize('large')]}
                    onPress={() => {
                      void handlePayOrder(item)
                    }}
                  />
                ) : null}
              </HStack>
            </Host>
          </View>
        )}
      </View>
    )
  }

  if (isSessionLoading || !session) {
    return <View style={[styles.loadingContainer, { backgroundColor: ui.background }]} />
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '我的订单',
          headerTransparent: true,
        }}
      />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.left" onPress={() => router.back()} />
      </Stack.Toolbar>

      <FlatList
        data={orders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.orderId}
        style={[styles.rootContainer, { backgroundColor: ui.background }]}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: insets.bottom + 32,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.pickerWrapper}>
            <Host matchContents>
              <Picker
                label="订单状态"
                selection={activeTab}
                onSelectionChange={(selection) => setActiveTab(selection as string)}
                modifiers={[pickerStyle('segmented')]}
              >
                {TABS.map((tab) => (
                  <SwiftUIText key={tab.id} modifiers={[tag(tab.id)]}>
                    {tab.label}
                  </SwiftUIText>
                ))}
              </Picker>
            </Host>
          </View>
        }
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={() => {
              void handleRefresh()
            }}
          />
        }
      />
    </>
  )
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  pickerWrapper: {
    marginTop: 16,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowBetweenEnd: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  orderIdText: {
    flex: 1,
    fontSize: 13,
    marginRight: 12,
  },
  stateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  stateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productImage: {
    width: 88,
    height: 88,
    borderRadius: 16,
  },
  placeholderBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  productInfo: {
    flex: 1,
    marginLeft: 14,
    minHeight: 88,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 8,
  },
  productMeta: {
    fontSize: 14,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '500',
  },
  iapText: {
    fontSize: 12,
    marginTop: 6,
  },
  timeText: {
    fontSize: 13,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: 13,
    marginRight: 6,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
  },
  actionWrapper: {
    marginTop: 16,
  },
  placeholderText: {
    fontSize: typography.fontSize.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    marginTop: 12,
  },
})

export default OrderPage
