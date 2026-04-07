import { colors, spacing, typography } from '@/config/theme'
import { orderApi, OrderVO, OrderState } from '@/api/order'
import { tradeApi, PaymentType } from '@/api/trade'
import { useSession } from '@/utils/ctx'
import Feather from '@expo/vector-icons/Feather'
import { Stack, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import {
  BottomSheet,
  Button,
  Group,
  Host,
  HStack,
  Label,
  List,
  Picker,
  ProgressView,
  Section,
  Spacer,
  Text as SwiftUIText,
  VStack,
} from '@expo/ui/swift-ui'
import {
  buttonStyle,
  controlSize,
  disabled,
  font,
  foregroundStyle,
  frame,
  listStyle,
  multilineTextAlignment,
  padding,
  pickerStyle,
  presentationDetents,
  presentationDragIndicator,
  tag,
  tint,
} from '@expo/ui/swift-ui/modifiers'

const PAYMENT_METHOD_MAP: Record<string, PaymentType> = {
  wechat: 'WECHAT',
}

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

type PayState = 'idle' | 'loading' | 'success'

const OrderPage = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { session, isLoading: isSessionLoading } = useSession()
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [activeTab, setActiveTab] = useState('all')
  const [orders, setOrders] = useState<OrderVO[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [payModalVisible, setPayModalVisible] = useState(false)
  const [selectedPayMethod, setSelectedPayMethod] = useState('wechat')
  const [payingOrder, setPayingOrder] = useState<OrderVO | null>(null)
  const [payState, setPayState] = useState<PayState>('idle')
  const [payStatusText, setPayStatusText] = useState('支付请求处理中...')

  const fetchOrders = useCallback(
    async (tabId = activeTab, silent = false) => {
      try {
        !silent && setLoading(true)

        const state = TABS.find((t) => t.id === tabId)?.state
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
        !silent && setLoading(false)
      }
    },
    [activeTab],
  )

  useEffect(() => {
    if (isSessionLoading) return

    if (!session) {
      router.replace('/(auth)/sign-in')
      return
    }

    fetchOrders(activeTab).catch(console.error)
  }, [activeTab, fetchOrders, isSessionLoading, router, session])

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await fetchOrders(activeTab, true)
    } finally {
      setRefreshing(false)
    }
  }, [activeTab, fetchOrders])

  const getStateInfo = (state: string) =>
    ORDER_STATE_MAP[state] || {
      label: state,
      color: ui.textSecondary as unknown as string,
      bgColor: 'rgba(142,142,147,0.10)',
    }

  const openPayModal = (order: OrderVO) => {
    setPayingOrder(order)
    setSelectedPayMethod('wechat')
    setPayState('idle')
    setPayStatusText('支付请求处理中...')
    setPayModalVisible(true)
  }

  const closePayModal = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }

    setPayModalVisible(false)
    setPayingOrder(null)
    setSelectedPayMethod('wechat')
    setPayState('idle')
    setPayStatusText('支付请求处理中...')
  }

  const pollOrderStatus = (orderId: string) => {
    let attempts = 0
    const maxAttempts = 20

    pollingRef.current = setInterval(async () => {
      attempts += 1

      try {
        const order = await orderApi.getOrder(orderId)
        if (!order) return

        if (order.orderState === 'PAID') {
          setPayStatusText('支付成功，正在铸造资产...')
          return
        }

        if (order.orderState === 'FINISH') {
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }

          setPayState('success')

          setTimeout(() => {
            closePayModal()
            fetchOrders(activeTab).catch(console.error)
          }, 1500)

          return
        }
      } catch (error) {
        console.error('轮询订单状态失败:', error)
      }

      if (attempts >= maxAttempts) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }

        setPayState('idle')
        Alert.alert('提示', '支付已受理，资产可能仍在铸造中，请稍后在订单列表查看最终结果')
      }
    }, 2000)
  }

  const handleConfirmPay = async () => {
    if (!payingOrder || payState === 'loading') return

    const paymentType = PAYMENT_METHOD_MAP[selectedPayMethod]
    if (!paymentType) {
      Alert.alert('提示', '不支持的支付方式')
      return
    }

    try {
      setPayState('loading')
      setPayStatusText('正在发起支付...')

      await tradeApi.pay({
        orderId: payingOrder.orderId,
        paymentType,
      })

      setPayStatusText('支付请求已提交，等待支付确认...')
      pollOrderStatus(payingOrder.orderId)
    } catch (error) {
      console.error('发起支付失败:', error)
      setPayState('idle')
      Alert.alert('提示', '发起支付失败，请稍后重试')
    }
  }

  const handleCancelOrder = (order: OrderVO) => {
    Alert.alert('提示', '确定要取消该订单吗？', [
      { text: '暂时不要', style: 'cancel' },
      {
        text: '取消订单',
        style: 'destructive',
        onPress: async () => {
          try {
            console.log(order.orderId)
            await orderApi.cancel(order.orderId)
            Alert.alert('提示', '订单已取消')
            await fetchOrders(activeTab)
          } catch (error) {
            console.error('取消订单失败:', error)
            Alert.alert('提示', '取消订单失败，请稍后重试')
          }
        },
      },
    ])
  }

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="inbox" size={48} color={ui.textSecondary} />
      <Text style={[styles.emptyText, { color: ui.textSecondary }]}>
        {loading ? '加载中...' : '暂无相关订单'}
      </Text>
    </View>
  )

  const renderOrderCard = ({ item }: { item: OrderVO }) => {
    const stateInfo = getStateInfo(item.orderState)
    const canPay = item.orderState === 'CREATE' || item.orderState === 'CONFIRM'

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
                {
                  backgroundColor: ui.imageBg,
                  borderColor: ui.border,
                },
              ]}
            >
              <Text style={[styles.placeholderText, { color: ui.textTertiary }]}>藏品</Text>
            </View>
          )}

          <View style={styles.productInfo}>
            <Text numberOfLines={2} style={[styles.productName, { color: ui.textPrimary }]}>
              {item.productName || '未知商品'}
            </Text>

            <Text style={[styles.productMeta, { color: ui.textSecondary }]}>
              数量：{item.quantity}
            </Text>

            <Text style={[styles.productPrice, { color: ui.textPrimary }]}>
              单价：¥ {formatPrice(item.unitPrice)}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: ui.border }]} />

        <View style={styles.rowBetweenEnd}>
          <Text style={[styles.timeText, { color: ui.textTertiary }]}>
            {item.confirmTime != null
              ? new Date(item.confirmTime).toLocaleString('zh-CN', {
                  hour12: false,
                })
              : ''}
          </Text>

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: ui.textSecondary }]}>合计</Text>
            <Text style={[styles.totalPrice, { color: ui.blue }]}>
              ¥ {formatPrice(item.totalPrice)}
            </Text>
          </View>
        </View>

        {canPay && (
          <View style={styles.actionWrapper}>
            <Host matchContents>
              <HStack spacing={12}>
                <Button
                  label="取消订单"
                  modifiers={[buttonStyle('glassProminent'), controlSize('large'), tint('#FF3B30')]}
                  onPress={() => handleCancelOrder(item)}
                />
                <Spacer />
                <Button
                  label="去付款"
                  modifiers={[buttonStyle('glassProminent'), controlSize('large')]}
                  onPress={() => openPayModal(item)}
                />
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
            refreshing={refreshing}
            onRefresh={() => {
              handleRefresh().catch(console.error)
            }}
          />
        }
      />

      <Host matchContents>
        <BottomSheet
          isPresented={payModalVisible}
          onIsPresentedChange={(visible) => {
            if (!visible) closePayModal()
            else setPayModalVisible(true)
          }}
        >
          <Group
            modifiers={[
              presentationDragIndicator('visible'),
              presentationDetents(['medium', 'large']),
            ]}
          >
            <VStack spacing={0}>
              <VStack spacing={8} modifiers={[padding({ top: 32, bottom: 16 })]}>
                <SwiftUIText modifiers={[foregroundStyle('secondary'), font({ size: 14 })]}>
                  支付金额
                </SwiftUIText>

                <HStack spacing={4}>
                  <SwiftUIText
                    modifiers={[font({ size: 24, weight: 'bold' }), foregroundStyle('primary')]}
                  >
                    ¥
                  </SwiftUIText>
                  <SwiftUIText
                    modifiers={[font({ size: 36, weight: 'bold' }), foregroundStyle('primary')]}
                  >
                    {formatPrice(payingOrder?.totalPrice)}
                  </SwiftUIText>
                </HStack>

                <SwiftUIText modifiers={[foregroundStyle('secondary'), font({ size: 12 })]}>
                  订单号：{payingOrder?.orderId}
                </SwiftUIText>
              </VStack>

              <List modifiers={[listStyle('insetGrouped')]}>
                <Section title="选择支付方式">
                  <Picker
                    selection={selectedPayMethod}
                    onSelectionChange={(value) => setSelectedPayMethod(value as string)}
                    modifiers={[pickerStyle('inline')]}
                  >
                    <Label
                      title="微信支付（推荐）"
                      systemImage="message.fill"
                      modifiers={[tag('wechat')]}
                    />
                  </Picker>
                </Section>
              </List>

              <VStack modifiers={[padding({ horizontal: 20, bottom: 32, top: 8 })]}>
                {payState === 'loading' ? (
                  <Button
                    modifiers={[
                      buttonStyle('glassProminent'),
                      controlSize('large'),
                      disabled(true),
                    ]}
                  >
                    <HStack spacing={8} modifiers={[frame({ maxWidth: 'infinity' as any })]}>
                      <ProgressView />
                      <SwiftUIText modifiers={[multilineTextAlignment('center')]}>
                        {payStatusText}
                      </SwiftUIText>
                    </HStack>
                  </Button>
                ) : payState === 'success' ? (
                  <Button
                    modifiers={[
                      buttonStyle('glassProminent'),
                      controlSize('large'),
                      disabled(true),
                    ]}
                  >
                    <SwiftUIText
                      modifiers={[
                        frame({ maxWidth: 'infinity' as any }),
                        foregroundStyle('green'),
                        font({ weight: 'bold' }),
                        multilineTextAlignment('center'),
                      ]}
                    >
                      支付成功
                    </SwiftUIText>
                  </Button>
                ) : (
                  <Button
                    onPress={handleConfirmPay}
                    modifiers={[buttonStyle('glassProminent'), controlSize('large')]}
                  >
                    <SwiftUIText
                      modifiers={[
                        frame({ maxWidth: 'infinity' as any }),
                        multilineTextAlignment('center'),
                      ]}
                    >
                      确认支付
                    </SwiftUIText>
                  </Button>
                )}
              </VStack>
            </VStack>
          </Group>
        </BottomSheet>
      </Host>
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
    paddingTop: 200,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    marginTop: 12,
  },
})

export default OrderPage
