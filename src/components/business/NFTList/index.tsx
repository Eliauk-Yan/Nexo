/**
 * NFT 列表组件
 * 用于展示多个 NFT 卡片
 */

import React from 'react'
import { View, FlatList, StyleSheet, ActivityIndicator, Text, RefreshControl } from 'react-native'
import { NFTCard } from '../NFTCard'
import { NFT } from '@/types'
import { colors, spacing } from '@/config/theme'

interface NFTListProps {
  nfts: NFT[]
  loading?: boolean
  onItemPress?: (nft: NFT) => void
  onItemLike?: (nft: NFT) => void
  onLoadMore?: () => void
  hasMore?: boolean
  showCollection?: boolean
  numColumns?: number
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null
  refreshControl?: React.ReactElement<RefreshControl>
  contentContainerStyle?: any
}

export const NFTList: React.FC<NFTListProps> = ({
  nfts,
  loading = false,
  onItemPress,
  onItemLike,
  onLoadMore,
  hasMore = false,
  showCollection = false,
  numColumns = 2,
  ListHeaderComponent,
  refreshControl,
  contentContainerStyle,
}) => {
  const renderItem = ({ item }: { item: NFT }) => (
    <View style={styles.itemContainer}>
      <NFTCard
        nft={item}
        onPress={onItemPress}
        onLike={onItemLike}
        showCollection={showCollection}
      />
    </View>
  )

  const renderFooter = () => {
    if (!loading) return null
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    )
  }

  const renderEmpty = () => {
    if (loading) return null
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暂无数据</Text>
      </View>
    )
  }

  const handleEndReached = () => {
    if (hasMore && !loading && onLoadMore) {
      onLoadMore()
    }
  }

  return (
    <FlatList
      data={nfts}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      contentContainerStyle={[styles.container, contentContainerStyle]}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      refreshControl={refreshControl}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    flex: 1,
    maxWidth: '48%',
    marginBottom: spacing.md,
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
})

