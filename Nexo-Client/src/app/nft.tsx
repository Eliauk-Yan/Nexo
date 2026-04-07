import { artworkApi, authApi, orderApi, tradeApi } from '@/api'
import { ArtworkDetail } from '@/api/artwork'
import { useSession } from '@/utils/ctx'
import {
  BottomSheet,
  Button,
  Group,
  Host,
  HStack,
  Image as SwiftImage,
  List,
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
  presentationDetents,
  presentationDragIndicator,
} from '@expo/ui/swift-ui/modifiers'
import { Image } from 'expo-image'
import { GlassView } from 'expo-glass-effect'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
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
  SELLING: { text: '发售中', color: '#007AFF' },
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

export default function NftDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const colorScheme = useColorScheme()
  const { session, isLoading: isSessionLoading } = useSession()

  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState('')
  const [payModalVisible, setPayModalVisible] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState('')
  const [paying, setPaying] = useState(false)
  const [paySuccess, setPaySuccess] = useState(false)
  const [payStatusText, setPayStatusText] = useState('支付请求处理�?..')
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

  const closePayModal = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setPayModalVisible(false)
    setPaying(false)
    setPaySuccess(false)
    setPayStatusText('支付请求处理中...')
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
    setPaying(true)
    setPayStatusText('正在发起支付...')
    try {
      await tradeApi.pay({
        orderId: currentOrderId,
        paymentType: 'WECHAT',
      })
      setPayStatusText('支付请求已提交，等待支付确认...')
      pollOrderStatus(currentOrderId)
    } catch (error) {
      console.error('发起支付失败:', error)
      setPaying(false)
    }
  }, [currentOrderId, paying, pollOrderStatus])

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
      setPayModalVisible(true)
    } catch {
      // request 已统一处理
    } finally {
      setLoading(false)
    }
  }, [artwork.id, token, fetchData])

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

  if (Platform.OS !== 'ios' || isSessionLoading || !session) {
    return (
      <View style={styles.center}>
        <Spinner visible />
      </View>
    )
  }

  const isBuyDisabled = artwork.productState !== 'SELLING' || loading

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
              value={artwork.description?.trim() || '暂无详情描述'}
            />
          </Section>

          <Section title="发售信息">
            <InfoRow
              icon="yensign.circle.fill"
              iconColor="#22C55E"
              label="当前价格"
              value={`￥ ${(artwork.price ?? 0).toFixed(2)}`}
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
                  ? new Date(artwork.saleTime).toLocaleString('zh-CN', {
                      hour12: false,
                    })
                  : '-'
              }
            />
          </Section>

          <Section title="购买说明">
            <Text modifiers={[foregroundStyle('#8E8E93')]}>藏品购买后不可退款，请谨慎付款。</Text>
            <Text modifiers={[foregroundStyle('#8E8E93')]}>
              下单后会直接弹出支付窗口，关闭后也可稍后去订单页继续支付。
            </Text>
            <Text modifiers={[foregroundStyle('#8E8E93')]}>支付成功后系统会自动进入铸造流程。</Text>
          </Section>
        </List>
      </Host>

      <View style={styles.floatingButtonBar}>
        <TouchableOpacity activeOpacity={0.85} onPress={doBuy} disabled={isBuyDisabled}>
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
                ? `立即下单 ￥ ${(artwork.price ?? 0).toFixed(2)}`
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
                <Text modifiers={[foregroundStyle('secondary'), font({ size: 14 })]}>支付金额</Text>
                <Text modifiers={[font({ size: 36, weight: 'bold' }), foregroundStyle('primary')]}>
                  ￥ {(artwork.price ?? 0).toFixed(2)}
                </Text>
                <Text modifiers={[foregroundStyle('secondary'), font({ size: 12 })]}>
                  订单： {currentOrderId}
                </Text>
              </VStack>

              <List modifiers={[listStyle('insetGrouped')]}>
                <Section title="支付方式">
                  <Text>微信支付（推荐）</Text>
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
                          <Text modifiers={[multilineTextAlignment('center')]}>
                            {payStatusText}
                          </Text>
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
