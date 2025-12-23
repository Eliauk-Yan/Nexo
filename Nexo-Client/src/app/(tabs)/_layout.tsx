import React from 'react'

import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs'
import { colors } from '@/config/theme'

const TabLayout = () => {
  return (
    <NativeTabs tintColor={colors.primary} disableTransparentOnScrollEdge>
      <NativeTabs.Trigger name="home">
        <Label>首页</Label>
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="community">
        <Label>社区</Label>
        <Icon sf={{ default: 'person.2', selected: 'person.2.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="mint">
        <Label>铸造</Label>
        <Icon sf={{ default: 'plus.circle', selected: 'plus.circle.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="market">
        <Label>NFT</Label>
        <Icon sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="account">
        <Label>账户</Label>
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}

export default TabLayout
