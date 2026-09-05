import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Home,
  BellOff,
  Clock,
  MessageSquare,
  RefreshCw,
  FileText,
  ShieldCheck,
  ChevronRight,
  CheckCheck,
  Tag,
  Store,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { getMyselfRedux } from '../redux/getData';
import { apiFunction } from '../apis/apiFunction';
import { readNotificationsApi } from '../apis/api';
import Toast from 'react-native-toast-message';
import AppHeader from '../components/common/AppHeader';

const Notification = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { myself } = useSelector((state) => state.getData);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'enquiries'
  // Local optimistic read overrides map: { [notificationId]: true }
  const [readOverrides, setReadOverrides] = useState({});

  const getMyself = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        dispatch(getMyselfRedux(userId));
      }
    } catch (e) {
      console.log('Error fetching user profile:', e);
    }
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getMyself();
    setRefreshing(false);
  };

  useEffect(() => {
    if (!myself) {
      getMyself();
    }
  }, [myself, getMyself]);

  // Check if an item is unread (considering optimistic local overrides)
  const isItemUnread = useCallback(
    (item) => {
      if (readOverrides[item.id]) return false;
      if (item.isRead === false || item.is_read === false) return true;
      if (item.isRead === true || item.is_read === true) return false;
      return false;
    },
    [readOverrides]
  );

  // Memoize all notifications, latest first
  const allNotifications = useMemo(() => {
    if (!myself?.notifications || !Array.isArray(myself.notifications)) return [];
    return [...myself.notifications].reverse();
  }, [myself]);

  // Filter unread notifications
  const unreadNotifications = useMemo(() => {
    return allNotifications.filter((item) => isItemUnread(item));
  }, [allNotifications, isItemUnread]);

  // Filter enquiries notifications
  const enquiryNotifications = useMemo(() => {
    return allNotifications.filter((item) => {
      const type = (item.eventType || item.event_type || '').toLowerCase();
      return (
        type === 'new_message' ||
        type === 'status_change' ||
        type === 'new_enquiry' ||
        item.metadata?.enquiryId ||
        item.metadata?.enquiry_id
      );
    });
  }, [allNotifications]);

  // Displayed notifications based on active tab
  const displayedNotifications = useMemo(() => {
    if (activeTab === 'unread') return unreadNotifications;
    if (activeTab === 'enquiries') return enquiryNotifications;
    return allNotifications;
  }, [activeTab, allNotifications, unreadNotifications, enquiryNotifications]);

  // Group notifications chronologically: "TODAY" (<24h) and "EARLIER"
  const { todayNotifications, earlierNotifications } = useMemo(() => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const today = [];
    const earlier = [];

    displayedNotifications.forEach((item) => {
      const timeVal = new Date(item.timestamp || item.created_at || item.createdAt || 0).getTime();
      if (now - timeVal < oneDayMs) {
        today.push(item);
      } else {
        earlier.push(item);
      }
    });

    return { todayNotifications: today, earlierNotifications: earlier };
  }, [displayedNotifications]);

  const markAllAsRead = async () => {
    if (unreadNotifications.length === 0) return;

    // Optimistically mark all current items as read locally
    const nextOverrides = { ...readOverrides };
    unreadNotifications.forEach((n) => {
      if (n.id) nextOverrides[n.id] = true;
    });
    setReadOverrides(nextOverrides);

    setLoading(true);
    try {
      const res = await apiFunction(readNotificationsApi, [myself?.id], {}, 'PUT', true);
      setLoading(false);

      if (res?.success) {
        Toast.show({
          type: 'success',
          text1: 'Notifications Updated',
          text2: 'All alerts marked as read',
        });
        getMyself();
      } else {
        Toast.show({
          type: 'error',
          text1: res?.message || 'Failed to update notifications',
        });
      }
    } catch (error) {
      setLoading(false);
      console.log('Error marking notifications as read:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update notifications',
      });
    }
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    try {
      const date = new Date(timestamp);
      const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

      if (seconds < 60) return 'Just now';

      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;

      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;

      const days = Math.floor(hours / 24);
      if (days === 1) return 'Yesterday';
      if (days < 7) return `${days}d ago`;

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return 'Recent';
    }
  };

  const getEventMeta = (item) => {
    const type = (item.eventType || item.event_type || '').toLowerCase();
    const enquiryId = item.metadata?.enquiryId || item.metadata?.enquiry_id;

    if (type === 'new_message') {
      return {
        badgeText: enquiryId ? `TICKET #${enquiryId}` : 'NEW MESSAGE',
        badgeBg: '#FEF2F2',
        badgeColor: '#D0142C',
        icon: <MessageSquare size={16} color="#D0142C" strokeWidth={2.2} />,
        iconBg: '#FEE2E2',
      };
    }
    if (type === 'status_change') {
      return {
        badgeText: enquiryId ? `TICKET #${enquiryId} • STATUS` : 'STATUS UPDATE',
        badgeBg: '#EFF6FF',
        badgeColor: '#2563EB',
        icon: <RefreshCw size={16} color="#2563EB" strokeWidth={2.2} />,
        iconBg: '#DBEAFE',
      };
    }
    if (type === 'new_enquiry') {
      return {
        badgeText: enquiryId ? `TICKET #${enquiryId}` : 'NEW ENQUIRY',
        badgeBg: '#F5F3FF',
        badgeColor: '#7C3AED',
        icon: <FileText size={16} color="#7C3AED" strokeWidth={2.2} />,
        iconBg: '#EDE9FE',
      };
    }
    if (type === 'account_approved') {
      return {
        badgeText: 'VERIFIED DEALER',
        badgeBg: '#ECFDF5',
        badgeColor: '#059669',
        icon: <ShieldCheck size={16} color="#059669" strokeWidth={2.2} />,
        iconBg: '#D1FAE5',
      };
    }

    return {
      badgeText: 'ALERT',
      badgeBg: '#F1F5F9',
      badgeColor: '#475569',
      icon: <FileText size={16} color="#475569" strokeWidth={2.2} />,
      iconBg: '#E2E8F0',
    };
  };

  const handleNotificationPress = async (item) => {
    // 1. Optimistic read override
    if (item.id) {
      setReadOverrides((prev) => ({ ...prev, [item.id]: true }));

      // 2. Fire single-notification read API in background
      if (myself?.id) {
        apiFunction(
          readNotificationsApi,
          [myself.id],
          { notificationId: item.id },
          'PUT',
          false
        ).catch((err) => console.warn('Single read error:', err));
      }
    }

    // 3. Deep-link directly to target conversation
    const enquiryId =
      item.metadata?.enquiryId ||
      item.metadata?.enquiry_id ||
      item.metadata?.id;

    if (enquiryId) {
      navigation.navigate('MyEnquiries', { openTicketId: enquiryId });
    }
  };

  const renderCard = (item, index) => {
    const unread = isItemUnread(item);
    const timeStr = formatRelativeTime(item.timestamp || item.created_at || item.createdAt);
    const meta = getEventMeta(item);
    const hasLink = !!(
      item.metadata?.enquiryId ||
      item.metadata?.enquiry_id ||
      item.metadata?.id
    );

    return (
      <TouchableOpacity
        key={item.id || index}
        style={[
          styles.notificationCard,
          unread ? styles.cardUnread : styles.cardRead,
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={hasLink ? 0.75 : 1}
        disabled={!hasLink}
      >
        {/* Unread Left Red Accent Rail */}
        {unread && <View style={styles.unreadRail} />}

        {/* Event Icon Stage */}
        <View style={[styles.iconStage, { backgroundColor: meta.iconBg }]}>
          {meta.icon}
        </View>

        {/* Card Body */}
        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <View style={[styles.categoryBadge, { backgroundColor: meta.badgeBg }]}>
              <Text style={[styles.categoryBadgeText, { color: meta.badgeColor }]}>
                {meta.badgeText}
              </Text>
            </View>

            <View style={styles.cardTimeWrap}>
              <Clock size={11} color="#94A3B8" />
              <Text style={styles.cardTimeText}>{timeStr}</Text>
              {unread && <View style={styles.unreadPillDot} />}
            </View>
          </View>

          <Text
            style={[styles.messageText, unread ? styles.messageTextUnread : styles.messageTextRead]}
            numberOfLines={2}
          >
            {item.message}
          </Text>

          {/* Optional context tags */}
          {(item.metadata?.dealerName || item.metadata?.partNumber) && (
            <View style={styles.metaRow}>
              {item.metadata?.dealerName && (
                <View style={styles.metaChip}>
                  <Store size={10} color="#059669" />
                  <Text style={styles.metaChipText} numberOfLines={1}>
                    {item.metadata.dealerName}
                  </Text>
                </View>
              )}
              {item.metadata?.partNumber && (
                <View style={styles.metaChip}>
                  <Tag size={10} color="#D0142C" />
                  <Text style={styles.metaChipText} numberOfLines={1}>
                    #{item.metadata.partNumber}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Right Action Indicator */}
        {hasLink && (
          <View style={styles.chevronBox}>
            <ChevronRight size={16} color={unread ? '#94A3B8' : '#CBD5E1'} strokeWidth={2.2} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Notifications"
        subtitle={
          unreadNotifications.length > 0
            ? `${unreadNotifications.length} pending alert${unreadNotifications.length > 1 ? 's' : ''}`
            : 'All caught up'
        }
        onBack={() => navigation.goBack()}
        rightElement={
          <View style={styles.headerRightBox}>
            {unreadNotifications.length > 0 && (
              <TouchableOpacity
                style={styles.readAllButton}
                onPress={markAllAsRead}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <View style={styles.readAllRow}>
                    <CheckCheck size={13} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={styles.readAllText}>Read All</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate('OwnerHome')}
              style={styles.headerHomeBtn}
              activeOpacity={0.8}
            >
              <Home color="#FFFFFF" size={17} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Segmented Filter Control */}
      <View style={styles.filterBarContainer}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'all' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.75}
          >
            <Text style={[styles.segmentText, activeTab === 'all' && styles.segmentTextActive]}>
              All
            </Text>
            <View style={[styles.countBadge, activeTab === 'all' && styles.countBadgeActive]}>
              <Text style={[styles.countBadgeText, activeTab === 'all' && styles.countBadgeTextActive]}>
                {allNotifications.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'unread' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('unread')}
            activeOpacity={0.75}
          >
            <Text style={[styles.segmentText, activeTab === 'unread' && styles.segmentTextActive]}>
              Unread
            </Text>
            {unreadNotifications.length > 0 && (
              <View style={styles.countBadgeUnread}>
                <Text style={styles.countBadgeUnreadText}>
                  {unreadNotifications.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'enquiries' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('enquiries')}
            activeOpacity={0.75}
          >
            <Text style={[styles.segmentText, activeTab === 'enquiries' && styles.segmentTextActive]}>
              Enquiries
            </Text>
            <View style={[styles.countBadge, activeTab === 'enquiries' && styles.countBadgeActive]}>
              <Text style={[styles.countBadgeText, activeTab === 'enquiries' && styles.countBadgeTextActive]}>
                {enquiryNotifications.length}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#D0142C']}
            tintColor="#D0142C"
          />
        }
      >
        {displayedNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <ShieldCheck color="#10B981" size={38} strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'unread' ? 'No Pending Alerts' : 'All Caught Up!'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'unread'
                ? 'All notifications have been reviewed. Switch to "All" to browse message history.'
                : 'No new activity at the moment. We will notify you when stockists quote or respond to your enquiries.'}
            </Text>
          </View>
        ) : (
          <>
            {/* TODAY SECTION */}
            {todayNotifications.length > 0 && (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>TODAY</Text>
                  <View style={styles.sectionLine} />
                  <Text style={styles.sectionCount}>{todayNotifications.length}</Text>
                </View>
                {todayNotifications.map((item, idx) => renderCard(item, `today_${idx}`))}
              </View>
            )}

            {/* EARLIER SECTION */}
            {earlierNotifications.length > 0 && (
              <View style={[styles.sectionWrap, todayNotifications.length > 0 && { marginTop: 18 }]}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>EARLIER</Text>
                  <View style={styles.sectionLine} />
                  <Text style={styles.sectionCount}>{earlierNotifications.length}</Text>
                </View>
                {earlierNotifications.map((item, idx) => renderCard(item, `earlier_${idx}`))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerRightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  readAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readAllText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  headerHomeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Segmented Control
  filterBarContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  countBadgeActive: {
    backgroundColor: '#0F172A',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  countBadgeTextActive: {
    color: '#FFFFFF',
  },
  countBadgeUnread: {
    backgroundColor: '#D0142C',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  countBadgeUnreadText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Main scroll content
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
  },

  // Chronological sections
  sectionWrap: {
    marginBottom: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  sectionCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },

  // Notification Cards
  notificationCard: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardUnread: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  cardRead: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  unreadRail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 3.5,
    backgroundColor: '#D0142C',
  },
  iconStage: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardTimeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardTimeText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  unreadPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D0142C',
    marginLeft: 3,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  messageTextUnread: {
    fontWeight: '600',
    color: '#0F172A',
  },
  messageTextRead: {
    fontWeight: '400',
    color: '#64748B',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  chevronBox: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  emptyIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Notification;