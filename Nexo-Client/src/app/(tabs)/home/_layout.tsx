import { Stack } from 'expo-router'

export default function AccountLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: '首页',
          headerShown: true,
        }}
      />
    </Stack>
  )
}
