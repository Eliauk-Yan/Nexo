import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import Feather from '@expo/vector-icons/Feather'
import { artworkApi } from '@/api'
import { Artwork } from '@/api/artwork'
import { Stack, useFocusEffect, useRouter } from 'expo-router'
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native'
import { Image as RNImage } from 'expo-image'

const formatPrice = (price: string | number) => {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return isNaN(num) ? '0.00' : num.toFixed(2)
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
  artwork: Artwork
  onPress?: (a: Artwork) => void
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

          {!!artwork.saleTime && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>在售</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text numberOfLines={1} style={[styles.title, { color: titleColor }]}>
            {artwork.name}
          </Text>

          <View style={styles.metaRow}>
            <View style={[styles.pricePill, { backgroundColor: priceBg }]}>
              <Text style={styles.price}>{formatPrice(artwork.price)}</Text>
              <Text style={[styles.unit, { color: subTextColor }]}>元</Text>
            </View>

            <View style={[styles.limitPill, { backgroundColor: limitBg }]}>
              <Text style={[styles.limit, { color: subTextColor }]}>限量 {artwork.quantity}</Text>
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

  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [searchText, setSearchText] = useState('')
  const hasLoadedInitiallyRef = useRef(false)

  const fetchTrending = useCallback(async (searchKeyword = '', silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
      }

      const response = await artworkApi.list({
        currentPage: 1,
        pageSize: 10,
        keyword: searchKeyword,
      })

      setArtworks(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('获取藏品失败:', error)
      setArtworks([])
    } finally {
      if (!silent) {
        setLoading(false)
      }
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
    }, [fetchTrending, keyword]),
  )

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true)
      await fetchTrending(keyword, true)
    } finally {
      setRefreshing(false)
    }
  }, [fetchTrending, keyword])

  const renderItem = ({ item }: { item: Artwork }) => (
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

  return (
    <>
      <Stack.Screen
        options={{
          title: '数字藏品',
          headerLargeTitle: true,
        }}
      />

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="bell" onPress={() => router.push('/notification')} />
      </Stack.Toolbar>

      <Stack.SearchBar
        placeholder="搜索藏品"
        onChangeText={(event) => setSearchText(event.nativeEvent.text)}
      />

      <FlatList
        style={[styles.rootContainer, { backgroundColor: systemBg }]}
        contentInsetAdjustmentBehavior="automatic"
        data={artworks}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{
          paddingHorizontal: 16,
          flexGrow: 1,
        }}
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
    minHeight: 56,
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
    justifyContent: 'space-between',
  },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
  },
  unit: {
    fontSize: 11,
  },
  limitPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  limit: {
    fontSize: 11,
  },
})

export default Home
