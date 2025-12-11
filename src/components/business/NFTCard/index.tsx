/**
 * NFT 卡片组件
 * 用于展示 NFT 的基本信息
 */

import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Feather from '@expo/vector-icons/Feather'
import { NFT } from '@/types'
import { colors, spacing, borderRadius, typography, shadows } from '@/config/theme'
import { formatPrice, formatRelativeTime } from '@/utils/validation'

interface NFTCardProps {
  nft: NFT
  onPress?: (nft: NFT) => void
  onLike?: (nft: NFT) => void
  showCollection?: boolean
}

export const NFTCard: React.FC<NFTCardProps> = ({
  nft,
  onPress,
  onLike,
  showCollection = false,
}) => {
  const handlePress = () => {
    onPress?.(nft)
  }

  const handleLike = (e: any) => {
    e?.stopPropagation()
    onLike?.(nft)
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: nft.image }} style={styles.image} resizeMode="cover" />
        {nft.status === 'listed' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>在售</Text>
          </View>
        )}
        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Feather
            name={nft.isLiked ? 'heart' : 'heart'}
            size={18}
            color={nft.isLiked ? colors.error : colors.textSecondary}
            fill={nft.isLiked ? colors.error : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {showCollection && nft.collectionName && (
          <Text style={styles.collectionName}>{nft.collectionName}</Text>
        )}
        <Text style={styles.name} numberOfLines={1}>
          {nft.name}
        </Text>

        {nft.price && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>价格</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>
                {formatPrice(nft.price)} {nft.currency || 'ETH'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Feather name="eye" size={12} color={colors.textTertiary} />
              <Text style={styles.statText}>{nft.views}</Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="heart" size={12} color={colors.textTertiary} />
              <Text style={styles.statText}>{nft.likes}</Text>
            </View>
          </View>
          <Text style={styles.time}>{formatRelativeTime(nft.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    color: colors.text,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  likeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.overlay,
    borderRadius: borderRadius.full,
    padding: spacing.xs,
  },
  content: {
    padding: spacing.md,
  },
  collectionName: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  priceContainer: {
    marginBottom: spacing.sm,
  },
  priceLabel: {
    color: colors.textTertiary,
    fontSize: typography.fontSize.xs,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceValue: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    color: colors.textTertiary,
    fontSize: typography.fontSize.xs,
  },
  time: {
    color: colors.textTertiary,
    fontSize: typography.fontSize.xs,
  },
})

