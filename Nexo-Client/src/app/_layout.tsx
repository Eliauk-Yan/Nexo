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
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/verify"
          options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="settings/setting" options={{ headerShown: false }} />
        <Stack.Screen name="settings/account-security" options={{ headerShown: false }} />
        <Stack.Screen
          name="notification/notification"
          options={{ title: '通知', headerShown: false }}
        />
        <Stack.Screen name="artwork/detail" options={{ headerShown: false }} />
      </Stack>
    </>
  )
}

export default RootLayout
