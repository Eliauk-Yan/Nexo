import { orderApi, OrderState, OrderVO } from '@/api/order'
import { PaymentType, tradeApi } from '@/api/trade'
import { colors, spacing, typography } from '@/config/theme'
import { ensureWeChatRegistered, getWeChatConfigError, isWeChatConfigured } from '@/utils/wechat'
import { showErrorAlert } from '@/utils/error'
import { useSession } from '@/utils/ctx'
import Feather from '@expo/vector-icons/Feather'
import { useEvent } from 'expo'
import ExpoWeChat from 'expo-wechat'
import { Stack, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native'
import Spinner from 'react-native-loading-spinner-overlay'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const TABS: { id: string; label: string; state?: OrderState }[] = [
  { id: 'all', label: '全部' },
  { id: 'pending', label: '待付款', state: 'CONFIRM' },
  { id: 'paid', label: '已付款', state: 'PAID' },
  { id: 'finished', label: '已完成', state: 'FINISH' },
  { id: 'closed', label: '已关闭', state: 'CLOSED' },
]

const ORDER_STATE_MAP: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  CREATE: { label: '待付款', color: '#FFB800', bgColor: 'rgba(255,184,0,0.14)', borderColor: 'rgba(255,184,0,0.28)' },
  CONFIRM: { label: '待付款', color: '#FFB800', bgColor: 'rgba(255,184,0,0.14)', borderColor: 'rgba(255,184,0,0.28)' },
  PAID: { label: '已付款', color: '#22C55E', bgColor: 'rgba(34,197,94,0.14)', borderColor: 'rgba(34,197,94,0.28)' },
  FINISH: { label: '已完成', color: '#22C55E', bgColor: 'rgba(34,197,94,0.14)', borderColor: 'rgba(34,197,94,0.28)' },
  CLOSED: { label: '已关闭', color: '#8E8E93', bgColor: 'rgba(142,142,147,0.12)', borderColor: 'rgba(142,142,147,0.24)' },
}

const formatPrice = (price?: number | null) => (price ?? 0).toFixed(2)

