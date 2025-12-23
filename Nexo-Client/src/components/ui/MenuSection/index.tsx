import Feather from '@expo/vector-icons/Feather'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { colors, spacing, typography } from '@/config/theme'

export type MenuItem = {
  label: string
  icon: string
  color: string
  onPress: () => void
}

interface MenuSectionProps {
  items: MenuItem[]
}

const MenuSection: React.FC<MenuSectionProps> = ({ items }) => (
  <View style={styles.menuContainer}>
    {items.map((item, index) => (
      <TouchableOpacity
        key={item.label}
        style={[
          styles.menuItem,
          index === items.length - 1 && styles.menuItemLast,
        ]}
        activeOpacity={0.8}
        onPress={item.onPress}
      >
        <View style={styles.menuItemLeft}>
          <View style={styles.menuIcon}>
            <Feather name={item.icon as any} size={20} color={item.color} />
          </View>
          <Text style={styles.menuLabel}>{item.label}</Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    ))}
  </View>
)

const styles = StyleSheet.create({
  menuContainer: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 28,
    overflow: 'hidden',
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 56,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: typography.fontSize.lg,
    color: colors.text,
  },
})

export default MenuSection


