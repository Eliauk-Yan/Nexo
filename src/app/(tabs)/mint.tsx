/**
 * 铸造页面
 * 用于创建和铸造新的 NFT
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { LinearGradient } from 'expo-linear-gradient'
import Feather from '@expo/vector-icons/Feather'
import NexoInput from '@/components/ui/NexoInput'
import { colors, spacing, typography, borderRadius } from '@/config/theme'
import { uploadApi, nftApi } from '@/services/api'
import { handleApiError } from '@/utils/errorHandler'
import { validateRequired, validateUrl } from '@/utils/validation'
import { MESSAGES } from '@/constants/messages'

const Mint = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('权限', '需要访问相册权限')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri)
    }
  }

  const handleMint = async () => {
    // 表单验证
    if (!validateRequired(name)) {
      Alert.alert('错误', '请输入 NFT 名称')
      return
    }

    if (!image) {
      Alert.alert('错误', '请选择 NFT 图片')
      return
    }

    try {
      setLoading(true)

      // 上传图片
      let imageUrl = image
      if (!validateUrl(image)) {
        const uploadResult = await uploadApi.uploadImage({
          uri: image,
          type: 'image/jpeg',
          name: 'nft-image.jpg',
        })
        imageUrl = uploadResult.url
      }

      // 创建 NFT
      await nftApi.mint({
        name,
        description,
        image: imageUrl,
        price: price || undefined,
        currency: 'ETH',
      })

      Alert.alert('成功', MESSAGES.NFT.MINT_SUCCESS, [
        {
          text: '确定',
          onPress: () => {
            setName('')
            setDescription('')
            setImage(null)
            setPrice('')
          },
        },
      ])
    } catch (error) {
      const errorMessage = handleApiError(error as Error)
      Alert.alert('错误', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>铸造 NFT</Text>
          <Text style={styles.subtitle}>创建您的数字藏品</Text>
        </View>

        <View style={styles.form}>
          {/* 图片上传 */}
          <View style={styles.imageSection}>
            <Text style={styles.label}>NFT 图片 *</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Feather name="image" size={48} color={colors.textSecondary} />
                  <Text style={styles.imagePlaceholderText}>选择图片</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* 名称 */}
          <NexoInput
            label="NFT 名称 *"
            icon="tag"
            placeholder="输入 NFT 名称"
            value={name}
            InputOnChangeText={setName}
          />

          {/* 描述 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>描述</Text>
      <NexoInput
              label=""
              icon="file-text"
              placeholder="输入 NFT 描述（可选）"
              value={description}
              InputOnChangeText={setDescription}
      />
    </View>

          {/* 价格 */}
          <NexoInput
            label="价格（ETH）"
            icon="dollar-sign"
            placeholder="输入价格（可选）"
            value={price}
            InputOnChangeText={setPrice}
          />

          {/* 铸造按钮 */}
          <TouchableOpacity
            onPress={handleMint}
            disabled={loading || !name || !image}
            style={styles.mintButton}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.mintButtonGradient}
            >
              <Text style={styles.mintButtonText}>
                {loading ? '铸造中...' : '立即铸造'}
              </Text>
              {!loading && <Feather name="zap" size={20} color={colors.text} />}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.md,
  },
  imageSection: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  imagePicker: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    marginTop: spacing.sm,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  mintButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  mintButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  mintButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
})

export default Mint
