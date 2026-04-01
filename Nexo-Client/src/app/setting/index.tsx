import { authApi } from '@/api'
import { userApi } from '@/api/user'
import { useSession } from '@/utils/ctx'
import { Stack, useRouter } from 'expo-router'
import {
  Host,
  List,
  Section,
  Button,
  Label,
  Link,
  LabeledContent,
  ProgressView,
} from '@expo/ui/swift-ui'
import { listStyle, onTapGesture } from '@expo/ui/swift-ui/modifiers'
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
      // 预加载用户数据，加载完再跳转
      await userApi.getUserProfile()
      router.push('/setting/account')
    } catch (err) {
      console.error('获取用户信息失败', err)
      Alert.alert('提示', '获取用户信息失败，请重试')
    } finally {
      setAccountLoading(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: async () => {
          try {
            await authApi.logout()
          } catch (error) {
            console.error('退出登录失败：', error)
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
      '分享 APP',
      '如果这是正式上线的产品，这里会唤起系统分享面板。\n\n当前为毕业设计演示版，可以向老师口头"安利"一下就行啦～',
      [{ text: '知道了', style: 'default' }],
    )
  }

  const nepuUrl = 'https://www.imut.edu.cn/'

  return (
    <>
      <Stack.Screen
        options={{
          title: '设置',
          headerLargeTitle: true,
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.left" onPress={() => router.back()} />
      </Stack.Toolbar>
      <Host style={{ flex: 1 }}>
        <List modifiers={[listStyle('insetGrouped')]}>
          {/* 账号管理 */}
          <Section title="账号管理">
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

          {/* 关于 */}
          <Section title="关于">
            <Label
              title="关于我们"
              systemImage="info.circle"
              modifiers={[onTapGesture(() => router.push('/setting/about'))]}
            />
            <Button label="分享APP" systemImage="square.and.arrow.up" onPress={handleShareApp} />
          </Section>

          {/* 退出登录 */}
          {isLogin && (
            <Section>
              <Button role="destructive" label="退出登录" onPress={handleLogout} />
            </Section>
          )}

          {/* 隐私与法律 */}
          <Section title="隐私与法律">
            <Link label="个人信息共享清单" destination={nepuUrl} />
            <Link label="个人信息已收集清单" destination={nepuUrl} />
            <Link label="隐私与政策" destination={nepuUrl} />
          </Section>
        </List>
      </Host>
    </>
  )
}

export default Setting
