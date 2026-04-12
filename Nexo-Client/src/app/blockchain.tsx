import React, { useState } from 'react'
import { Stack, useRouter } from 'expo-router'
import { StyleSheet, View, Alert, Linking } from 'react-native'
import {
  Host,
  List,
  Section,
  VStack,
  HStack,
  Spacer,
  Text,
  TextField,
  Button,
} from '@expo/ui/swift-ui'
import {
  buttonStyle,
  controlSize,
  font,
  foregroundStyle,
  listRowBackground,
  listStyle,
  padding,
} from '@expo/ui/swift-ui/modifiers'

export default function BlockchainScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    if (!query.trim()) {
      Alert.alert('提示', '请输入有效的哈希值或区块链地址')
      return
    }

    Linking.openURL('https://docs.avata.bianjie.ai/api-95754726')
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: '区块链查询',
          headerTransparent: true,
        }}
      />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.left" onPress={() => router.back()} />
      </Stack.Toolbar>

      <Host style={styles.host}>
        <List modifiers={[listStyle('insetGrouped')]}>
          {/* 顶部标题区 - 参考登录页样式 */}
          <Section modifiers={[listRowBackground('clear')]}>
            <VStack alignment="leading" spacing={8}>
              <Text modifiers={[font({ size: 32, weight: 'bold' }), foregroundStyle('primary')]}>
                区块链查询
              </Text>
              <Text modifiers={[font({ size: 15 }), foregroundStyle('secondary')]}>
                请输入哈希值（含区块链地址）支持藏品账户相关区块链信息的查询
              </Text>
            </VStack>
          </Section>

          {/* 输入区域 */}
          <Section title="查询信息">
            <TextField
              placeholder="输入交易哈希、合约地址或账户地址"
              keyboardType="default"
              autocorrection={false}
              allowNewlines={true}
              defaultValue={query}
              onChangeText={setQuery}
            />
          </Section>

          {/* 操作区域 */}
          <Section modifiers={[listRowBackground('clear')]}>
            <HStack>
              <Spacer />
              <Button
                label="立即查询"
                onPress={handleSearch}
                modifiers={[
                  buttonStyle('glassProminent'),
                  controlSize('extraLarge'),
                ]}
              />
              <Spacer />
            </HStack>
          </Section>
        </List>
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
