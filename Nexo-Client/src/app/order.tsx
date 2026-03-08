import { LiquidGlassButton } from '@/components/ui'
import { colors, spacing, borderRadius, typography, shadows } from '@/config/theme'
import { Stack, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { orderApi, OrderVO, OrderState } from '@/api/order'
import { tradeApi, PaymentType } from '@/api/trade'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

/** 前端 ID → 后端 PaymentType 映射 */
const PAYMENT_METHOD_MAP: Record<string, PaymentType> = {
  wechat: 'WECHAT',
  alipay: 'ALIPAY',
  applepay: 'APPLE_PAY',
}

/** 支付方式配置 */
const PAYMENT_METHODS = [
  { id: 'wechat', label: '微信支付', icon: 'weixin', color: '#07C160', desc: '推荐使用' },
  { id: 'alipay', label: '支付宝', icon: 'alipay', color: '#1677FF', desc: '' },
  { id: 'applepay', label: 'Apple Pay', icon: 'apple-pay', color: '#FFFFFF', desc: '' },
]

/**
 * Tab 配置
 * 全部 - 不传 state 参数
 * 待付款 - CREATE / CONFIRM 状态
 * 已付款 - PAID 状态
 * 已完成 - FINISH 状态
 * 已关闭 - CLOSED 状态
 */
const TABS: { id: string; label: string; state?: OrderState }[] = [
  { id: 'all', label: '全部' },
  { id: 'pending', label: '待付款', state: 'CONFIRM' },
  { id: 'paid', label: '已付款', state: 'PAID' },
  { id: 'finished', label: '已完成', state: 'FINISH' },
  { id: 'closed', label: '已关闭', state: 'CLOSED' },
]

/** 订单状态显示配置 */
const ORDER_STATE_MAP: Record<string, { label: string; color: string }> = {
  CREATE: { label: '待付款', color: '#FFBB33' },
  CONFIRM: { label: '待付款', color: '#FFBB33' },
  PAID: { label: '已付款', color: colors.primary },
  FINISH: { label: '已完成', color: colors.success },
  CLOSED: { label: '已关闭', color: colors.textSecondary },
}

/** 格式化时间 */
const formatTime = (dateStr: string | null) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

/** 格式化金额 */
const formatPrice = (price: number | null | undefined) => {
  if (price == null) return '0.00'
  return Number(price).toFixed(2)
}

const PAGE_SIZE = 10

const OrderPage = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all')
  const [orders, setOrders] = useState<OrderVO[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // 支付弹窗状态
  const [payModalVisible, setPayModalVisible] = useState(false)
  const [selectedPayMethod, setSelectedPayMethod] = useState<string>('wechat')
  const [payingOrder, setPayingOrder] = useState<OrderVO | null>(null)
  const [paying, setPaying] = useState(false)
  const [paySuccess, setPaySuccess] = useState(false)
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const HEADER_HEIGHT = 44

  /** 根据当前选中 tab 获取订单列表 */
  const fetchOrders = useCallback(
    async (tabId?: string) => {
      const currentTab = tabId || activeTab
      const tabConfig = TABS.find((t) => t.id === currentTab)
      try {
        setLoading(true)
        const params: any = {
          current: 1,
          size: PAGE_SIZE,
        }
        // 不是"全部"时传递 state 参数
        if (tabConfig?.state) {
          params.state = tabConfig.state
        }
        const response = await orderApi.list(params)
        setOrders(Array.isArray(response) ? response : [])
      } catch (error) {
        console.error('获取订单列表失败:', error)
        setOrders([])
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [activeTab],
  )

  /** 初始化加载 & tab 切换时重新加载 */
  useEffect(() => {
    fetchOrders(activeTab)
  }, [activeTab])

  /** 切换 Tab */
  const handleTabPress = (tabId: string) => {
    if (tabId === activeTab) return
    setActiveTab(tabId)
    setOrders([]) // 清空当前列表，显示 loading
  }

  /** 下拉刷新 */
  const handleRefresh = () => {
    setRefreshing(true)
    fetchOrders()
  }

  /** 获取订单状态显示信息 */
  /** 打开支付弹窗 */
  const openPayModal = (order: OrderVO) => {
    setPayingOrder(order)
    setSelectedPayMethod('wechat')
    setPayModalVisible(true)
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start()
  }

  /** 关闭支付弹窗 */
  const closePayModal = () => {
    // 清理轮询
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setPayModalVisible(false)
      setPayingOrder(null)
      setPaying(false)
      setPaySuccess(false)
    })
  }

  /** 轮询订单状态（等待MockPay异步回调后订单变PAID） */
  const pollOrderStatus = (orderId: string) => {
    let attempts = 0
    const maxAttempts = 20 // 最多轮询20次（约40秒）

    pollingRef.current = setInterval(async () => {
      attempts++
      try {
        const order = await orderApi.getOrder(orderId)
        if (order && order.orderState === 'PAID') {
          // 支付成功
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }
          setPaySuccess(true)
          setPaying(false)
          // 刷新订单列表
          setTimeout(() => {
            closePayModal()
            fetchOrders(activeTab)
          }, 1500)
        }
      } catch (e) {
        console.error('轮询订单状态失败:', e)
      }
      if (attempts >= maxAttempts) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
        setPaying(false)
        Alert.alert('提示', '支付处理中，请稍后在订单列表查看结果')
      }
    }, 2000)
  }

  /** 确认支付 */
  const handleConfirmPay = async () => {
    if (!payingOrder || paying) return

    const backendPayType = PAYMENT_METHOD_MAP[selectedPayMethod]
    if (!backendPayType) {
      Alert.alert('提示', '不支持的支付方式')
      return
    }

    setPaying(true)
    try {
      // 调用后端支付接口
      const result = await tradeApi.pay({
        orderId: payingOrder.orderId,
        paymentType: backendPayType,
      })

      console.log('支付创建成功:', result)

      // 开始轮询订单状态（等待Mock支付回调）
      pollOrderStatus(payingOrder.orderId)
    } catch (error: any) {
      console.error('发起支付失败:', error)
      setPaying(false)
    }
  }

  // 组件卸载时清理轮询
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [])

  /** 取消订单 */
  const handleCancelOrder = (order: OrderVO) => {
    Alert.alert('提示', '确定要取消该订单吗？', [
      { text: '暂时不要', style: 'cancel' },
      {
        text: '取消订单',
        style: 'destructive',
        onPress: async () => {
          try {
            await orderApi.cancel(order.orderId)
            Alert.alert('提示', '订单已取消')
            fetchOrders(activeTab)
          } catch (error) {
            console.error('取消订单失败:', error)
          }
        },
      },
    ])
  }

  const getStateInfo = (state: string) => {
    return ORDER_STATE_MAP[state] || { label: state, color: colors.textSecondary }
  }

  /** 渲染单个订单卡片 */
  const renderOrderCard = ({ item }: { item: OrderVO }) => {
    const stateInfo = getStateInfo(item.orderState)

    return (
      <View style={styles.orderCard}>
        {/* 卡片顶部：订单号 + 状态 */}
        <View style={styles.cardHeader}>
          <Text style={styles.orderId} numberOfLines={1}>
            订单号: {item.orderId}
          </Text>
          <Text style={[styles.orderState, { color: stateInfo.color }]}>{stateInfo.label}</Text>
        </View>

        {/* 分割线 */}
        <View style={styles.divider} />

        {/* 商品信息 */}
        <View style={styles.goodsInfo}>
          {item.productCoverUrl ? (
            <Image
              source={{ uri: item.productCoverUrl }}
              style={styles.goodsImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.goodsImage, styles.goodsImagePlaceholder]}>
              <Text style={styles.placeholderText}>藏品</Text>
            </View>
          )}
          <View style={styles.goodsDetail}>
            <Text style={styles.goodsName} numberOfLines={2}>
              {item.productName || '未知商品'}
            </Text>
            <Text style={styles.goodsCount}>数量: {item.quantity}</Text>
            <Text style={styles.goodsPrice}>¥ {formatPrice(item.unitPrice)}</Text>
          </View>
        </View>

        {/* 卡片底部：金额 + 时间 */}
        <View style={styles.divider} />
        <View style={styles.cardFooter}>
          <Text style={styles.footerTime}>
            {item.confirmTime ? formatTime(item.confirmTime) : ''}
          </Text>
          <View style={styles.totalAmount}>
            <Text style={styles.totalLabel}>合计: </Text>
            <Text style={styles.totalPrice}>¥ {formatPrice(item.totalPrice)}</Text>
          </View>
        </View>

        {/* 待付款状态显示操作按钮 */}
        {(item.orderState === 'CREATE' || item.orderState === 'CONFIRM') && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => handleCancelOrder(item)}>
              <Text style={styles.btnSecondaryText}>取消订单</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => openPayModal(item)}>
              <Text style={styles.btnPrimaryText}>去付款</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    )
  }

  /** 渲染空状态 */
  const renderEmpty = () => {
    if (loading) return null
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyText}>暂无相关订单</Text>
      </View>
    )
  }

  return (
    <View style={styles.rootContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <LiquidGlassButton icon="chevron-left" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>我的订单</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={[styles.container, { paddingTop: insets.top + HEADER_HEIGHT + 16 }]}>
        {/* Tabs Section */}
        <View style={styles.tabsContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
                {tab.label}
              </Text>
              {activeTab === tab.id && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Order List */}
        {loading && orders.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderCard}
            keyExtractor={(item) => item.orderId}
            contentContainerStyle={{
              paddingHorizontal: spacing.md,
              paddingTop: spacing.md,
              paddingBottom: insets.bottom + 32,
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          />
        )}
      </View>

      {/* ===== 支付弹窗 ===== */}
      <Modal
        visible={payModalVisible}
        transparent
        animationType="none"
        onRequestClose={closePayModal}
      >
        <TouchableWithoutFeedback onPress={closePayModal}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }], paddingBottom: insets.bottom + 16 },
          ]}
        >
          {/* 顶部拖拽条 */}
          <View style={styles.modalDragBar} />

          {/* 金额区域 */}
          <View style={styles.modalAmountSection}>
            <Text style={styles.modalAmountLabel}>支付金额</Text>
            <View style={styles.modalAmountRow}>
              <Text style={styles.modalCurrency}>¥</Text>
              <Text style={styles.modalAmountValue}>
                {formatPrice(payingOrder?.totalPrice)}
              </Text>
            </View>
            <Text style={styles.modalOrderHint}>
              订单号: {payingOrder?.orderId}
            </Text>
          </View>

          {/* 分割线 */}
          <View style={styles.modalDivider} />

          {/* 选择支付方式标题 */}
          <Text style={styles.modalSectionTitle}>选择支付方式</Text>

          {/* 支付方式列表 */}
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedPayMethod === method.id
            return (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.payMethodItem,
                  isSelected && styles.payMethodItemActive,
                ]}
                onPress={() => setSelectedPayMethod(method.id)}
                activeOpacity={0.7}
              >
                <View style={styles.payMethodLeft}>
                  <FontAwesome6 name={method.icon} size={22} color={method.color} style={styles.payMethodIcon} />
                  <View>
                    <Text style={styles.payMethodLabel}>{method.label}</Text>
                    {method.desc ? (
                      <Text style={styles.payMethodDesc}>{method.desc}</Text>
                    ) : null}
                  </View>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterActive,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            )
          })}

          {/* 确认支付按钮 */}
          <TouchableOpacity
            style={[styles.confirmPayBtn, paying && styles.confirmPayBtnDisabled]}
            onPress={handleConfirmPay}
            activeOpacity={0.8}
            disabled={paying}
          >
            {paying ? (
              <View style={styles.payingRow}>
                {paySuccess ? (
                  <>
                    <FontAwesome6 name="circle-check" size={18} color="#000" solid />
                    <Text style={[styles.confirmPayText, { marginLeft: 8 }]}>支付成功</Text>
                  </>
                ) : (
                  <>
                    <ActivityIndicator size="small" color="#000" />
                    <Text style={[styles.confirmPayText, { marginLeft: 8 }]}>支付处理中...</Text>
                  </>
                )}
              </View>
            ) : (
              <Text style={styles.confirmPayText}>确认支付</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  container: {
    flex: 1,
  },
  /* ---- Tabs ---- */
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 20,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  /* ---- Loading ---- */
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  /* ---- Order Card ---- */
  orderCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderId: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
    marginRight: spacing.sm,
  },
  orderState: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: spacing.sm,
  },
  /* ---- Goods Info ---- */
  goodsInfo: {
    flexDirection: 'row',
  },
  goodsImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundTertiary,
  },
  goodsImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  placeholderText: {
    color: colors.textTertiary,
    fontSize: typography.fontSize.xs,
  },
  goodsDetail: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
  },
  goodsName: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
    lineHeight: 20,
  },
  goodsCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  goodsPrice: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  /* ---- Card Footer ---- */
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  totalAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  totalPrice: {
    fontSize: typography.fontSize.lg,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  /* ---- Action Buttons ---- */
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  btnSecondary: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnSecondaryText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  btnPrimary: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
  },
  btnPrimaryText: {
    color: '#000',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  /* ---- Empty State ---- */
  emptyContainer: {
    flex: 1,
    paddingTop: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
  },
  /* ---- Payment Modal ---- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#141414',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  modalDragBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalAmountSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  modalAmountLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  modalAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  modalCurrency: {
    fontSize: typography.fontSize.xl,
    color: colors.text,
    fontWeight: typography.fontWeight.bold,
    marginRight: 2,
    marginBottom: 4,
  },
  modalAmountValue: {
    fontSize: 36,
    color: colors.text,
    fontWeight: typography.fontWeight.bold,
  },
  modalOrderHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  modalDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: spacing.md,
  },
  modalSectionTitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.md,
  },
  payMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  payMethodItemActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 212, 255, 0.06)',
  },
  payMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payMethodIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  payMethodLabel: {
    fontSize: typography.fontSize.lg,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  payMethodDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  confirmPayBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  confirmPayBtnDisabled: {
    opacity: 0.7,
  },
  payingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPayText: {
    fontSize: typography.fontSize.lg,
    color: '#000',
    fontWeight: typography.fontWeight.bold,
  },
})

export default OrderPage
