import { colors, spacing, typography } from '@/config/theme'
import { Stack, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { orderApi, OrderVO, OrderState } from '@/api/order'
import { tradeApi, PaymentType } from '@/api/trade'
import { useSession } from '@/utils/ctx'
import Feather from '@expo/vector-icons/Feather'
import {
  Host,
  Picker,
  Text as SwiftUIText,
  HStack,
  VStack,
  Button,
  Spacer,
  BottomSheet,
  Group,
  List,
  Section,
  ProgressView,
  Label,
} from '@expo/ui/swift-ui'
import {
  pickerStyle,
  tag,
  buttonStyle,
  controlSize,
  tint,
  presentationDragIndicator,
  presentationDetents,
  listStyle,
  foregroundStyle,
  font,
  padding,
  frame,
  disabled,
  multilineTextAlignment,
} from '@expo/ui/swift-ui/modifiers'

/** 前端 ID → 后端 PaymentType 映射 */
const PAYMENT_METHOD_MAP: Record<string, PaymentType> = {
  wechat: 'WECHAT',
  alipay: 'ALIPAY',
  applepay: 'APPLE_PAY',
}

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
const ORDER_STATE_MAP: Record<string, { label: string; color: string; bgColor: string }> = {
  CREATE: { label: '待付款', color: '#FFB800', bgColor: 'rgba(255,184,0,0.14)' },
  CONFIRM: { label: '待付款', color: '#FFB800', bgColor: 'rgba(255,184,0,0.14)' },
  PAID: { label: '已付款', color: colors.success, bgColor: 'rgba(52,199,89,0.14)' },
  FINISH: { label: '已完成', color: colors.success, bgColor: 'rgba(52,199,89,0.14)' },
  CLOSED: { label: '已关闭', color: 'rgba(255,255,255,0.5)', bgColor: 'rgba(255,255,255,0.08)' },
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
  const { session, isLoading: isSessionLoading } = useSession()
  const colorScheme = useColorScheme()
  // 严格判断是否为 dark，防止返回 null 时误判为黑夜模式导致“自己变黑”
  const isDark = colorScheme === 'dark'
  const systemBg = isDark ? '#000000' : '#F2F2F7'
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
  const textMain = isDark ? '#fff' : '#000'
  const textSub = isDark ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.5)'
  const textTime = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.4)'
  const imageBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)'
  const [activeTab, setActiveTab] = useState('all')
  const [orders, setOrders] = useState<OrderVO[]>([])
  const [loading, setLoading] = useState(false)

  // 支付弹窗状态
  const [payModalVisible, setPayModalVisible] = useState(false)
  const [selectedPayMethod, setSelectedPayMethod] = useState<string>('wechat')
  const [payingOrder, setPayingOrder] = useState<OrderVO | null>(null)
  const [paying, setPaying] = useState(false)
  const [paySuccess, setPaySuccess] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
      }
    },
    [activeTab],
  )

  /** 未登录时进入即跳转登录页，不请求接口；已登录时初始化加载 & tab 切换时重新加载 */
  useEffect(() => {
    if (isSessionLoading) return
    if (!session) {
      router.replace('/(auth)/sign-in')
      return
    }
    fetchOrders(activeTab).catch()
  }, [isSessionLoading, session, activeTab, fetchOrders, router])

  /** 切换 Tab */
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setOrders([])
  }

  /** 获取订单状态显示信息 */
  /** 打开支付弹窗 */
  const openPayModal = (order: OrderVO) => {
    setPayingOrder(order)
    setSelectedPayMethod('wechat')
    setPayModalVisible(true)
  }

  /** 关闭支付弹窗 */
  const closePayModal = () => {
    // 清理轮询
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setPayModalVisible(false)
    setPayingOrder(null)
    setPaying(false)
    setPaySuccess(false)
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
            await fetchOrders(activeTab)
          } catch (error) {
            console.error('取消订单失败:', error)
          }
        },
      },
    ])
  }

  const getStateInfo = (state: string) => {
    const info = ORDER_STATE_MAP[state] || {
      label: state,
      color: colors.textSecondary,
      bgColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    }
    if (!isDark && state === 'CLOSED') {
      return { ...info, color: 'rgba(0,0,0,0.4)', bgColor: 'rgba(0,0,0,0.06)' }
    }
    return info
  }

  /** 渲染单个订单卡片 */
  const renderOrderCard = ({ item }: { item: OrderVO }) => {
    const stateInfo = getStateInfo(item.orderState)

    return (
      <View
        style={{
          width: '100%',
          backgroundColor: cardBg,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: cardBorder,
          padding: 18,
          marginBottom: 16,
        }}
      >
        {/* 顶部 */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              color: textSub,
              fontSize: 13,
              marginRight: 12,
            }}
          >
            订单号：{item.orderId}
          </Text>

          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
              backgroundColor: stateInfo.bgColor,
            }}
          >
            <Text
              style={{
                color: stateInfo.color,
                fontSize: 13,
                fontWeight: '600',
              }}
            >
              {stateInfo.label}
            </Text>
          </View>
        </View>

        {/* 分割线 */}
        <View
          style={{
            height: 1,
            backgroundColor: cardBorder,
            marginVertical: 14,
          }}
        />

        {/* 商品区 */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
          }}
        >
          {item.productCoverUrl ? (
            <Image
              source={{ uri: item.productCoverUrl }}
              style={{
                width: 88,
                height: 88,
                borderRadius: 16,
                backgroundColor: imageBg,
              }}
            />
          ) : (
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 16,
                backgroundColor: imageBg,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: cardBorder,
              }}
            >
              <Text style={styles.placeholderText}>藏品</Text>
            </View>
          )}

          <View
            style={{
              flex: 1,
              marginLeft: 14,
              minHeight: 88,
              justifyContent: 'space-between',
            }}
          >
            <Text
              numberOfLines={2}
              style={{
                color: textMain,
                fontSize: 16,
                fontWeight: '600',
                lineHeight: 22,
                marginBottom: 8,
              }}
            >
              {item.productName || '未知商品'}
            </Text>

            <Text
              style={{
                color: textSub,
                fontSize: 14,
                marginBottom: 6,
              }}
            >
              数量：{item.quantity}
            </Text>

            <Text
              style={{
                color: textMain,
                fontSize: 15,
                fontWeight: '500',
              }}
            >
              单价：¥ {formatPrice(item.unitPrice)}
            </Text>
          </View>
        </View>

        {/* 分割线 */}
        <View
          style={{
            height: 1,
            backgroundColor: cardBorder,
            marginVertical: 14,
          }}
        />

        {/* 金额区 */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              color: textTime,
              fontSize: 13,
            }}
          >
            {item.confirmTime ? formatTime(item.confirmTime) : ''}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text
              style={{
                color: textSub,
                fontSize: 13,
                marginRight: 6,
              }}
            >
              合计
            </Text>
            <Text
              style={{
                color: '#007AFF', // iOS default native blue tint
                fontSize: 24,
                fontWeight: '700',
              }}
            >
              ¥ {formatPrice(item.totalPrice)}
            </Text>
          </View>
        </View>

        {/* 动态按钮区 */}
        {(item.orderState === 'CREATE' || item.orderState === 'CONFIRM') && (
          <View style={{ marginTop: 16 }}>
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

  /** 渲染空状态 */
  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="inbox" size={48} color={colors.textSecondary} />
        <Text style={styles.emptyText}>暂无相关订单</Text>
      </View>
    )
  }

  // 未登录或仍在确认登录状态时，不渲染订单页，直接跳转或显示加载
  if (isSessionLoading || !session) {
    return (
      <View
        style={[styles.rootContainer, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}
      ></View>
    )
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
        style={[styles.rootContainer, { backgroundColor: systemBg }]}
        contentInsetAdjustmentBehavior="automatic"
        data={orders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.orderId}
        ListHeaderComponent={
          /* Tabs Section 放入 Header 当中，确保外层容器和列表不割裂，大标题顺滑折叠 */
          <View style={[styles.pickerWrapper, { marginTop: 16 }]}>
            <Host matchContents>
              <Picker
                modifiers={[pickerStyle('segmented')]}
                label="订单状态"
                selection={activeTab}
                onSelectionChange={(selection) => handleTabChange(selection as string)}
              >
                {TABS.map((t) => (
                  <SwiftUIText key={t.id} modifiers={[tag(t.id)]}>
                    {t.label}
                  </SwiftUIText>
                ))}
              </Picker>
            </Host>
          </View>
        }
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={loading ? <ActivityIndicator size={'large'} /> : null}
      />

      {/* ===== 支付弹窗 ===== */}
      <Host matchContents>
        <BottomSheet
          isPresented={payModalVisible}
          onIsPresentedChange={(isVisible) => {
            if (!isVisible) closePayModal()
            else setPayModalVisible(isVisible)
          }}
        >
          <Group
            modifiers={[
              presentationDragIndicator('visible'),
              presentationDetents(['medium', 'large']),
            ]}
          >
            <VStack spacing={0}>
              {/* 金额区域 (无背景，自然居中) */}
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
                  订单号: {payingOrder?.orderId}
                </SwiftUIText>
              </VStack>

              <List modifiers={[listStyle('insetGrouped')]}>
                {/* 支付方式列表 */}
                <Section title="选择支付方式">
                  <Picker
                    selection={selectedPayMethod}
                    onSelectionChange={(val) => setSelectedPayMethod(val as string)}
                    modifiers={[pickerStyle('inline')]}
                  >
                    <Label
                      title="微信支付 (推荐)"
                      systemImage="message.fill"
                      modifiers={[tag('wechat')]}
                    />
                    <Label
                      title="支付宝"
                      systemImage="yensign.circle.fill"
                      modifiers={[tag('alipay')]}
                    />
                    <Label
                      title="Apple Pay"
                      systemImage="applelogo"
                      modifiers={[tag('applepay')]}
                    />
                  </Picker>
                </Section>
              </List>

              {/* 底部悬浮操作按钮区 */}
              <VStack modifiers={[padding({ horizontal: 20, bottom: 32, top: 8 })]}>
                {paying ? (
                  <Button
                    modifiers={[
                      buttonStyle('glassProminent'),
                      controlSize('large'),
                      disabled(true),
                    ]}
                  >
                    <HStack spacing={8} modifiers={[frame({ maxWidth: 'infinity' as any })]}>
                      {paySuccess ? (
                        <SwiftUIText
                          modifiers={[
                            foregroundStyle('green'),
                            font({ weight: 'bold' }),
                            multilineTextAlignment('center'),
                          ]}
                        >
                          ✓ 支付成功
                        </SwiftUIText>
                      ) : (
                        <>
                          <ProgressView />
                          <SwiftUIText modifiers={[multilineTextAlignment('center')]}>
                            支付处理中...
                          </SwiftUIText>
                        </>
                      )}
                    </HStack>
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
    backgroundColor: '#000',
  },
  pickerWrapper: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    color: colors.textTertiary,
    fontSize: typography.fontSize.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 200,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
  },
})

export default OrderPage
