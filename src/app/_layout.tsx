import { Stack } from 'expo-router'
import 'react-native-reanimated'

const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="auth/login"
        options={{
          headerShown: false,
          gestureEnabled: false, // 禁用手势返回
        }}
      />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  )
}

export default RootLayout
