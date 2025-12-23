import { StyleSheet, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Header } from '@/components/ui'
import { colors, spacing } from '@/config/theme'

const Mint = () => {
  const insets = useSafeAreaInsets()

  // 通知按钮高度 50px + spacing.sm (8px) + 额外间距
  const notificationButtonHeight = 50
  const contentTopPadding = insets.top + spacing.sm + notificationButtonHeight + spacing.md

  return (
    <View style={styles.container}>
      <Header />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.contentWrapper}>{/* 铸造页面内容 */}</View>
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
})

export default Mint
