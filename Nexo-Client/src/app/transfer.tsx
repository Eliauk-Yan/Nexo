import React, { useCallback, useState } from 'react'
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import {
  Alert,
  StyleSheet,
  View,
} from 'react-native'
import * as Haptics from 'expo-haptics'

import {
  BottomSheet,
  Button,
  Group,
  HStack,
  Host,
  Image,
  List,
  ScrollView,
  Section,
  Spacer,
  Text,
  TextField,
  VStack,
} from '@expo/ui/swift-ui'

import {
  buttonStyle,
  controlSize,
  font,
  foregroundStyle,
  listRowBackground,
  listStyle,
  onTapGesture,
  padding,
  presentationDetents,
  presentationDragIndicator,
  tint,
} from '@expo/ui/swift-ui/modifiers'

import { nftApi, Asset } from '@/api/nft'
import { userApi, SimpleUserInfo } from '@/api/user'
import { showErrorAlert } from '@/utils/error'
import { useSession } from '@/utils/ctx'

export default function TransferScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ assetId?: string }>()
  const { session } = useSession()
  const isLogin = !!session

  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isAssetSheetPresented, setIsAssetSheetPresented] = useState(false)

  // ── 手机号查询受赠人 ──────────────────────────────
  const [phone, setPhone] = useState('')
  const [searching, setSearching] = useState(false)
  const [receiver, setReceiver] = useState<SimpleUserInfo | null>(null)

  const [transferring, setTransferring] = useState(false)

  // ── 加载用户持有的活跃资产 ──────────────────────────
  const fetchAssets = useCallback(async () => {
    if (!isLogin) return
    try {
      setLoading(true)
      const response = await nftApi.getMyAssets({
        currentPage: 1,
        pageSize: 50,
        state: 'ACTIVE',
      })
      const items = response || []
      const activeItems = (Array.isArray(items) ? items : []).filter(
        (a: Asset) => a.state === 'ACTIVE',
      )
      setAssets(activeItems)

      // 如果路由参数中带了 assetId，自动选中对应资产
      if (params.assetId) {
        const target = activeItems.find((a: Asset) => String(a.id) === params.assetId)
        if (target) setSelectedAsset(target)
      }
    } catch (error) {
      showErrorAlert(error, '加载资产失败，请稍后重试。')
    } finally {
      setLoading(false)
    }
  }, [isLogin, params.assetId])

  useFocusEffect(
    useCallback(() => {
      fetchAssets()
    }, [fetchAssets]),
  )

  // ── 根据手机号查询受赠人 ────────────────────────────
  const handleSearchReceiver = useCallback(async () => {
    const trimmed = phone.trim()
    if (!trimmed) {
      Alert.alert('提示', '请输入受赠人的手机号')
      return
    }
    try {
      setSearching(true)
      setReceiver(null)
      const result = await userApi.getUserByPhone(trimmed)
      if (result) {
        setReceiver(result)
      }
    } catch (error) {
      showErrorAlert(error, '查询用户失败，请稍后重试。')
      setReceiver(null)
    } finally {
      setSearching(false)
    }
  }, [phone])

  // ── 执行转赠 ────────────────────────────────────────
  const handleTransfer = useCallback(() => {
    if (!selectedAsset) {
      Alert.alert('提示', '请先选择要转赠的资产')
      return
    }
    if (!receiver) {
      Alert.alert('提示', '请先查询受赠人信息')
      return
    }

    Alert.alert(
      '确认转赠',
      `确认将「${selectedAsset.artworkName}」转赠给 ${receiver.nickName || '用户' + receiver.id} 吗？\n\n转赠操作无法撤销，请确认受赠人信息准确。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认转赠',
          style: 'destructive',
          onPress: async () => {
            try {
              setTransferring(true)
              await nftApi.transferAsset({
                assetId: String(selectedAsset.id),
                recipeId: String(receiver.id),
              })
              try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
              } catch {
                // Haptics might not be available
              }
              Alert.alert('转赠成功', '资产已成功转赠，链上确认可能需要一些时间。', [
                { text: '好的', onPress: () => router.back() },
              ])
            } catch (error) {
              showErrorAlert(error, '转赠失败，请稍后重试。')
            } finally {
              setTransferring(false)
            }
          },
        },
      ],
    )
  }, [selectedAsset, receiver, router])

  const canTransfer = !!selectedAsset && !!receiver && !transferring

  // ── 渲染 ────────────────────────────────────────────
  return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerTitle: '资产转赠', headerTransparent: true }} />
        <Stack.Toolbar placement="left">
          <Stack.Toolbar.Button icon="chevron.left" onPress={() => router.back()} />
        </Stack.Toolbar>

          <Host style={styles.host}>
            <List modifiers={[listStyle('insetGrouped')]}>
          {/* ── 页面标题 ─────────────────────────────── */}
          <Section modifiers={[listRowBackground('clear')]}>
            <VStack alignment="leading" spacing={8}>
              <Text modifiers={[font({ size: 32, weight: 'bold' }), foregroundStyle('primary')]}>
                资产转赠
              </Text>
              <Text modifiers={[font({ size: 15 }), foregroundStyle('secondary')]}>
                将您持有的数字藏品无偿转赠给其他用户，转赠后不可撤销
              </Text>
            </VStack>
          </Section>

          {/* ── 选择转赠资产 ──────────────────────────── */}
          <Section title="选择转赠资产">
            <HStack spacing={8}>
              <Image
                systemName={
                  loading
                    ? 'arrow.triangle.2.circlepath'
                    : selectedAsset
                      ? 'checkmark.circle.fill'
                      : 'rectangle.stack.fill'
                }
                size={18}
                color={selectedAsset ? '#22C55E' : '#0A84FF'}
              />
              <VStack
                alignment="leading"
                spacing={2}
                modifiers={[onTapGesture(() => setIsAssetSheetPresented(true))]}
              >
                <Text modifiers={[font({ size: 16, weight: 'medium' }), foregroundStyle('primary')]}>
                  {loading
                    ? '加载资产中...'
                    : selectedAsset?.artworkName || '请选择资产'}
                </Text>
                <Text modifiers={[font({ size: 12 }), foregroundStyle('secondary')]}>
                  {selectedAsset
                    ? `#${selectedAsset.serialNumber?.substring(0, 14)}...`
                    : assets.length > 0
                      ? `${assets.length} 件资产可转赠`
                      : '暂无可转赠的资产'}
                </Text>
              </VStack>
              <Spacer />
              <Button
                label="选择资产"
                onPress={() => setIsAssetSheetPresented(true)}
                modifiers={[
                  buttonStyle('glassProminent'),
                  controlSize('regular'),
                  tint('#0A84FF'),
                ]}
              />
            </HStack>
          </Section>

          {/* ── 输入手机号查询受赠人 ──────────────────── */}
          <Section title="受赠人手机号">
            <HStack spacing={8}>
              <TextField
                placeholder="请输入受赠人的手机号"
                keyboardType="numbers-and-punctuation"
                autocorrection={false}
                defaultValue={phone}
                onChangeText={(text: string) => {
                  setPhone(text)
                  if (receiver) setReceiver(null)
                }}
              />
              <Button
                label={searching ? '查询中...' : '查询用户'}
                onPress={handleSearchReceiver}
                modifiers={[
                  buttonStyle('glassProminent'),
                  controlSize('regular'),
                  tint('#0A84FF'),
                ]}
              />
            </HStack>
          </Section>

          {/* ── 受赠人信息（查询成功后显示） ──────────── */}
          {receiver && (
            <Section title="受赠人信息">
              <HStack spacing={12}>
                <Image systemName="person.circle.fill" size={16} color="#0A84FF" />
                <Text modifiers={[foregroundStyle('primary')]}>昵称</Text>
                <Spacer />
                <Text modifiers={[foregroundStyle('secondary')]}>
                  {receiver.nickName || '未设置'}
                </Text>
              </HStack>

              <HStack spacing={12}>
                <Image systemName="phone.fill" size={16} color="#22C55E" />
                <Text modifiers={[foregroundStyle('primary')]}>手机号</Text>
                <Spacer />
                <Text modifiers={[foregroundStyle('secondary')]}>
                  {phone.trim()}
                </Text>
              </HStack>

              <HStack spacing={12}>
                <Image systemName="number" size={16} color="#FF9500" />
                <Text modifiers={[foregroundStyle('primary')]}>用户ID</Text>
                <Spacer />
                <Text modifiers={[foregroundStyle('secondary')]}>
                  {receiver.id}
                </Text>
              </HStack>
            </Section>
          )}

          {/* ── 转赠信息确认（选中资产 & 查到受赠人后显示） */}
          {selectedAsset && receiver && (
            <Section title="转赠信息确认">
              <HStack spacing={12}>
                <Image systemName="photo.artframe" size={16} color="#0A84FF" />
                <Text modifiers={[foregroundStyle('primary')]}>藏品名称</Text>
                <Spacer />
                <Text modifiers={[foregroundStyle('secondary')]}>{selectedAsset.artworkName}</Text>
              </HStack>

              <HStack spacing={12}>
                <Image systemName="barcode.viewfinder" size={16} color="#0A84FF" />
                <Text modifiers={[foregroundStyle('primary')]}>资产标识</Text>
                <Spacer />
                <Text modifiers={[font({ size: 13 }), foregroundStyle('secondary')]}>
                  {selectedAsset.serialNumber?.substring(0, 8)}...
                  {selectedAsset.serialNumber?.slice(-6)}
                </Text>
              </HStack>

              <HStack spacing={12}>
                <Image systemName="person.fill" size={16} color="#FF9500" />
                <Text modifiers={[foregroundStyle('primary')]}>受赠人</Text>
                <Spacer />
                <Text modifiers={[foregroundStyle('secondary')]}>
                  {receiver.nickName || '用户' + receiver.id}
                </Text>
              </HStack>
            </Section>
          )}

          {/* ── 确认按钮 ─────────────────────────────── */}
          <Section modifiers={[listRowBackground('clear')]}>
            <HStack>
              <Spacer />
              <Button
                label={transferring ? '转赠处理中...' : '确认转赠'}
                onPress={handleTransfer}
                modifiers={[
                  buttonStyle('glassProminent'),
                  controlSize('extraLarge'),
                  tint(canTransfer ? '#0A84FF' : '#8E8E93'),
                ]}
              />
              <Spacer />
            </HStack>
          </Section>

          {/* ── 转赠须知 ─────────────────────────────── */}
          <Section title="转赠须知">
            <VStack alignment="leading" spacing={6}>
              <Text modifiers={[font({ size: 13 }), foregroundStyle('secondary')]}>
                1. 请确认您具备赠送数字藏品的民事行为能力
              </Text>
              <Text modifiers={[font({ size: 13 }), foregroundStyle('secondary')]}>
                2. 请确认您与受赠人均已通过平台实名认证并遵守相关法律法规
              </Text>
              <Text modifiers={[font({ size: 13 }), foregroundStyle('secondary')]}>
                3. 请确认本次赠送行为未设定任何形式的对价
              </Text>
              <Text modifiers={[font({ size: 13 }), foregroundStyle('secondary')]}>
                4. 转赠操作无法撤销，资产将不可恢复
              </Text>
              <Text modifiers={[font({ size: 13 }), foregroundStyle('secondary')]}>
                5. 与数字藏品相关的权利将同步且毫无保留地转移至受赠人
              </Text>
            </VStack>
          </Section>
            </List>

            <BottomSheet
              isPresented={isAssetSheetPresented}
              onIsPresentedChange={setIsAssetSheetPresented}
            >
              <Group
                modifiers={[
                  presentationDetents([{ height: 520 }]),
                  presentationDragIndicator('visible'),
                ]}
              >
                <List modifiers={[listStyle('insetGrouped')]}>
                  <Section modifiers={[listRowBackground('clear')]}>
                    <VStack alignment="leading" spacing={6}>
                      <Text
                        modifiers={[
                          font({ size: 24, weight: 'bold' }),
                          foregroundStyle('primary'),
                        ]}
                      >
                        选择资产
                      </Text>
                      <Text modifiers={[font({ size: 14 }), foregroundStyle('secondary')]}>
                        仅显示当前可转赠的已持有资产
                      </Text>
                    </VStack>
                  </Section>

                  <Section title="可转赠资产">
                    {assets.length === 0 ? (
                      <HStack spacing={10} modifiers={[padding({ vertical: 18 })]}>
                        <Image systemName="tray" size={18} color="#8E8E93" />
                        <Text modifiers={[font({ size: 16, weight: 'medium' }), foregroundStyle('secondary')]}>
                          暂无可转赠资产
                        </Text>
                      </HStack>
                    ) : (
                      <ScrollView>
                        <VStack spacing={0}>
                          {assets.map((asset) => (
                            <HStack
                              key={String(asset.id)}
                              spacing={12}
                              modifiers={[
                                padding({ vertical: 10 }),
                                onTapGesture(() => {
                                  setSelectedAsset(asset)
                                  setIsAssetSheetPresented(false)
                                }),
                              ]}
                            >
                              <Image
                                systemName={
                                  selectedAsset?.id === asset.id
                                    ? 'checkmark.circle.fill'
                                    : 'circle'
                                }
                                size={22}
                                color={selectedAsset?.id === asset.id ? '#0A84FF' : '#C7C7CC'}
                              />
                              <VStack alignment="leading" spacing={2}>
                                <Text
                                  modifiers={[
                                    font({ size: 16, weight: 'medium' }),
                                    foregroundStyle('primary'),
                                  ]}
                                >
                                  {asset.artworkName}
                                </Text>
                                <Text
                                  modifiers={[font({ size: 12 }), foregroundStyle('secondary')]}
                                >
                                  #{asset.serialNumber?.substring(0, 14)}...
                                </Text>
                              </VStack>
                              <Spacer />
                              <Text
                                modifiers={[
                                  font({ size: 14, weight: 'medium' }),
                                  foregroundStyle('secondary'),
                                ]}
                              >
                                ¥{asset.purchasePrice}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>
                      </ScrollView>
                    )}
                  </Section>
                </List>
              </Group>
            </BottomSheet>
          </Host>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  host: {
    flex: 1,
  },
})
