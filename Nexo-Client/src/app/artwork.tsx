import { artworkApi, authApi, tradeApi } from '@/api'
import { LiquidGlassButton } from '@/components/ui'
import { borderRadius, colors, shadows, spacing, typography } from '@/config/theme'
import { ArtworkDetail } from '@/api/artwork'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spinner from 'react-native-loading-spinner-overlay'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const IMAGE_HEIGHT = SCREEN_WIDTH * 1.15

/**
 * 格式化时间为正常格式 YYYY-MM-DD HH:mm
 */
const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const y = date.getFullYear()
  const M = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${M}-${d} ${h}:${m}`
}

/**
 * 格式化价格为两位小数
 */
const formatPrice = (price: number | undefined): string => {
  if (price === undefined || price === null) return '0.00'
  return price.toFixed(2)
}

const getStatusMap = (state?: string) => {
  switch (state) {
    case 'NOT_FOR_SALE': return { text: '不可售卖', color: colors.textSecondary }
    case 'SELLING': return { text: '售卖中', color: colors.primary }
    case 'SOLD_OUT': return { text: '已售空', color: colors.error }
    case 'COMING_SOON': return { text: '即将开售', color: colors.warning }
    case 'WAIT_FOR_SALE': return { text: '等待开售', color: colors.info }
    default: return { text: '获取中...', color: colors.textTertiary }
  }
}

const Artwork = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(false)
  const [artwork, setArtwork] = useState<ArtworkDetail>({
    id: 0,
    name: '',
    cover: '',
    price: 0,
    quantity: 0,
    inventory: 0,
    saleTime: '',
    bookStartTime: '',
    bookEndTime: '',
    canBook: false,
    hasBooked: null,
    productState: 'WAIT_FOR_SALE',
  })
  const [token, setToken] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await artworkApi.getDetail(Number(id))
      const t = await authApi.getToken({ scene: 'artwork', key: id })
      setToken(t)
      setArtwork(res)
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = async () => {
    setLoading(true)
    try {
      await tradeApi.buy(
        { productId: String(artwork.id), productType: 'ARTWORK', itemCount: 1 },
        token,
      )
      await fetchData()
    } catch (e: any) {
      // 错误弹窗已在request工具类中统一处理
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData().catch((e) => console.error('获取藏品详情错误：' + e))
  }, [])

  return (
    <View style={styles.container}>
      {/* ===== 顶部导航 ===== */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <LiquidGlassButton
          icon="chevron-left"
          onPress={() => router.back()}
          size={20}
          color="#fff"
          glassStyle="regular"
        />
        <LiquidGlassButton
          icon="share-nodes"
          onPress={() => { }}
          size={20}
          color="#fff"
          glassStyle="regular"
        />
      </View>

      <Spinner visible={loading} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ===== 图片显示区域（小图带边框） ===== */}
        <View style={styles.imageContainer}>
          <Image
            source={artwork?.cover}
            style={styles.artworkImage}
            contentFit="cover"
            transition={300}
          />
        </View>

        {/* ===== 藏品名称 ===== */}
        <View style={styles.nameSection}>
          <Text style={styles.artworkName}>{artwork?.name}</Text>
          <View style={styles.divider} />
        </View>

        {/* ===== 信息标签区（竖向） ===== */}
        <View style={styles.chipSection}>
          <View style={styles.chip}>
            <View style={styles.chipIconWrap}>
              <Text style={styles.chipIcon}>🔒</Text>
            </View>
            <View style={styles.chipContent}>
              <Text style={styles.chipLabel}>限量发行</Text>
              <Text style={styles.chipValue}>{artwork?.quantity} 份</Text>
            </View>
          </View>

          <View style={styles.chip}>
            <View style={styles.chipIconWrap}>
              <Text style={styles.chipIcon}>✨</Text>
            </View>
            <View style={styles.chipContent}>
              <Text style={styles.chipLabel}>当前状态</Text>
              <Text style={[styles.chipValue, { color: getStatusMap(artwork?.productState).color }]}>
                {getStatusMap(artwork?.productState).text}
              </Text>
            </View>
          </View>

          <View style={styles.chip}>
            <View style={styles.chipIconWrap}>
              <Text style={styles.chipIcon}>📦</Text>
            </View>
            <View style={styles.chipContent}>
              <Text style={styles.chipLabel}>当前库存</Text>
              <Text style={styles.chipValue}>{artwork?.inventory} 份</Text>
            </View>
          </View>



          {artwork?.saleTime && (
            <View style={styles.chip}>
              <View style={styles.chipIconWrap}>
                <Text style={styles.chipIcon}>📅</Text>
              </View>
              <View style={styles.chipContent}>
                <Text style={styles.chipLabel}>发售时间</Text>
                <Text style={styles.chipValue}>{formatDateTime(artwork?.saleTime)}</Text>
              </View>
            </View>
          )}

          {artwork?.bookStartTime && (
            <View style={styles.chip}>
              <View style={styles.chipIconWrap}>
                <Text style={styles.chipIcon}>⏳</Text>
              </View>
              <View style={styles.chipContent}>
                <Text style={styles.chipLabel}>预定开始时间</Text>
                <Text style={styles.chipValue}>{formatDateTime(artwork?.bookStartTime)}</Text>
              </View>
            </View>
          )}

          {artwork?.bookEndTime && (
            <View style={styles.chip}>
              <View style={styles.chipIconWrap}>
                <Text style={styles.chipIcon}>⌛</Text>
              </View>
              <View style={styles.chipContent}>
                <Text style={styles.chipLabel}>预定结束时间</Text>
                <Text style={styles.chipValue}>{formatDateTime(artwork?.bookEndTime)}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ===== 底部操作栏 ===== */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <View style={styles.bottomInner}>
          <View style={styles.bottomPriceWrap}>
            <Text style={styles.bottomPriceLabel}>合计</Text>
            <View style={styles.bottomPriceRow}>
              <Text style={styles.bottomPriceSymbol}>¥</Text>
              <Text style={styles.bottomPriceValue}>{formatPrice(artwork?.price)}</Text>
              <Text style={styles.bottomCurrency}>CNY</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.buyButton, artwork?.productState !== 'SELLING' && { opacity: 0.6 }]}
            onPress={handleBuy}
            activeOpacity={0.85}
            disabled={artwork?.productState !== 'SELLING'}
          >
            <LinearGradient
              colors={
                artwork?.productState === 'SELLING'
                  ? [colors.primary, colors.primaryDark]
                  : [colors.border, colors.borderDark]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buyButtonGradient}
            >
              <Text
                style={[
                  styles.buyButtonText,
                  artwork?.productState !== 'SELLING' && { color: colors.textSecondary }
                ]}
              >
                {artwork?.productState === 'SELLING' ? '立即购买' : getStatusMap(artwork?.productState).text}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  /* ===== 容器 ===== */
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },

  /* ===== 顶部导航 ===== */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },

  /* ===== 小图带边框 ===== */
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 80, // 上方留给绝对定位的导航栏
    paddingBottom: spacing.lg,
  },
  artworkImage: {
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_WIDTH * 0.65,
    borderRadius: borderRadius.md,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
    ...shadows.primary,
  },
  /* ===== 藏品名称 ===== */
  nameSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  artworkName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    letterSpacing: 0.5,
    lineHeight: 32,
  },
  divider: {
    width: 36,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: spacing.md,
    opacity: 0.8,
  },

  /* ===== 信息标签（竖向） ===== */
  chipSection: {
    flexDirection: 'column',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  chipIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  chipIcon: {
    fontSize: 20,
  },
  chipContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  chipValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },

  /* ===== 底部操作栏 ===== */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
  },
  bottomInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  bottomPriceWrap: {
    justifyContent: 'center',
  },
  bottomPriceLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  bottomPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomPriceSymbol: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginRight: 2,
  },
  bottomPriceValue: {
    fontSize: 26,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  bottomCurrency: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
    marginLeft: 6,
  },
  buyButton: {
    borderRadius: 100,
    overflow: 'hidden',
    ...shadows.primary,
  },
  buyButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    color: '#000',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
})

export default Artwork
