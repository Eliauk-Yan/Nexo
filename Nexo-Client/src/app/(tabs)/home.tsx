import { artworkApi } from '@/api'
import { NFTCard } from '@/components/ui/NFTCard'
import LiquidGlassSearchBar from '@/components/ui/LiquidGlassSearch'
import { colors, spacing, typography } from '@/config/theme'
import { Artwork } from '@/api/artwork'
import React, { useCallback, useEffect, useState } from 'react'
import { RefreshControl, StyleSheet, Text, View, FlatList } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { useRouter } from 'expo-router'
import Spinner from 'react-native-loading-spinner-overlay'

const Home = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const headerHeight = insets.top + 60

  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTrending = useCallback(async () => {
    try {
      setLoading(true)
      const response = await artworkApi.list({
        currentPage: 1,
        pageSize: 10,
        keyword: '',
      })
      setArtworks(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTrending().catch((err) => console.error(err))
  }, [fetchTrending])

  const handleArtworkPress = (artwork: Artwork) => {
    router.push({ pathname: '/artwork', params: { id: artwork.id } })
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.sectionTitle}>热门藏品</Text>
    </View>
  )

  const renderItem = ({ item }: { item: Artwork }) => (
    <View style={styles.itemContainer}>
      <NFTCard artwork={item} onPress={handleArtworkPress} />
    </View>
  )

  return (
    <View style={styles.container}>
      <Spinner visible={loading} />
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <LiquidGlassSearchBar
          placeholder={'搜索收藏品'}
          onSubmit={(t) => console.log('submit:', t)}
          onPressAction={() => router.push('/notification')}
          actionIcon="bell"
          glassStyle="regular"
          tintColor="rgba(255,255,255,0.12)"
          search={true}
        />
      </View>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={[styles.contentWrapper]}>
          <FlatList
            data={artworks}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            columnWrapperStyle={styles.row}
            ListHeaderComponent={renderHeader}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={fetchTrending}
                tintColor={colors.primary}
              />
            }
            contentContainerStyle={[styles.content, { paddingTop: headerHeight }]}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  content: {
    padding: spacing.sm,
    paddingBottom: spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    flex: 1,
    margin: spacing.xs,
    maxWidth: '48%',
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerWrap: {
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  viewAllButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  viewAllText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    backgroundColor: 'transparent',
  },
})

export default Home
