import React from 'react'
import { Redirect } from 'expo-router'

import { colors } from '@/config/theme'
import { useSession } from '@/utils/ctx'
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs'

const TabLayout = () => {
  return (
    <NativeTabs tintColor={colors.primary} disableTransparentOnScrollEdge>
      <NativeTabs.Trigger name="home">
        <Label>首页</Label>
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="account">
        <Label>账户</Label>
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}

export default TabLayout
