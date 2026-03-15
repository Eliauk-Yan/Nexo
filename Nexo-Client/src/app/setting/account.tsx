import { LiquidGlassButton } from '@/components/ui'
import ListItem, { ListItemData } from '@/components/ui/ListItem'
import { colors, spacing } from '@/config/theme'
import { userApi, UserInfo } from '@/api/user'
import { useSession } from '@/utils/ctx'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spinner from 'react-native-loading-spinner-overlay'

const defaultProfile: UserInfo = {
  id: '',
  nickName: '未设置',
  avatarUrl: '',
  phone: '未绑定',
}

const AccountSecurity = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { session, user, signIn, isLoading: isSessionLoading } = useSession()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<UserInfo>(defaultProfile)

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await userApi.getUserProfile()
      // 用 session 中的 user 补全接口可能未返回的字段（如 phone）
      const merged = res ? { ...defaultProfile, ...user, ...res } : defaultProfile
      setProfile(merged)
      return res
    } finally {
      setLoading(false)
    }
  }

  // 未登录时进入即跳转登录页，不请求接口
  useEffect(() => {
    if (isSessionLoading) return
    if (!session) {
      router.replace('/(auth)/sign-in')
      return
    }
    fetchProfile().catch((err) => console.error(err))
  }, [isSessionLoading, session])

  const avatar = profile?.avatarUrl || ''
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
          // TODO: 实现账号注销逻辑
          console.log('Index deletion requested')
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
                      await fetchProfile()
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
                const newProfile = await fetchProfile()
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

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // 只选图片
      allowsEditing: true,
      aspect: [1, 1], // 1:1 裁减
      quality: 0.8, // 适当压缩质量
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
        const newProfile = await fetchProfile()
        if (session && newProfile) {
          signIn(session, { ...user, ...newProfile } as any)
        }
        Alert.alert('成功', '头像已更新')
      } catch {
        Alert.alert('失败', '头像更新失败，请重试')
      }
    }
  }

  const menuItems: ListItemData[] = [
    {
      label: '头像',
      type: 'avatar',
      value: avatar,
      onPress: updateAvatar,
    },
    {
      label: '昵称',
      type: 'text',
      value: nickname,
      onPress: updateUsername,
    },
    {
      label: '手机号',
      type: 'text',
      value: phone,
      onPress: () => {},
    },
    {
      label: '实名认证',
      type: 'text',
      value: isRealNameAuth ? '已认证' : '未认证',
      onPress: realNameAuthentication,
    },
    {
      label: '账号注销',
      type: 'delete',
      onPress: deleteAccount,
    },
  ]

  const buttonTop = insets.top + spacing.md

  // 未登录或仍在确认登录状态时，不渲染页面内容，直接跳转或显示加载
  if (isSessionLoading || !session) {
    return (
      <View style={[styles.container, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <Spinner visible={true} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Spinner visible={loading} />
      <View style={[styles.backButton, { top: buttonTop }]}>
        <LiquidGlassButton icon="chevron-left" onPress={() => router.back()} />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: buttonTop + 50 + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item) => (
          <ListItem key={item.label} item={item} />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
})

export default AccountSecurity
