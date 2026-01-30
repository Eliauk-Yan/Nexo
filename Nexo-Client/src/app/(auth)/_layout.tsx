import { Stack } from 'expo-router'
import React from 'react'

/**
 * 认证流程布局
 * 设置统一的滑动动画
 */
export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right', // 从右侧滑入
                contentStyle: { backgroundColor: 'transparent' },
            }}
        >
            <Stack.Screen name="sign-in" />
            <Stack.Screen name="verify" />
        </Stack>
    )
}
