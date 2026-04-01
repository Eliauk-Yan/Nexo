import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Image, useColorScheme } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import { Asset } from '@/api/artwork'
import { borderRadius, colors, spacing, typography } from '@/config/theme'

interface AssetCardProps {
  asset: Asset
  onPress?: (asset: Asset) => void
}

const getAssetStateLabel = (state?: string) => {
  switch (state) {
    case 'INIT':
      return '铸造中'
    case 'ACTIVE':
      return '已持有'
    default:
      return '已失效'
  }
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onPress }) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const cardBg = isDark ? colors.backgroundCard : '#FFFFFF'
  const cardBorder = isDark ? colors.border : 'rgba(15, 23, 42, 0.08)'
  const frameBg = isDark ? colors.backgroundSecondary : '#F3F4F6'
  const titleColor = isDark ? colors.text : '#111827'
  const secondaryText = isDark ? colors.textSecondary : '#6B7280'
  const badgeBg = isDark ? 'rgba(0,0,0,0.58)' : 'rgba(255,255,255,0.92)'
  const badgeBorder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15, 23, 42, 0.08)'
  const priceColor = '#0A84FF'
  const badgeText = '#0A84FF'
  const shadowOpacity = isDark ? 0.12 : 0.06

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress?.(asset)}
      style={styles.cardOuter}
    >
      <View
        style={[
          styles.cardContainer,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
            shadowOpacity,
          },
        ]}
      >
        <View style={styles.imageContainer}>
          <View style={[styles.imageFrame, { backgroundColor: frameBg }]}>
            <Image source={{ uri: asset.artworkCover }} style={styles.image} />
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: badgeBg,
                borderColor: badgeBorder,
              },
            ]}
          >
            <Text style={[styles.statusText, { color: badgeText }]}>{getAssetStateLabel(asset.state)}</Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
            {asset.artworkName}
          </Text>

          <View style={styles.serialContainer}>
            <MaterialCommunityIcons name="barcode-scan" size={12} color={secondaryText} />
            <Text style={[styles.serialText, { color: secondaryText }]} numberOfLines={1}>
              #{asset.serialNumber?.substring(0, 8)}...
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.priceContainer}>
              <Text style={[styles.priceLabel, { color: secondaryText }]}>买入价</Text>
              <Text style={[styles.priceValue, { color: priceColor }]}>¥{asset.purchasePrice}</Text>
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
    borderRadius: 28,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: spacing.sm,
    position: 'relative',
  },
  imageFrame: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
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
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  statusText: {
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
    marginBottom: 2,
  },
  priceValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
})
