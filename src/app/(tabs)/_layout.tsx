import React from 'react'

import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs'

const TabLayout = () => {
  return (
    <NativeTabs tintColor="#6C5CE7" disableTransparentOnScrollEdge>
      <NativeTabs.Trigger name="index">
        <Label>首页</Label>
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="market">
        <Label>NFT</Label>
        <Icon sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="mint">
        <Label>铸造</Label>
        <Icon sf={{ default: 'plus.circle', selected: 'plus.circle.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="notifications">
        <Label>通知</Label>
        <Icon sf={{ default: 'bell', selected: 'bell.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label>我的</Label>
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}

export default TabLayout
