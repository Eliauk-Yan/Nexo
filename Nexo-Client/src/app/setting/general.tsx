import { LiquidGlassButton } from '@/components/ui'
import { colors, spacing } from '@/config/theme'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { StyleSheet, View, ScrollView, Text, Switch } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const GeneralSetting = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const buttonTop = insets.top + spacing.md

    // 仅做前端展示，实际主题仍为统一深色
    const [isDark, setIsDark] = useState(true)

    return (
        <View style={styles.container}>
            <View style={[styles.backButton, { top: buttonTop }]}>
                <LiquidGlassButton icon="chevron-left" onPress={() => router.back()} />
            </View>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingTop: buttonTop + 50 + spacing.lg }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.itemRow}>
                    <View>
                        <Text style={styles.itemLabel}>夜间模式</Text>
                    </View>
                    <Switch
                        value={isDark}
                        onValueChange={setIsDark}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={isDark ? '#000' : '#f4f3f4'}
                        style={styles.switchControl}
                    />
                </View>
            </ScrollView>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
        gap: spacing.sm,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.backgroundCard,
        borderRadius: 28,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 64,
        width: '100%',
    },
    itemLabel: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '600',
    },
    switchControl: {
        alignSelf: 'center',
    },
})

export default GeneralSetting
