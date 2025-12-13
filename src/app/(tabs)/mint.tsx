import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ButtonHeader } from '@/components/ui'
import { colors } from '@/config/theme'

const Mint = () => {
  return (
    <View style={styles.container}>
      <ButtonHeader />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {/* 铸造页面内容 */}
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
})

export default Mint
