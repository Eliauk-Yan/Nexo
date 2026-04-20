import { Stack } from 'expo-router'

export default function MainLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="main"
        options={{
          title: '首页',
          headerShown: true,
        }}
      />
    </Stack>
  )
}
