import { LiquidGlassButton } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Settings = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { logout } = useAuth()
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(true)

  const handleLogout = async () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '退出', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout()
              router.replace('/auth/login')
            } catch (error) {
              console.error('Logout failed:', error)
            }
          }
        }
      ]
    )
  }

  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  )

  const renderItem = (
    icon: keyof typeof Feather.glyphMap,
    title: string,
    onPress?: () => void,
    rightElement?: React.ReactNode,
    isDestructive = false
  ) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, isDestructive && styles.destructiveIconContainer]}>
          <Feather name={icon} size={20} color={isDestructive ? '#FF4444' : '#FFF'} />
        </View>
        <Text style={[styles.itemTitle, isDestructive && styles.destructiveText]}>{title}</Text>
      </View>
      <View style={styles.itemRight}>
        {rightElement ? (
          rightElement
        ) : (
          <Feather name="chevron-right" size={20} color="#666" />
        )}
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top, paddingHorizontal: 20, paddingBottom: 10 }}>
        <LiquidGlassButton icon="arrow-left" onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderSectionHeader('账户')}
        {renderItem('user', '个人资料', () => {})}
        {renderItem('shield', '账号安全', () => {})}
        {renderItem('credit-card', '支付设置', () => {})}

        {renderSectionHeader('通用')}
        {renderItem(
          'bell',
          '消息通知',
          undefined,
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#333', true: '#6C5CE7' }}
            thumbColor={'#FFF'}
          />
        )}
        {renderItem(
          'moon',
          '深色模式',
          undefined,
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: '#333', true: '#6C5CE7' }}
            thumbColor={'#FFF'}
          />
        )}
        {renderItem('globe', '多语言', () => {})}

        {renderSectionHeader('支持')}
        {renderItem('help-circle', '帮助中心', () => {})}
        {renderItem('info', '关于我们', () => {})}

        <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>退出登录</Text>
            </TouchableOpacity>
        </View>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  sectionHeader: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  destructiveIconContainer: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  itemTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  destructiveText: {
    color: '#FF4444',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
      marginTop: 20,
  },
  logoutButton: {
      backgroundColor: '#1E1E1E',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#333',
  },
  logoutText: {
      color: '#FF4444',
      fontSize: 16,
      fontWeight: 'bold',
  },
  versionText: {
    color: '#444',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
    fontSize: 12,
  },
})

export default Settings
