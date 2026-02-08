import { artworkApi, authApi } from '@/api'
import { LiquidGlassButton } from '@/components/ui'
import { colors, spacing, typography } from '@/config/theme'
import { ArtworkDetail } from '@/api/artwork'
import { GlassView } from 'expo-glass-effect'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spinner from 'react-native-loading-spinner-overlay'

const Artwork = () => {
  // 获取路径中的id
  const { id } = useLocalSearchParams<{ id: string }>()
  // 路由器
  const router = useRouter()
  // 安全区域
  const insets = useSafeAreaInsets()
  // 加载中状态
  const [loading, setLoading] = useState(false)
  // 藏品详情状态
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
  // 令牌状态
  const [token, setToken] = useState('')

  /**
   * 获取数据方法
   */
  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await artworkApi.getDetail(Number(id))
      const token = await authApi.getToken({
        scene: 'artwork',
        key: id,
      })
      setToken(token)
      setArtwork(res)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 购买藏品方法
   */
  const handleBuy = async () => {
    setLoading(true)
    // TODO 调用购买接口
    setLoading(false)
  }

  useEffect(() => {
    fetchData().catch((e) => console.error('获取藏品详情错误：' + e))
  }, [])

  const renderHeader = (title?: string) => (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <LiquidGlassButton
        icon="chevron-left"
        onPress={() => router.back()}
        size={20}
        color="#fff"
        glassStyle="regular"
      />
      {title && <Text style={styles.headerTitle}>{title}</Text>}
      <LiquidGlassButton
        icon="share-nodes"
        onPress={() => {}}
        size={20}
        color="#fff"
        glassStyle="regular"
      />
    </View>
  )

  return (
    <View style={styles.container}>
      {renderHeader()}
      <Spinner visible={loading} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: insets.top + 50 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <Image source={artwork?.cover} style={styles.cover} contentFit="cover" />
          </View>
          <Text style={styles.artworkName}>{artwork?.name}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>藏品信息</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>限量</Text>
              <Text style={styles.value}>{artwork?.quantity} 份</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>库存</Text>
              <Text style={styles.value}>{artwork?.inventory ?? '-'} 份</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>版本号</Text>
              <Text style={styles.value}>#{artwork?.version}</Text>
            </View>
            {artwork?.saleTime && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>发售时间</Text>
                <Text style={styles.value}>{artwork?.saleTime}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <GlassView
        style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}
        glassEffectStyle="clear"
        isInteractive
      >
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>价格</Text>
          <Text style={styles.bottomPrice}>
            {artwork?.price} <Text style={styles.currency}>CNY</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.actionButton} onPress={handleBuy} activeOpacity={0.8}>
          <Text style={styles.actionButtonText}>立即购买</Text>
        </TouchableOpacity>
      </GlassView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  imageContainer: {
    width: 280,
    height: 380,
  },
  cover: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  content: {
    padding: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
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
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  section: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  value: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    justifyContent: 'center',
  },
  priceLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  bottomPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: -0.5,
  },
  currency: {
    fontSize: typography.fontSize.sm,
    fontWeight: 'normal',
    color: colors.textSecondary,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 100,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  artworkName: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    fontSize: typography.fontSize.lg,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1,
    opacity: 0.9,
  },
})

export default Artwork
