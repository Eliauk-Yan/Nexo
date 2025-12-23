/**
 * 社区（原通知）
 * 暂沿用通知流，后续可替换为社区动态/帖子流
 */

import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'
// TODO: 实现 notificationApi
// import { notificationApi } from '@/api'
import { Header } from '@/components/ui'
import { Notification } from '@/types'
import { colors, spacing, typography, borderRadius } from '@/config/theme'
import { formatRelativeTime } from '@/utils/validation'
import { handleApiError } from '@/utils/errorHandler'

const Notifications = () => {
  const insets = useSafeAreaInsets()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // 社区页不显示通知按钮，但需要为标题留出顶部空间
  const contentTopPadding = insets.top + spacing.md

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      // TODO: 实现 notificationApi 后恢复此功能
      // const response = await notificationApi.getList({ page: 1, pageSize: 50 })
      // setNotifications(response.list)
      // const count = await notificationApi.getUnreadCount()
      // setUnreadCount(count)

      // 暂时使用空数据
      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error('Fetch notifications error:', handleApiError(error as Error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      // TODO: 实现 notificationApi 后恢复此功能
      // await notificationApi.markAsRead(id)
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Mark as read error:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      // TODO: 实现 notificationApi 后恢复此功能
      // await notificationApi.markAllAsRead()
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Mark all as read error:', error)
    }
  }

  const renderItem = ({ item }: { item: Notification }) => {
    const iconMap = {
      like: 'heart',
      comment: 'message-circle',
      sale: 'dollar-sign',
      offer: 'tag',
      transfer: 'arrow-right',
      system: 'bell',
    }

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.unreadItem]}
        onPress={() => handleMarkAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Feather
            name={iconMap[item.type] as any}
            size={20}
            color={item.read ? colors.textSecondary : colors.primary}
          />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, !item.read && styles.unreadTitle]}>{item.title}</Text>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    )
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>社区</Text>
      {unreadCount > 0 && (
        <TouchableOpacity onPress={handleMarkAllAsRead}>
          <Text style={styles.markAllText}>全部已读</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <Header />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.contentWrapper}>
          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, { paddingTop: contentTopPadding }]}
            ListHeaderComponent={renderHeader}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={fetchNotifications}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="bell-off" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>暂无通知</Text>
              </View>
            }
          />
        </View>
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
  contentWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  markAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  list: {
    padding: spacing.md,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadItem: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundTertiary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  unreadTitle: {
    color: colors.text,
  },
  message: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  time: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    color: colors.textTertiary,
    fontSize: typography.fontSize.md,
    marginTop: spacing.md,
  },
})

export default Notifications
