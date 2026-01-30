import { Stack } from 'expo-router'
import React from 'react'
import { useSession } from '@/utils/ctx'

const AuthLayout = () => {
  // 获取会话
  const { session } = useSession()

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  )
}

export default AuthLayout
