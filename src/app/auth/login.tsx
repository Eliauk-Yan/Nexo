import { LiquidGlassButton } from '@/components/ui'
import { MESSAGES } from '@/constants/messages'
import { useAuth } from '@/hooks/useAuth'
import { handleApiError } from '@/utils/errorHandler'
import { validatePhone } from '@/utils/validation'
import Feather from '@expo/vector-icons/Feather'
import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const DEFAULT_CODE = '123456'
const DEFAULT_PHONE = '13800138000'
const illustration = require('@/assets/images/react-logo.png')

const Login = () => {
  const [phone] = useState(DEFAULT_PHONE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()

  const handleLogin = async () => {
    if (!validatePhone(phone)) {
      Alert.alert('错误', MESSAGES.VALIDATION.PHONE_INVALID)
      return
    }

    try {
      setIsSubmitting(true)
      await login({ phone, code: DEFAULT_CODE })
    } catch (error) {
      Alert.alert('错误', handleApiError(error as Error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const maskedPhone = `${phone.slice(0, 3)}****${phone.slice(-4)}`
  const displayPhone = `+86 ${maskedPhone}`

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#111218']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.logoArea}>
            <Text style={styles.logoWordmark}>NEXO!</Text>
            <Text style={styles.tagline}>开启数字艺术与资产的灵感之旅</Text>
          </View>

          <View style={styles.illustrationBox}>
            <Image source={illustration} style={styles.illustration} resizeMode="contain" />
          </View>

          <View style={styles.phoneCard}>
            <Text style={styles.phoneStatic}>{displayPhone}</Text>
            <Text style={styles.phoneSub}>其他手机号登录</Text>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.9}
            disabled={!phone || isSubmitting}
            style={[styles.primaryButtonWrapper, (!phone || isSubmitting) && styles.buttonDisabled]}
          >
            <LinearGradient
              colors={['#ffffff', '#dcdde1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>{isSubmitting ? '登录中...' : '一键登录'}</Text>
              <Feather name="arrow-right" size={18} color="#0A0B14" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.otherSection}>
            <Text style={styles.sectionTitle}>其他登录方式</Text>
            <View style={styles.socialRow}>
              <LiquidGlassButton icon="message-circle" />
              <LiquidGlassButton icon="github" />
              <LiquidGlassButton icon="credit-card" />
            </View>
          </View>

          <Text style={styles.agreement}>
            登录即表示同意
            <Text style={styles.link}>《用户协议》</Text>
            和
            <Text style={styles.link}>《隐私政策》</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050509',
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoArea: {
    marginTop: 32,
    alignItems: 'center',
    gap: 12,
  },
  logoWordmark: {
    color: '#f5f7fa',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 6,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255, 255, 255, 0.35)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 16,
  },
  tagline: {
    color: '#C9CEDC',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  illustrationBox: {
    marginTop: 28,
    marginBottom: 32,
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: 200,
    transform: [{ translateY: -8 }],
  },
  phoneCard: {
    marginTop: 12,
    paddingVertical: 8,
  },
  cardLabel: {
    color: '#E2E6F0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 12,
    height: 54,
  },
  phoneStatic: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
  },
  phoneSub: {
    marginTop: 6,
    textAlign: 'center',
    color: '#9EA5BD',
    fontSize: 12,
  },
  cardHint: {
    color: '#7B8199',
    fontSize: 12,
    marginTop: 8,
  },
  primaryButtonWrapper: {
    marginTop: 20,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: '#0A0B14',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  otherSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#9EA3B5',
    fontSize: 12,
    marginBottom: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 18,
  },
  agreement: {
    marginTop: 24,
    color: '#9EA3B5',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: '#F2F4F7',
  },
})

export default Login
