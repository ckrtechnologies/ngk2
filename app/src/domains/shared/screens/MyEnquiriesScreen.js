import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Info,
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
  CheckCheck,
  FileText,
  Wrench,
  Gauge,
  Calendar,
  Hash,
  MapPin,
  CheckCircle2,
  Layers,
  RotateCw,
  TrendingUp,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { getEnquiryRedux } from '../../../redux/getData';
import { apiFunction } from '../../../apis/apiFunction';
import { addEnquiryMessageApi, updateEnquiryStatusApi } from '../../../apis/api';
import AppHeader from '../../../components/common/AppHeader';

const MyEnquiriesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { enquiry, myself } = useSelector((state) => state.getData);
  const scrollViewRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [specsModalVisible, setSpecsModalVisible] = useState(false);
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

  // Handle openTicketId or initialFilter from navigation params
  useEffect(() => {
    const openTicketId = route?.params?.openTicketId;
    if (openTicketId && enquiry && enquiry.length > 0) {
      const target = enquiry.find(
        (e) => String(e.id) === String(openTicketId) || String(e.ticket_number) === String(openTicketId)
      );
      if (target) {
        setSelectedTicket(target);
      }
    }
  }, [route?.params?.openTicketId, enquiry, route?.params]);

  useEffect(() => {
    if (route?.params?.initialFilter) {
      const f = route.params.initialFilter.toLowerCase().replace(/[\s_-]+/g, '');
      if (f === 'pending') setActiveFilter('PENDING');
      else if (f === 'inprogress' || f === 'inprocess') setActiveFilter('IN PROGRESS');
      else if (f === 'resolved') setActiveFilter('RESOLVED');
      else setActiveFilter('ALL');
    }
  }, [route?.params?.initialFilter]);

  const filterTabs = ['ALL', 'PENDING', 'IN PROGRESS', 'RESOLVED', 'CLOSED'];

  const getFilteredList = () => {
    if (!enquiry) return [];
    if (activeFilter === 'ALL') return enquiry;
    const normActive = activeFilter.replace(/[\s_-]+/g, '').toUpperCase();
    return enquiry.filter((e) => {
      const pRef = e.part_reference || e.partReference || {};
      const parsedRef = typeof pRef === 'string' ? (() => { try { return JSON.parse(pRef); } catch (err) { return {}; } })() : pRef;
      const effectiveStatus = (e.workflow_status || parsedRef.workflow_status || e.status || 'Pending')
        .replace(/[\s_-]+/g, '')
        .toUpperCase();

      if (normActive === 'CLOSED') return effectiveStatus === 'CLOSED';
      if (normActive === 'INPROGRESS') return effectiveStatus === 'INPROGRESS' || effectiveStatus === 'QUOTESENT' || effectiveStatus === 'AWAITINGSTOCK';
      if (normActive === 'RESOLVED') return effectiveStatus === 'RESOLVED' || effectiveStatus === 'APPROVED';
      if (normActive === 'PENDING') return effectiveStatus === 'PENDING';
      return effectiveStatus === normActive;
    });
  };

  const getStatusBadge = (status) => {
    const s = (status || 'Pending').toLowerCase().replace(/[\s_-]+/g, '');
    switch (s) {
      case 'resolved':
      case 'approved':
        return {
          bg: '#D1FAE5',
          color: '#059669',
          label: 'Resolved',
        };
      case 'inprogress':
      case 'inprocess':
        return {
          bg: '#DBEAFE',
          color: '#2563EB',
          label: 'In Progress',
        };
      case 'quotesent':
      case 'quote':
        return {
          bg: '#EDE9FE',
          color: '#7C3AED',
          label: 'Quote Sent',
        };
      case 'awaitingstock':
      case 'stock':
      case 'backorder':
        return {
          bg: '#FFEDD5',
          color: '#EA580C',
          label: 'Awaiting Stock',
        };
      case 'closed':
        return {
          bg: '#F1F5F9',
          color: '#475569',
          label: 'Closed',
        };
      case 'declined':
      case 'cancelled':
      case 'rejected':
        return {
          bg: '#FFE4E6',
          color: '#E11D48',
          label: 'Declined',
        };
      default:
        return {
          bg: '#FEF3C7',
          color: '#D97706',
          label: 'Pending',
        };
    }
  };

  // Helper: Extract complete, structured automotive vehicle and part data
  const getTicketVehicleAndPartInfo = useCallback((item) => {
    if (!item) return {};
    let pRef = item.part_reference || {};
    if (typeof pRef === 'string') {
      try {
        pRef = JSON.parse(pRef);
      } catch (e) {
        pRef = {};
      }
    }
    let vObj = item.vehicle || item.vehicleData || pRef.vehicle || {};
    if (typeof vObj === 'string') {
      try {
        vObj = JSON.parse(vObj);
      } catch (e) {
        vObj = {};
      }
    }
    let pObj = item.part || pRef.part || {};
    if (typeof pObj === 'string') {
      try {
        pObj = JSON.parse(pObj);
      } catch (e) {
        pObj = {};
      }
    }

    // 1. Resolve Part Number
    const partNumber =
      item.part_number ||
      pRef.partNumber ||
      pRef.part_number ||
      pObj.partNumber ||
      pObj.articleNo ||
      vObj.partNumber ||
      (item.title && item.title.match(/#([A-Za-z0-9_-]+)/)?.[1]) ||
      null;

    // 2. Resolve Part Name
    let partName =
      item.part_name ||
      pRef.partName ||
      pRef.part_name ||
      pObj.partName ||
      pObj.description ||
      vObj.partName ||
      null;

    if (!partName && item.title) {
      partName = item.title.replace(/Part\s*#[A-Za-z0-9_-]+\s*[-–—:]\s*/i, '').trim();
    }
    if (!partName) {
      partName = 'Automotive Component';
    }

    // 3. Resolve Vehicle Details
    const make =
      item.make ||
      pRef.make ||
      vObj.make ||
      pRef.vehicleMake ||
      null;

    const model =
      item.model ||
      pRef.model ||
      vObj.model ||
      pRef.vehicleModel ||
      null;

    const year =
      item.year ||
      pRef.year ||
      vObj.year ||
      pRef.vehicleYear ||
      null;

    const engine =
      item.engine ||
      pRef.engine ||
      vObj.engine ||
      pRef.vehicleEngine ||
      null;

    // Constructed or Explicit Car Name
    let carName =
      item.car_name ||
      pRef.carName ||
      pRef.car_name ||
      vObj.carName ||
      null;

    if (!carName && (make || model)) {
      carName = [make, model, year].filter(Boolean).join(' ').trim();
    }

    // Dealer / Reseller Name
    const dealerName =
      item.dealerName ||
      item.dealer?.name ||
      pRef.dealerName ||
      vObj.dealerName ||
      'Authorized Reseller';

    return {
      partNumber,
      partName,
      make,
      model,
      year,
      engine,
      carName: carName || 'Universal Fitment',
      dealerName,
    };
  }, []);

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    setSendingReply(true);
    const userId = await AsyncStorage.getItem('userId');
    const role = currentUserRole || 'owner';
    const senderDisplayName =
      myself?.name ||
      myself?.companyName ||
      (isWholesalerOrDealer ? 'Authorized Reseller' : 'Vehicle Owner');

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

  // SNO 7: Navigate to VerifiedParts screen
  const navigateToProductScreen = (ticket) => {
    const target = ticket || selectedTicket;
    if (!target) return;
    const info = getTicketVehicleAndPartInfo(target);
    const pRef = target.part_reference || target.partReference || target.partObject || {};
    const parsedRef = typeof pRef === 'string' ? (() => { try { return JSON.parse(pRef); } catch (e) { return {}; } })() : pRef;

    const partObj = {
      articleNo: info.partNumber || parsedRef.partNumber || parsedRef.articleNo || 'GENUINE-OE',
      articleNumber: info.partNumber || parsedRef.partNumber || parsedRef.articleNumber || 'GENUINE-OE',
      articleName: info.partName || parsedRef.partName || parsedRef.title || 'NGK Component',
      mfrName: parsedRef.mfrName || parsedRef.brandName || 'NGK SPARK PLUG',
      tradeNumbers: [info.partNumber].filter(Boolean),
      genericArticles: [{ genericArticleDescription: info.partName }],
      ...(parsedRef.part || {}),
      ...(parsedRef || {}),
    };

    const vehicleObj = {
      make: info.make || parsedRef.make || '',
      model: info.model || parsedRef.model || '',
      year: info.year || parsedRef.year || '',
      engine: info.engine || parsedRef.engine || '',
      ...(parsedRef.vehicle || {}),
    };

    setSpecsModalVisible(false);
    setSelectedTicket(null);
    navigation.navigate('VerifiedParts', {
      articles: [partObj],
      selectedPart: partObj,
      vehicle: vehicleObj,
      openSpecs: true,
    });
  };

  // SNO 14-B: Partner status update handler & modal
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusNoteText, setStatusNoteText] = useState('');
  const [pendingStatusChoice, setPendingStatusChoice] = useState('InProgress');

  const STATUS_OPTIONS = [
    { id: 'InProgress', label: 'In Progress', desc: 'Reviewing inquiry & checking catalog', bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE' },
    { id: 'QuoteSent', label: 'Quote Sent', desc: 'Price & availability sent to customer', bg: '#EDE9FE', color: '#6D28D9', border: '#DDD6FE' },
    { id: 'AwaitingStock', label: 'Awaiting Stock', desc: 'Parts backordered from regional hub', bg: '#FFEDD5', color: '#C2410C', border: '#FED7AA' },
    { id: 'Resolved', label: 'Mark Resolved', desc: 'Query answered / order ready for pickup', bg: '#D1FAE5', color: '#047857', border: '#A7F3D0' },
    { id: 'Closed', label: 'Close Ticket', desc: 'Transaction completed & archived', bg: '#F1F5F9', color: '#334155', border: '#CBD5E1' },
    { id: 'Declined', label: 'Decline / Cancel', desc: 'Out of stock / unable to supply', bg: '#FFE4E6', color: '#BE123C', border: '#FECDD3' },
  ];

  const handleUpdateStatus = async (newStatus, note = '') => {
    if (!selectedTicket || updatingStatus) return;
    setUpdatingStatus(true);
    const role = currentUserRole || 'reseller';
    const responderName = myself?.name || (role === 'distributor' ? 'Regional Distributor' : 'Authorized Reseller');

    try {
      const res = await apiFunction(
        updateEnquiryStatusApi,
        [selectedTicket.id],
        { status: newStatus, responderName, role, note: note || statusNoteText },
        'PUT',
        true
      );
      setUpdatingStatus(false);
      setShowStatusModal(false);
      setStatusNoteText('');
      if (res && res.success !== false) {
        setSelectedTicket((prev) => prev ? {
          ...prev,
          status: newStatus,
          workflow_status: newStatus,
          part_reference: { ...(prev.part_reference || {}), workflow_status: newStatus },
        } : prev);
        Toast.show({
          type: 'success',
          text1: 'Status Updated',
          text2: `Ticket status updated to ${newStatus.toUpperCase()}`,
        });
        refreshEnquiries();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Status Update Failed',
          text2: res?.message || 'Could not update ticket status',
        });
      }
    } catch (err) {
      setUpdatingStatus(false);
      Toast.show({
        type: 'error',
        text1: 'Status Update Failed',
        text2: err.message || 'Could not update ticket status',
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
              const effectiveCardStatus = item.workflow_status || item.part_reference?.workflow_status || item.status;
              const statusStyle = getStatusBadge(effectiveCardStatus);
              const info = getTicketVehicleAndPartInfo(item);
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
                      info.partName ||
                      item.enquiry_details ||
                      'Technical Support Inquiry'}
                  </Text>

                  {/* Compact Badges for Part # and Vehicle */}
                  <View style={styles.metaRow}>
                    {info.partNumber && (
                      <TouchableOpacity
                        style={styles.partBadge}
                        onPress={() => navigateToProductScreen(item)}
                        activeOpacity={0.7}
                      >
                        <Tag size={11} color="#D0142C" strokeWidth={2.2} />
                        <Text style={styles.partBadgeText} numberOfLines={1}>
                          #{info.partNumber}
                        </Text>
                        <ChevronRight size={10} color="#D0142C" strokeWidth={2.4} />
                      </TouchableOpacity>
                    )}
                    {info.carName && (
                      <View style={styles.vehicleBadge}>
                        <Car size={11} color="#2563EB" strokeWidth={2} />
                        <Text style={styles.vehicleBadgeText} numberOfLines={1}>
                          {info.carName}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.ticketFooter}>
                    <View style={styles.dealerInfo}>
                      <Store size={12} color="#64748B" strokeWidth={2} />
                      <Text style={styles.dealerName} numberOfLines={1}>
                        {info.dealerName}
                      </Text>
                    </View>

                    {messagesCount > 0 && (
                      <View style={styles.messageCountChip}>
                        <MessageSquare size={10} color="#D0142C" strokeWidth={2.2} />
                        <Text style={styles.messageCountChipText}>
                          {messagesCount} msg{messagesCount > 1 ? 's' : ''}
                        </Text>
                      </View>
                    )}

                    <ChevronRight size={14} color="#94A3B8" strokeWidth={2} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
      {/* =========================================================================
          CONVERSATION MODAL (FULL-SCREEN NATIVE CONVERSATION WITH PINNED CONTEXT)
         ========================================================================= */}
      <Modal
        visible={!!selectedTicket}
        transparent={false}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => {
          if (specsModalVisible) {
            setSpecsModalVisible(false);
          } else {
            setSelectedTicket(null);
          }
        }}
      >
        <SafeAreaView style={styles.fullScreenConvSafeArea} edges={['top', 'bottom', 'left', 'right']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.fullScreenConvContainer}
          >
            {/* Top Native Crimson Header */}
            <View style={styles.convHeader}>
              <TouchableOpacity
                onPress={() => setSelectedTicket(null)}
                style={styles.convBackBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <ChevronLeft size={22} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>

              <View style={styles.convHeaderCenter}>
                <View style={styles.convHeaderTitleRow}>
                  <Text style={styles.convHeaderTitle} numberOfLines={1}>
                    Ticket #{selectedTicket?.ticket_number || selectedTicket?.id}
                  </Text>
                  {selectedTicket && (() => {
                    const effectiveDetailStatus = selectedTicket?.workflow_status || selectedTicket?.part_reference?.workflow_status || selectedTicket?.status;
                    const badge = getStatusBadge(effectiveDetailStatus);
                    return (
                      <View
                        style={[
                          styles.convStatusBadge,
                          {
                            backgroundColor: badge.bg,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.convStatusDot,
                            {
                              backgroundColor: badge.color,
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.convStatusBadgeText,
                            {
                              color: badge.color,
                            },
                          ]}
                        >
                          {badge.label}
                        </Text>
                      </View>
                    );
                  })()}
                </View>
                <Text style={styles.convHeaderSubtitle}>
                  {selectedTicket?.created_at
                    ? new Date(selectedTicket.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Active Thread'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setSpecsModalVisible(true)}
                style={styles.convHeaderInfoBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Info size={19} color="#FFFFFF" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {/* PINNED CONTEXT BAR (Sticky Under Header - Tappable for Specifications) */}
            {(() => {
              const info = getTicketVehicleAndPartInfo(selectedTicket);
              return (
                <View style={styles.pinnedContextCard}>
                  <TouchableOpacity
                    style={styles.pinnedLeftCol}
                    activeOpacity={0.8}
                    onPress={() => navigateToProductScreen()}
                  >
                    <View style={styles.pinnedPartRow}>
                      <View style={styles.pinnedPartBadge}>
                        <Tag size={10.5} color="#D0142C" strokeWidth={2.4} />
                        <Text style={styles.pinnedPartBadgeText}>
                          #{info.partNumber || 'PART-SPEC'}
                        </Text>
                      </View>
                      <Text style={styles.pinnedPartNameText} numberOfLines={1}>
                        {info.partName}
                      </Text>
                    </View>

                    <View style={styles.pinnedMetaRow}>
                      <View style={styles.pinnedMetaItem}>
                        <Car size={11.5} color="#2563EB" strokeWidth={2.2} />
                        <Text style={styles.pinnedMetaText} numberOfLines={1}>
                          {info.carName}
                        </Text>
                      </View>
                      <View style={styles.pinnedDot} />
                      <View style={styles.pinnedMetaItem}>
                        <Store size={11.5} color="#059669" strokeWidth={2.2} />
                        <Text style={styles.pinnedMetaText} numberOfLines={1}>
                          {isWholesalerOrDealer
                            ? selectedTicket?.userName || 'Customer'
                            : info.dealerName}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.pinnedRightCol}>
                    <TouchableOpacity
                      style={styles.viewPartPill}
                      onPress={() => navigateToProductScreen()}
                      activeOpacity={0.8}
                    >
                      <Car size={11} color="#FFFFFF" strokeWidth={2.2} />
                      <Text style={styles.viewPartPillText}>Part</Text>
                      <ChevronRight size={11} color="#FFFFFF" strokeWidth={2.4} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.viewSpecsPill}
                      onPress={() => setSpecsModalVisible(true)}
                      activeOpacity={0.8}
                    >
                      <Wrench size={11} color="#D0142C" strokeWidth={2.2} />
                      <Text style={styles.viewSpecsPillText}>Specs</Text>
                      <ChevronRight size={11} color="#D0142C" strokeWidth={2.4} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })()}

            {/* SNO 14-B: Partner Status Action Controls */}
            {isWholesalerOrDealer && selectedTicket && (() => {
              const effectiveStatus = selectedTicket.workflow_status || selectedTicket.part_reference?.workflow_status || selectedTicket.status || 'Pending';
              const currentStatusBadge = getStatusBadge(effectiveStatus);
              const normalizedStatus = (effectiveStatus || '').toLowerCase().replace(/[\s_-]+/g, '');
              return (
                <View style={styles.partnerStatusBar}>
                  <View style={styles.partnerStatusHeaderRow}>
                    <View style={styles.partnerStatusLabelGroup}>
                      <Text style={styles.partnerStatusLabel}>STATUS:</Text>
                      <View style={[styles.statusBadgePill, { backgroundColor: currentStatusBadge.bg }]}>
                        <Text style={[styles.statusBadgePillText, { color: currentStatusBadge.color }]}>
                          {currentStatusBadge.label}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.openStatusModalBtn}
                      onPress={() => {
                        setPendingStatusChoice(effectiveStatus);
                        setShowStatusModal(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <RotateCw size={11} color="#334155" />
                      <Text style={styles.openStatusModalBtnText}>Change Status</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Direct One-Touch Shortcut Actions */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.partnerStatusButtonsScroll}>
                    {/* 1. Quick Quote Sent */}
                    {normalizedStatus !== 'quotesent' && (
                      <TouchableOpacity
                        style={[styles.statusActionBtn, { backgroundColor: '#EDE9FE', borderColor: '#DDD6FE' }]}
                        onPress={() => handleUpdateStatus('QuoteSent', 'Price & availability quotation provided.')}
                        disabled={updatingStatus}
                        activeOpacity={0.8}
                      >
                        <Tag size={11} color="#6D28D9" />
                        <Text style={[styles.statusActionBtnText, { color: '#6D28D9' }]}>Quote Sent</Text>
                      </TouchableOpacity>
                    )}

                    {/* 2. Quick Awaiting Stock */}
                    {normalizedStatus !== 'awaitingstock' && (
                      <TouchableOpacity
                        style={[styles.statusActionBtn, { backgroundColor: '#FFEDD5', borderColor: '#FED7AA' }]}
                        onPress={() => handleUpdateStatus('AwaitingStock', 'Parts on order from regional hub.')}
                        disabled={updatingStatus}
                        activeOpacity={0.8}
                      >
                        <Clock size={11} color="#C2410C" />
                        <Text style={[styles.statusActionBtnText, { color: '#C2410C' }]}>Awaiting Stock</Text>
                      </TouchableOpacity>
                    )}

                    {/* 3. Quick In Progress */}
                    {normalizedStatus !== 'inprogress' && (
                      <TouchableOpacity
                        style={[styles.statusActionBtn, { backgroundColor: '#DBEAFE', borderColor: '#BFDBFE' }]}
                        onPress={() => handleUpdateStatus('InProgress')}
                        disabled={updatingStatus}
                        activeOpacity={0.8}
                      >
                        <TrendingUp size={11} color="#1D4ED8" />
                        <Text style={[styles.statusActionBtnText, { color: '#1D4ED8' }]}>In Progress</Text>
                      </TouchableOpacity>
                    )}

                    {/* 4. Quick Resolve */}
                    {normalizedStatus !== 'resolved' && (
                      <TouchableOpacity
                        style={[styles.statusActionBtn, { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' }]}
                        onPress={() => handleUpdateStatus('Resolved', 'Inquiry answered and parts ready for pickup.')}
                        disabled={updatingStatus}
                        activeOpacity={0.8}
                      >
                        <CheckCircle2 size={11} color="#047857" />
                        <Text style={[styles.statusActionBtnText, { color: '#047857' }]}>Resolved</Text>
                      </TouchableOpacity>
                    )}

                    {/* 5. Quick Close */}
                    {normalizedStatus !== 'closed' && (
                      <TouchableOpacity
                        style={[styles.statusActionBtn, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}
                        onPress={() => handleUpdateStatus('Closed', 'Ticket completed and archived.')}
                        disabled={updatingStatus}
                        activeOpacity={0.8}
                      >
                        <X size={11} color="#334155" />
                        <Text style={[styles.statusActionBtnText, { color: '#334155' }]}>Close Ticket</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>
              );
            })()}

            {/* Scrollable Conversation Stream */}
            <ScrollView
              ref={scrollViewRef}
              style={{ flex: 1 }}
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({ animated: true })
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollBody}
            >
              {/* Pinned Initial Customer Inquiry Card */}
              <View style={styles.initialInquiryCard}>
                <View style={styles.inquiryCardHeader}>
                  <View style={styles.inquiryBadge}>
                    <FileText size={12} color="#D0142C" />
                    <Text style={styles.inquiryBadgeText}>
                      {isWholesalerOrDealer ? 'Customer Inquiry' : 'Your Initial Inquiry'}
                    </Text>
                  </View>
                  <Text style={styles.inquiryTimeText}>
                    {formatMsgTime(selectedTicket?.created_at)}
                  </Text>
                </View>

                <Text style={styles.inquiryBodyText}>
                  {selectedTicket?.enquiry_details ||
                    selectedTicket?.description ||
                    'Technical enquiry submitted for verification.'}
                </Text>

                {selectedTicket?.quantity && (
                  <View style={styles.inquiryQtyTag}>
                    <Text style={styles.inquiryQtyTagText}>
                      Requested quantity: {selectedTicket.quantity} units
                    </Text>
                  </View>
                )}

                {(selectedTicket?.image_url || selectedTicket?.imageurl) && (
                  <Image
                    source={{
                      uri: selectedTicket.image_url || selectedTicket.imageurl,
                    }}
                    style={styles.attachedImage}
                    resizeMode="cover"
                  />
                )}
              </View>

              {/* Thread Relay Divider */}
              <View style={styles.threadDividerRow}>
                <View style={styles.threadDividerLine} />
                <View style={styles.liveIndicatorPill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveIndicatorText}>Live Conversation Relay</Text>
                </View>
                <View style={styles.threadDividerLine} />
              </View>

              {/* Deduplicated Message Bubbles */}
              {(() => {
                const rawMessages = selectedTicket?.messages || [];
                const initialText = (
                  selectedTicket?.enquiry_details ||
                  selectedTicket?.description ||
                  ''
                )
                  .trim()
                  .toLowerCase();

                const conversationMessages = rawMessages.filter((msg, idx) => {
                  if (idx === 0) {
                    const msgText = (msg.text || '').trim().toLowerCase();
                    const isCustomer =
                      msg.sender === 'owner' ||
                      msg.sender === 'user' ||
                      msg.sender === 'customer';
                    if (
                      isCustomer &&
                      initialText &&
                      (msgText === initialText ||
                        initialText.includes(msgText) ||
                        msgText.includes(initialText))
                    ) {
                      return false; // Deduplicate initial enquiry from bubbles
                    }
                  }
                  return true;
                });

                if (conversationMessages.length === 0) {
                  return (
                    <View style={styles.waitingForReplyBox}>
                      <Text style={styles.waitingForReplyText}>
                        {isWholesalerOrDealer
                          ? 'No messages yet. Send a response to the vehicle owner below.'
                          : 'Waiting for dealer response. You will receive an update once replied.'}
                      </Text>
                    </View>
                  );
                }

                return conversationMessages.map((msg, index) => {
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
                        <Text style={styles.systemMessageText}>{msg.text}</Text>
                      </View>
                    );
                  }

                  const isMyMessage = isWholesalerOrDealer
                    ? isFromDealerOrDist
                    : isFromCustomer;

                  return (
                    <View
                      key={msg.id || index}
                      style={[
                        styles.messageRowWrapper,
                        isMyMessage ? styles.messageRowRight : styles.messageRowLeft,
                      ]}
                    >
                      {!isMyMessage && (
                        <View style={styles.messageAvatarBox}>
                          {isFromDealerOrDist ? (
                            <View style={styles.avatarDealer}>
                              <Store size={13} color="#FFFFFF" strokeWidth={2.4} />
                            </View>
                          ) : (
                            <View style={styles.avatarCustomer}>
                              <User size={13} color="#FFFFFF" strokeWidth={2.4} />
                            </View>
                          )}
                        </View>
                      )}

                      <View
                        style={[
                          styles.messageBubble,
                          isMyMessage ? styles.bubbleRight : styles.bubbleLeft,
                        ]}
                      >
                        {!isMyMessage && (
                          <View style={styles.senderHeaderRow}>
                            <Text style={styles.senderDisplayName}>
                              {msg.senderName ||
                                (isFromDealerOrDist
                                  ? 'Authorized Dealer'
                                  : 'Vehicle Owner')}
                            </Text>
                            {isFromDealerOrDist && (
                              <View style={styles.verifiedTag}>
                                <ShieldCheck
                                  size={10}
                                  color="#059669"
                                  strokeWidth={2.5}
                                />
                                <Text style={styles.verifiedTagText}>Verified</Text>
                              </View>
                            )}
                          </View>
                        )}

                        <Text
                          style={[
                            styles.messageBodyText,
                            isMyMessage
                              ? styles.messageBodyTextRight
                              : styles.messageBodyTextLeft,
                          ]}
                        >
                          {msg.text}
                        </Text>

                        <View style={styles.bubbleFooterRow}>
                          <Text
                            style={[
                              styles.messageTimeText,
                              isMyMessage
                                ? styles.messageTimeTextRight
                                : styles.messageTimeTextLeft,
                            ]}
                          >
                            {formatMsgTime(msg.timestamp)}
                          </Text>
                          {isMyMessage && (
                            <CheckCheck
                              size={13}
                              color="rgba(255, 255, 255, 0.85)"
                              strokeWidth={2.4}
                            />
                          )}
                        </View>
                      </View>

                      {isMyMessage && (
                        <View style={styles.messageAvatarBoxRight}>
                          <View
                            style={
                              isWholesalerOrDealer
                                ? styles.avatarDealer
                                : styles.avatarCustomerCrimson
                            }
                          >
                            {isWholesalerOrDealer ? (
                              <Store size={13} color="#FFFFFF" strokeWidth={2.4} />
                            ) : (
                              <User size={13} color="#FFFFFF" strokeWidth={2.4} />
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  );
                });
              })()}
            </ScrollView>

            {/* Bottom Reply Bar */}
            <View style={styles.replyFooterBox}>
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
                  returnKeyType="send"
                  onSubmitEditing={handleSendReply}
                />
                <TouchableOpacity
                  style={[
                    styles.sendBtn,
                    (!replyMessage.trim() || sendingReply) &&
                      styles.sendBtnDisabled,
                  ]}
                  onPress={handleSendReply}
                  disabled={sendingReply || !replyMessage.trim()}
                  activeOpacity={0.8}
                >
                  {sendingReply ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Send size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* =========================================================================
                PRODUCT TECHNICAL SPECIFICATIONS OVERLAY SHEET (IN-VIEW FOR 100% ANDROID RELIABILITY)
               ========================================================================= */}
            {specsModalVisible && (
              <View style={[StyleSheet.absoluteFillObject, styles.specsModalBackdrop, { zIndex: 9999 }]}>
                <TouchableOpacity
                  style={styles.specsModalOverlayTap}
                  activeOpacity={1}
                  onPress={() => setSpecsModalVisible(false)}
                />
                <View style={styles.specsModalCard}>
            {/* Modal Drag Handle */}
            <View style={styles.specsDragHandleContainer}>
              <View style={styles.specsDragHandle} />
            </View>

            {/* Modal Header */}
            <View style={styles.specsModalHeader}>
              <View style={styles.specsHeaderIconBox}>
                <Wrench size={16} color="#D0142C" strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.specsModalTitle}>Technical Specifications</Text>
                <Text style={styles.specsModalSubtitle}>Part Fitment & Diagnostic Sheet</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSpecsModalVisible(false)}
                style={styles.specsModalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={16} color="#475569" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {(() => {
              const info = getTicketVehicleAndPartInfo(selectedTicket);
              const statusBadge = getStatusBadge(selectedTicket?.status);

              return (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.specsModalBody}
                >
                  {/* Compact Header Pill Bar */}
                  <View style={styles.specsHeaderPillRow}>
                    <View style={styles.specsPartPill}>
                      <Hash size={10.5} color="#D0142C" strokeWidth={2.5} />
                      <Text style={styles.specsPartPillText}>
                        {info.partNumber || 'STANDARD-OE'}
                      </Text>
                    </View>
                    <View style={styles.specsFitmentGuaranteePill}>
                      <ShieldCheck size={11} color="#059669" strokeWidth={2.2} />
                      <Text style={styles.specsFitmentGuaranteeText}>OEM Authentic</Text>
                    </View>
                    <View style={[styles.specsStatusTag, { backgroundColor: statusBadge.bg }]}>
                      <Text style={[styles.specsStatusTagText, { color: statusBadge.color }]}>
                        {statusBadge.label}
                      </Text>
                    </View>
                  </View>

                  {/* Component Title */}
                  <Text style={styles.specsProductName} numberOfLines={2}>
                    {info.partName}
                  </Text>

                  {/* SECTION 1: VEHICLE SPECIFICATIONS */}
                  <View style={styles.specsSection}>
                    <View style={styles.specsSectionHeader}>
                      <Car size={13} color="#2563EB" strokeWidth={2.4} />
                      <Text style={styles.specsSectionTitle}>TARGET VEHICLE FITMENT</Text>
                    </View>

                    <View style={styles.specsGridCompact}>
                      <View style={styles.specsCell}>
                        <View style={styles.specsCellLabelRow}>
                          <Text style={styles.specsCellLabel}>MAKE</Text>
                        </View>
                        <Text style={styles.specsCellVal} numberOfLines={1}>
                          {info.make || 'Universal'}
                        </Text>
                      </View>
                      <View style={styles.specsCell}>
                        <View style={styles.specsCellLabelRow}>
                          <Text style={styles.specsCellLabel}>MODEL</Text>
                        </View>
                        <Text style={styles.specsCellVal} numberOfLines={1}>
                          {info.model || 'Universal'}
                        </Text>
                      </View>
                      <View style={styles.specsCell}>
                        <View style={styles.specsCellLabelRow}>
                          <Calendar size={9} color="#64748B" />
                          <Text style={styles.specsCellLabel}>MODEL YEAR</Text>
                        </View>
                        <Text style={styles.specsCellVal}>
                          {info.year || 'All Years'}
                        </Text>
                      </View>
                      <View style={styles.specsCell}>
                        <View style={styles.specsCellLabelRow}>
                          <Gauge size={9} color="#64748B" />
                          <Text style={styles.specsCellLabel}>ENGINE / TRIM</Text>
                        </View>
                        <Text style={styles.specsCellVal} numberOfLines={1}>
                          {info.engine || 'OE Spec'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* SECTION 2: COMPONENT & ORDER SPECIFICATIONS */}
                  <View style={styles.specsSection}>
                    <View style={styles.specsSectionHeader}>
                      <Layers size={13} color="#D0142C" strokeWidth={2.4} />
                      <Text style={styles.specsSectionTitle}>COMPONENT ATTRIBUTES</Text>
                    </View>

                    <View style={styles.specsGridCompact}>
                      <View style={styles.specsCell}>
                        <View style={styles.specsCellLabelRow}>
                          <Hash size={9} color="#D0142C" />
                          <Text style={styles.specsCellLabel}>OEM PART #</Text>
                        </View>
                        <Text style={[styles.specsCellVal, { color: '#D0142C' }]} numberOfLines={1}>
                          {info.partNumber || 'OE Standard'}
                        </Text>
                      </View>
                      <View style={styles.specsCell}>
                        <View style={styles.specsCellLabelRow}>
                          <Text style={styles.specsCellLabel}>BRAND</Text>
                        </View>
                        <Text style={styles.specsCellVal}>NGK / NTK</Text>
                      </View>
                      <View style={styles.specsCell}>
                        <View style={styles.specsCellLabelRow}>
                          <Text style={styles.specsCellLabel}>REQUESTED QTY</Text>
                        </View>
                        <Text style={styles.specsCellVal}>
                          {selectedTicket?.quantity ? `${selectedTicket.quantity} units` : '1 unit'}
                        </Text>
                      </View>
                      <View style={styles.specsCell}>
                        <View style={styles.specsCellLabelRow}>
                          <Store size={9} color="#059669" />
                          <Text style={styles.specsCellLabel}>RESELLER / DEALER</Text>
                        </View>
                        <Text style={styles.specsCellVal} numberOfLines={1}>
                          {info.dealerName}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* SECTION 3: ORIGINAL INQUIRY NOTE */}
                  {(selectedTicket?.enquiry_details || selectedTicket?.description) && (
                    <View style={styles.specsSection}>
                      <View style={styles.specsSectionHeader}>
                        <FileText size={12} color="#64748B" strokeWidth={2.2} />
                        <Text style={styles.specsSectionTitle}>CUSTOMER INQUIRY NOTES</Text>
                      </View>
                      <View style={styles.specsInquiryBox}>
                        <Text style={styles.specsInquiryNotesText}>
                          "{selectedTicket?.enquiry_details || selectedTicket?.description}"
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Primary Action: Navigate to Product Screen & 3D Studio */}
                  <TouchableOpacity
                    style={styles.specsNavigateBtn}
                    onPress={() => navigateToProductScreen()}
                    activeOpacity={0.85}
                  >
                    <Car size={15} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={styles.specsNavigateBtnText}>View Verified Product & 3D Studio</Text>
                    <ChevronRight size={16} color="#FFFFFF" strokeWidth={2.4} />
                  </TouchableOpacity>

                  {/* Return Button */}
                  <TouchableOpacity
                    style={styles.specsDismissBtn}
                    onPress={() => setSpecsModalVisible(false)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.specsDismissBtnText}>Close Specifications</Text>
                  </TouchableOpacity>
                </ScrollView>
              );
            })()}
          </View>
        </View>
      )}

      {/* SNO 14-C: Partner Status Management Overlay Sheet */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.statusModalBackdrop}>
          <TouchableOpacity
            style={styles.specsModalOverlayTap}
            activeOpacity={1}
            onPress={() => setShowStatusModal(false)}
          />
          <View style={styles.statusModalCard}>
            <View style={styles.statusModalHeader}>
              <View>
                <Text style={styles.statusModalTitle}>Update Inquiry Status</Text>
                <Text style={styles.statusModalSubtitle}>Select workflow status for Ticket #{selectedTicket?.id}</Text>
              </View>
              <TouchableOpacity
                style={styles.statusModalCloseBtn}
                onPress={() => setShowStatusModal(false)}
              >
                <X size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = pendingStatusChoice === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.statusOptionRow,
                      isSelected && { backgroundColor: opt.bg, borderColor: opt.border, borderWidth: 1.5 }
                    ]}
                    onPress={() => setPendingStatusChoice(opt.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.statusOptionRadio, isSelected && { borderColor: opt.color }]}>
                      {isSelected && <View style={[styles.statusOptionRadioDot, { backgroundColor: opt.color }]} />}
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.statusOptionLabel, isSelected && { color: opt.color, fontWeight: '800' }]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.statusOptionDesc}>{opt.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Optional Status Note Input */}
            <View style={styles.statusNoteBox}>
              <Text style={styles.statusNoteLabel}>Optional Note for Customer / Audit:</Text>
              <TextInput
                style={styles.statusNoteInput}
                placeholder="e.g. Quotation emailed or stock arriving tomorrow..."
                placeholderTextColor="#94A3B8"
                value={statusNoteText}
                onChangeText={setStatusNoteText}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.statusModalActions}>
              <TouchableOpacity
                style={styles.statusModalCancelBtn}
                onPress={() => setShowStatusModal(false)}
              >
                <Text style={styles.statusModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statusModalConfirmBtn}
                disabled={updatingStatus}
                onPress={() => handleUpdateStatus(pendingStatusChoice, statusNoteText)}
              >
                {updatingStatus ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.statusModalConfirmText}>Save Status</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
          </KeyboardAvoidingView>
        </SafeAreaView>
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

  // Full Screen Conversation Styles
  fullScreenConvSafeArea: {
    flex: 1,
    backgroundColor: '#D0142C',
  },
  fullScreenConvContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  convHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D0142C',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 14,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  convBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  convHeaderCenter: {
    flex: 1,
  },
  convHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  convHeaderTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  convStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  convStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  convStatusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  convHeaderSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    fontWeight: '500',
  },
  convHeaderInfoBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // Sticky Pinned Context Bar
  pinnedContextCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  pinnedLeftCol: {
    flex: 1,
    marginRight: 10,
  },
  pinnedPartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },
  pinnedPartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 0.8,
    borderColor: '#FECACA',
  },
  pinnedPartBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#D0142C',
  },
  pinnedPartNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  pinnedMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinnedMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    flexShrink: 1,
  },
  pinnedMetaText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    maxWidth: 160,
  },
  pinnedDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
  },
  pinnedRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewPartPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#D0142C',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 14,
  },
  viewPartPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  viewSpecsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 14,
  },
  viewSpecsPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#D0142C',
  },
  partnerStatusBar: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  partnerStatusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  partnerStatusLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partnerStatusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  statusBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  statusBadgePillText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  openStatusModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  openStatusModalBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  partnerStatusButtonsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 10,
  },
  statusActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusActionBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
  },

  // SNO 14-C: Status Management Overlay Sheet Styles
  statusModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  statusModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  statusModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statusModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusModalSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  statusModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 7,
  },
  statusOptionRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusOptionRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOptionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  statusOptionDesc: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  statusNoteBox: {
    marginTop: 8,
    marginBottom: 14,
  },
  statusNoteLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 5,
  },
  statusNoteInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
  },
  statusModalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  statusModalCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusModalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  statusModalConfirmBtn: {
    flex: 2,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#D0142C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusModalConfirmText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Specifications Sheet Modal
  specsModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  specsModalOverlayTap: {
    flex: 1,
  },
  specsModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 10,
  },
  specsDragHandleContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 2,
  },
  specsDragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  specsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  specsHeaderIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  specsModalTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  specsModalSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  specsModalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  specsModalBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  specsHeaderPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  specsPartPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  specsPartPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D0142C',
  },
  specsFitmentGuaranteePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  specsFitmentGuaranteeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  specsStatusTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  specsStatusTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  specsProductName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    lineHeight: 20,
  },
  specsSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 9,
  },
  specsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 7,
  },
  specsSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  specsGridCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specsCell: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specsCellLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    marginBottom: 2,
  },
  specsCellLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  specsCellVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  specsInquiryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specsInquiryNotesText: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  specsNavigateBtn: {
    backgroundColor: '#D0142C',
    borderRadius: 9,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    shadowColor: '#D0142C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  specsNavigateBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  specsDismissBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 9,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  specsDismissBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  modalScrollBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  initialInquiryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: '#D0142C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 14,
  },
  inquiryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inquiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  inquiryBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#D0142C',
  },
  inquiryTimeText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  inquiryBodyText: {
    fontSize: 13.5,
    color: '#1E293B',
    lineHeight: 19,
  },
  inquiryQtyTag: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inquiryQtyTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  attachedImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 10,
  },
  threadDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 8,
  },
  threadDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  liveIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveIndicatorText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  waitingForReplyBox: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingForReplyText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  messageRowWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    width: '100%',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageAvatarBox: {
    marginRight: 8,
    marginBottom: 2,
  },
  messageAvatarBoxRight: {
    marginLeft: 8,
    marginBottom: 2,
  },
  avatarDealer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCustomer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCustomerCrimson: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D0142C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 13,
    paddingTop: 8,
    paddingBottom: 6,
  },
  bubbleLeft: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleRight: {
    backgroundColor: '#D0142C',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
    shadowColor: '#D0142C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  senderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  senderDisplayName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  messageBodyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  messageBodyTextLeft: {
    color: '#1E293B',
  },
  messageBodyTextRight: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bubbleFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 4,
  },
  messageTimeTextLeft: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  messageTimeTextRight: {
    fontSize: 9.5,
    color: 'rgba(255, 255, 255, 0.78)',
    fontWeight: '500',
  },
  systemMessageRow: {
    alignSelf: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginVertical: 6,
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
  replyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 44,
    fontSize: 13,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D0142C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
});

export default MyEnquiriesScreen;
