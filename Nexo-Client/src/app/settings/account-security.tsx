import { userApi } from '@/api'
import { LiquidGlassButton } from '@/components/ui'
import ListItem, { ListItemData } from '@/components/ui/ListItem'
import { colors, spacing } from '@/config/theme'
import { useAuthStore } from '@/stores/authState'
import { authStore } from '@/stores/authStore'
import { UpdateUserRequest, UserInfo, UserProfile } from '@/types'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import * as AppleAuthentication from 'expo-apple-authentication'

const AccountSecurity = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const { user, setUser } = useAuthStore()

  const fetchProfile = async () => {
    try {
      const data = await userApi.getUserProfile()
      setProfile(data)
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  }

  useEffect(() => {
    void fetchProfile()
  }, [])

  const avatar = profile?.avatarUrl || ''
  const nickname = profile?.nickName || '未设置'
  const phone = profile?.phone || '未绑定'
  const alipayAccount = profile?.alipay || '未绑定'
  const wechatAccount = profile?.wechat || '未绑定'
  const appleId = profile?.appleId || '未绑定'
  const isRealNameAuth = profile?.realNameAuth ?? false
  const hasPassword = !!profile?.password

  const deleteAccount = () => {
    Alert.alert('账号注销', '注销账号后，所有数据将被永久删除且无法恢复。确定要继续吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定注销',
        style: 'destructive',
        onPress: () => {
          // TODO: 实现账号注销逻辑
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
                  onPress: (idCard?: string) => {
                    if (!idCard) {
                      Alert.alert('提示', '请输入身份证号')
                      return
                    }
                    try {
                      userApi.realNameAuthentication({ realName: name, idCardNo: idCard })
                      void fetchProfile()
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
                const payload: UpdateUserRequest = { nickName: text }
                await userApi.updateNickName(payload)
                const updated = await userApi.getUserProfile()
                setProfile(updated)
                // 同步全局登录态：同时更新持久化存储和内存状态
                const mergedUser: UserInfo = {
                  id: updated.id,
                  nickName: updated.nickName,
                  avatarUrl: updated.avatarUrl,
                  role: user?.role ?? '',
                }
                // 先更新持久化存储，再更新内存状态
                await authStore.setUserInfo(mergedUser)
                setUser(mergedUser)
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
      Alert.alert('Permission required', 'Permission to access the media library is required.')
      return
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    console.log(result)

    if (!result.canceled) {
      // TODO 调用更新头像接口
    }
  }

  const updatePaymentPassword = () => {
    Alert.prompt(
      '修改密码',
      '请输入您的新密码',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认',
          onPress: async (text?: string) => {
            const password = text?.trim() ?? ''
            // 1. 必须是 6 位
            if (password.length !== 6) {
              Alert.alert('错误', '支付密码必须是 6 位数字')
              return
            }
            // TODO 调用修改支付密码接口
          },
        },
      ],
      'plain-text',
      '',
      'number-pad',
    )
  }

  const appleIdAuthentication = () => {
    Alert.alert('提示', '请使用 Apple 账号登录')
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
      label: '支付宝账号',
      type: 'text',
      value: alipayAccount,
      onPress: () => {},
    },
    {
      label: '微信账号',
      type: 'text',
      value: wechatAccount,
      onPress: () => {},
    },
    {
      label: 'AppleID',
      type: 'text',
      value: appleId,
      onPress: appleIdAuthentication,
    },
    {
      label: '实名认证',
      type: 'text',
      value: isRealNameAuth ? '已认证' : '未认证',
      onPress: realNameAuthentication,
    },
    {
      label: '支付密码',
      type: 'text',
      value: hasPassword ? '已设置' : '未设置',
      onPress: updatePaymentPassword,
    },
    {
      label: '账号注销',
      type: 'delete',
      onPress: deleteAccount,
    },
  ]

  const buttonTop = insets.top + spacing.md

  return (
    <View style={styles.container}>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  modalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.backgroundSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  modalButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
  },
  modalCancel: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalConfirm: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    color: colors.text,
    fontSize: 14,
  },
})

export default AccountSecurity
