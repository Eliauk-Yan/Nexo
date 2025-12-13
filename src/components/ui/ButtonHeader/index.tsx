import { LiquidGlassButton } from '@/components/ui'
import { colors, spacing, typography } from '@/config/theme'
// TODO: 实现 notificationApi
// import { notificationApi } from '@/api'
import { handleApiError } from '@/utils/errorHandler'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

interface ButtonHeaderProps {
  /**
   * 是否显示通知按钮
   * @default true
   */
  showNotification?: boolean
  /**
   * 右侧自定义按钮
   */
  rightButtons?: React.ReactNode
}

const ButtonHeader: React.FC<ButtonHeaderProps> = ({
  showNotification = true,
  rightButtons,
}) => {
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)

  // 获取未读通知数量
  // TODO: 实现 notificationApi 后恢复此功能
  const fetchUnreadCount = async () => {
    try {
      // const count = await notificationApi.getUnreadCount()
      // setUnreadCount(count)
      // 暂时设置为 0，等待 notificationApi 实现
      setUnreadCount(0)
    } catch (error) {
      console.error('Fetch unread count error:', handleApiError(error as Error))
    }
  }

  useEffect(() => {
    if (showNotification) {
      fetchUnreadCount()
      // TODO: 实现 notificationApi 后恢复定时刷新
      // 每30秒刷新一次未读数量
      // const interval = setInterval(fetchUnreadCount, 30000)
      // return () => clearInterval(interval)
    }
  }, [showNotification])

  const handleNotificationPress = () => {
    router.push('/(tabs)/community')
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          {/* 左侧可以放置其他按钮，如返回按钮等 */}
        </View>
        <View style={styles.rightSection}>
          {showNotification && (
            <View style={styles.buttonWrapper}>
              <LiquidGlassButton
                icon="bell"
                size={22}
                color={colors.text}
                onPress={handleNotificationPress}
              />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          )}
          {rightButtons}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'transparent',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  buttonWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
})

export default ButtonHeader
