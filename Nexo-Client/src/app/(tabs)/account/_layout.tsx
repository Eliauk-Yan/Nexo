import { Stack } from 'expo-router'
import React from 'react'
import { useSession } from '@/utils/ctx'

const AuthLayout = () => {
  // 获取会话
  const { session } = useSession()

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {session ? (
        <Stack.Screen name="index" />
      ) : (
        <>
          <Stack.Screen name="sign-in" />
          <Stack.Screen
            name="verify"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </>
      )}
    </Stack>
  )
}

export default AuthLayout
