import { LiquidGlassButton } from '@/components/ui'
import { colors, spacing, typography } from '@/config/theme'
import { useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const CollectionPage = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const buttonTop = insets.top + spacing.md

    return (
        <View style={styles.container}>
            <View style={[styles.backButton, { top: buttonTop }]}>
                <LiquidGlassButton icon="chevron-left" onPress={() => router.back()} />
            </View>
            <View style={[styles.content, { paddingTop: buttonTop + 50 + spacing.lg }]}>
                <Text style={styles.title}>藏品消息</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    backButton: {
        position: 'absolute',
        left: spacing.md,
        zIndex: 10,
    },
    content: {
        paddingHorizontal: spacing.md,
    },
    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
    },
})

export default CollectionPage
