import Index from '@/components/ui/Avatar'
import LiquidGlassButton from '@/components/ui/LiquidGlassButton'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 2
const HEADER_HEIGHT = 60 // 不含安全区

const Profile = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('collected')

  const nftData = [
    {
      id: 1,
      title: 'CyberPunk #8821',
      price: '2.5 ETH',
      image: 'https://placehold.co/300x300/1a1a1a/FFF?text=NFT+1',
    },
    {
      id: 2,
      title: 'Bored Ape #120',
      price: '10.8 ETH',
      image: 'https://placehold.co/300x300/2b2b2b/FFF?text=NFT+2',
    },
    {
      id: 3,
      title: 'Azuki #999',
      price: '5.2 ETH',
      image: 'https://placehold.co/300x300/3c3c3c/FFF?text=NFT+3',
    },
    {
      id: 4,
      title: 'Doodle #45',
      price: '1.1 ETH',
      image: 'https://placehold.co/300x300/4d4d4d/FFF?text=NFT+4',
    },
  ]

  const renderNftCard = (item: any) => (
    <View key={item.id} style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>{item.price}</Text>
        </View>
      </View>
    </View>
  )

  // 计算 ScrollView 顶部留白：状态栏安全区 + header 高度
  const scrollPaddingTop = insets.top + HEADER_HEIGHT

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[styles.headerBar, { paddingTop: insets.top, height: insets.top + HEADER_HEIGHT }]}
      >
        <LiquidGlassButton icon="share" />
        <LiquidGlassButton icon="settings" onPress={() => router.push('/settings')} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: scrollPaddingTop }} // 关键：给内容留出头部空间
        showsVerticalScrollIndicator={false}
      >
        {/* 你的内容 */}
        <View style={styles.profileHeader}>
          <Index />
          <Text style={styles.username}>Shiie Yan</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.address}>0x1234...abcd</Text>
            <View style={styles.copyBadge}>
              <Text style={styles.copyText}>复制</Text>
            </View>
          </View>

          <Text style={styles.bio}>
            Digital artist & NFT collector. Exploring the metaverse one block at a time. 🚀
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12.5k</Text>
              <Text style={styles.statLabel}>粉丝</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>245</Text>
              <Text style={styles.statLabel}>关注</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>85.2</Text>
              <Text style={styles.statLabel}>Vol (ETH)</Text>
            </View>
          </View>

          <View style={styles.walletCard}>
            <View>
              <Text style={styles.walletLabel}>Total Balance</Text>
              <Text style={styles.walletValue}>$24,502.35</Text>
            </View>
            <TouchableOpacity style={styles.walletBtn}>
              <Text style={styles.walletBtnText}>Top Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabContainer}>
          {['收藏', '创作', '喜欢'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.gridContainer}>{nftData.map(renderNftCard)}</View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent', // 留透明让头部悬浮看见下面内容
  },

  // 头部：绝对定位悬浮
  headerBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    // paddingTop 与 height 在组件渲染时通过 inline style 覆盖（含安全区）
    backgroundColor: 'transparent', // 透明背景
    // 若想在 iOS 上确保触控优先，可增加：
    // elevation: 10, // android
    // shadow... // ios shadow if needed
  },

  // 其余样式（保留/略微调整）
  profileHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  address: {
    color: '#AAAAAA',
    fontSize: 14,
    marginRight: 8,
  },
  copyBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  copyText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bio: {
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666666',
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#333',
  },

  walletCard: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  walletLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  walletValue: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  walletBtn: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  walletBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: '#6C5CE7',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: '#333',
  },
  cardInfo: {
    padding: 12,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: '#666',
    fontSize: 12,
  },
  priceValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
})

export default Profile
