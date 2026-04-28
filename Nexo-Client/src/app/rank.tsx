import Feather from '@expo/vector-icons/Feather'
import { nftApi } from '@/api'
import { NFT, NFTClassify } from '@/api/nft'
import { showErrorAlert } from '@/utils/error'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageSourcePropType,
  useColorScheme,
} from 'react-native'
import { Image as RNImage } from 'expo-image'

const CLASSIFY_OPTIONS: NFTClassify[] = ['艺术类', '文博类', '景区类']

const RANK_BACKGROUNDS: Record<NFTClassify, ImageSourcePropType> = {
  艺术类: require('@/assets/images/classify/art.png'),
  文博类: require('@/assets/images/classify/history.png'),
  景区类: require('@/assets/images/classify/landscape.png'),
}

const formatDate = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}.${day}`
}

const getWeekRangeText = () => {
  const now = new Date()
  const day = now.getDay() || 7
  const start = new Date(now)
  start.setDate(now.getDate() - day + 1)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return `${formatDate(start)} ~ ${formatDate(end)}`
}

const getHeatValue = (artwork: NFT) => {
  const heat = Number(artwork.heat)
  if (!Number.isNaN(heat)) return heat

  const inventory = artwork.inventory ?? artwork.quantity
  return Math.max((artwork.quantity ?? 0) - (inventory ?? 0), 0)
}

const RankBadge = ({ rank }: { rank: number }) => {
  const isTopThree = rank <= 3
  return (
    <View style={[styles.rankBadge, isTopThree && styles.rankBadgeTop]}>
      <Text style={[styles.rankBadgeText, isTopThree && styles.rankBadgeTextTop]}>{rank}</Text>
    </View>
  )
}

const RankingItem = memo(function RankingItem({
  item,
  index,
  cardBg,
  imageBg,
  titleColor,
  subTextColor,
  limitBg,
  onPress,
}: {
  item: NFT
  index: number
  cardBg: string
  imageBg: string
  titleColor: string
  subTextColor: string
  limitBg: string
  onPress: (item: NFT) => void
}) {
  return (
    <TouchableOpacity activeOpacity={0.86} style={[styles.itemCard, { backgroundColor: cardBg }]} onPress={() => onPress(item)}>
      <View style={[styles.coverBox, { backgroundColor: imageBg }]}>
        <RNImage source={{ uri: item.cover }} style={styles.cover} contentFit="cover" />
        <RankBadge rank={index + 1} />
      </View>

      <View style={styles.itemInfo}>
        <Text numberOfLines={2} style={[styles.itemTitle, { color: titleColor }]}>
          {item.name}
        </Text>

        <View style={styles.tagRow}>
          <View style={styles.limitPrimary}>
            <Text style={styles.limitPrimaryText}>限量</Text>
          </View>
          <View style={[styles.limitTag, { backgroundColor: limitBg }]}>
            <Text style={[styles.limitText, { color: subTextColor }]}>{item.quantity}份</Text>
          </View>
          <View style={[styles.limitTag, { backgroundColor: limitBg }]}>
            <Text numberOfLines={1} style={[styles.limitText, { color: subTextColor }]}>
              {item.classify || '其他'}
            </Text>
          </View>
        </View>

        <View style={styles.metaLine}>
          <Feather name="user" size={14} color={subTextColor} />
          <Text numberOfLines={1} style={[styles.metaText, { color: subTextColor }]}>
            {item.source || '未知来源'}
          </Text>
        </View>
        <View style={styles.metaLine}>
          <Feather name="activity" size={14} color={subTextColor} />
          <Text style={[styles.metaText, { color: subTextColor }]}>热度 {getHeatValue(item)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
})

export default function RankPage() {
  const router = useRouter()
  const params = useLocalSearchParams<{ classify?: string }>()
  const colorScheme = useColorScheme()
  const [items, setItems] = useState<NFT[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false)

  const classify = useMemo<NFTClassify>(() => {
    return CLASSIFY_OPTIONS.includes(params.classify as NFTClassify)
      ? (params.classify as NFTClassify)
      : '艺术类'
  }, [params.classify])

  const isDark = colorScheme === 'dark'
  const systemBg = isDark ? '#000000' : '#F2F2F7'
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF'
  const titleColor = isDark ? '#FFFFFF' : '#111111'
  const subTextColor = isDark ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.5)'
  const imageBg = isDark ? 'rgba(255,255,255,0.08)' : '#EEEEEE'
  const limitBg = isDark ? 'rgba(255,255,255,0.08)' : '#EDEDED'

  const fetchRank = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true)
        }

        const response = await nftApi.list({
          currentPage: 1,
          pageSize: 30,
          classify,
        })

        const ranked = (Array.isArray(response) ? response : [])
          .slice()
          .sort((a, b) => getHeatValue(b) - getHeatValue(a))

        setItems(ranked)
      } catch (error) {
        showErrorAlert(error, '获取排行榜失败，请稍后重试。')
        setItems([])
      } finally {
        if (!silent) {
          setLoading(false)
        }
      }
    },
    [classify],
  )

  useEffect(() => {
    void fetchRank()
  }, [fetchRank])

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true)
      await fetchRank(true)
    } finally {
      setRefreshing(false)
    }
  }, [fetchRank])

  const empty = !loading ? (
    <View style={styles.empty}>
      <Feather name="bar-chart-2" size={46} color="#8E8E93" />
      <Text style={styles.emptyText}>暂无榜单藏品</Text>
    </View>
  ) : null

  return (
    <View style={[styles.screen, { backgroundColor: systemBg }]}>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
        }}
      />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.left" onPress={() => router.back()} />
      </Stack.Toolbar>

      <View style={styles.fixedHero} pointerEvents="none">
        <RNImage source={RANK_BACKGROUNDS[classify]} style={styles.heroBackground} contentFit="cover" />
        <View style={styles.heroVeil} />
        <View style={[styles.heroBottomShade, { backgroundColor: systemBg }]} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{classify}热榜</Text>
          <View style={styles.periodPill}>
            <Feather name="clock" size={15} color="rgba(255,255,255,0.82)" />
            <Text style={styles.periodText}>每周一更新，当前为 {getWeekRangeText()}</Text>
          </View>
        </View>
      </View>

      <FlatList
        style={styles.page}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={styles.content}
        data={items}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={empty}
        renderItem={({ item, index }) => (
          <RankingItem
            item={item}
            index={index}
            cardBg={cardBg}
            imageBg={imageBg}
            titleColor={titleColor}
            subTextColor={subTextColor}
            limitBg={limitBg}
            onPress={(artwork) => router.push({ pathname: '/nft', params: { id: artwork.id } })}
          />
        )}
        refreshControl={
          <RefreshControl
            tintColor="#FFFFFF"
            refreshing={refreshing}
            onRefresh={() => {
              handleRefresh().catch(() => {})
            }}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  content: {
    paddingTop: 330,
    paddingBottom: 28,
  },
  fixedHero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 360,
    justifyContent: 'flex-end',
    paddingHorizontal: 32,
    paddingBottom: 44,
    overflow: 'hidden',
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  heroVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  heroBottomShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
    opacity: 0.62,
  },
  heroContent: {
    zIndex: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 16,
  },
  periodPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  periodText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  itemCard: {
    minHeight: 132,
    borderRadius: 18,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coverBox: {
    width: 112,
    height: 112,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  rankBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.56)',
  },
  rankBadgeTop: {
    backgroundColor: '#FFF8D8',
  },
  rankBadgeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  rankBadgeTextTop: {
    color: '#5B4B20',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
    paddingVertical: 4,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  limitPrimary: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 5,
    backgroundColor: '#FFF8D8',
  },
  limitPrimaryText: {
    color: '#4C4324',
    fontSize: 13,
    fontWeight: '700',
  },
  limitTag: {
    maxWidth: 82,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  limitText: {
    fontSize: 13,
    fontWeight: '600',
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  metaText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 12,
  },
})
