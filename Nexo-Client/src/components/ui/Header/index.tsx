import LiquidGlassSearchBar from '@/components/ui/LiquidGlassSearch'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type HeaderProps = {
  search?: boolean
  placeholder?: string
}
const Header = (props: HeaderProps) => {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <LiquidGlassSearchBar
        placeholder={props.placeholder}
        onSubmit={(t) => console.log('submit:', t)}
        onPressAction={() => console.log('press action')}
        actionIcon="bell"
        glassStyle="regular"
        tintColor="rgba(255,255,255,0.12)"
        search={props.search}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
})

export default Header
