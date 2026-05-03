import { SplashScreenController } from '@/utils/splash'
import { SessionProvider, useSession } from '@/utils/ctx'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useIAP } from 'expo-iap'
import React, { useEffect } from 'react'
import { Platform } from 'react-native'

const IapProvider = ({ children }: { children: React.ReactNode }) => {
  useIAP()
  return <>{children}</>
}

const RootLayout = () => {
  return (
    <SessionProvider>
      <StatusBar style="light" />
      <SplashScreenController />
      {Platform.OS === 'ios' || Platform.OS === 'android' ? (
        <IapProvider>
          <AuthLayout />
        </IapProvider>
      ) : (
        <AuthLayout />
      )}
    </SessionProvider>
  )
}

const AuthLayout = () => {
  const { session, isLoading } = useSession()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (session && segments[0] === '(auth)') {
      router.replace('/account/account')
    }
  }, [session, segments, isLoading, router])

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="setting"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="order"
        options={{
          title: '订单',
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="assets"
        options={{
          title: '数字资产',
          headerBackTitle: '我的',
          headerTransparent: true,
          headerBackTitleStyle: {
            fontSize: 16,
            fontFamily: 'RobotoSlab_400Regular',
          },
        }}
      />

      <Stack.Screen
        name="nft"
        options={{
          title: '藏品详情',
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="rank"
        options={{
          title: '藏品热榜',
          headerShown: true,
        }}
      />
    </Stack>
  )
}

export default RootLayout
