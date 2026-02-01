import { authApi } from '@/api'
import { LiquidGlassButton, MenuSection, type MenuItem } from '@/components/ui'
import { colors, spacing, typography } from '@/config/theme'
import { ROUTES } from '@/constants/routes'
import { useSession } from '@/utils/ctx'
import { useRouter } from 'expo-router'
import React from 'react'
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const Setting = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { signOut, session } = useSession()
  const isLogin = !!session

  const handleLogout = async () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: async () => {
          try {
            await authApi.logout()
          } catch (error) {
            console.error('退出登录失败：', error)
          } finally {
            signOut()
            router.replace('/(tabs)/account')
          }
        },
      },
    ])
  }

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err))
  }

  const accountItems: MenuItem[] = [
    {
      label: '账号与安全',
      icon: 'shield',
      color: '#33B5E5',
      onPress: () => router.push('/setting/account'),
    },
    {
      label: '通用设置',
      icon: 'settings',
      color: '#FFFFFF',
      onPress: () => router.push('/setting/general'),
    },
  ]

  const aboutItems: MenuItem[] = [
    {
      label: '关于我们',
      icon: 'info',
      color: '#00D4FF',
      onPress: () => router.push('/setting/about'),
    },
    { label: '分享APP', icon: 'share-2', color: '#00C851', onPress: () => { } },
  ]

  const personalLinks = [
    { label: '个人信息共享清单', url: 'https://example.com/sharing' },
    { label: '个人信息已收集清单', url: 'https://example.com/collected' },
  ]
  const privacyLink = { label: '隐私与政策', url: 'https://example.com/privacy' }

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
        <MenuSection items={accountItems} />

        <MenuSection items={aboutItems} />

        {isLogin && (
          <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={handleLogout}>
            <Text style={styles.logoutText}>退出登录</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footerContainer}>
        <View style={styles.footerLinks}>
          {personalLinks.map((link, index) => (
            <React.Fragment key={link.label}>
              <TouchableOpacity onPress={() => handleLinkPress(link.url)} activeOpacity={0.8}>
                <Text style={styles.footerLink}>{link.label}</Text>
              </TouchableOpacity>
              {index < personalLinks.length - 1 && <Text style={styles.footerSeparator}>|</Text>}
            </React.Fragment>
          ))}
        </View>
        <TouchableOpacity onPress={() => handleLinkPress(privacyLink.url)} activeOpacity={0.8}>
          <Text style={styles.footerLink}>{privacyLink.label}</Text>
        </TouchableOpacity>
      </SafeAreaView>
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
    gap: spacing.lg,
  },
  logoutButton: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 28,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    width: '100%',
    minHeight: 56,
  },
  logoutText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
  },
  footerContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  footerLink: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  footerSeparator: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
})

export default Setting
