import { LiquidGlassButton } from '@/components/ui'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@/config/theme'

const ProfileEdit = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [username, setUsername] = useState('Shiie Yan')
  const [bio, setBio] = useState('Digital artist & NFT collector.')
  const [email, setEmail] = useState('user@example.com')
  const [website, setWebsite] = useState('https://example.com')
  const [location, setLocation] = useState('Shanghai, CN')

  const handleSave = () => {
    Alert.alert('已保存', '个人资料已更新')
    router.back()
  }

  const renderField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    props?: Partial<React.ComponentProps<typeof TextInput>>
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#666"
        {...props}
      />
    </View>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <LiquidGlassButton icon="arrow-left" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>编辑个人资料</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.avatarBox}>
          <View style={styles.avatarPlaceholder}>
            <Feather name="user" size={32} color="#9EA3B5" />
          </View>
          <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.8}>
            <Text style={styles.avatarBtnText}>更换头像</Text>
          </TouchableOpacity>
        </View>

        {renderField('用户名', username, setUsername)}
        {renderField('个人简介', bio, setBio, {
          multiline: true,
          numberOfLines: 3,
          style: [styles.input, styles.textArea],
        })}
        {renderField('邮箱', email, setEmail, { keyboardType: 'email-address' })}
        {renderField('个人主页', website, setWebsite, { autoCapitalize: 'none' })}
        {renderField('所在地', location, setLocation)}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.9}>
          <Text style={styles.saveBtnText}>保存修改</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  avatarBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#111219',
    borderWidth: 1,
    borderColor: '#1f2130',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1f2130',
    borderRadius: 20,
  },
  avatarBtnText: {
    color: '#E2E6F0',
    fontSize: 13,
    fontWeight: '600',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: '#9EA3B5',
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0f111a',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#1f2130',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  saveBtn: {
    marginTop: 10,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})

export default ProfileEdit

