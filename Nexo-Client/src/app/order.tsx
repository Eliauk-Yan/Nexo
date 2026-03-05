import { LiquidGlassButton } from '@/components/ui'
import { colors, spacing, borderRadius, typography, shadows } from '@/config/theme'
import { Stack, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { orderApi, OrderVO, OrderState } from '@/api/order'

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
  { id: 'pending', label: '待付款', state: 'CREATE' },
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
        console.log(response)
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
            <TouchableOpacity style={styles.btnSecondary}>
              <Text style={styles.btnSecondaryText}>取消订单</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary}>
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
})

export default OrderPage
