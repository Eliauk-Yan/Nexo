import { borderRadius, colors, spacing, typography } from '@/config/theme'
import { Artwork } from '@/types'
import { formatPrice } from '@/utils/validation'
import { Image } from 'expo-image'
import React, { memo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface NFTCardProps {
  artwork: Artwork
  onPress?: (artwork: Artwork) => void
}

export const NFTCard = memo(function NFTCard({ artwork, onPress }: NFTCardProps) {
  const handlePress = () => onPress?.(artwork)

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.outerFrame}>
        <View style={styles.imageSection}>
          <View style={styles.imageFrame}>
            <Image source={artwork.cover} style={styles.image} contentFit="cover" transition={200} />
          </View>
          {artwork.saleTime && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>在售</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {artwork.name}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.priceValue}>{formatPrice(artwork.price)} CNY</Text>
            <Text style={styles.limitText}>限量 {artwork.quantity}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    width: '100%',
    marginBottom: spacing.sm,
    padding: spacing.xs,
  },
  outerFrame: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageSection: {
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
    borderWidth: 4,
    borderColor: '#e0e0e0', // Frame color
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    zIndex: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    paddingTop: spacing.xs,
  },
  name: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  priceValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  limitText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
})
