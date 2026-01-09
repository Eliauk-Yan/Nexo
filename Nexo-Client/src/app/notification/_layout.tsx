import { Stack } from 'expo-router'
import React from 'react'

const NotificationLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="like" />
            <Stack.Screen name="follow" />
            <Stack.Screen name="comment" />
            <Stack.Screen name="activity" />
            <Stack.Screen name="collection" />
            <Stack.Screen name="subscription" />
        </Stack>
    )
}

export default NotificationLayout
