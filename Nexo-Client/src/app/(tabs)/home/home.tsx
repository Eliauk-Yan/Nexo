import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import Feather from '@expo/vector-icons/Feather'
import { nftApi } from '@/api'
import { NFT, NFTClassify } from '@/api/nft'
import { showErrorAlert } from '@/utils/error'
import { Stack, useFocusEffect, useRouter } from 'expo-router'
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageSourcePropType,
  useColorScheme,
} from 'react-native'
import { Image as RNImage } from 'expo-image'

const formatPrice = (price: string | number) => {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return isNaN(num) ? '0.00' : num.toFixed(2)
}

const CLASSIFY_OPTIONS: Array<NFTClassify | '全部'> = ['全部', '艺术类', '文博类', '景区类']
const HOT_CLASSIFY_OPTIONS: NFTClassify[] = ['艺术类', '文博类', '景区类']
const RANK_ACCENTS: Record<NFTClassify, string> = {
  艺术类: '#5E5CE6',
  文博类: '#A16207',
  景区类: '#0F766E',
}
const RANK_BACKGROUNDS: Record<NFTClassify, ImageSourcePropType> = {
  艺术类: require('@/assets/images/classify/art.png'),
  文博类: require('@/assets/images/classify/history.png'),
  景区类: require('@/assets/images/classify/landscape.png'),
}

const getHeatValue = (artwork: NFT) => {
  const heat = Number(artwork.heat)
  if (!Number.isNaN(heat)) return heat

  const inventory = artwork.inventory ?? artwork.quantity
  return Math.max((artwork.quantity ?? 0) - (inventory ?? 0), 0)
}

const InlineNFTCard = memo(function InlineNFTCard({
  artwork,
  onPress,
  cardBg,
  imageBg,
  titleColor,
  subTextColor,
  priceBg,
  limitBg,
}: {
  artwork: NFT
  onPress?: (a: NFT) => void
  cardBg: string
  imageBg: string
  titleColor: string
  subTextColor: string
  priceBg: string
  limitBg: string
}) {
  const imageSource = { uri: artwork.cover }

  return (
    <TouchableOpacity
      style={styles.cardWrap}
      activeOpacity={0.85}
      onPress={() => onPress?.(artwork)}
    >
      <View style={[styles.cardInner, { backgroundColor: cardBg }]}>
        <View style={[styles.imageBox, { backgroundColor: imageBg }]}>
          <RNImage source={imageSource} style={styles.image} contentFit="cover" />
        </View>

        <View style={styles.content}>
          <Text numberOfLines={1} style={[styles.title, { color: titleColor }]}>
            {artwork.name}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.limitPillPrimary}>
              <Text style={styles.limitPrimaryText}>限量</Text>
            </View>
            <View style={[styles.limitPill, { backgroundColor: limitBg }]}>
              <Text style={[styles.limit, { color: subTextColor }]}>{artwork.quantity}份</Text>
            </View>
            <View style={[styles.limitPill, { backgroundColor: limitBg }]}>
              <Text style={[styles.limit, { color: subTextColor }]}>{artwork.classify || '其他'}</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.creatorRow}>
              <Feather name="user" size={13} color={subTextColor} />
              <Text numberOfLines={1} style={[styles.creatorText, { color: subTextColor }]}>
                {artwork.source || '未知来源'}
              </Text>
            </View>
            <View style={[styles.pricePill, { backgroundColor: priceBg }]}>
              <Text style={styles.priceText}>￥{formatPrice(artwork.price)}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
})

