import React, { memo, useCallback, useRef, useState } from 'react'
import Feather from '@expo/vector-icons/Feather'
import { Image as RNImage } from 'expo-image'
import { Stack, useFocusEffect, useRouter } from 'expo-router'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native'

import { nftApi, userApi } from '@/api'
import { NFT } from '@/api/nft'
import { InviteRankInfo } from '@/api/user'
import { showErrorAlert } from '@/utils/error'
import { useSession } from '@/utils/ctx'

const formatPrice = (price: string | number) => {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return isNaN(num) ? '0.00' : num.toFixed(2)
}

const LatestArtworkCard = memo(function LatestArtworkCard({
  artwork,
  cardBg,
  imageBg,
  textMain,
  textSub,
  onPress,
}: {
  artwork: NFT
  cardBg: string
  imageBg: string
  textMain: string
  textSub: string
  onPress: (artwork: NFT) => void
}) {
  return (
    <TouchableOpacity
      style={styles.artworkCard}
      activeOpacity={0.86}
      onPress={() => onPress(artwork)}
    >
      <View style={[styles.artworkCardInner, { backgroundColor: cardBg }]}>
        <View style={[styles.artworkImageWrap, { backgroundColor: imageBg }]}>
          <RNImage source={{ uri: artwork.cover }} style={styles.artworkImage} contentFit="cover" />
        </View>
        <Text style={[styles.artworkName, { color: textMain }]} numberOfLines={1}>
          {artwork.name}
        </Text>
        <View style={styles.artworkMeta}>
          <Text style={styles.artworkPrice}>¥{formatPrice(artwork.price)}</Text>
          <Text style={[styles.artworkQuantity, { color: textSub }]}>限量 {artwork.quantity}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
})

export default function MainScreen() {
  const router = useRouter()
  const { session } = useSession()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isLogin = !!session

  const systemBg = isDark ? '#000000' : '#F2F2F7'
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF'
  const imageBg = isDark ? 'rgba(255,255,255,0.08)' : '#EEEEEE'
  const textMain = isDark ? '#FFFFFF' : '#111111'
  const textSub = isDark ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.5)'
  const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'

  const [rankingUsers, setRankingUsers] = useState<InviteRankInfo[]>([])
  const [myRank, setMyRank] = useState<number | null>(null)
  const [latestArtworks, setLatestArtworks] = useState<NFT[]>([])
  const hasLoadedRef = useRef(false)
  const lastLoginStateRef = useRef(isLogin)

  const fetchRanking = useCallback(async () => {
    try {
      const topRankings = await userApi.getInviteTopN(100)
      setRankingUsers(Array.isArray(topRankings) ? topRankings : [])

      if (isLogin) {
        const rank = await userApi.getMyInviteRank()
        setMyRank(typeof rank === 'number' ? rank : null)
      } else {
        setMyRank(null)
      }
    } catch (error) {
      showErrorAlert(error, '获取积分排行榜失败，请稍后重试。')
    }
  }, [isLogin])

  const fetchLatestArtworks = useCallback(async () => {
    try {
      const response = await nftApi.list({
        currentPage: 1,
        pageSize: 6,
      })
      setLatestArtworks(Array.isArray(response) ? response.slice(0, 6) : [])
    } catch (error) {
      showErrorAlert(error, '获取最新藏品失败，请稍后重试。')
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      const shouldReload = !hasLoadedRef.current || lastLoginStateRef.current !== isLogin
      if (!shouldReload) return

      hasLoadedRef.current = true
      lastLoginStateRef.current = isLogin
      fetchRanking().catch(() => {})
      fetchLatestArtworks().catch(() => {})
    }, [fetchLatestArtworks, fetchRanking, isLogin]),
  )

  return (
    <>
      <Stack.Screen
        options={{
          title: '首页',
          headerLargeTitle: true,
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: systemBg }]}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textMain }]}>积分排行榜</Text>
          <Text style={[styles.sectionSubtitle, { color: textSub }]}>用户积分排名</Text>
        </View>

        <View style={[styles.myRankingCard, { backgroundColor: cardBg }]}>
          <View style={styles.myRankingIcon}>
            <Feather name="award" size={20} color="#0A84FF" />
          </View>
          <View style={styles.myRankingInfo}>
            <Text style={[styles.myRankingName, { color: textMain }]}>
              {isLogin ? '我的排名' : '未登录'}
            </Text>
            <Text style={[styles.myRankingHint, { color: textSub }]}>
              {isLogin ? '邀请好友可提升积分排名' : '登录后查看我的积分排名'}
            </Text>
          </View>
          {isLogin ? (
            <View style={styles.myRankingMeta}>
              <Text style={styles.myRankingRank}>{myRank ? `第 ${myRank} 名` : '暂无排名'}</Text>
              <Text style={[styles.myRankingPoints, { color: textSub }]}>邀请积分</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.86}
              onPress={() => router.push('/(auth)/sign-in')}
            >
              <Text style={styles.loginButtonText}>去登录</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.rankingCard, { backgroundColor: cardBg }]}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {rankingUsers.length > 0 ? (
              rankingUsers.map((user, index) => (
                <View
                  key={`${user.nickName || 'user'}-${index}`}
                  style={[
                    styles.rankingRow,
                    index < rankingUsers.length - 1
                      ? { borderBottomColor: divider, borderBottomWidth: 1 }
                      : null,
                  ]}
                >
                  <View style={[styles.rankBadge, index < 3 ? styles.topRankBadge : null]}>
                    <Text style={[styles.rankText, index < 3 ? styles.topRankText : null]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.userAvatar}>
                    {user.avatar ? (
                      <RNImage
                        source={{ uri: user.avatar }}
                        style={styles.avatarImage}
                        contentFit="cover"
                      />
                    ) : (
                      <Feather name="user" size={16} color="#0A84FF" />
                    )}
                  </View>
                  <Text style={[styles.rankingName, { color: textMain }]} numberOfLines={1}>
                    {user.nickName || '匿名用户'}
                  </Text>
                  <Text style={styles.rankingPoints}>
                    {(user.inviteScore ?? 0).toLocaleString()} 分
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyRankingWrap}>
                <Feather name="users" size={34} color="#8E8E93" />
                <Text style={styles.emptyText}>暂无排行榜数据</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textMain }]}>最新藏品</Text>
          <Text style={[styles.sectionSubtitle, { color: textSub }]}>平台最新上架的数字藏品</Text>
        </View>

        {latestArtworks.length > 0 ? (
          <View style={styles.artworkGrid}>
            {latestArtworks.map((artwork) => (
              <LatestArtworkCard
                key={artwork.id}
                artwork={artwork}
                cardBg={cardBg}
                imageBg={imageBg}
                textMain={textMain}
                textSub={textSub}
                onPress={(item) => router.push({ pathname: '/nft', params: { id: item.id } })}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyWrap}>
            <Feather name="inbox" size={42} color="#8E8E93" />
            <Text style={styles.emptyText}>暂无最新藏品</Text>
          </View>
        )}
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  myRankingCard: {
    minHeight: 72,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  myRankingIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,132,255,0.12)',
  },
  myRankingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  myRankingName: {
    fontSize: 16,
    fontWeight: '700',
  },
  myRankingHint: {
    fontSize: 12,
    marginTop: 4,
  },
  myRankingMeta: {
    alignItems: 'flex-end',
  },
  myRankingRank: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '700',
  },
  myRankingPoints: {
    fontSize: 12,
    marginTop: 4,
  },
  loginButton: {
    minWidth: 78,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#0A84FF',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  rankingCard: {
    maxHeight: 360,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  rankingRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(142,142,147,0.16)',
  },
  topRankBadge: {
    backgroundColor: 'rgba(10,132,255,0.14)',
  },
  rankText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '700',
  },
  topRankText: {
    color: '#0A84FF',
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    backgroundColor: 'rgba(10,132,255,0.12)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  rankingName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  rankingPoints: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '700',
  },
  artworkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  artworkCard: {
    width: '48%',
  },
  artworkCardInner: {
    borderRadius: 16,
    padding: 10,
  },
  artworkImageWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  artworkName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  artworkMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  artworkPrice: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '700',
  },
  artworkQuantity: {
    fontSize: 11,
  },
  loadingWrap: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
  },
  emptyWrap: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRankingWrap: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 15,
    marginTop: 10,
  },
})
