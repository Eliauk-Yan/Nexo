import { artworkApi } from '@/api'
import { LiquidGlassButton } from '@/components/ui'
import { borderRadius, colors, spacing, typography } from '@/config/theme'
import { ArtworkDetail } from '@/api/artwork'
import { GlassView } from 'expo-glass-effect'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'

const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price
    return isNaN(num) ? '0.0000' : num.toFixed(4)
}

const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const ArtworkDetailScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const [detail, setDetail] = useState<ArtworkDetail | null>(null)
    const [loading, setLoading] = useState(true)

    const rotateY = useSharedValue(0)

    useEffect(() => {
        if (id) {
            fetchDetail(Number(id))
        }
    }, [id])

    useEffect(() => {
        // Start rotation animation
        rotateY.value = withRepeat(
            withTiming(360, {
                duration: 8000,
                easing: Easing.linear,
            }),
            -1, // Infinite repeat
            false // Do not reverse
        )
    }, [])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { perspective: 1000 },
                { rotateY: `${rotateY.value}deg` }
            ],
        }
    })

    const fetchDetail = async (artworkId: number) => {
        try {
            setLoading(true)
            const data = await artworkApi.getDetail(artworkId)
            setDetail(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = () => {
        if (detail) {
            // TODO: Implement buy logic
        }
    }

    const renderHeader = (title?: string) => (
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
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
                onPress={() => { }}
                size={20}
                color="#fff"
                glassStyle="regular"
            />
        </View>
    )

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        )
    }

    if (!detail) {
        return (
            <View style={styles.container}>
                {renderHeader('藏品详情')}
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>未找到藏品信息</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {renderHeader()}

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: 100 + insets.bottom, paddingTop: insets.top + 60 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.imageSection}>
                    <Animated.View style={[styles.image3DContainer, animatedStyle]}>
                        <Image
                            source={detail.cover}
                            style={styles.cover}
                            contentFit="cover"
                        />
                    </Animated.View>
                    <Text style={styles.artworkName}>{detail.name}</Text>
                </View>

                <View style={styles.content}>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>藏品信息</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>限量</Text>
                            <Text style={styles.value}>{detail.quantity} 份</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>库存</Text>
                            <Text style={styles.value}>{detail.inventory ?? '-'} 份</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>版本号</Text>
                            <Text style={styles.value}>#{detail.version}</Text>
                        </View>
                        {detail.saleTime && (
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>发售时间</Text>
                                <Text style={styles.value}>{formatDate(detail.saleTime)}</Text>
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
                    <Text style={styles.bottomPrice}>{formatPrice(detail.price)} <Text style={styles.currency}>CNY</Text></Text>
                </View>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleAction}
                    activeOpacity={0.8}
                >
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
    loadingContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
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
    image3DContainer: {
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

export default ArtworkDetailScreen
