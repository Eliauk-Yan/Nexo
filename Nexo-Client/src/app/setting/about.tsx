import { Stack, useRouter } from 'expo-router'
import { Host, List, Section, Label, LabeledContent, Text, Link } from '@expo/ui/swift-ui'
import { listStyle, onTapGesture } from '@expo/ui/swift-ui/modifiers'
import React, { useRef, useState } from 'react'
import { Alert } from 'react-native'

const About = () => {
  const router = useRouter()

  const tapCountRef = useRef(0)
  const [easterEgg, setEasterEgg] = useState<string | null>(null)

  const handleLogoPress = () => {
    tapCountRef.current += 1
    if (tapCountRef.current === 5) {
      setEasterEgg('你已经解锁了NEXO的隐藏成就：真正点进关于页的开发者。祝毕业答辩一次通过！')
      Alert.alert('🎉 小彩蛋', '你已经解锁了NEXO的隐藏成就：真正点进关于页的开发者。祝毕业答辩一次通过！')
    }
  }

  const projectUrl = 'https://github.com/Eliauk-Yan/Nexo.git'

  return (
    <>
      <Stack.Screen
        options={{
          title: '关于我们',
          headerLargeTitle: true,
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.left" onPress={() => router.back()} />
      </Stack.Toolbar>

      <Host style={{ flex: 1 }}>
        <List modifiers={[listStyle('insetGrouped')]}>
          {/* 应用信息 */}
          <Section title="应用信息">
            <Label
              title="NEXO"
              systemImage="app.gift"
              modifiers={[onTapGesture(handleLogoPress)]}
            />
            <LabeledContent label="版本号">
              <Text>1.0.0</Text>
            </LabeledContent>
            <LabeledContent label="构建版本">
              <Text>2026.03.31</Text>
            </LabeledContent>
          </Section>

          {/* 项目说明 */}
          <Section title="项目说明">
            <LabeledContent label={<Label title="项目简介" systemImage="doc.text" />}>
              <Text>毕业设计演示</Text>
            </LabeledContent>
          </Section>

          {/* 技术栈 */}
          <Section title="技术栈">
            <LabeledContent label={<Label title="前端" systemImage="iphone" />}>
              <Text>React Native · Expo</Text>
            </LabeledContent>
            <LabeledContent label={<Label title="后端" systemImage="server.rack" />}>
              <Text>SpringCloud</Text>
            </LabeledContent>
            <LabeledContent label={<Label title="数据库" systemImage="externaldrive" />}>
              <Text>MySQL · Redis</Text>
            </LabeledContent>
          </Section>

          {/* 相关链接 */}
          <Section title="相关链接">
            <Link label="项目地址" destination={projectUrl} />
          </Section>

          {/* 彩蛋 */}
          {easterEgg && (
            <Section title="🎉 隐藏成就">
              <Label title="彩蛋已解锁" systemImage="star.fill" />
            </Section>
          )}
        </List>
      </Host>
    </>
  )
}

export default About
