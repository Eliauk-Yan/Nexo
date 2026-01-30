import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import { SessionProvider, useSession } from '@/utils/ctx'
import { SplashScreenController } from '@/utils/splash'

/**
 * 根布局组件
 * 包裹 SessionProvider 以提供全局认证状态
 */
const RootLayout = () => {
  return (
    <SessionProvider>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <SplashScreenController />
      <AuthLayout />
    </SessionProvider>
  )
}

/**
 * 认证导航布局 - 统一路由卫士
 */
const AuthLayout = () => {
  const { session, isLoading } = useSession()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!session && (segments[0] === '(auth)' || segments[2] === 'sign-in')) {
      // 如果未登录且试图进入需要登录的页面，由各页面自行处理或在此统一拦截
      // 这里暂时保持宽松，允许用户浏览首页和市场，但账户操作会触发登录
    } else if (session && segments[0] === '(auth)') {
      // 已登录且想去登录页 -> 返回首页
      router.replace('/(tabs)/home')
    }
  }, [session, segments, isLoading])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" options={{ presentation: 'fullScreenModal', animation: 'slide_from_right' }} />
      {/* 这里的 notification 等可以保持默认或根据需要配置 */}
      <Stack.Screen name="notification" options={{ title: '通知' }} />
    </Stack>
  )
}

export default RootLayout
