import { userApi, UserInfo } from '@/api/user'
import { authApi } from '@/api/auth'
import { useSession } from '@/utils/ctx'
import { showErrorAlert } from '@/utils/error'
import Feather from '@expo/vector-icons/Feather'
import * as ImagePicker from 'expo-image-picker'
import * as AppleAuthentication from 'expo-apple-authentication'
import { Stack, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import * as Haptics from 'expo-haptics'

const defaultProfile: UserInfo = {
  id: '',
  nickName: '未设置',
  avatarUrl: '',
  phone: '未绑定',
  account: '',
}

const InfoRow = ({
  label,
  value,
  borderColor,
  textColor,
  subTextColor,
  onPress,
}: {
  label: string
  value: string
  borderColor: string
  textColor: string
  subTextColor: string
  onPress?: () => void
}) => {
  const content = (
    <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
      <Text style={[styles.rowLabel, { color: textColor }]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.rowValue, { color: subTextColor }]}>
        {value}
      </Text>
      {onPress ? <Feather name="chevron-right" size={18} color="#8E8E93" /> : null}
    </View>
  )

  if (!onPress) return content

  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress}>
      {content}
    </TouchableOpacity>
  )
}

const AccountSecurity = () => {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const { session, user, signIn, isLoading: isSessionLoading } = useSession()
  const [profile, setProfile] = useState<UserInfo>(defaultProfile)

  const isDark = colorScheme === 'dark'
  const background = isDark ? '#000000' : '#F2F2F7'
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF'
  const textMain = isDark ? '#FFFFFF' : '#111111'
  const textSub = isDark ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.5)'
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  const imageBg = isDark ? 'rgba(255,255,255,0.08)' : '#EDEDED'

  const refreshProfile = useCallback(async () => {
    const res = await userApi.getUserProfile()
    const merged = res ? { ...defaultProfile, ...user, ...res } : defaultProfile
    setProfile(merged)
    return res
  }, [user])

  useEffect(() => {
    if (isSessionLoading) return
    if (!session) {
      router.replace('/(auth)/sign-in')
      return
    }
    refreshProfile().catch((err) => showErrorAlert(err, '获取个人信息失败，请稍后重试。'))
  }, [isSessionLoading, refreshProfile, router, session])

  const nickname = profile?.nickName || '未设置'
  const phone = profile?.phone || '未绑定'
  const inviteCode = profile?.inviteCode || user?.inviteCode || '暂无邀请码'
  const avatarUrl = profile?.avatarUrl || user?.avatarUrl || ''
  const isRealNameAuth = profile?.certification === true
  const isAppleBound = profile?.hasAppleBound === true

  const handleCopy = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text)
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } catch {
        // Haptics might not be available.
      }
      Alert.alert('提示', `${label}已复制到剪贴板`)
    } catch {
      Alert.alert('复制失败', '无法自动复制，请长按文本进行手动选择复制。')
    }
  }

  const realNameAuthentication = () => {
    if (isRealNameAuth) {
      Alert.alert('实名认证', '你已完成实名认证')
      return
    }
    Alert.prompt('实名认证', '请输入您的真实姓名', [
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
                    const newProfile = await refreshProfile()
                    if (session && newProfile) {
                      signIn(session, { ...user, ...newProfile })
                    }
                    Alert.alert('成功', '实名认证已完成')
                  } catch (err) {
                    showErrorAlert(err, '实名认证提交失败，请稍后重试。')
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
    ])
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
                showErrorAlert(err, '更新昵称失败，请稍后重试。')
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
      } catch (err) {
        showErrorAlert(err, '头像更新失败，请重试。')
      }
    }
  }

  const bindAppleAccount = async () => {
    if (isAppleBound) {
      Alert.alert('提示', '您已绑定 Apple 账号')
      return
    }
    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync()
      if (!isAvailable) {
        Alert.alert('提示', '当前设备不支持 Apple 登录')
        return
      }
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })
      await authApi.bindApple({
        identityToken: credential.identityToken!,
        authorizationCode: credential.authorizationCode,
        user: credential.fullName?.givenName
          ? `${credential.fullName?.familyName || ''}${credential.fullName?.givenName || ''}`
          : null,
      })
      Alert.alert('成功', '已成功绑定 Apple 账号')
      const newProfile = await refreshProfile()
      if (session && newProfile) {
        signIn(session, { ...user, ...newProfile })
      }
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        showErrorAlert(e, '绑定 Apple 账号失败，请稍后重试。')
      }
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: background }]}>
      <Stack.Screen
        options={{
          title: '个人信息',
          headerTransparent: true,
          headerShadowVisible: false,
        }}
      />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.left" onPress={() => router.back()} />
      </Stack.Toolbar>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarHero}>
          <TouchableOpacity
            activeOpacity={0.86}
            style={[styles.largeAvatarWrap, { backgroundColor: imageBg }]}
            onPress={updateAvatar}
          >
            {avatarUrl ? (
              <RNImage source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <Feather name="user" size={56} color="#8E8E93" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.changeAvatarButton}
            onPress={updateAvatar}
          >
            <Text style={styles.changeAvatarText}>更改</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <InfoRow
              label="昵称"
              value={nickname}
              borderColor={border}
              textColor={textMain}
              subTextColor={textSub}
              onPress={updateUsername}
            />
            <InfoRow
              label="手机号"
              value={phone}
              borderColor={border}
              textColor={textMain}
              subTextColor={textSub}
            />
            <InfoRow
              label="邀请码"
              value={inviteCode}
              borderColor="transparent"
              textColor={textMain}
              subTextColor={textSub}
              onPress={() => {
                if (profile?.inviteCode || user?.inviteCode) {
                  handleCopy(inviteCode, '邀请码').catch(() => {})
                }
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <InfoRow
              label="实名认证"
              value={isRealNameAuth ? '已认证' : '未认证'}
              borderColor="transparent"
              textColor={textMain}
              subTextColor={textSub}
              onPress={realNameAuthentication}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <InfoRow
              label="Apple 账号"
              value={isAppleBound ? '已绑定' : '点击绑定'}
              borderColor="transparent"
              textColor={textMain}
              subTextColor={textSub}
              onPress={bindAppleAccount}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  avatarHero: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 34,
  },
  largeAvatarWrap: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  changeAvatarButton: {
    marginTop: 18,
    minWidth: 64,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: 'rgba(10,132,255,0.12)',
  },
  changeAvatarText: {
    color: '#0A84FF',
    fontSize: 15,
    fontWeight: '700',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  section: {
    marginTop: 18,
  },
  card: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  infoRow: {
    minHeight: 58,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  rowValue: {
    flex: 1,
    marginLeft: 12,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default AccountSecurity
