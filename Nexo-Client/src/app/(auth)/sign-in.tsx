import { Ionicons } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { Alert, StyleSheet, Text as RNText, TouchableOpacity, View } from 'react-native'
import Spinner from 'react-native-loading-spinner-overlay'

import { authApi } from '@/api'
import { LiquidGlassButton } from '@/components/ui'
import { useSession } from '@/utils/ctx'
import * as AppleAuthentication from 'expo-apple-authentication'
import {
  Button,
  Host,
  HStack,
  List,
  Section,
  TextField,
  VStack,
  Text,
  RNHostView,
} from '@expo/ui/swift-ui'
import {
  disabled,
  font,
  foregroundStyle,
  listRowBackground,
  listStyle,
} from '@expo/ui/swift-ui/modifiers'

export default function SignIn() {
  const router = useRouter()
  const { signIn } = useSession()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const isPhoneValid = useMemo(() => {
    return phone.trim().length === 11 && /^1[3-9]\d{9}$/.test(phone)
  }, [phone])

  const isCodeValid = useMemo(() => code.trim().length === 6, [code])
  const canSendCode = isPhoneValid && !loading
  const canLogin = isPhoneValid && isCodeValid && !loading

  const confirmAgreement = () => {
    if (agreed) return Promise.resolve(true)

    return new Promise<boolean>((resolve) => {
      Alert.alert(
        '用户协议与隐私政策',
        '请阅读并同意《用户协议》和《隐私政策》后继续。',
        [
          {
            text: '不同意',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: '同意',
            onPress: () => {
              setAgreed(true)
              resolve(true)
            },
          },
        ],
        {
          cancelable: true,
          onDismiss: () => resolve(false),
        },
      )
    })
  }

  const handleSendCode = async () => {
    if (!canSendCode) return
    if (!(await confirmAgreement())) return

    setLoading(true)
    try {
      await authApi.sendVerificationCode(phone)
      Alert.alert('提示', `验证码已发送至 ${phone}`)
    } catch (error) {
      Alert.alert('提示', error instanceof Error ? error.message : '发送验证码失败')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!canLogin) return
    if (!(await confirmAgreement())) return

    setLoading(true)
    try {
      const response = await authApi.login({
        phone,
        verifyCode: code,
        rememberMe: true,
        inviteCode: inviteCode.trim() || undefined,
      })
      const token = response.token
      let userInfo = response.userInfo

      if (!userInfo?.nickName && !userInfo?.avatarUrl) {
        try {
          userInfo = await authApi.getCurrentUser(token)
        } catch {
          userInfo = { id: '', nickName: '', avatarUrl: '', role: '' }
        }
      }

      signIn(token, userInfo!)
    } catch (error) {
      Alert.alert('登录失败', error instanceof Error ? error.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAppleLogin = async () => {
    if (loading) return
    if (!(await confirmAgreement())) return

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
      setLoading(true)
      try {
        const response = await authApi.appleLogin({
          identityToken: credential.identityToken!,
          authorizationCode: credential.authorizationCode,
          user: credential.fullName?.givenName
            ? `${credential.fullName?.familyName || ''}${credential.fullName?.givenName || ''}`
            : null,
        })

        const token = response.token
        let userInfo = response.userInfo

        if (!userInfo?.nickName && !userInfo?.avatarUrl) {
          try {
            userInfo = await authApi.getCurrentUser(token)
          } catch {
            userInfo = { id: '', nickName: '', avatarUrl: '', role: '' }
          }
        }

        signIn(token, userInfo!)
      } finally {
        setLoading(false)
      }
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // 用户取消，可以忽略
      }
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '登录',
          headerTransparent: true,
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.left" onPress={() => router.back()} />
      </Stack.Toolbar>

      <Spinner visible={loading} />

      <Host style={styles.container}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section modifiers={[listRowBackground('clear')]}>
            <VStack alignment="leading" spacing={4}>
              <Text modifiers={[font({ size: 70, weight: 'bold' }), foregroundStyle('primary')]}>
                NEXO
              </Text>

              <Text modifiers={[font({ size: 14 }), foregroundStyle('secondary')]}>
                开启数字藏品之旅
              </Text>
            </VStack>
          </Section>

          <Section title="手机号登录">
            <HStack spacing={12}>
              <TextField
                placeholder="请输入手机号"
                keyboardType="default"
                autocorrection={false}
                allowNewlines={false}
                defaultValue={phone}
                onChangeText={(value) => setPhone(value.replace(/\D/g, '').slice(0, 11))}
              />
              <Button
                label="发送验证码"
                onPress={() => void handleSendCode()}
                modifiers={[disabled(!canSendCode)]}
              />
            </HStack>
          </Section>

          <Section title="验证码">
            <HStack spacing={12}>
              <TextField
                placeholder="请输入验证码"
                keyboardType="default"
                autocorrection={false}
                allowNewlines={false}
                defaultValue={code}
                onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
              />
              <Button
                label="登录"
                onPress={() => void handleLogin()}
                modifiers={[disabled(!canLogin)]}
              />
            </HStack>
          </Section>

          <Section title="邀请码">
            <TextField
              placeholder="请输入邀请码（选填）"
              keyboardType="default"
              autocorrection={false}
              allowNewlines={false}
              defaultValue={inviteCode}
              onChangeText={(value) => setInviteCode(value.trim().slice(0, 20))}
            />
          </Section>

          <Section modifiers={[listRowBackground('clear')]}>
            <RNHostView matchContents={true}>
              <View style={styles.socialArea}>
                <RNText style={styles.socialTitle}>其他登录方式</RNText>
                <View style={styles.socialButtons}>
                  <LiquidGlassButton
                    icon="apple"
                    size={22}
                    color="#111827"
                    onPress={() => void handleAppleLogin()}
                  />
                </View>
              </View>
            </RNHostView>
            <RNHostView matchContents={true}>
              <View style={styles.bottomArea}>
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={() => setAgreed((prev) => !prev)}
                  style={styles.agreementRow}
                >
                  <Ionicons
                    name={agreed ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={agreed ? '#007AFF' : '#C7C7CC'}
                  />
                  <RNText style={styles.agreementText}>
                    已阅读并同意
                    <RNText style={styles.linkText}>《用户协议》</RNText>
                    <RNText style={styles.linkText}>《隐私政策》</RNText>
                  </RNText>
                </TouchableOpacity>
              </View>
            </RNHostView>
          </Section>
        </List>
      </Host>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },
  heroEyebrow: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  heroTitle: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: '#6B7280',
    fontSize: 14,
  },
  socialArea: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 18,
  },
  socialTitle: {
    color: '#8E8E93',
    fontSize: 13,
    marginBottom: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  bottomArea: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  agreementText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  linkText: {
    color: '#007AFF',
  },
  logoWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },

  logoSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  logoBlock: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    alignItems: 'center',
  },
})
