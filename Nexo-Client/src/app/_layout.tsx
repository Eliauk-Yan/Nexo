import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'

const RootLayout = () => {
  return (
    <>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="setting" options={{ headerShown: false }} />
        <Stack.Screen
          name="notification"
          options={{ title: '通知', headerShown: false }}
        />
        <Stack.Screen name="artwork-detail" options={{ headerShown: false }} />
        <Stack.Screen name="order" options={{ headerShown: false }} />
      </Stack>
    </>
  )
}

export default RootLayout
