import { useRouter } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const Index = () => {
  const router = useRouter()

  const handleNavigateToLogin = () => {
    router.push('/auth/login')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>首页</Text>

      <TouchableOpacity onPress={handleNavigateToLogin}>
        <Text style={{ color: '#fff' }}>跳转到登录页面</Text>
      </TouchableOpacity>
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

export default Index
