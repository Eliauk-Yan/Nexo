/**
 * 首页
 * 展示热门 NFT、推荐内容等
 */

import React from 'react'
import { View, Text, StyleSheet, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTrendingNFTs } from '@/hooks/useMarket'
import { NFTList } from '@/components/business/NFTList'
import { colors, spacing, typography } from '@/config/theme'
import { ROUTES } from '@/constants/routes'
import { NFT } from '@/types'

const Home = () => {
  const router = useRouter()
  const { nfts, loading, refresh } = useTrendingNFTs(20)

  const handleNFTPress = (nft: NFT) => {
    // router.push(`${ROUTES.NFT.DETAIL}?id=${nft.id}`)
    console.log('NFT pressed:', nft.id)
  }

  const handleNFTLike = (nft: NFT) => {
    console.log('NFT liked:', nft.id)
    // 这里可以调用 API 进行点赞操作
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>发现</Text>
      <Text style={styles.subtitle}>探索热门数字藏品</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>热门推荐</Text>
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
        numColumns={2}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />
        }
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
  content: {
    paddingBottom: spacing.xl,
  },
  header: {
    padding: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
})

export default Home
