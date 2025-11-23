import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient' // Expo 渐变库
import { BlurView } from 'expo-blur' // Expo 毛玻璃库图标
import AntDesign from '@expo/vector-icons/AntDesign'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'

const { width } = Dimensions.get('window')

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailFocused, setIsEmailFocused] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)

  const router = useRouter()
  const handleLogin = () => {
    setIsLoading(true)
    router.push('/(tabs)/profile')
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* --- 登录卡片主体 --- */}
          <BlurView intensity={30} tint="dark" style={styles.card}>
            {/* Logo 区 */}
            <View style={styles.header}>
              <LinearGradient colors={['#6C5CE7', '#a29bfe']} style={styles.logoBg}>
                <Feather name="hexagon" size={28} color="#FFF" fill="rgba(255,255,255,0.2)" />
              </LinearGradient>
              <Text style={styles.title}>欢迎回来</Text>
              <Text style={styles.subtitle}>登录以管理您的 NFT 资产</Text>
            </View>

            {/* 1. 钱包登录按钮 */}
            <TouchableOpacity style={styles.walletBtn} activeOpacity={0.8}>
              <Feather name="credit-card" size={20} color="#6C5CE7" />
              <Text style={styles.walletBtnText}>连接钱包登录</Text>
            </TouchableOpacity>

            {/* 分割线 */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>或使用手机号登录</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 2. 表单区域 */}
            <View style={styles.form}>
              {/* 手机号输入 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>手机号</Text>
                <View style={[styles.inputWrapper, isEmailFocused && styles.inputWrapperFocused]}>
                  <Feather
                    name="phone"
                    size={20}
                    color={isEmailFocused ? '#6C5CE7' : '#666'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="188****8888"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                  />
                </View>
              </View>

              {/* 密码输入 */}
              <View style={styles.inputGroup}>
                <View style={styles.passwordHeader}>
                  <Text style={styles.label}>验证码</Text>
                </View>
                <View
                  style={[styles.inputWrapper, isPasswordFocused && styles.inputWrapperFocused]}
                >
                  <Feather
                    name="lock"
                    size={20}
                    color={isPasswordFocused ? '#6C5CE7' : '#666'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="输入您的密码"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    {showPassword ? (
                      <Feather name="eye-off" size={20} color="#666" />
                    ) : (
                      <Feather name="eye" size={20} color="#666" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* 登录按钮 */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
                style={styles.loginBtnContainer}
              >
                <LinearGradient
                  colors={['#6C5CE7', '#8075e5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginBtn}
                >
                  {isLoading ? (
                    <Text style={styles.loginText}>登录中...</Text>
                  ) : (
                    <>
                      <Text style={styles.loginText}>立即登录</Text>
                      <Feather name="arrow-right" size={20} color="#FFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* 底部社交 & 注册 */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>其他登录方式</Text>
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn}>
                  {/* 使用 Hexagon 模拟 Discord */}
                  <AntDesign name="wechat" size={20} color="#888" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                  <Feather name="github" size={20} color="#888" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                  <AntDesign name="alipay-circle" size={20} color="#888" />
                </TouchableOpacity>
              </View>

              <View style={styles.signupRow}>
                <Text style={styles.noAccountText}>还没有账号? </Text>
                <TouchableOpacity>
                  <Text style={styles.signupText}>创建一个 NFT 账户</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  glow: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width,
    opacity: 0.25,
  },
  glowPurple: {
    backgroundColor: '#6C5CE7',
    top: -width * 0.6,
    left: -width * 0.4,
  },
  glowCyan: {
    backgroundColor: '#00cec9',
    bottom: -width * 0.5,
    right: -width * 0.4,
    opacity: 0.15,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(18, 18, 18, 0.6)', // Fallback for Android if blur doesn't work perfectly
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoBg: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 24,
  },
  walletBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#666',
    fontSize: 12,
    marginHorizontal: 16,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#888',
    fontSize: 12,
    marginBottom: 6,
    marginLeft: 4,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotText: {
    color: '#6C5CE7',
    fontSize: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 12,
  },
  inputWrapperFocused: {
    borderColor: '#6C5CE7',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFF',
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  loginBtnContainer: {
    marginTop: 10,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  loginText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    color: '#444',
    fontSize: 12,
    marginBottom: 16,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupRow: {
    flexDirection: 'row',
  },
  noAccountText: {
    color: '#666',
    fontSize: 14,
  },
  signupText: {
    color: '#6C5CE7',
    fontWeight: 'bold',
    fontSize: 14,
  },
})

export default Login
