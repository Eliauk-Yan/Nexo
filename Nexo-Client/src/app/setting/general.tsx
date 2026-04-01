import { Stack, useRouter } from 'expo-router'
import { Host, List, Section, Toggle, LabeledContent, Text } from '@expo/ui/swift-ui'
import { listStyle } from '@expo/ui/swift-ui/modifiers'
import React, { useEffect, useState } from 'react'
import { Appearance } from 'react-native'

type ThemeMode = 'system' | 'light' | 'dark'

const GeneralSetting = () => {
  const router = useRouter()

  const [pushNotification, setPushNotification] = useState(true)

  // 默认跟随系统
  const [themeMode, setThemeMode] = useState<ThemeMode>('system')

  useEffect(() => {
    if (themeMode === 'system') {
      Appearance.setColorScheme(null as any)
      return
    }
    Appearance.setColorScheme(themeMode)
  }, [themeMode])

  return (
    <>
      <Stack.Screen
        options={{
          title: '通用设置',
          headerLargeTitle: true,
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.left" onPress={() => router.back()} />
      </Stack.Toolbar>

      <Host style={{ flex: 1 }}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section title="外观">
            <Toggle
              label="跟随系统"
              systemImage="iphone"
              isOn={themeMode === 'system'}
              onIsOnChange={(value) => {
                if (value) {
                  setThemeMode('system')
                } else {
                  setThemeMode('light')
                }
              }}
            />
            <Toggle
              label="夜间模式"
              systemImage="moon.fill"
              isOn={themeMode === 'dark'}
              onIsOnChange={(value) => {
                if (value) {
                  setThemeMode('dark')
                } else {
                  setThemeMode('light')
                }
              }}
            />
            <LabeledContent label="当前外观模式">
              <Text>
                {themeMode === 'system' ? '跟随系统' : themeMode === 'dark' ? '深色' : '浅色'}
              </Text>
            </LabeledContent>
          </Section>
          <Section title="通知">
            <Toggle
              label="推送通知"
              systemImage="bell.fill"
              isOn={pushNotification}
              onIsOnChange={setPushNotification}
            />
          </Section>
          <Section title="关于">
            <LabeledContent label="版本号">
              <Text>1.0.0</Text>
            </LabeledContent>
            <LabeledContent label="构建版本">
              <Text>2026.03.31</Text>
            </LabeledContent>
          </Section>
        </List>
      </Host>
    </>
  )
}

export default GeneralSetting