const OrderPage = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { session, isLoading: isSessionLoading } = useSession()
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [activeTab, setActiveTab] = useState('all')
  const [orders, setOrders] = useState<OrderVO[]>([])
  const [loading, setLoading] = useState(false)
  const [purchasingOrderId, setPurchasingOrderId] = useState('')
  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false)
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType>('MOCK')
  const [selectedOrder, setSelectedOrder] = useState<OrderVO | null>(null)
  const payResult = useEvent(ExpoWeChat, 'onPayResult')
  const wechatConfigured = isWeChatConfigured()

  const ui = {
    background: isDark ? '#000000' : '#F2F2F7',
    card: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(60,60,67,0.10)',
    textPrimary: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? 'rgba(235,235,245,0.60)' : 'rgba(60,60,67,0.72)',
    textTertiary: isDark ? 'rgba(235,235,245,0.40)' : 'rgba(60,60,67,0.50)',
    imageBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(60,60,67,0.05)',
    blue: isDark ? '#0A84FF' : '#007AFF',
    tabBg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(118,118,128,0.12)',
    tabActive: isDark ? 'rgba(255,255,255,0.18)' : '#FFFFFF',
  }

  const paymentMethods = [
    {
      type: 'MOCK' as PaymentType,
      title: '模拟支付',
      iconLabel: '模',
      iconColor: '#F59E0B',
    },
    {
      type: 'WECHAT' as PaymentType,
      title: '微信支付',
      iconLabel: '微',
      iconColor: '#07C160',
    },
  ]

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
        showErrorAlert(error, '获取订单列表失败，请稍后重试。')
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
          const order = await orderApi.getOrder(orderId, { suppressErrorAlert: true })
          if (!order) return

          if (order.orderState === 'PAID' || order.orderState === 'FINISH') {
            if (pollingRef.current) {
              clearInterval(pollingRef.current)
              pollingRef.current = null
            }

            await fetchOrders(activeTab, true)
            setPurchasingOrderId('')
            setSelectedOrder(null)
            Alert.alert('提示', '支付完成，订单状态已更新。')
            return
          }
        } catch (error) {
          if (isOrderSyncingError(error)) {
            return
          }
          showErrorAlert(error, '获取订单状态失败，请稍后重试。')
        }

        if (attempts >= maxAttempts) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }

          setPurchasingOrderId('')
        }
      }, 2000)
    },
    [activeTab, fetchOrders, isOrderSyncingError],
  )

  const payWithRetry = useCallback(
    async (orderId: string, paymentType: PaymentType) => {
      const maxAttempts = 5

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
          if (paymentType === 'MOCK') {
            await tradeApi.pay({
              orderId,
              paymentType,
            })
            return 'MOCK'
          }

          await ensureWeChatRegistered()

          const payResponse = await tradeApi.pay({
            orderId,
            paymentType,
          })

          const wechatPayParams = payResponse.wechatPayParams
          if (
            !wechatPayParams?.partnerId ||
            !wechatPayParams.prepayId ||
            !wechatPayParams.nonceStr ||
            !wechatPayParams.timeStamp ||
            !wechatPayParams.sign ||
            !wechatPayParams.packageValue
          ) {
            throw new Error('微信支付参数尚未就绪，请稍后再试。')
          }

          const isRequestSent = await ExpoWeChat.pay({
            partnerId: wechatPayParams.partnerId,
            prepayId: wechatPayParams.prepayId,
            nonceStr: wechatPayParams.nonceStr,
            timeStamp: wechatPayParams.timeStamp,
            sign: wechatPayParams.sign,
            package: wechatPayParams.packageValue,
            extraData: wechatPayParams.extraData ?? payResponse.payOrderId ?? orderId,
          })

          if (!isRequestSent) {
            throw new Error('微信支付请求发送失败，请确认微信客户端是否可用。')
          }
          return 'WECHAT'
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

  useEffect(() => {
    if (!payResult || !selectedOrder) return

    if (payResult.errorCode === 0) {
      pollOrderStatus(selectedOrder.orderId)
      return
    }

    if (payResult.errorCode === -2) {
      setPurchasingOrderId('')
      Alert.alert('提示', '你已取消微信支付。')
      return
    }

    setPurchasingOrderId('')
    Alert.alert('提示', payResult.errorMessage || '微信支付失败，请稍后重试。')
  }, [payResult, pollOrderStatus, selectedOrder])

  useEffect(() => {
    if (isSessionLoading) return

    if (!session) {
      router.replace('/(auth)/sign-in')
      return
    }

    void fetchOrders(activeTab)
  }, [activeTab, fetchOrders, isSessionLoading, router, session])

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [])

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
            showErrorAlert(error, '取消订单失败，请稍后重试。')
          }
        },
      },
    ])
  }

  const handlePayOrder = (order: OrderVO) => {
    setSelectedOrder(order)
    setPaymentSheetVisible(true)
  }

  const handleConfirmPayment = async () => {
    if (!selectedOrder) return

    if (selectedPaymentType === 'WECHAT' && !wechatConfigured) {
      Alert.alert('提示', getWeChatConfigError() || '微信支付配置未完成。')
      return
    }

    try {
      setPaymentSheetVisible(false)
      setPurchasingOrderId(selectedOrder.orderId)
      const payType = await payWithRetry(selectedOrder.orderId, selectedPaymentType)
      if (payType === 'MOCK') {
        pollOrderStatus(selectedOrder.orderId)
      }
    } catch (error) {
      setPurchasingOrderId('')
      if (!isOrderSyncingError(error)) {
        showErrorAlert(error, '支付失败，请稍后重试。')
      }
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
      color: '#8E8E93',
      bgColor: 'rgba(142,142,147,0.10)',
      borderColor: 'rgba(142,142,147,0.24)',
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

          <View style={[styles.stateBadge, { backgroundColor: stateInfo.bgColor, borderColor: stateInfo.borderColor }]}>
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
                支付方式：模拟支付 / 微信支付
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
            {canCancel && (
              <TouchableOpacity
                activeOpacity={0.82}
                style={[styles.cancelButton, { borderColor: 'rgba(255,59,48,0.3)' }]}
                onPress={() => handleCancelOrder(item)}
              >
                <Text style={styles.cancelButtonText}>取消订单</Text>
              </TouchableOpacity>
            )}
            {canPay && (
              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.payButton}
                onPress={() => { void handlePayOrder(item) }}
                disabled={isPurchasing}
              >
                <Text style={styles.payButtonText}>{isPurchasing ? '处理中...' : '去付款'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    )
  }

  const renderTabBar = () => (
    <View style={styles.tabBarWrap}>
      {TABS.map((tab) => {
        const active = activeTab === tab.id
        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.82}
            style={[
              styles.tabChip,
              {
                backgroundColor: active ? '#0A84FF' : ui.tabBg,
                borderColor: active ? '#0A84FF' : ui.border,
              },
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabChipText, { color: active ? '#FFFFFF' : ui.textSecondary }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )

  if (isSessionLoading || !session) {
    return <View style={[styles.loadingContainer, { backgroundColor: ui.background }]} />
  }

  return (
    <View style={[styles.screen, { backgroundColor: ui.background }]}>
      <Spinner
        visible={loading}
        animation="fade"
      />
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
        style={styles.rootContainer}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: insets.bottom + 32,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.pickerWrapper}>
            {renderTabBar()}
          </View>
        }
        ListEmptyComponent={renderEmpty}
      />

      {/* Payment Bottom Sheet */}
      <Modal
        visible={paymentSheetVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          if (!purchasingOrderId) {
            setPaymentSheetVisible(false)
          }
        }}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalDismissArea}
            onPress={() => {
              if (!purchasingOrderId) {
                setPaymentSheetVisible(false)
              }
            }}
          />
          <View style={[styles.paymentSheet, { backgroundColor: ui.background }]}>
            <View style={styles.sheetHandle} />

            {/* Amount */}
            <View style={styles.paymentAmountSection}>
              <Text style={[styles.paymentAmount, { color: ui.textPrimary }]}>
                ￥{selectedOrder ? formatPrice(selectedOrder.totalPrice) : '0.00'}
              </Text>
              <Text style={[styles.paymentOrderId, { color: ui.textSecondary }]}>
                订单号：{selectedOrder?.orderId || '-'}
              </Text>
            </View>

            {/* Payment Methods */}
            <View style={styles.paymentMethodSection}>
              <Text style={[styles.paymentMethodTitle, { color: ui.textSecondary }]}>支付方式</Text>
              <View style={[styles.paymentMethodList, { backgroundColor: ui.card, borderColor: ui.border }]}>
                {paymentMethods.map((method, index) => (
                  <React.Fragment key={method.type}>
                    {index > 0 && <View style={[styles.methodDivider, { backgroundColor: ui.border }]} />}
                    <TouchableOpacity
                      activeOpacity={0.78}
                      style={styles.paymentMethodRow}
                      onPress={() => setSelectedPaymentType(method.type)}
                    >
                      <View style={[styles.paymentMethodIcon, { backgroundColor: method.iconColor }]}>
                        <Text style={styles.paymentMethodIconText}>{method.iconLabel}</Text>
                      </View>
                      <Text style={[styles.paymentMethodLabel, { color: ui.textPrimary }]}>{method.title}</Text>
                      <View style={styles.paymentMethodCheck}>
                        <Feather
                          name={selectedPaymentType === method.type ? 'check-circle' : 'circle'}
                          size={20}
                          color={selectedPaymentType === method.type ? '#007AFF' : '#C7C7CC'}
                        />
                      </View>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.confirmPayButton, purchasingOrderId ? styles.confirmPayButtonDisabled : null]}
              disabled={!!purchasingOrderId}
              onPress={() => { void handleConfirmPayment() }}
            >
              <Text style={styles.confirmPayButtonText}>
                {purchasingOrderId ? '支付处理中...' : '确认支付'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  rootContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  pickerWrapper: {
    marginTop: 16,
    marginBottom: spacing.sm,
  },
  tabBarWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tabChip: {
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
  tabChipText: {
    fontSize: 13,
    fontWeight: '800',
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
    borderWidth: 1,
  },
  stateText: {
    fontSize: 12,
    fontWeight: '700',
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,59,48,0.08)',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '700',
  },
  payButton: {
    height: 40,
    paddingHorizontal: 22,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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
  // Payment Sheet
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  modalDismissArea: {
    flex: 1,
  },
  paymentSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingBottom: 34,
    paddingHorizontal: 20,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(142,142,147,0.42)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  paymentAmountSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  paymentAmount: {
    fontSize: 40,
    fontWeight: '800',
  },
  paymentOrderId: {
    fontSize: 12,
    marginTop: 6,
  },
  paymentMethodSection: {
    marginBottom: 20,
  },
  paymentMethodTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  paymentMethodList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  methodDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  paymentMethodIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodIconText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  paymentMethodLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  paymentMethodCheck: {
    marginLeft: 8,
  },
  confirmPayButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
  },
  confirmPayButtonDisabled: {
    opacity: 0.6,
  },
  confirmPayButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
})

export default OrderPage
