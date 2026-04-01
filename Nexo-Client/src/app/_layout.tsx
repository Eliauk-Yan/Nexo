// splash 必须最先导入，以便全局错误拦截器尽早注册
import { SplashScreenController } from '@/utils/splash'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import { SessionProvider, useSession } from '@/utils/ctx'

const RootLayout = () => {
  return (
    <SessionProvider>
      <StatusBar style="light" />
      <SplashScreenController />
      <AuthLayout />
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
      router.replace('/home/home')
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
        name="notification"
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
        name="nft"
        options={{
          title: '藏品详情',
          headerShown: true,
        }}
      />
    </Stack>
  )
}

export default RootLayout
