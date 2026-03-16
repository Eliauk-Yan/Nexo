import React from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import { colors, spacing, typography, borderRadius } from '@/config/theme'
import { Asset } from '@/api/artwork'
import { MaterialCommunityIcons } from '@expo/vector-icons'

interface AssetCardProps {
    asset: Asset
    onPress?: (asset: Asset) => void
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onPress }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPress && onPress(asset)}
            style={styles.cardOuter}
        >
            <View style={styles.cardContainer}>
                <View style={styles.imageContainer}>
                    <View style={styles.imageFrame}>
                        <Image source={{ uri: asset.artworkCover }} style={styles.image} />
                    </View>

                    {/* Status Badge */}
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>
                            {asset.state === 'INIT' ? '铸造中' : asset.state === 'ACTIVE' ? '已持有' : '已失效'}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                        {asset.artworkName}
                    </Text>

                    <View style={styles.serialContainer}>
                        <MaterialCommunityIcons name="barcode-scan" size={12} color={colors.textSecondary} />
                        <Text style={styles.serialText} numberOfLines={1}>
                            #{asset.serialNumber?.substring(0, 8)}...
                        </Text>
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.priceContainer}>
                            <Text style={styles.priceLabel}>购入价</Text>
                            <Text style={styles.priceValue}>¥{asset.purchasePrice}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    cardOuter: {
        backgroundColor: 'transparent',
        width: '100%',
        padding: spacing.xs,
    },
    cardContainer: {
        backgroundColor: colors.backgroundCard,
        // 与账户页上方功能区域的圆角保持一致
        borderRadius: 28,
        padding: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.border,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        marginBottom: spacing.sm,
        position: 'relative',
    },
    imageFrame: {
        flex: 1,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        // 去掉中间的白色边框，只保留外层卡片边框
        borderWidth: 0,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    statusBadge: {
        position: 'absolute',
        top: spacing.xs,
        right: spacing.xs,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    statusText: {
        color: colors.primary,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
    },
    infoContainer: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    title: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    serialContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: spacing.sm,
    },
    serialText: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        fontFamily: 'monospace',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    priceContainer: {
        flexDirection: 'column',
    },
    priceLabel: {
        fontSize: 10,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    priceValue: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
    },
})
