import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MessageSquare,
  ChevronRight,
  Send,
  X,
  Store,
  Plus,
  Car,
  Tag,
  ShieldCheck,
  User,
  Clock,
  Sparkles,
  Building2,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { getEnquiryRedux } from '../redux/getData';
import { apiFunction } from '../apis/apiFunction';
import { addEnquiryMessageApi } from '../apis/api';
import AppHeader from '../components/common/AppHeader';

const MyEnquiriesScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { enquiry, myself } = useSelector((state) => state.getData);

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(
    myself?.role?.toLowerCase() || 'owner'
  );

  useEffect(() => {
    const fetchUserRole = async () => {
      const storedRole =
        (await AsyncStorage.getItem('role')) ||
        (await AsyncStorage.getItem('userRole'));
      if (storedRole) {
        setCurrentUserRole(storedRole.toLowerCase());
      } else if (myself?.role) {
        setCurrentUserRole(myself.role.toLowerCase());
      }
    };
    fetchUserRole();
  }, [myself?.role]);

  const isWholesalerOrDealer =
    currentUserRole === 'reseller' ||
    currentUserRole === 'distributor' ||
    currentUserRole === 'retailer' ||
    currentUserRole === 'wholesaler';

  const refreshEnquiries = useCallback(async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (userId) dispatch(getEnquiryRedux(userId));
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshEnquiries();
    setRefreshing(false);
  };

  useEffect(() => {
    refreshEnquiries();
  }, [refreshEnquiries]);

  // Keep selectedTicket updated if enquiry array in Redux changes
  useEffect(() => {
    if (selectedTicket && enquiry) {
      const updated = enquiry.find((e) => e.id === selectedTicket.id);
      if (updated) {
        setSelectedTicket(updated);
      }
    }
  }, [enquiry, selectedTicket?.id]);

  const filterTabs = ['ALL', 'PENDING', 'IN PROGRESS', 'RESOLVED'];

  const getFilteredList = () => {
    if (!enquiry) return [];
    if (activeFilter === 'ALL') return enquiry;
    return enquiry.filter(
      (e) => (e.status || 'Pending').toUpperCase() === activeFilter
    );
  };

  const getStatusBadge = (status) => {
    const s = (status || 'Pending').toLowerCase();
    switch (s) {
      case 'resolved':
      case 'approved':
        return {
          bg: '#D1FAE5',
          color: '#059669',
          label: 'Resolved',
        };
      case 'in progress':
        return {
          bg: '#DBEAFE',
          color: '#2563EB',
          label: 'In Progress',
        };
      case 'closed':
        return {
          bg: '#F3F4F6',
          color: '#4B5563',
          label: 'Closed',
        };
      default:
        return {
          bg: '#FEF3C7',
          color: '#D97706',
          label: 'Pending',
        };
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    setSendingReply(true);
    const userId = await AsyncStorage.getItem('userId');
    const role = currentUserRole || 'owner';
    const senderDisplayName =
      myself?.name ||
      myself?.companyName ||
      (isWholesalerOrDealer ? 'Authorized Stockist' : 'Vehicle Owner');

    const trimmed = replyMessage.trim();

    const payload = {
      enquiryId: selectedTicket.id,
      id: selectedTicket.id,
      senderId: userId,
      senderRole: role,
      senderName: senderDisplayName,
      text: trimmed,
      message: trimmed,
    };

    try {
      const res = await apiFunction(
        addEnquiryMessageApi,
        [selectedTicket.id],
        payload,
        'POST',
        false
      );
      setSendingReply(false);

      // Optimistically append message to selected ticket
      const optimisticMsg = {
        id: `opt_${Date.now()}`,
        sender: role,
        senderName: senderDisplayName,
        text: trimmed,
        timestamp: new Date().toISOString(),
        isSystem: false,
      };

      setSelectedTicket((prev) => {
        if (!prev) return prev;
        const currentMessages = Array.isArray(prev.messages) ? prev.messages : [];
        return {
          ...prev,
          messages: [...currentMessages, optimisticMsg],
        };
      });

      setReplyMessage('');
      Toast.show({
        type: 'success',
        text1: 'Reply Relayed',
        text2: 'Message posted to the enquiry conversation thread.',
      });
      refreshEnquiries();
    } catch (err) {
      setSendingReply(false);
      Toast.show({
        type: 'error',
        text1: 'Failed to send reply',
        text2: 'Network connection error or server timeout.',
      });
    }
  };

  const filtered = getFilteredList();

  // Format date helper
  const formatMsgTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    try {
      const d = new Date(timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Recent';
    }
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <AppHeader
        title={isWholesalerOrDealer ? 'Inquiry Leads' : 'Technical Enquiries'}
        subtitle={`${enquiry?.length || 0} Total Requests`}
        onBack={() => navigation.goBack()}
        rightElement={
          !isWholesalerOrDealer && (
            <TouchableOpacity
              style={styles.newTicketHeaderBtn}
              onPress={() => navigation.navigate('TechnicalEnquiry')}
              activeOpacity={0.8}
            >
              <Plus size={15} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.newTicketHeaderBtnText}>New</Text>
            </TouchableOpacity>
          )
        }
      />

      {/* Role View Banner */}
      {isWholesalerOrDealer && (
        <View style={styles.roleBanner}>
          <Building2 size={15} color="#D0142C" />
          <Text style={styles.roleBannerText}>
            Wholesaler & Reseller Portal: Customer inquiries appear as leads. Reply below to relay assistance.
          </Text>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabPill, isSelected && styles.tabPillSelected]}
                onPress={() => setActiveFilter(tab)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    isSelected && styles.tabPillTextSelected,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#D0142C']}
            tintColor="#D0142C"
          />
        }
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MessageSquare size={32} color="#D0142C" />
            </View>
            <Text style={styles.emptyTitle}>No Enquiries Found</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any tickets matching the "{activeFilter}" filter.
            </Text>
          </View>
        ) : (
          <View style={styles.ticketList}>
            {filtered.map((item, idx) => {
              const statusStyle = getStatusBadge(item.status);
              const partNumber =
                item.part_number ||
                item.part?.articleNo ||
                item.part?.partNumber ||
                item.vehicle?.partNumber ||
                null;
              const vehicleName =
                item.car_name ||
                (item.vehicle?.make
                  ? `${item.vehicle.make} ${item.vehicle.model || ''}`
                  : null);

              const messagesCount = item.messages?.length || 0;

              return (
                <TouchableOpacity
                  key={item.id || idx}
                  style={styles.ticketCard}
                  onPress={() => setSelectedTicket(item)}
                  activeOpacity={0.75}
                >
                  <View style={styles.ticketTop}>
                    <Text style={styles.ticketId}>TICKET #{item.id || idx + 1}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusStyle.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: statusStyle.color },
                        ]}
                      >
                        {statusStyle.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.partTitle} numberOfLines={1}>
                    {item.title ||
                      item.part_name ||
                      item.enquiry_details ||
                      'Technical Support Inquiry'}
                  </Text>

                  {/* Badges for Part # and Vehicle */}
                  <View style={styles.metaRow}>
                    {partNumber && (
                      <View style={styles.partBadge}>
                        <Tag size={12} color="#D0142C" />
                        <Text style={styles.partBadgeText} numberOfLines={1}>
                          {partNumber}
                        </Text>
                      </View>
                    )}
                    {vehicleName && (
                      <View style={styles.vehicleBadge}>
                        <Car size={12} color="#2563EB" />
                        <Text style={styles.vehicleBadgeText} numberOfLines={1}>
                          {vehicleName}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.ticketFooter}>
                    <View style={styles.dealerInfo}>
                      <Store size={13} color="#6B7280" />
                      <Text style={styles.dealerName} numberOfLines={1}>
                        {item.dealerName || item.dealer?.name || 'Assigned Dealer'}
                      </Text>
                    </View>

                    {messagesCount > 0 && (
                      <View style={styles.messageCountChip}>
                        <MessageSquare size={11} color="#D0142C" />
                        <Text style={styles.messageCountChipText}>
                          {messagesCount} msg{messagesCount > 1 ? 's' : ''}
                        </Text>
                      </View>
                    )}

                    <ChevronRight size={16} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* TICKET DETAIL & CONVERSATION RELAY MODAL (Item 7) */}
      <Modal
        visible={!!selectedTicket}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedTicket(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View>
                  <View style={styles.modalHeaderTop}>
                    <Text style={styles.modalTitle}>
                      Ticket #{selectedTicket?.id}
                    </Text>
                    {selectedTicket && (
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: getStatusBadge(
                              selectedTicket.status
                            ).bg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            {
                              color: getStatusBadge(
                                selectedTicket.status
                              ).color,
                            },
                          ]}
                        >
                          {getStatusBadge(selectedTicket.status).label}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.modalSubtitle}>
                    {selectedTicket?.created_at
                      ? new Date(selectedTicket.created_at).toLocaleDateString(
                          undefined,
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )
                      : 'Recent Ticket'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedTicket(null)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.modalCloseBtn}
                >
                  <X size={18} color="#4B5563" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollBody}
              >
                {/* Ticket Specs Summary Card */}
                <View style={styles.specsCard}>
                  <Text style={styles.specsCardTitle}>
                    {selectedTicket?.title || 'Technical Inquiry'}
                  </Text>

                  <View style={styles.specsGrid}>
                    {(selectedTicket?.part_number ||
                      selectedTicket?.part?.articleNo ||
                      selectedTicket?.vehicle?.partNumber) && (
                      <View style={styles.specsItem}>
                        <Text style={styles.specsLabel}>PART NUMBER</Text>
                        <Text style={styles.specsValue}>
                          {selectedTicket?.part_number ||
                            selectedTicket?.part?.articleNo ||
                            selectedTicket?.vehicle?.partNumber}
                        </Text>
                      </View>
                    )}

                    {(selectedTicket?.car_name ||
                      selectedTicket?.vehicle?.make) && (
                      <View style={styles.specsItem}>
                        <Text style={styles.specsLabel}>VEHICLE</Text>
                        <Text style={styles.specsValue}>
                          {selectedTicket?.car_name ||
                            `${selectedTicket?.vehicle?.make || ''} ${
                              selectedTicket?.vehicle?.model || ''
                            }`.trim()}
                        </Text>
                      </View>
                    )}

                    <View style={styles.specsItem}>
                      <Text style={styles.specsLabel}>
                        {isWholesalerOrDealer ? 'CUSTOMER' : 'ASSIGNED DEALER'}
                      </Text>
                      <Text style={styles.specsValue} numberOfLines={1}>
                        {isWholesalerOrDealer
                          ? selectedTicket?.userName || 'Vehicle Owner'
                          : selectedTicket?.dealerName ||
                            selectedTicket?.dealer?.name ||
                            'Authorized Stockist'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* CONVERSATION RELAY THREAD (Item 7) */}
                <View style={styles.threadSection}>
                  <View style={styles.threadHeaderRow}>
                    <Text style={styles.threadSectionTitle}>
                      CONVERSATION RELAY HISTORY
                    </Text>
                    <View style={styles.liveIndicator}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>Live Relay</Text>
                    </View>
                  </View>

                  {/* Initial Root Query Card */}
                  <View style={styles.rootQueryBubble}>
                    <View style={styles.messageHeaderRow}>
                      <View style={styles.senderPillCustomer}>
                        <User size={12} color="#D0142C" />
                        <Text style={styles.senderPillCustomerText}>
                          {selectedTicket?.userName || 'Customer / Vehicle Owner'}
                        </Text>
                      </View>
                      <Text style={styles.messageTimeText}>
                        {formatMsgTime(selectedTicket?.created_at)}
                      </Text>
                    </View>

                    <Text style={styles.rootQueryText}>
                      {selectedTicket?.enquiry_details ||
                        selectedTicket?.description ||
                        'No detailed description provided.'}
                    </Text>

                    {(selectedTicket?.image_url || selectedTicket?.imageurl) && (
                      <Image
                        source={{
                          uri:
                            selectedTicket.image_url || selectedTicket.imageurl,
                        }}
                        style={styles.attachedImage}
                        resizeMode="cover"
                      />
                    )}
                  </View>

                  {/* Relayed Messages Stream */}
                  {(selectedTicket?.messages || []).map((msg, index) => {
                    const isFromDealerOrDist =
                      msg.sender === 'reseller' ||
                      msg.sender === 'distributor' ||
                      msg.sender === 'dealer' ||
                      msg.sender === 'wholesaler';

                    const isFromCustomer =
                      msg.sender === 'owner' ||
                      msg.sender === 'user' ||
                      msg.sender === 'customer';

                    if (msg.isSystem) {
                      return (
                        <View key={msg.id || index} style={styles.systemMessageRow}>
                          <Text style={styles.systemMessageText}>
                            {msg.text}
                          </Text>
                        </View>
                      );
                    }

                    return (
                      <View
                        key={msg.id || index}
                        style={[
                          styles.messageBubble,
                          isFromDealerOrDist
                            ? styles.messageBubbleDealer
                            : styles.messageBubbleCustomer,
                        ]}
                      >
                        <View style={styles.messageHeaderRow}>
                          <View
                            style={[
                              styles.senderRoleBadge,
                              isFromDealerOrDist
                                ? styles.senderRoleBadgeDealer
                                : styles.senderRoleBadgeCustomer,
                            ]}
                          >
                            {isFromDealerOrDist ? (
                              <Store size={11} color="#047857" />
                            ) : (
                              <User size={11} color="#D0142C" />
                            )}
                            <Text
                              style={[
                                styles.senderRoleBadgeText,
                                isFromDealerOrDist
                                  ? styles.senderRoleBadgeTextDealer
                                  : styles.senderRoleBadgeTextCustomer,
                              ]}
                            >
                              {msg.senderName ||
                                (isFromDealerOrDist
                                  ? 'Stockist / Wholesaler'
                                  : 'Vehicle Owner')}
                            </Text>
                          </View>
                          <Text style={styles.messageTimeText}>
                            {formatMsgTime(msg.timestamp)}
                          </Text>
                        </View>

                        <Text style={styles.messageBodyText}>{msg.text}</Text>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Plain Text Reply Input (Item 7) */}
              <View style={styles.replyFooterBox}>
                <Text style={styles.replyBoxLabel}>
                  {isWholesalerOrDealer
                    ? 'REPLY TO VEHICLE OWNER (PLAIN TEXT)'
                    : 'REPLY TO STOCKIST / WHOLESALER'}
                </Text>
                <View style={styles.replyRow}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder={
                      isWholesalerOrDealer
                        ? 'Type part availability, price quote, or fitment answer...'
                        : 'Type message or question to dealer...'
                    }
                    placeholderTextColor="#94A3B8"
                    value={replyMessage}
                    onChangeText={setReplyMessage}
                    multiline={false}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendBtn,
                      (!replyMessage.trim() || sendingReply) &&
                        styles.sendBtnDisabled,
                    ]}
                    onPress={handleSendReply}
                    disabled={sendingReply || !replyMessage.trim()}
                    activeOpacity={0.7}
                  >
                    {sendingReply ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Send size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  roleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
  },
  roleBannerText: {
    fontSize: 11.5,
    color: '#991B1B',
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#F1F5F9',
  },
  tabPillSelected: {
    backgroundColor: '#D0142C',
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabPillTextSelected: {
    color: '#FFFFFF',
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  ticketList: {
    gap: 12,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  ticketTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ticketId: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  partTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  partBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  partBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D0142C',
  },
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  vehicleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 6,
    paddingTop: 8,
  },
  dealerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dealerName: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  messageCountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  messageCountChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D0142C',
  },
  newTicketHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  newTicketHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 14,
  },
  specsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specsCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  specsItem: {
    minWidth: '45%',
  },
  specsLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  specsValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  threadSection: {
    gap: 10,
  },
  threadHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  threadSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  rootQueryBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: '#D0142C',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  senderPillCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  senderPillCustomerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D0142C',
  },
  messageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  messageTimeText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  rootQueryText: {
    fontSize: 13.5,
    color: '#1E293B',
    lineHeight: 19,
  },
  attachedImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 10,
  },
  messageBubble: {
    borderRadius: 14,
    padding: 12,
    maxWidth: '92%',
  },
  messageBubbleDealer: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  messageBubbleCustomer: {
    alignSelf: 'flex-end',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  senderRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  senderRoleBadgeDealer: {
    backgroundColor: '#D1FAE5',
  },
  senderRoleBadgeCustomer: {
    backgroundColor: '#FEE2E2',
  },
  senderRoleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  senderRoleBadgeTextDealer: {
    color: '#047857',
  },
  senderRoleBadgeTextCustomer: {
    color: '#B91C1C',
  },
  messageBodyText: {
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 18,
  },
  systemMessageRow: {
    alignSelf: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginVertical: 4,
  },
  systemMessageText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
  replyFooterBox: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  replyBoxLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 13,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#D0142C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
});

export default MyEnquiriesScreen;
