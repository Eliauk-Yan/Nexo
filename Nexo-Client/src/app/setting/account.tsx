import { userApi, UserInfo } from '@/api/user'
import { useSession } from '@/utils/ctx'
import * as ImagePicker from 'expo-image-picker'
import { Stack, useRouter } from 'expo-router'
import { Button, Host, LabeledContent, List, Section, Text } from '@expo/ui/swift-ui'
import { listStyle, onTapGesture } from '@expo/ui/swift-ui/modifiers'
import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'

const defaultProfile: UserInfo = {
  id: '',
  nickName: '未设置',
  avatarUrl: '',
  phone: '未绑定',
  account: '',
}

const AccountSecurity = () => {
  const router = useRouter()
  const { session, user, signIn, isLoading: isSessionLoading } = useSession()
  const [profile, setProfile] = useState<UserInfo>(defaultProfile)

  const refreshProfile = async () => {
    const res = await userApi.getUserProfile()
    const merged = res ? { ...defaultProfile, ...user, ...res } : defaultProfile
    setProfile(merged)
    return res
  }

  useEffect(() => {
    if (isSessionLoading) return
    if (!session) {
      router.replace('/(auth)/sign-in')
      return
    }
    refreshProfile().catch((err) => console.error(err))
  }, [isSessionLoading, refreshProfile, router, session])

  const nickname = profile?.nickName || '未设置'
  const phone = profile?.phone || '未绑定'
  const isRealNameAuth = profile?.certification === true

  const deleteAccount = () => {
    Alert.alert('账号注销', '注销账号后，所有数据将被永久删除且无法恢复。确定要继续吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定注销',
        style: 'destructive',
        onPress: () => {
          console.log('Account deletion requested')
        },
      },
    ])
  }

  const realNameAuthentication = () => {
    if (isRealNameAuth) {
      Alert.alert('实名认证', '你已完成实名认证')
      return
    }
    Alert.prompt(
      '实名认证',
      '请输入您的真实姓名',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '下一步',
          onPress: async (name?: string) => {
            if (!name) {
              Alert.alert('提示', '姓名不能为空')
              return
            }
            Alert.prompt(
              '实名认证',
              '请输入您的身份证号',
              [
                { text: '取消', style: 'cancel' },
                {
                  text: '提交',
                  onPress: async (idCard?: string) => {
                    if (!idCard) {
                      Alert.alert('提示', '请输入身份证号')
                      return
                    }
                    try {
                      await userApi.realNameAuthentication({ realName: name, idCardNo: idCard })
                      await refreshProfile()
                    } catch (err) {
                      console.error('实名认证提交失败', err)
                      Alert.alert('提交失败', '请稍后重试')
                    }
                  },
                },
              ],
              'plain-text',
              '',
              'number-pad',
            )
          },
        },
      ],
      'plain-text',
      '',
    )
  }

  const updateUsername = () => {
    const current = profile?.nickName || ''
    Alert.prompt(
      '修改昵称',
      `当前昵称：${current || '未设置'}`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认',
          onPress: async (text?: string) => {
            if (text !== undefined) {
              try {
                await userApi.updateNickName({ nickName: text })
                const newProfile = await refreshProfile()
                if (session && newProfile) {
                  signIn(session, { ...user, ...newProfile } as any)
                }
              } catch (err) {
                console.error('更新昵称失败', err)
              }
            }
          },
        },
      ],
      'plain-text',
      current,
    )
  }

  const updateAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permissionResult.granted) {
      Alert.alert('权限错误', '我们需要访问相册的权限才能继续。')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      const asset = result.assets[0]
      const formData = new FormData()
      formData.append('avatar', {
        uri: asset.uri,
        name: asset.fileName || 'avatar.jpg',
        type: asset.mimeType || 'image/jpeg',
      } as any)

      try {
        await userApi.updateAvatar(formData)
        const newProfile = await refreshProfile()
        if (session && newProfile) {
          signIn(session, { ...user, ...newProfile } as any)
        }
        Alert.alert('成功', '头像已更新')
      } catch {
        Alert.alert('失败', '头像更新失败，请重试')
      }
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '个人信息',
          headerLargeTitle: true,
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.left" onPress={() => router.back()} />
      </Stack.Toolbar>
      <Host style={{ flex: 1 }}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section title="个人信息">
            <LabeledContent label="头像" modifiers={[onTapGesture(updateAvatar)]}>
              <Text>点击修改</Text>
            </LabeledContent>
            <LabeledContent label="昵称" modifiers={[onTapGesture(updateUsername)]}>
              <Text>{nickname}</Text>
            </LabeledContent>
            <LabeledContent label="手机号">
              <Text>{phone}</Text>
            </LabeledContent>
          </Section>

          <Section title="安全设置">
            <LabeledContent label="实名认证" modifiers={[onTapGesture(realNameAuthentication)]}>
              <Text>{isRealNameAuth ? '已认证' : '未认证'}</Text>
            </LabeledContent>
          </Section>

          <Section>
            <Button role="destructive" label="账号注销" onPress={deleteAccount} />
          </Section>
        </List>
      </Host>
    </>
  )
}

export default AccountSecurity
