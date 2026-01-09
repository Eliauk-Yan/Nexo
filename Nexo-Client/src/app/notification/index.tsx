import { LiquidGlassButton } from '@/components/ui';
import { colors } from '@/config/theme';
import { FontAwesome6 } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NotificationPage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const HEADER_HEIGHT = 44; // Button size

  return (
    <View style={styles.rootContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header - Absolute & Transparent */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <LiquidGlassButton
          icon="chevron-left"
          onPress={() => router.back()}
        />
        <Text style={styles.headerTitle}>消息中心</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + HEADER_HEIGHT + 24,
            paddingBottom: insets.bottom + 32
          },
        ]}
      >
        {/* Top statistic blocks */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.statBlock}
            activeOpacity={0.8}
            onPress={() => router.push('/notification/like')}
          >
            <FontAwesome6 name="thumbs-up" size={22} color={colors.success} style={styles.iconSpacing} />
            <Text style={styles.statLabel}>赞</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statBlock}
            activeOpacity={0.8}
            onPress={() => router.push('/notification/follow')}
          >
            <FontAwesome6 name="user-plus" size={22} color={colors.info} style={styles.iconSpacing} />
            <Text style={styles.statLabel}>新增关注</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statBlock}
            activeOpacity={0.8}
            onPress={() => router.push('/notification/comment')}
          >
            <FontAwesome6 name="comment" size={22} color={colors.warning} style={styles.iconSpacing} />
            <Text style={styles.statLabel}>评论</Text>
          </TouchableOpacity>
        </View>

        {/* Notification list */}
        <View style={styles.listContainer}>
          <Pressable
            style={styles.listItem}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
            onPress={() => router.push('/notification/activity')}
          >
            <View style={styles.leftSection}>
              <FontAwesome6 name="bullhorn" size={20} color={colors.primary} />
              <Text style={styles.listText}>活动通知</Text>
            </View>
            <FontAwesome6 name="chevron-right" size={14} color="#8E8E93" />
          </Pressable>

          <Pressable
            style={styles.listItem}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
            onPress={() => router.push('/notification/collection')}
          >
            <View style={styles.leftSection}>
              <FontAwesome6 name="box-open" size={20} color={colors.primaryDark} />
              <Text style={styles.listText}>藏品消息</Text>
            </View>
            <FontAwesome6 name="chevron-right" size={14} color="#8E8E93" />
          </Pressable>

          <Pressable
            style={[styles.listItem, styles.lastItem]}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
            onPress={() => router.push('/notification/subscription')}
          >
            <View style={styles.leftSection}>
              <FontAwesome6 name="envelope-open-text" size={20} color={colors.primaryLight} />
              <Text style={styles.listText}>订阅消息</Text>
            </View>
            <FontAwesome6 name="chevron-right" size={14} color="#8E8E93" />
          </Pressable>
        </View>
      </ScrollView>
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
    // Transparent background by default
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  container: {
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
    gap: 12,
  },
  statBlock: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
  },
  iconSpacing: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#E5E5EA',
    fontWeight: '600',
  },
  listContainer: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 28,
    width: '100%',
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 25,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#38383A',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  listText: {
    fontSize: 15,
    color: '#E5E5EA',
    fontWeight: '500',
  },
});

export default NotificationPage;
