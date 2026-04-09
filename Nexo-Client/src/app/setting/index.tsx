import { authApi } from '@/api'
import { userApi } from '@/api/user'
import { useSession } from '@/utils/ctx'
import {
  Button,
  Host,
  Label,
  LabeledContent,
  Link,
  List,
  ProgressView,
  Section,
} from '@expo/ui/swift-ui'
import { listStyle, onTapGesture } from '@expo/ui/swift-ui/modifiers'
import { Stack, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert } from 'react-native'

const Setting = () => {
  const router = useRouter()
  const { signOut, session } = useSession()
  const isLogin = !!session
  const [accountLoading, setAccountLoading] = useState(false)

  const handleAccountPress = async () => {
    if (accountLoading) return

    setAccountLoading(true)

    try {
      await userApi.getUserProfile()
      router.push('/setting/account')
    } catch (error) {
      console.error('获取用户信息失败:', error)
      Alert.alert('提示', '获取用户信息失败，请稍后重试。')
    } finally {
      setAccountLoading(false)
    }
  }

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出当前账号吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: async () => {
          try {
            await authApi.logout()
          } catch (error) {
            console.error('退出登录失败:', error)
          } finally {
            signOut()
            router.replace('/home/home')
          }
        },
      },
    ])
  }

  const handleShareApp = () => {
    Alert.alert(
      '分享应用',
      '这里可以接入系统分享能力。当前演示版本保留为说明弹窗，方便答辩时讲解应用传播场景。',
      [{ text: '知道了', style: 'default' }],
    )
  }

  const privacyUrl = 'https://www.imut.edu.cn/'

  return (
    <>
      <Stack.Screen
        options={{
          title: '设置',
          headerLargeTitle: true,
        }}
      />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="chevron.left"
          onPress={() => router.back()}
        />
      </Stack.Toolbar>

      <Host style={{ flex: 1 }}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section title="账号与偏好">
            <LabeledContent
              label={<Label title="个人信息" systemImage="person.crop.circle" />}
              modifiers={[onTapGesture(handleAccountPress)]}
            >
              {accountLoading ? <ProgressView /> : null}
            </LabeledContent>

            <Label
              title="通用设置"
              systemImage="gearshape"
              modifiers={[onTapGesture(() => router.push('/setting/general'))]}
            />
          </Section>

          <Section title="关于">
            <Label
              title="关于我们"
              systemImage="info.circle"
              modifiers={[onTapGesture(() => router.push('/setting/about'))]}
            />

            <Button
              label="分享 App"
              systemImage="square.and.arrow.up"
              onPress={handleShareApp}
            />
          </Section>

          {isLogin && (
            <Section>
              <Button
                role="destructive"
                label="退出登录"
                onPress={handleLogout}
              />
            </Section>
          )}

          <Section title="隐私与法律">
            <Link
              label="个人信息共享清单"
              destination={privacyUrl}
            />
            <Link
              label="个人信息已收集清单"
              destination={privacyUrl}
            />
            <Link
              label="隐私政策"
              destination={privacyUrl}
            />
          </Section>
        </List>
      </Host>
    </>
  )
}

export default Setting
