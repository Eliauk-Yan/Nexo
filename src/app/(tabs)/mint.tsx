import { StyleSheet, Text, View } from 'react-native'
import NexoInput from '@/components/ui/NexoInput'
import { useState } from 'react'

const Mint = () => {
  const [value, setValue] = useState('')
  return (
    <View style={styles.container}>
      <Text style={styles.title}>发布</Text>
      <Text style={styles.title}>Value:{value}</Text>
      <NexoInput
        label="验证码"
        icon={'lock'}
        placeholder="请输入验证码"
        value={value}
        type={'sms'}
        InputOnChangeText={setValue}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
})

export default Mint
