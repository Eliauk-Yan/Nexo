import { Stack, useRouter } from 'expo-router'
import React from 'react'
import { Host, Label, List, Section } from '@expo/ui/swift-ui'
import { listStyle, onTapGesture } from '@expo/ui/swift-ui/modifiers'

const NotificationPage = () => {
  const router = useRouter()

  return (
    <>
      <Stack.Screen
        options={{
          title: '消息中心',
          headerLargeTitle: true,
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.left" onPress={() => router.back()} />
      </Stack.Toolbar>

      <Host style={{ flex: 1 }}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section title="系统消息">
            <Label
              title="活动通知"
              systemImage="megaphone"
              modifiers={[onTapGesture(() => router.push('/notification/activity'))]}
            />
            <Label
              title="藏品消息"
              systemImage="shippingbox"
              modifiers={[onTapGesture(() => router.push('/notification/collection'))]}
            />
            <Label
              title="订阅消息"
              systemImage="envelope.badge"
              modifiers={[onTapGesture(() => router.push('/notification/subscription'))]}
            />
          </Section>
        </List>
      </Host>
    </>
  )
}

export default NotificationPage
