import { View, Text, StyleSheet } from 'react-native'

const NoData = () => {
  return (
    <View style={styles.center}>
      <Text>暂无数据</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default NoData
