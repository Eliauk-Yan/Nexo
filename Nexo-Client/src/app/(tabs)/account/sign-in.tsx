import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { authApi } from '@/api'
import { LiquidGlassButton } from '@/components/ui'
import { borderRadius, colors, spacing, typography } from '@/config/theme'
import { handleApiError } from '@/utils/errorHandler'
import { validatePhone } from '@/utils/validation'

const Login = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const handleSendCode = async () => {
    if (sending || !canSubmit) return

    setSending(true)
    try {
      await authApi.sendVerificationCode(phone)
      router.push({ pathname: '/(tabs)/account/verify', params: { phone } })
    } catch (error) {
      Alert.alert('错误', handleApiError(error as Error))
    } finally {
      setSending(false)
    }
  }

  const isPhoneValid = phone.trim().length === 11 && validatePhone(phone)
  const canSubmit = isPhoneValid && agreed

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={[styles.header, { top: insets.top }]}>
          <View>
            <LiquidGlassButton icon="chevron-left" size={14} onPress={() => router.back()} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoBlock}>
            <Text style={styles.logoTitle}>NEXO</Text>
            <Text style={styles.logoSubtitle}>开启数字藏品之旅</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>手机号</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入手机号"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              selectionColor={colors.primary}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={11}
            />
          </View>

          <View style={styles.agreementRow}>
            <TouchableOpacity
              onPress={() => setAgreed(!agreed)}
              activeOpacity={0.7}
              style={styles.checkboxContainer}
            >
              <Feather
                name={agreed ? 'check-square' : 'square'}
                size={20}
                color={agreed ? colors.primary : colors.border}
              />
            </TouchableOpacity>
            <Text style={styles.agreementText}>
              同意
              <Text
                style={styles.linkText}
                onPress={() => {
                  // TODO: 跳转到用户协议页面
                  console.log('打开用户协议')
                }}
              >
                《用户协议》
              </Text>
              与
              <Text
                style={styles.linkText}
                onPress={() => {
                  // TODO: 跳转到隐私政策页面
                  console.log('打开隐私政策')
                }}
              >
                《隐私政策》
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, (!canSubmit || sending) && styles.submitBtnDisabled]}
            activeOpacity={0.8}
            onPress={handleSendCode}
            disabled={!canSubmit || sending}
          >
            {sending ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.submitBtnText}>发送手机验证码</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>其他登录方式</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.otherLoginRow}>
            <LiquidGlassButton
              icon="weixin"
              size={24}
              color="#07C160"
              onPress={() => {
                // TODO: 微信登录
                console.log('微信登录')
              }}
            />
            <LiquidGlassButton
              icon="alipay"
              size={24}
              color="#1677FF"
              onPress={() => {
                // TODO: 支付宝登录
                console.log('支付宝登录')
              }}
            />
            <LiquidGlassButton
              icon="apple"
              size={24}
              color="#FFFFFF"
              onPress={() => {
                // TODO: 苹果登录
                console.log('苹果登录')
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 10,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.xl,
  },
  logoBlock: {
    alignItems: 'flex-start',
    marginBottom: 82,
  },
  logoTitle: {
    fontSize: 86,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    marginTop: spacing.xs,
    fontSize: 18,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.md * 1.4,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    height: 50,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: typography.fontSize.md,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  checkboxContainer: {
    padding: spacing.xs,
  },
  agreementText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    flex: 1,
    flexWrap: 'wrap',
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginTop: spacing.md,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: colors.text,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginHorizontal: spacing.sm,
  },
  otherLoginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
})

export default Login
