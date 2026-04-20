import React, { useMemo, useState } from 'react'
import { Stack, useFocusEffect, useRouter } from 'expo-router'
import { Alert, Image as RNImage, StyleSheet, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import * as Haptics from 'expo-haptics'

import {
  Button,
  HStack,
  Host,
  Image,
  List,
  Popover,
  RNHostView,
  Section,
  Spacer,
  Text,
  VStack,
} from '@expo/ui/swift-ui'

import {
  buttonStyle,
  controlSize,
  font,
  foregroundStyle,
  listStyle,
  onTapGesture,
  padding,
  tint,
} from '@expo/ui/swift-ui/modifiers'

import { useSession } from '@/utils/ctx'
import { userApi } from '@/api/user'

export default function ProfileScreen() {
  const router = useRouter()
  const { user, session, signIn } = useSession()
  const isLogin = !!session

  const [isAccountPopoverPresented, setIsAccountPopoverPresented] = useState(false)

  useFocusEffect(
    React.useCallback(() => {
      if (!session) return

      let isActive = true
      userApi
        .getUserProfile()
        .then((profile) => {
          if (isActive) {
            signIn(session, profile)
          }
        })
        .catch((error) => {
          console.error('刷新用户信息失败', error)
        })

      return () => {
        isActive = false
      }
    }, [session, signIn]),
  )

  const handleCopy = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text)
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } catch {
        // Haptics might not be available
      }
      Alert.alert('提示', `${label}已复制到剪贴板`)
    } catch (error) {
      console.error('Clipboard error:', error)
      Alert.alert('复制失败', '无法自动复制，请长按文本进行手动选择复制。')
    }
  }

  const shortAccount = useMemo(() => {
    if (!user?.account) return '暂未绑定链地址'
    if (user.account.length <= 18) return user.account
    return `${user.account.slice(0, 8)}...${user.account.slice(-6)}`
  }, [user?.account])

  const inviteCode = user?.inviteCode || '暂无邀请码'

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
        }}
      />

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="gearshape" onPress={() => router.push('/setting')} />
      </Stack.Toolbar>

      <Host style={styles.host}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section>
            <VStack spacing={14} modifiers={[padding({ vertical: 8 })]}>
              <HStack spacing={12}>
                <RNHostView matchContents>
                  <View style={styles.avatarWrap}>
                    {isLogin && user?.avatarUrl ? (
                      <RNImage source={{ uri: user.avatarUrl }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Host matchContents>
                          <Image systemName="person.fill" size={28} color="#8E8E93" />
                        </Host>
                      </View>
                    )}
                  </View>
                </RNHostView>

                <VStack alignment="leading" spacing={6}>
                  <Text
                    modifiers={[font({ size: 24, weight: 'bold' }), foregroundStyle('primary')]}
                  >
                    {user?.nickName || '未登录'}
                  </Text>

                  {!isLogin ? (
                    <Text modifiers={[font({ size: 10 }), foregroundStyle('secondary')]}>
                      登录后可以查看更多功能
                    </Text>
                  ) : (
                    <Popover
                      isPresented={isAccountPopoverPresented}
                      onIsPresentedChange={setIsAccountPopoverPresented}
                      attachmentAnchor="trailing"
                      arrowEdge="top"
                    >
                      <Popover.Trigger>
                        <Button
                          label={shortAccount}
                          onPress={() => setIsAccountPopoverPresented(true)}
                          modifiers={[
                            buttonStyle('borderless'),
                            controlSize('mini'),
                            tint('#8E8E93'),
                          ]}
                        />
                      </Popover.Trigger>
                      <Popover.Content>
                        <VStack>
                          <Text modifiers={[font({ size: 10 }), foregroundStyle('secondary')]}>
                            链账户地址
                          </Text>
                          <Button
                            label={user?.account || '暂未绑定链地址'}
                            onPress={() => {
                              if (user?.account) {
                                handleCopy(user.account, '链账户地址')
                                setIsAccountPopoverPresented(false)
                              }
                            }}
                            modifiers={[
                              buttonStyle('plain'),
                              tint('primary'),
                              font({ size: 14, weight: 'medium' }),
                            ]}
                          />
                        </VStack>
                      </Popover.Content>
                    </Popover>
                  )}
                </VStack>

                <Spacer />

                <Button
                  label={isLogin ? '编辑资料' : '去登录'}
                  onPress={() =>
                    isLogin ? router.push('/setting/account') : router.push('/(auth)/sign-in')
                  }
                  modifiers={[buttonStyle('glassProminent'), controlSize('regular')]}
                />
              </HStack>
            </VStack>
          </Section>

          {isLogin && (
            <Section title="我的邀请">
              <HStack
                spacing={12}
                modifiers={[
                  padding({ vertical: 10 }),
                  onTapGesture(() => {
                    if (user?.inviteCode) {
                      handleCopy(user.inviteCode, '邀请码')
                    }
                  }),
                ]}
              >
                <Image systemName="person.2.fill" size={18} color="#0A84FF" />
                <Text modifiers={[font({ size: 16, weight: 'medium' })]}>邀请码</Text>
                <Spacer />
                <Text modifiers={[font({ size: 15 }), foregroundStyle('secondary')]}>
                  {inviteCode}
                </Text>
              </HStack>
            </Section>
          )}

          <Section title="快捷入口">
            <HStack
              spacing={12}
              modifiers={[padding({ vertical: 10 }), onTapGesture(() => router.push('/order'))]}
            >
              <Image systemName="bag.fill" size={18} color="#0A84FF" />
              <Text modifiers={[font({ size: 16, weight: 'medium' })]}>订单</Text>
              <Spacer />
              <Image systemName="chevron.right" size={13} color="#8E8E93" />
            </HStack>

            <HStack
              spacing={12}
              modifiers={[padding({ vertical: 10 }), onTapGesture(() => router.push('/my-assets'))]}
            >
              <Image systemName="rectangle.stack.fill" size={18} color="#0A84FF" />
              <Text modifiers={[font({ size: 16, weight: 'medium' })]}>我的数字资产</Text>
              <Spacer />
              <Image systemName="chevron.right" size={13} color="#8E8E93" />
            </HStack>

            <HStack
              spacing={12}
              modifiers={[
                padding({ vertical: 10 }),
                onTapGesture(() => router.push('/blockchain')),
              ]}
            >
              <Image systemName="link.circle.fill" size={18} color="#0A84FF" />
              <Text modifiers={[font({ size: 16, weight: 'medium' })]}>区块链查询</Text>
              <Spacer />
              <Image systemName="chevron.right" size={13} color="#8E8E93" />
            </HStack>
          </Section>
        </List>
      </Host>
    </>
  )
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
