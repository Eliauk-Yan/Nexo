import Feather from '@expo/vector-icons/Feather'
import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { colors, spacing, typography } from '@/config/theme'

export type ListItemType = 'avatar' | 'text' | 'delete'

export interface ListItemData {
  label: string
  type: ListItemType
  value?: string
  onPress: () => void
}

interface ListItemProps {
  item: ListItemData
}

const ListItem = ({ item }: ListItemProps) => {
  const isDelete = item.type === 'delete'

  return (
    <TouchableOpacity
      style={styles.menuItem}
      activeOpacity={0.8}
      onPress={item.onPress}
    >
      <Text
        style={[
          styles.menuLabel,
          isDelete && styles.deleteAccountLabel,
        ]}
      >
        {item.label}
      </Text>
      <View style={styles.menuItemRight}>
        {item.type === 'avatar' ? (
          <View style={styles.avatarContainer}>
            {item.value ? (
              <Image source={{ uri: item.value }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={18} color={colors.textSecondary} />
              </View>
            )}
          </View>
        ) : (
          <Text
            style={[
              styles.menuValue,
              isDelete && styles.deleteAccountLabel,
            ]}
          >
            {item.value || ''}
          </Text>
        )}
        <Feather name="chevron-right" size={18} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundCard,
    borderRadius: 28,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 64,
    width: '100%',
  },
  menuLabel: {
    fontSize: typography.fontSize.lg,
    color: colors.text,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuValue: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
  avatarContainer: {
    // 在当前行高设置下的最大头像尺寸
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAccountLabel: {
    color: colors.error,
  },
})

export default ListItem


