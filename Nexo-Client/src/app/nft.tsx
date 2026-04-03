import { artworkApi, authApi, orderApi, tradeApi } from '@/api'
import { ArtworkDetail } from '@/api/artwork'
import { PaymentType } from '@/api/trade'
import { useSession } from '@/utils/ctx'
import {
  BottomSheet,
  Button,
  Group,
  Host,
  HStack,
  Image as SwiftImage,
  Label,
  List,
  Picker,
  ProgressView,
  RNHostView,
  Section,
  Text,
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
} from '@expo/ui/swift-ui/modifiers'
import { Image } from 'expo-image'
import { GlassView } from 'expo-glass-effect'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
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

const PAYMENT_METHOD_MAP: Record<string, PaymentType> = {
  wechat: 'WECHAT',
  alipay: 'ALIPAY',
  applepay: 'APPLE_PAY',
}

const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr

  const y = date.getFullYear()
  const M = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${M}-${d} ${h}:${m}`
}

const formatPrice = (price: number | undefined): string => {
  if (price === undefined || price === null) return '0.00'
  return price.toFixed(2)
}

const getStatusMap = (state?: string) => {
  switch (state) {
    case 'NOT_FOR_SALE':
      return { text: '不可售', color: '#8E8E93' }
    case 'SELLING':
      return { text: '发售中', color: '#007AFF' }
    case 'SOLD_OUT':
      return { text: '已售罄', color: '#FF3B30' }
    case 'COMING_SOON':
      return { text: '即将开售', color: '#FF9500' }
    case 'WAIT_FOR_SALE':
      return { text: '待开售', color: '#5AC8FA' }
    default:
      return { text: '加载中', color: '#C7C7CC' }
  }
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

  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState('')
  const [payModalVisible, setPayModalVisible] = useState(false)
  const [selectedPayMethod, setSelectedPayMethod] = useState<string>('wechat')
  const [currentOrderId, setCurrentOrderId] = useState('')
  const [paying, setPaying] = useState(false)
  const [paySuccess, setPaySuccess] = useState(false)
  const [payStatusText, setPayStatusText] = useState('支付请求处理中...')
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
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

  const status = useMemo(() => getStatusMap(artwork.productState), [artwork.productState])

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

  const closePayModal = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setPayModalVisible(false)
    setPaying(false)
    setPaySuccess(false)
    setPayStatusText('支付请求处理中...')
    setSelectedPayMethod('wechat')
  }, [])

  const pollOrderStatus = useCallback(
    (orderId: string) => {
      let attempts = 0
      const maxAttempts = 20

      pollingRef.current = setInterval(async () => {
        attempts++
        try {
          const order = await orderApi.getOrder(orderId)
          if (!order) {
            return
          }

          if (order.orderState === 'PAID') {
            setPayStatusText('支付成功，正在铸造资产...')
            return
          }

          if (order.orderState === 'FINISH') {
            if (pollingRef.current) {
              clearInterval(pollingRef.current)
              pollingRef.current = null
            }
            setPaySuccess(true)
            setPaying(false)
            await fetchData()
            setTimeout(() => {
              closePayModal()
              router.push('/order')
            }, 1200)
          }
        } catch (error) {
          console.error('轮询订单状态失败:', error)
        }

        if (attempts >= maxAttempts) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }
          setPaying(false)
          Alert.alert('提示', '支付已受理，资产可能仍在铸造中，你可以稍后去订单页继续查看结果')
        }
      }, 2000)
    },
    [closePayModal, fetchData, router],
  )

  const handleConfirmPay = useCallback(async () => {
    if (!currentOrderId || paying) return

    const backendPayType = PAYMENT_METHOD_MAP[selectedPayMethod]
    if (!backendPayType) {
      Alert.alert('提示', '不支持的支付方式')
      return
    }

    setPaying(true)
    setPayStatusText('正在发起支付...')
    try {
      await tradeApi.pay({
        orderId: currentOrderId,
        paymentType: backendPayType,
      })
      setPayStatusText('支付请求已提交，等待支付确认...')
      pollOrderStatus(currentOrderId)
    } catch (error) {
      console.error('发起支付失败:', error)
      setPaying(false)
    }
  }, [currentOrderId, paying, pollOrderStatus, selectedPayMethod])

  const doBuy = useCallback(async () => {
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
      await fetchData()
      setCurrentOrderId(orderId)
      setPaying(false)
      setPaySuccess(false)
      setPayStatusText('支付请求处理中...')
      setSelectedPayMethod('wechat')
      setPayModalVisible(true)
    } catch {
      // request 已统一处理
    } finally {
      setLoading(false)
    }
  }, [artwork.id, token, fetchData])

  const handleBuy = useCallback(() => {
    void doBuy()
  }, [doBuy])

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

  if (Platform.OS !== 'ios') {
    return (
      <View style={styles.center}>
        <Spinner visible />
      </View>
    )
  }

  if (isSessionLoading || !session) {
    return (
      <View style={styles.center}>
        <Spinner visible />
      </View>
    )
  }

  const artworkDescription = artwork.description?.trim() || '暂无详情描述'
  const isBuyDisabled = artwork.productState !== 'SELLING' || loading
  const isDark = colorScheme === 'dark'
  const buttonFontColor = isDark ? '#000000' : '#F2F2F7'

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

      <Spinner visible={loading} />

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
              value={artworkDescription}
            />
          </Section>

          <Section title="发售信息">
            <InfoRow
              icon="yensign.circle.fill"
              iconColor="#22C55E"
              label="当前价格"
              value={`￥ ${formatPrice(artwork.price)}`}
            />
            <InfoRow
              icon="square.stack.3d.up.fill"
              iconColor="#3B82F6"
              label="发行数量"
              value={String(artwork.quantity ?? 0)}
            />
            <InfoRow
              icon="shippingbox.fill"
              iconColor="#F59E0B"
              label="剩余库存"
              value={String(artwork.inventory ?? 0)}
            />
            <InfoRow
              icon="calendar.badge.clock"
              iconColor="#EC4899"
              label="发售时间"
              value={formatDateTime(artwork.saleTime)}
            />
          </Section>

          <Section title="购买说明">
            <Text modifiers={[foregroundStyle('#8E8E93')]}>藏品购买后不可退款，请谨慎付款。</Text>
            <Text modifiers={[foregroundStyle('#8E8E93')]}>下单后会直接弹出支付窗口，关闭后也可稍后去订单页继续支付。</Text>
            <Text modifiers={[foregroundStyle('#8E8E93')]}>支付成功后系统会自动进入铸造流程。</Text>
          </Section>
        </List>
      </Host>

      <View style={styles.floatingButtonBar}>
        <TouchableOpacity activeOpacity={0.85} onPress={handleBuy} disabled={isBuyDisabled}>
          <GlassView
            style={[styles.glassButton, isBuyDisabled && styles.glassButtonDisabled]}
            glassEffectStyle="regular"
            tintColor={artwork.productState === 'SELLING' ? '#007AFF' : 'rgba(142,142,147,0.18)'}
            isInteractive={true}
          >
            <RNText style={[styles.glassButtonText, { color: buttonFontColor }]}>
              {artwork.productState === 'SELLING'
                ? `立即下单 ￥ ${formatPrice(artwork.price)}`
                : status.text}
            </RNText>
          </GlassView>
        </TouchableOpacity>
      </View>

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
              <VStack spacing={8} modifiers={[padding({ top: 32, bottom: 16 })]}>
                <Text modifiers={[foregroundStyle('secondary'), font({ size: 14 })]}>
                  支付金额
                </Text>
                <HStack spacing={4}>
                  <Text modifiers={[font({ size: 24, weight: 'bold' }), foregroundStyle('primary')]}>
                    ￥
                  </Text>
                  <Text modifiers={[font({ size: 36, weight: 'bold' }), foregroundStyle('primary')]}>
                    {formatPrice(artwork.price)}
                  </Text>
                </HStack>
                <Text modifiers={[foregroundStyle('secondary'), font({ size: 12 })]}>
                  订单号: {currentOrderId}
                </Text>
              </VStack>

              <List modifiers={[listStyle('insetGrouped')]}>
                <Section title="选择支付方式">
                  <Picker
                    selection={selectedPayMethod}
                    onSelectionChange={(val) => setSelectedPayMethod(val as string)}
                    modifiers={[pickerStyle('inline')]}
                  >
                    <Label
                      title="微信支付（推荐）"
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

              <VStack spacing={12} modifiers={[padding({ horizontal: 20, bottom: 32, top: 8 })]}>
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
                        <Text
                          modifiers={[
                            foregroundStyle('green'),
                            font({ weight: 'bold' }),
                            multilineTextAlignment('center'),
                          ]}
                        >
                          支付成功
                        </Text>
                      ) : (
                        <>
                          <ProgressView />
                          <Text modifiers={[multilineTextAlignment('center')]}>{payStatusText}</Text>
                        </>
                      )}
                    </HStack>
                  </Button>
                ) : (
                  <Button
                    onPress={handleConfirmPay}
                    modifiers={[buttonStyle('glassProminent'), controlSize('large')]}
                  >
                    <Text
                      modifiers={[
                        frame({ maxWidth: 'infinity' as any }),
                        multilineTextAlignment('center'),
                      ]}
                    >
                      确认支付
                    </Text>
                  </Button>
                )}
              </VStack>
            </VStack>
          </Group>
        </BottomSheet>
      </Host>
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
    position: 'relative',
    backgroundColor: 'transparent',
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
