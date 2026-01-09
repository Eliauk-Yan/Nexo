/**
 * Market screen
 */

import { artworkApi } from '@/api'
import { NFTList } from '@/components/business/NFTList'
import { Header } from '@/components/ui'
import { borderRadius, colors, spacing, typography } from '@/config/theme'
import { Artwork } from '@/types'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { useRouter } from 'expo-router'

const Market = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [sortBy, setSortBy] = useState<'price' | 'date'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(false)

  const notificationButtonHeight = 50
  const contentTopPadding = insets.top + spacing.sm + notificationButtonHeight + spacing.md

  const fetchMarketList = useCallback(async () => {
    try {
      setLoading(true)
      const response = await artworkApi.list({
        pageSize: 20,
        currentPage: 1,
        keyword: '',
      })
      setArtworks(response)
    } catch (error) {
      console.error('Fetch artwork list error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMarketList()
  }, [fetchMarketList])

  const sortedArtworks = useMemo(() => {
    const data = [...artworks]
    const direction = sortOrder === 'asc' ? 1 : -1

    data.sort((a, b) => {
      if (sortBy === 'price') {
        return direction * (a.price - b.price)
      }
      // Date sort
      const aTime = a.saleTime ? new Date(a.saleTime).getTime() : 0
      const bTime = b.saleTime ? new Date(b.saleTime).getTime() : 0
      return direction * (aTime - bTime)
    })

    return data
  }, [artworks, sortBy, sortOrder])

  const handleArtworkPress = (artwork: Artwork) => {
    router.push({ pathname: '/artwork-detail', params: { id: artwork.id } })
  }

  const handleSortChange = (newSortBy: 'price' | 'date') => {
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
        {(['price', 'date'] as const).map((sort) => (
          <TouchableOpacity
            key={sort}
            style={[styles.sortButton, sortBy === sort && styles.sortButtonActive]}
            onPress={() => handleSortChange(sort)}
          >
            <Text style={[styles.sortButtonText, sortBy === sort && styles.sortButtonTextActive]}>
              {sort === 'price' ? '价格' : '时间'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <Header search={true} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.contentWrapper}>
          <NFTList
            data={sortedArtworks}
            loading={loading}
            onItemPress={handleArtworkPress}
            numColumns={2}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={[styles.content, { paddingTop: contentTopPadding }]}
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
