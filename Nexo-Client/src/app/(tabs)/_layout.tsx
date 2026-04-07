import { NativeTabs } from 'expo-router/unstable-native-tabs'

const TabLayout = () => {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>藏品</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Label>我的</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}

export default TabLayout
