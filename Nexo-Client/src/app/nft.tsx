import { artworkApi, authApi, orderApi, tradeApi } from '@/api'
import { ArtworkDetail } from '@/api/artwork'
import { PaymentType } from '@/api/trade'
import { ensureWeChatRegistered, getWeChatConfigError, isWeChatConfigured } from '@/utils/wechat'
import { useSession } from '@/utils/ctx'
import {
  BottomSheet,
  Button,
  Group,
  Host,
  HStack,
  Image as SwiftImage,
  List,
  RNHostView,
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
  interactiveDismissDisabled,
  listStyle,
  multilineTextAlignment,
  padding,
  presentationDetents,
  presentationDragIndicator,
} from '@expo/ui/swift-ui/modifiers'
import { Image } from 'expo-image'
import { GlassView } from 'expo-glass-effect'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEvent } from 'expo'
import ExpoWeChat from 'expo-wechat'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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

const PaymentMethodIcon = ({
  label,
  backgroundColor,
}: {
  label: string
  backgroundColor: string
}) => {
  return (
    <RNHostView matchContents>
      <View style={[styles.paymentMethodIcon, { backgroundColor }]}>
        <RNText style={styles.paymentMethodIconText}>{label}</RNText>
      </View>
    </RNHostView>
  )
}

export default function NftDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const colorScheme = useColorScheme()
  const { session, isLoading: isSessionLoading } = useSession()
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false)
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType>('MOCK')
  const [pendingOrderId, setPendingOrderId] = useState('')
  const payResult = useEvent(ExpoWeChat, 'onPayResult')
  const wechatConfigured = isWeChatConfigured()
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

  const status = STATUS_MAP[artwork.productState as keyof typeof STATUS_MAP] ?? {
    text: '加载中',
    color: '#C7C7CC',
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
            setPendingOrderId('')
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

  const waitForOrderReady = useCallback(
    async (orderId: string) => {
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
    },
    [isOrderSyncingError, sleep],
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
    if (!payResult || !pendingOrderId) return

    if (payResult.errorCode === 0) {
      pollOrderStatus(pendingOrderId)
      return
    }

    if (payResult.errorCode === -2) {
      setPurchasing(false)
      Alert.alert('提示', '你已取消微信支付。')
      return
    }

    setPurchasing(false)
    Alert.alert('提示', payResult.errorMessage || '微信支付失败，请稍后重试。')
  }, [payResult, pendingOrderId, pollOrderStatus])

  useEffect(() => {
    if (isSessionLoading) return

    if (!session) {
      router.replace('/(auth)/sign-in')
      return
    }

    void fetchData()
  }, [fetchData, isSessionLoading, router, session])

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [])

  const handleConfirmPayment = useCallback(async () => {
    if (!pendingOrderId) {
      Alert.alert('提示', '订单尚未生成，请重新点击立即购买。')
      return
    }

    if (selectedPaymentType === 'WECHAT' && !wechatConfigured) {
      Alert.alert('提示', getWeChatConfigError() || '微信支付配置未完成。')
      return
    }

    setPaymentSheetVisible(false)
    setLoading(true)
    try {
      setPurchasing(true)
      await waitForOrderReady(pendingOrderId)
      const payType = await payWithRetry(pendingOrderId, selectedPaymentType)
      if (payType === 'MOCK') {
        pollOrderStatus(pendingOrderId)
      }
    } catch (error) {
      setPurchasing(false)
      console.error('发起购买失败:', error)
      if (!isOrderSyncingError(error)) {
        Alert.alert('提示', error instanceof Error ? error.message : '发起购买失败，请稍后重试。')
      }
    } finally {
      setLoading(false)
    }
  }, [getWeChatConfigError, isOrderSyncingError, payWithRetry, pendingOrderId, pollOrderStatus, selectedPaymentType, waitForOrderReady, wechatConfigured])

  const handlePrepareOrder = useCallback(async () => {
    if (pendingOrderId) {
      setPaymentSheetVisible(true)
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

      if (!orderId) {
        return
      }

      setPendingOrderId(orderId)
      setPaymentSheetVisible(true)
    } catch (error) {
      console.error('创建订单失败:', error)
      Alert.alert('提示', error instanceof Error ? error.message : '创建订单失败，请稍后重试。')
    } finally {
      setLoading(false)
    }
  }, [artwork.id, pendingOrderId, token])

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
            <InfoRow
              icon="tag.fill"
              iconColor="#5E5CE6"
              label="名称"
              value={artwork.name || '未命名藏品'}
            />
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
        <BottomSheet
          isPresented={paymentSheetVisible}
          onIsPresentedChange={setPaymentSheetVisible}
        >
            <Group
              modifiers={[
                presentationDetents([{ height: 360 }]),
                presentationDragIndicator('visible'),
                interactiveDismissDisabled(loading || purchasing),
              ]}
            >
            <VStack
              spacing={12}
              alignment="center"
              modifiers={[padding({ top: 24, horizontal: 20, bottom: 8 }), frame({ maxWidth: 9999 })]}
            >
              <Text
                modifiers={[
                  font({ size: 40, weight: 'bold' }),
                  foregroundStyle('#111111'),
                  multilineTextAlignment('center'),
                ]}
              >
                ￥{(artwork.price ?? 0).toFixed(2)}
              </Text>
              <Text
                modifiers={[
                  font({ size: 12, weight: 'regular' }),
                  foregroundStyle('#8E8E93'),
                  multilineTextAlignment('center'),
                ]}
              >
                订单号：{pendingOrderId || '待生成'}
              </Text>
            </VStack>

            <List modifiers={[listStyle('insetGrouped')]}>
              <Section title="支付方式">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.type}
                    modifiers={[buttonStyle('plain')]}
                    onPress={() => {
                      setSelectedPaymentType(method.type)
                    }}
                  >
                      <HStack spacing={12}>
                        <HStack spacing={10}>
                          <PaymentMethodIcon label={method.iconLabel} backgroundColor={method.iconColor} />
                          <Text modifiers={[foregroundStyle('#111111')]}>{method.title}</Text>
                        </HStack>
                        <Spacer />
                        <SwiftImage
                          systemName={
                            selectedPaymentType === method.type
                              ? 'checkmark.circle.fill'
                              : 'circle'
                          }
                          size={18}
                          color={selectedPaymentType === method.type ? '#007AFF' : '#C7C7CC'}
                        />
                      </HStack>
                  </Button>
                ))}
              </Section>
            </List>

            <VStack modifiers={[padding({ horizontal: 20, top: 8, bottom: 20 })]}>
              <Button
                label={loading || purchasing ? '支付处理中...' : '确认支付'}
                modifiers={[buttonStyle('borderedProminent'), controlSize('extraLarge')]}
                onPress={() => {
                  void handleConfirmPayment()
                }}
              />
            </VStack>
          </Group>
        </BottomSheet>
      </Host>

      <View style={styles.floatingButtonBar}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            void handlePrepareOrder()
          }}
          disabled={isBuyDisabled}
        >
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
  paymentMethodIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
})
