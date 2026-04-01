import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Image as RNImage, StyleSheet, View } from 'react-native'
import { Stack, useFocusEffect, useRouter } from 'expo-router'

import {
  Host,
  List,
  Section,
  HStack,
  Popover,
  VStack,
  Text,
  Button,
  Image,
  Spacer,
  ScrollView,
  RNHostView,
} from '@expo/ui/swift-ui'

import {
  listStyle,
  padding,
  foregroundStyle,
  font,
  buttonStyle,
  controlSize,
  onTapGesture,
  tint,
} from '@expo/ui/swift-ui/modifiers'

import { AssetCard } from '@/components/ui/AssetCard'
import { artworkApi, Asset } from '@/api/artwork'
import { useSession } from '@/utils/ctx'

function chunk<T>(arr: T[], size: number) {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

export default function ProfileScreen() {
  const router = useRouter()
  const { user, session } = useSession()
  const isLogin = !!session

  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [isAccountPopoverPresented, setIsAccountPopoverPresented] = useState(false)

  const fetchMyAssets = useCallback(async () => {
    if (!isLogin) {
      setAssets([])
      return
    }

    try {
      setLoading(true)
      const response = await artworkApi.getMyAssets(1, 20)
      const items = (response as any).records || response || []
      setAssets(Array.isArray(items) ? items : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [isLogin])

  useFocusEffect(
    useCallback(() => {
      fetchMyAssets().catch()
    }, [fetchMyAssets]),
  )

  useEffect(() => {
    fetchMyAssets().catch()
  }, [fetchMyAssets])

  const assetRows = useMemo(() => chunk(assets, 2), [assets])
  const shortAccount = useMemo(() => {
    if (!user?.account) return '暂未绑定链地址'
    if (user.account.length <= 18) return user.account
    return `${user.account.slice(0, 8)}...${user.account.slice(-6)}`
  }, [user?.account])

  const showChainInfo = () => {
    if (!isLogin) {
      router.push('/(auth)/sign-in')
      return
    }

    Alert.alert(
      '链上身份信息',
      `昵称：${user?.nickName || '未设置'}\n链地址：${user?.account || '暂未绑定'}\n实名状态：${
        user?.certification ? '已实名认证' : '未实名认证'
      }`,
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
        }}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="bell" onPress={() => router.push('/notification')} />
      </Stack.Toolbar>
      <Host style={styles.host}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section>
            <VStack spacing={14} modifiers={[padding({ vertical: 8 })]}>
              <HStack spacing={12}>
                <RNHostView matchContents>
                  <View style={styles.avatarWrap}>
                    {isLogin && user?.avatarUrl ? (
                      <RNImage source={{ uri: user.avatarUrl }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Host matchContents>
                          <Image systemName="person.fill" size={28} color="#8E8E93" />
                        </Host>
                      </View>
                    )}
                  </View>
                </RNHostView>
                <VStack spacing={6}>
                  <Text
                    modifiers={[font({ size: 24, weight: 'bold' }), foregroundStyle('primary')]}
                  >
                    {user?.nickName || '未登录'}
                  </Text>
                  {!isLogin ? (
                    <Text modifiers={[font({ size: 14 }), foregroundStyle('secondary')]}>
                      登录后可以查看更多功能
                    </Text>
                  ) : (
                    <Popover
                      isPresented={isAccountPopoverPresented}
                      onIsPresentedChange={setIsAccountPopoverPresented}
                      attachmentAnchor="trailing"
                      arrowEdge="top"
                    >
                      <Popover.Trigger>
                        <Button
                          label={shortAccount}
                          onPress={() => setIsAccountPopoverPresented(true)}
                          modifiers={[
                            buttonStyle('borderless'),
                            controlSize('mini'),
                            tint('#8E8E93'),
                          ]}
                        />
                      </Popover.Trigger>
                      <Popover.Content>
                        <VStack spacing={8} modifiers={[padding({ all: 12 })]}>
                          <Text modifiers={[font({ size: 12 }), foregroundStyle('secondary')]}>
                            链账户地址
                          </Text>
                          <Text>{user?.account || '暂未绑定链地址'}</Text>
                        </VStack>
                      </Popover.Content>
                    </Popover>
                  )}
                </VStack>
                <Spacer />
                <Button
                  label={isLogin ? '编辑资料' : '去登录'}
                  onPress={() =>
                    isLogin ? router.push('/setting/account') : router.push('/(auth)/sign-in')
                  }
                  modifiers={[buttonStyle('glassProminent'), controlSize('regular')]}
                />
              </HStack>
            </VStack>
          </Section>

          <Section title="快捷入口">
            <HStack
              spacing={12}
              modifiers={[padding({ vertical: 10 }), onTapGesture(() => router.push('/order'))]}
            >
              <Image systemName="bag.fill" size={18} color="#0A84FF" />
              <Text modifiers={[font({ size: 16, weight: 'medium' })]}>订单</Text>
              <Spacer />
              <Image systemName="chevron.right" size={13} color="#8E8E93" />
            </HStack>

            <HStack
              spacing={12}
              modifiers={[padding({ vertical: 10 }), onTapGesture(() => router.push('/setting'))]}
            >
              <Image systemName="gearshape.fill" size={18} color="#0A84FF" />
              <Text modifiers={[font({ size: 16, weight: 'medium' })]}>设置</Text>
              <Spacer />
              <Image systemName="chevron.right" size={13} color="#8E8E93" />
            </HStack>

            <HStack
              spacing={12}
              modifiers={[padding({ vertical: 10 }), onTapGesture(showChainInfo)]}
            >
              <Image systemName="link" size={18} color="#0A84FF" />
              <Text modifiers={[font({ size: 16, weight: 'medium' })]}>区块链</Text>
              <Spacer />
              <Image systemName="chevron.right" size={13} color="#8E8E93" />
            </HStack>
          </Section>

          {!isLogin ? (
            <Section title="数字资产">
              <VStack spacing={12} modifiers={[padding({ vertical: 12 })]}>
                <Host matchContents>
                  <Image systemName="shippingbox.fill" size={40} color="#8E8E93" />
                </Host>

                <Text modifiers={[font({ size: 16, weight: 'medium' })]}>
                  请登录以查看你的数字藏品
                </Text>

                <Button
                  label="立即登录"
                  onPress={() => router.push('/(auth)/sign-in')}
                  modifiers={[buttonStyle('glassProminent'), controlSize('large')]}
                />
              </VStack>
            </Section>
          ) : (
            <Section title="我的数字资产">
              {loading ? (
                <Text modifiers={[padding({ vertical: 8 }), foregroundStyle('secondary')]}>
                  正在加载...
                </Text>
              ) : assets.length === 0 ? (
                <VStack spacing={10} modifiers={[padding({ vertical: 12 })]}>
                  <Host matchContents>
                    <Image systemName="tray.fill" size={38} color="#8E8E93" />
                  </Host>
                  <Text modifiers={[foregroundStyle('secondary')]}>暂无数字资产</Text>
                </VStack>
              ) : (
                <ScrollView>
                  <VStack spacing={12} modifiers={[padding({ vertical: 8 })]}>
                    {assetRows.map((row, rowIndex) => (
                      <HStack key={rowIndex} spacing={12}>
                        {row.map((item) => (
                          <RNHostView key={String(item.id)} matchContents>
                            <View style={styles.assetCardWrap}>
                              <AssetCard asset={item} />
                            </View>
                          </RNHostView>
                        ))}

                        {row.length === 1 ? <View style={styles.assetCardWrap} /> : null}
                      </HStack>
                    ))}
                  </VStack>
                </ScrollView>
              )}
            </Section>
          )}
        </List>
      </Host>
    </>
  )
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetCardWrap: {
    width: 160,
  },
})
