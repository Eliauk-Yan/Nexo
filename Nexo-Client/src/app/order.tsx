import { LiquidGlassButton } from '@/components/ui';
import { colors, spacing } from '@/config/theme';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
    { id: 'all', label: '全部' },
    { id: 'pending', label: '待付款' },
    { id: 'paid', label: '已付款' },
    { id: 'cancelled', label: '已取消' },
];

const OrderPage = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('all');

    const HEADER_HEIGHT = 44;

    return (
        <View style={styles.rootContainer}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header - Same as Notification Center */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <LiquidGlassButton
                    icon="chevron-left"
                    onPress={() => router.back()}
                />
                <Text style={styles.headerTitle}>我的订单</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={[styles.container, { paddingTop: insets.top + HEADER_HEIGHT + 16 }]}>
                {/* Tabs Section */}
                <View style={styles.tabsContainer}>
                    {TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={styles.tabItem}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <Text style={[
                                styles.tabLabel,
                                activeTab === tab.id && styles.activeTabLabel
                            ]}>
                                {tab.label}
                            </Text>
                            {activeTab === tab.id && (
                                <View style={styles.activeIndicator} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Empty State placeholder */}
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>暂无相关订单</Text>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
    },
    container: {
        flex: 1,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    tabItem: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        position: 'relative',
    },
    tabLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    activeTabLabel: {
        color: colors.primary,
        fontWeight: '600',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        width: 20,
        height: 3,
        backgroundColor: colors.primary,
        borderRadius: 2,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    scrollView: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        paddingTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
});

export default OrderPage;
