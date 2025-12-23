import { userApi } from '@/api'
import { LiquidGlassButton } from '@/components/ui'
import ListItem, { ListItemData } from '@/components/ui/ListItem'
import { colors, spacing } from '@/config/theme'
import { useAuthStore } from '@/stores/authState'
import { authStore } from '@/stores/authStore'
import { UpdateUserRequest, UserInfo, UserProfile } from '@/types'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const AccountSecurity = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const { user, setUser } = useAuthStore()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userApi.getUserProfile()
        setProfile(data)
      } catch (error) {
        console.error('获取用户信息失败', error)
      }
    }
    fetchProfile()
  }, [])

  const avatar = profile?.avatarUrl || ''
  const nickname = profile?.nickName || '未设置'
  const phone = profile?.phone || '未绑定'
  const alipayAccount = profile?.alipay || '未绑定'
  const wechatAccount = profile?.wechat || '未绑定'
  const appleId = profile?.appleId || '未绑定'
  const isVerified = profile?.isVerified ?? false
  const hasPassword = !!profile?.password

  const handleDeleteAccount = () => {
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

  const handleNicknamePress = () => {
    const current = profile?.nickName || ''
    // iOS 原生 prompt
    if (Platform.OS === 'ios' && Alert.prompt) {
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
                  // 同步全局登录态
                  const mergedUser: UserInfo = {
                    id: updated.id,
                    nickName: updated.nickName,
                    avatarUrl: updated.avatarUrl,
                    role: user?.role ?? '',
                  }
                  await Promise.all([
                    // fix 感觉冗余
                    authStore.setUserInfo(mergedUser),
                    setUser(mergedUser),
                  ])
                } catch (err) {
                  console.error('更新昵称失败', err)
                }
              }
            },
          },
        ],
        'plain-text',
        current
      )
    }
  }

  const menuItems: ListItemData[] = [
    { 
      label: '头像', 
      type: 'avatar',
      value: avatar,
      onPress: () => {} 
    },
    { 
      label: '昵称', 
      type: 'text',
      value: nickname,
      onPress: handleNicknamePress, 
    },
    { 
      label: '手机号', 
      type: 'text',
      value: phone,
      onPress: () => {} 
    },
    { 
      label: '支付宝账号', 
      type: 'text',
      value: alipayAccount,
      onPress: () => {} 
    },
    { 
      label: '微信账号', 
      type: 'text',
      value: wechatAccount,
      onPress: () => {} 
    },
    { 
      label: 'AppleID', 
      type: 'text',
      value: appleId,
      onPress: () => {} 
    },
    { 
      label: '实名认证', 
      type: 'text',
      value: isVerified ? '已认证' : '未认证',
      onPress: () => {} 
    },
    { 
      label: '操作密码', 
      type: 'text',
      value: hasPassword ? '已设置' : '未设置',
      onPress: () => {} 
    },
    { 
      label: '账号注销', 
      type: 'delete',
      onPress: handleDeleteAccount, 
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
          <ListItem
            key={item.label}
            item={item}
          />
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

