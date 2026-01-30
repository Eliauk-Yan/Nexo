import React from 'react'
import {
  View,
  FlatList,
  FlatListProps,
  StyleSheet,
  ActivityIndicator,
  RefreshControlProps,
} from 'react-native'
import { NFTCard } from '../NFTCard'
import { Artwork } from '@/api/artwork'
import { spacing } from '@/config/theme'

interface NFTListProps extends Omit<FlatListProps<Artwork>, 'data' | 'renderItem'> {
  data: Artwork[]
  loading?: boolean
  onItemPress?: (artwork: Artwork) => void
  onLoadMore?: () => void
  hasMore?: boolean
  refreshControl?: React.ReactElement<RefreshControlProps>
}

export const NFTList: React.FC<NFTListProps> = ({
  data,
  loading = false,
  onItemPress,
  onLoadMore,
  hasMore = false,
  refreshControl,
  contentContainerStyle,
  numColumns = 2,
  ...restProps
}) => {
  const renderItem = ({ item }: { item: Artwork }) => (
    <View style={styles.itemContainer}>
      <NFTCard
        artwork={item}
        onPress={onItemPress}
      />
    </View>
  )

  const renderFooter = () => {
    if (!loading) return <View style={styles.footer} />
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" />
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
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => String(item.id)}
      numColumns={numColumns}
      contentContainerStyle={[styles.container, contentContainerStyle]}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      ListFooterComponent={renderFooter}
      refreshControl={refreshControl}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      {...restProps}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
  },
  row: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    flex: 1,
    margin: spacing.xs,
    maxWidth: '48%',
  },
  footer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
})
