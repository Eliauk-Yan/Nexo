import { Stack } from 'expo-router'
import React from 'react'

const LoginLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen
                name="verify"
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
        </Stack>
    )
}

export default LoginLayout
