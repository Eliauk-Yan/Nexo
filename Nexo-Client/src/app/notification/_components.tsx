import { Stack, useRouter } from 'expo-router'
import React from 'react'
import { Host, List, Section, Text } from '@expo/ui/swift-ui'
import { listStyle } from '@expo/ui/swift-ui/modifiers'

export const NotificationPlaceholderPage = ({
  title,
  description,
}: {
  title: string
  description: string
}) => {
  const router = useRouter()

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerLargeTitle: true,
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.left" onPress={() => router.back()} />
      </Stack.Toolbar>
      <Host style={{ flex: 1 }}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section>
            <Text>{description}</Text>
          </Section>
        </List>
      </Host>
    </>
  )
}
