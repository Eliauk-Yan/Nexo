/**
 * Home screen
 */
import { artworkApi } from '@/api'
import { NFTList } from '@/components/business/NFTList'
import { Header } from '@/components/ui'
import { colors, spacing, typography } from '@/config/theme'
import { Artwork } from '@/types'
import React, { useCallback, useEffect, useState } from 'react'
import { RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { useRouter } from 'expo-router'

const Home = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const headerHeight = insets.top + 60
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTrending = useCallback(async () => {
    try {
      setLoading(true)
      const response = await artworkApi.list({
        currentPage: 1,
        pageSize: 10,
        keyword: '',
      })
      setArtworks(response)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTrending()
  }, [fetchTrending])

  const handleArtworkPress = (artwork: Artwork) => {
    router.push({ pathname: '/artwork-detail', params: { id: artwork.id } })
  }

  const handleSearch = (keyword: string) => {
    console.log('Search:', keyword)
  }

  const handleViewAll = () => {
    // router.push(ROUTES.MARKET.LIST)
    console.log('View all pressed')
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.sectionTitle}>热门藏品</Text>
    </View>
  )

  const renderFooter = () => (
    <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAll}>
      <Text style={styles.viewAllText}>查看全部</Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Header search={true} placeholder={'搜索收藏品'} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={[styles.contentWrapper]}>
          <NFTList
            data={artworks}
            loading={loading}
            onItemPress={handleArtworkPress}
            numColumns={2}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={fetchTrending}
                tintColor={colors.primary}
              />
            }
            contentContainerStyle={[styles.content, { paddingTop: headerHeight }]}
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
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
  },
})

export default Home
