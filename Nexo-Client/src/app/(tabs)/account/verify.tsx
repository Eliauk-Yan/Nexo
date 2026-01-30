import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { ROUTES } from '@/constants/routes'
import { borderRadius, colors, spacing, typography } from '@/config/theme'
import { useAuthStore } from '@/stores/authState'
import { useSession } from '@/utils/ctx'
import { handleApiError } from '@/utils/errorHandler'

const Verify = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { signIn } = useSession()
  const { setUser, setIsLoading: setStoreLoading } = useAuthStore()
  const { phone } = useLocalSearchParams<{ phone: string }>()
  const [code, setCode] = useState('')
  const [resending, setResending] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const handleResend = async () => {
    if (resending || !phone) return
    setResending(true)
    try {
      await authApi.sendVerificationCode(phone)
      Alert.alert('成功', '验证码已重新发送')
    } catch (error) {
      Alert.alert('错误', handleApiError(error as Error))
    } finally {
      setResending(false)
    }
  }

  const handleConfirm = async () => {
    if (submitting || !phone) return
    if (!code || code.length !== 6) {
      Alert.alert('提示', '请输入6位验证码')
      return
    }
    setSubmitting(true)
    try {
      const response = await authApi.login({ phone, verifyCode: code, rememberMe: true })
      // 设置用户信息到 Store (用于 UI 显示)
      setUser(response.userInfo)
      // 设置 Session (用于路由保护)
      signIn(response.token)

      // 这里的跳转通常由路由卫视(Redirect)在 index.tsx 或 _layout.tsx 中自动完成
      // 但为了用户体验，我们也可以手动跳转到主页或之前的页面
      router.replace(ROUTES.TABS.HOME)
    } catch (error) {
      Alert.alert('登录失败', handleApiError(error as Error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCodeChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, '')
    if (digitsOnly.length <= 6) {
      setCode(digitsOnly)
    }
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={[styles.header, { top: insets.top + spacing.md }]}>
          <LiquidGlassButton icon="chevron-left" size={14} onPress={() => router.back()} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.codeHeader}>
              <Text style={styles.codeTitle}>输入短信验证码</Text>
              <Text style={styles.codeSubtitle}>验证码已发送至 {phone || '你的手机号'}</Text>
            </View>

            <View style={styles.codeInputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.codeHiddenInput}
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={handleCodeChange}
                autoFocus
                selectionColor={colors.primary}
              />
              <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()}>
                <View style={styles.codeBoxes}>
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const char = code[idx] ?? ''
                    const isActive = idx === code.length
                    return (
                      <View key={idx} style={[styles.codeBox, isActive && styles.codeBoxActive]}>
                        <Text style={styles.codeBoxText}>{char}</Text>
                      </View>
                    )
                  })}
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResend}
              disabled={resending}
            >
              <Text style={styles.resendText}>{resending ? '发送中...' : '重新发送验证码'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, submitting && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.confirmBtnText}>确认</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.xl,
  },
  codeHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  codeTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  codeSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  codeInputWrapper: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  codeHiddenInput: {
    position: 'absolute',
    width: '100%',
    height: 60,
    opacity: 0,
    zIndex: 2,
  },
  codeBoxes: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  codeBox: {
    flex: 1,
    height: 60,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  codeBoxText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  resendText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginTop: spacing.lg,
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    color: colors.text,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.md,
  },
})

export default Verify
