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
      <View style={styles.imageContainer}>
        <Image source={artwork.cover} style={styles.image} contentFit="cover" transition={200} />
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

        <View style={styles.priceContainer}>
          <Text style={styles.priceValue}>{formatPrice(artwork.price)} CNY</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    width: '100%',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: colors.backgroundSecondary,
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
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    padding: spacing.sm,
  },
  name: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
})
