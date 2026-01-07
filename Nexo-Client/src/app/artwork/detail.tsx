import { artworkApi } from '@/api'
import { LiquidGlassButton } from '@/components/ui'
import { colors, spacing, typography } from '@/config/theme'
import { ArtworkDetail } from '@/types'
import { formatDate, formatPrice } from '@/utils/validation'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ArtworkDetailScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const [detail, setDetail] = useState<ArtworkDetail | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            fetchDetail(Number(id))
        }
    }, [id])

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
        if (detail?.canBook && !detail.hasBooked) {
            console.log('Booking artwork:', detail.id)
            // TODO: Implement booking logic
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
            <View style={{ width: 44 }} />
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
            {renderHeader(detail.name)}

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
                showsVerticalScrollIndicator={false}
            >
                <Image
                    source={detail.cover}
                    style={styles.cover}
                    contentFit="cover"
                />

                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>{detail.name}</Text>
                        <Text style={styles.price}>{formatPrice(detail.price)} CNY</Text>
                    </View>

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
                                <Text style={styles.value}>{formatDate(detail.saleTime, 'YYYY-MM-DD HH:mm')}</Text>
                            </View>
                        )}
                    </View>

                    {(detail.bookStartTime || detail.bookEndTime) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>预约信息</Text>
                            {detail.bookStartTime && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>开始时间</Text>
                                    <Text style={styles.value}>{formatDate(detail.bookStartTime, 'MM-DD HH:mm')}</Text>
                                </View>
                            )}
                            {detail.bookEndTime && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>结束时间</Text>
                                    <Text style={styles.value}>{formatDate(detail.bookEndTime, 'MM-DD HH:mm')}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    <View style={styles.descriptionSection}>
                        <Text style={styles.sectionTitle}>藏品介绍</Text>
                        <Text style={styles.description}>
                            这里是藏品的详细介绍文案。作为一款独特的数字藏品，它具有极高的收藏价值。
                            (注：API目前没有返回description字段，此处为占位符)
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        (!detail.canBook || detail.hasBooked) && styles.disabledButton
                    ]}
                    onPress={handleAction}
                    disabled={!detail.canBook || !!detail.hasBooked}
                >
                    <Text style={styles.actionButtonText}>
                        {detail.hasBooked ? '已预约' : detail.canBook ? '立即预约' : '暂不可预约'}
                    </Text>
                </TouchableOpacity>
            </View>
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
    cover: {
        width: '100%',
        height: 400,
        backgroundColor: colors.backgroundSecondary,
    },
    content: {
        padding: spacing.lg,
        marginTop: -20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: colors.backgroundCard,
        minHeight: 500,
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
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xl,
    },
    title: {
        flex: 1,
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        marginRight: spacing.md,
    },
    price: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
    },
    section: {
        marginBottom: spacing.xl,
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
    descriptionSection: {
        marginBottom: spacing.xl,
    },
    description: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.normal,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.backgroundCard,
        paddingTop: spacing.md,
        paddingHorizontal: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    actionButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: 100,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: colors.backgroundTertiary,
    },
    actionButtonText: {
        color: '#000',
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
    },
})

export default ArtworkDetailScreen
