import { artworkApi, authApi, tradeApi } from '@/api'
import { ArtworkDetail } from '@/api/artwork'
import { useSession } from '@/utils/ctx'
import { Image } from 'expo-image'
import { GlassView } from 'expo-glass-effect'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
      return { text: '不可售卖', color: '#8E8E93' }
    case 'SELLING':
      return { text: '售卖中', color: '#007AFF' }
    case 'SOLD_OUT':
      return { text: '已售空', color: '#FF3B30' }
    case 'COMING_SOON':
      return { text: '即将开售', color: '#FF9500' }
    case 'WAIT_FOR_SALE':
      return { text: '等待开售', color: '#5AC8FA' }
    default:
      return { text: '获取中...', color: '#C7C7CC' }
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

  const doBuy = useCallback(async () => {
    setLoading(true)
    try {
      await tradeApi.buy(
        {
          productId: String(artwork.id),
          nftType: 'NFT',
          itemCount: 1,
        },
        token,
      )
      await fetchData()
      Alert.alert('购买成功')
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
              value={`¥ ${formatPrice(artwork.price)}`}
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
            <Text modifiers={[foregroundStyle('#8E8E93')]}>藏品购买后无法退款，谨慎付款</Text>
            <Text modifiers={[foregroundStyle('#8E8E93')]}>购买成功后可在我的资产中查看</Text>
            <Text modifiers={[foregroundStyle('#8E8E93')]}>藏品交易状态以平台最新结果为准</Text>
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
                ? `立即购买 ¥ ${formatPrice(artwork.price)}`
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
