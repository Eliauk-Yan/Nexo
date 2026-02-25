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
    version: 0,
    bookStartTime: '',
    bookEndTime: '',
    canBook: false,
    hasBooked: null,
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
      Alert.alert('提示', '下单成功！', [{ text: '确定' }])
      await fetchData()
    } catch (e: any) {
      Alert.alert('购买失败', e?.message || '请稍后再试', [{ text: '确定' }])
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
        {/* ===== 沉浸式大图区域 ===== */}
        <View style={styles.heroSection}>
          <Image
            source={artwork?.cover}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
          {/* 底部渐变遮罩 */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)', colors.background]}
            style={styles.heroGradient}
            locations={[0, 0.6, 1]}
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
          <TouchableOpacity style={styles.buyButton} onPress={handleBuy} activeOpacity={0.85}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buyButtonGradient}
            >
              <Text style={styles.buyButtonText}>立即购买</Text>
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

  /* ===== 沉浸式大图 ===== */
  heroSection: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: IMAGE_HEIGHT * 0.45,
  },
  /* ===== 藏品名称 ===== */
  nameSection: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
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