const Home = () => {
  const router = useRouter()
  const colorScheme = useColorScheme()

  const isDark = colorScheme === 'dark'
  const systemBg = isDark ? '#000000' : '#F2F2F7'
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#ffffff'
  const textMain = isDark ? '#fff' : '#111'
  const textSub = isDark ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.5)'
  const imageBg = isDark ? 'rgba(255,255,255,0.08)' : '#eeeeee'
  const priceBg = isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'
  const limitBg = isDark ? 'rgba(255,255,255,0.08)' : '#EDEDED'
  const searchBg = isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF'
  const searchBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(60,60,67,0.10)'

  const [artworks, setArtworks] = useState<NFT[]>([])
  const [hotRankings, setHotRankings] = useState<Record<NFTClassify, NFT[]>>({
    艺术类: [],
    文博类: [],
    景区类: [],
  })
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [searchText, setSearchText] = useState('')
  const [selectedClassify, setSelectedClassify] = useState<NFTClassify | '全部'>('全部')
  const hasLoadedInitiallyRef = useRef(false)

  const fetchTrending = useCallback(
    async (searchKeyword = '', silent = false) => {
      try {
        if (!silent) {
          setLoading(true)
        }

        const response = await nftApi.list({
          currentPage: 1,
          pageSize: 10,
          keyword: searchKeyword,
          classify: selectedClassify === '全部' ? undefined : selectedClassify,
        })

        setArtworks(Array.isArray(response) ? response : [])
      } catch (error) {
        showErrorAlert(error, '获取藏品失败，请稍后重试。')
        setArtworks([])
      } finally {
        if (!silent) {
          setLoading(false)
        }
      }
    },
    [selectedClassify],
  )

  const fetchHotRankings = useCallback(async () => {
    try {
      const entries = await Promise.all(
        HOT_CLASSIFY_OPTIONS.map(async (classify) => {
          const response = await nftApi.list({
            currentPage: 1,
            pageSize: 6,
            classify,
          })
          const ranked = (Array.isArray(response) ? response : [])
            .slice()
            .sort((a, b) => getHeatValue(b) - getHeatValue(a))
            .slice(0, 3)

          return [classify, ranked] as const
        }),
      )

      setHotRankings(Object.fromEntries(entries) as Record<NFTClassify, NFT[]>)
    } catch (error) {
      showErrorAlert(error, '获取热度排行榜失败，请稍后重试。')
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(searchText)
    }, 400)

    return () => clearTimeout(timer)
  }, [searchText])

  useFocusEffect(
    useCallback(() => {
      const isInitialLoad = !hasLoadedInitiallyRef.current
      hasLoadedInitiallyRef.current = true
      fetchTrending(keyword, isInitialLoad).catch(() => {})
      fetchHotRankings().catch(() => {})
    }, [fetchHotRankings, fetchTrending, keyword]),
  )

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true)
      await Promise.all([fetchTrending(keyword, true), fetchHotRankings()])
    } finally {
      setRefreshing(false)
    }
  }, [fetchHotRankings, fetchTrending, keyword])

  const renderItem = ({ item }: { item: NFT }) => (
    <View style={styles.itemContainer}>
      <InlineNFTCard
        artwork={item}
        cardBg={cardBg}
        imageBg={imageBg}
        titleColor={textMain}
        subTextColor={textSub}
        priceBg={priceBg}
        limitBg={limitBg}
        onPress={(a) => router.push({ pathname: '/nft', params: { id: a.id } })}
      />
    </View>
  )

  const renderEmpty = () => {
    if (loading) return null

    return (
      <View style={styles.emptyContainer}>
        <Feather name="inbox" size={48} color="#8E8E93" />
        <Text style={styles.emptyText}>暂无相关藏品</Text>
      </View>
    )
  }

  const listHeader = (
    <View style={styles.header}>
      <View style={[styles.searchBox, { backgroundColor: searchBg, borderColor: searchBorder }]}>
        <Feather name="search" size={18} color={textSub} />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="搜索藏品"
          placeholderTextColor={textSub}
          style={[styles.searchInput, { color: textMain }]}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchText.length > 0 ? (
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.searchClearButton}
            onPress={() => setSearchText('')}
          >
            <Feather name="x" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.sectionHeading}>
        <Feather name="trending-up" size={20} color="#FF9500" />
        <Text style={[styles.sectionTitle, { color: textMain }]}>藏品热榜</Text>
      </View>

      <View style={styles.rankRow}>
        {HOT_CLASSIFY_OPTIONS.map((classify) => (
          <TouchableOpacity
            key={classify}
            activeOpacity={0.86}
            style={[styles.rankCard, { backgroundColor: cardBg }]}
            onPress={() => router.push({ pathname: '/rank', params: { classify } })}
          >
            <View style={styles.rankContent}>
              <RNImage source={RANK_BACKGROUNDS[classify]} style={styles.rankCover} contentFit="cover" />
              <View style={[styles.rankTint, { backgroundColor: RANK_ACCENTS[classify] }]} />
              <Text style={styles.rankCardTitle}>{classify}</Text>
              <Text style={styles.rankCardSub}>本周热榜</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeading}>
        <Feather name="book-open" size={20} color="#5E5CE6" />
        <Text style={[styles.sectionTitle, { color: textMain }]}>藏品百科</Text>
      </View>

      <View style={styles.filterBar}>
        {CLASSIFY_OPTIONS.map((classify) => {
          const selected = selectedClassify === classify
          return (
            <TouchableOpacity
              key={classify}
              activeOpacity={0.8}
              style={[styles.filterButton, selected && styles.filterButtonActive]}
              onPress={() => setSelectedClassify(classify)}
            >
              <Text style={[styles.filterText, { color: selected ? '#FFFFFF' : textSub }]}>
                {classify}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )

  return (
    <>
      <Stack.Screen
        options={{
          title: '数字藏品',
          headerLargeTitle: true,
        }}
      />
      <FlatList
        style={[styles.rootContainer, { backgroundColor: systemBg }]}
        contentInsetAdjustmentBehavior="automatic"
        data={artworks}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              handleRefresh().catch(() => {})
            }}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />
    </>
  )
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  header: {
    paddingTop: 8,
    marginBottom: 16,
  },
  searchBox: {
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 0,
  },
  searchClearButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(142,142,147,0.72)',
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  rankRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  rankCard: {
    flex: 1,
    height: 88,
    borderRadius: 14,
    overflow: 'hidden',
  },
  rankContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  rankCover: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  rankTint: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.54,
  },
  rankCardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  rankCardSub: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.76)',
    fontSize: 13,
    fontWeight: '600',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  filterButton: {
    flex: 1,
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    borderColor: 'transparent',
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '800',
  },
  row: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    width: '48%',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    color: '#8E8E93',
  },
  cardWrap: {
    width: '100%',
  },
  cardInner: {
    borderRadius: 16,
    padding: 10,
  },
  imageBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    minHeight: 86,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  limitPillPrimary: {
    backgroundColor: '#FFF8D8',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  limitPill: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  limitPrimaryText: {
    color: '#4C4324',
    fontSize: 13,
    fontWeight: '700',
  },
  limit: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  creatorRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  creatorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pricePill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  priceText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '800',
  },
})

export default Home
