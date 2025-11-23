import { Button, StyleSheet, Text, TextInput, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import React, { useState } from 'react'

type NexoInputProps = {
  icon: keyof typeof Feather.glyphMap
  label: string
  placeholder?: string
  value: string
  type?: 'text' | 'password' | 'email' | 'sms' | 'phone'
  InputOnChangeText: (text: string) => void
  buttonOnPress?: () => void
}

const NexoInput = (props: NexoInputProps) => {
  const { label, icon, placeholder, value, type = 'text', buttonOnPress, InputOnChangeText } = props

  const [isFocused, setIsFocused] = useState(false)

  return (
    <View style={styles.layout}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
        <View style={styles.left}>
          <Feather
            name={icon}
            size={20}
            color={isFocused ? '#6C5CE7' : '#666'}
            style={styles.inputIcon}
          />
        </View>
        <TextInput
          // 光标颜色
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#666"
          value={value}
          onChangeText={InputOnChangeText}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
        />
        {type === 'sms' && (
          <Button title="发送验证码" onPress={buttonOnPress} disabled={!isFocused} />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  layout: {
    width: '80%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 12,
  },
  inputWrapperFocused: {
    borderColor: '#6C5CE7',
  },
  input: {
    flex: 1,
    color: '#FFF',
    paddingVertical: 0,
  },
  inputIcon: {
    marginRight: 10,
  },
  label: {
    color: '#888',
    fontSize: 14,
    marginBottom: 6,
    marginLeft: 4,
  },
  left: {},
  right: {},
})

export default NexoInput
