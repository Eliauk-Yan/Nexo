import { Stack } from 'expo-router'
import React from 'react'

const SettingLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="account" />
            <Stack.Screen name="general" />
            <Stack.Screen name="about" />
        </Stack>
    )
}

export default SettingLayout
