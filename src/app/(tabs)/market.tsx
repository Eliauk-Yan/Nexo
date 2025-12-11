/**
 * NFT 市场页面
 * 展示所有可交易的 NFT
 */

import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useMarketList } from '@/hooks/useMarket'
import { NFTList } from '@/components/business/NFTList'
import { colors, spacing, typography, borderRadius } from '@/config/theme'
import { NFT } from '@/types'

const Market = () => {
  const router = useRouter()
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'likes'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { nfts, loading, hasMore, refresh, loadMore } = useMarketList({
    page: 1,
    pageSize: 20,
    sortBy,
    sortOrder,
  })

  const handleNFTPress = (nft: NFT) => {
    console.log('NFT pressed:', nft.id)
    // router.push(`${ROUTES.NFT.DETAIL}?id=${nft.id}`)
  }

  const handleNFTLike = (nft: NFT) => {
    console.log('NFT liked:', nft.id)
  }

  const handleSortChange = (newSortBy: 'price' | 'date' | 'likes') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>NFT 市场</Text>
      <View style={styles.sortContainer}>
        {(['price', 'date', 'likes'] as const).map((sort) => (
          <TouchableOpacity
            key={sort}
            style={[
              styles.sortButton,
              sortBy === sort && styles.sortButtonActive,
            ]}
            onPress={() => handleSortChange(sort)}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === sort && styles.sortButtonTextActive,
              ]}
            >
              {sort === 'price' ? '价格' : sort === 'date' ? '时间' : '热度'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NFTList
        nfts={nfts}
        loading={loading}
        onItemPress={handleNFTPress}
        onItemLike={handleNFTLike}
        onLoadMore={loadMore}
        hasMore={hasMore}
        numColumns={2}
        showCollection
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sortContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sortButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  sortButtonTextActive: {
    color: colors.text,
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    paddingBottom: spacing.xl,
  },
})

export default Market
