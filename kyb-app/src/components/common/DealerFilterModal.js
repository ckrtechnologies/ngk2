import React, { useState, useEffect, useMemo } from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  X,
  RotateCcw,
  Building2,
  Store,
  Compass,
  ArrowDownAZ,
  Check,
  Sparkles,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DistanceSlider from './DistanceSlider';

export const DEFAULT_FILTERS = {
  radius: 50,
  role: 'all', // 'all' | 'distributor' | 'reseller'
  sortBy: 'nearest', // 'nearest' | 'alpha'
};

export default function DealerFilterModal({
  visible,
  onClose,
  filters = DEFAULT_FILTERS,
  onApply,
  onReset,
  dealers = [],
}) {
  const [draft, setDraft] = useState({ ...DEFAULT_FILTERS, ...filters });
  const insets = useSafeAreaInsets();

  // Sync draft whenever modal becomes visible or external filters update
  useEffect(() => {
    if (visible) {
      setDraft({ ...DEFAULT_FILTERS, ...filters });
    }
  }, [visible, filters]);

  // Compute live matching count based on draft filters
  const matchingCount = useMemo(() => {
    if (!dealers || dealers.length === 0) return 0;
    return dealers.filter((d) => {
      // Role filter
      if (draft.role === 'distributor' && d.role !== 'distributor') return false;
      if (
        draft.role === 'reseller' &&
        d.role !== 'reseller' &&
        d.role !== 'stockist' &&
        d.role !== 'dealer'
      )
        return false;

      // Distance / radius filter
      if (draft.radius !== undefined && draft.radius !== null) {
        if (
          d.distanceKm === undefined ||
          d.distanceKm === null ||
          d.distanceKm > draft.radius
        ) {
          return false;
        }
      }

      return true;
    }).length;
  }, [dealers, draft]);

  // Count how many non-default filter criteria are applied
  const activeCount = useMemo(() => {
    let count = 0;
    if (draft.radius !== 50) count++;
    if (draft.role !== 'all') count++;
    if (draft.sortBy !== 'nearest') count++;
    return count;
  }, [draft]);

  const handleReset = () => {
    setDraft({ ...DEFAULT_FILTERS });
    if (onReset) onReset();
  };

  const handleApply = () => {
    if (onApply) onApply(draft);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              {/* Top Drag Pill */}
              <View style={styles.dragPill} />

              {/* Header */}
              <View style={styles.modalHeader}>
                <View>
                  <View style={styles.headerTitleRow}>
                    <Text style={styles.modalTitle}>Dealer & Reseller Filters</Text>
                    {activeCount > 0 && (
                      <View style={styles.activePillBadge}>
                        <Text style={styles.activePillBadgeText}>
                          {activeCount} active
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.modalSubtitle}>
                    Refine distance radius, partner tier & capabilities
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  activeOpacity={0.7}
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Scrollable Filter Options */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* 1. Distance Slider */}
                <View style={styles.sectionCard}>
                  <DistanceSlider
                    value={draft.radius}
                    onValueChange={(val) =>
                      setDraft((prev) => ({ ...prev, radius: val }))
                    }
                  />
                </View>

                {/* 2. Partner Tier */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionLabel}>PARTNER TIER</Text>
                  <View style={styles.tierOptionGrid}>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() =>
                        setDraft((prev) => ({ ...prev, role: 'all' }))
                      }
                      style={[
                        styles.tierButton,
                        draft.role === 'all' && styles.tierButtonActive,
                      ]}
                    >
                      <Sparkles
                        size={16}
                        color={draft.role === 'all' ? COLORS.primary : COLORS.textTertiary}
                      />
                      <Text
                        style={[
                          styles.tierButtonText,
                          draft.role === 'all' && styles.tierButtonTextActive,
                        ]}
                      >
                        All Tiers
                      </Text>
                      {draft.role === 'all' && (
                        <Check size={14} color={COLORS.primary} strokeWidth={3} />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() =>
                        setDraft((prev) => ({ ...prev, role: 'distributor' }))
                      }
                      style={[
                        styles.tierButton,
                        draft.role === 'distributor' && styles.tierButtonActive,
                      ]}
                    >
                      <Building2
                        size={16}
                        color={
                          draft.role === 'distributor' ? '#1D4ED8' : COLORS.textTertiary
                        }
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.tierButtonText,
                            draft.role === 'distributor' &&
                              styles.tierButtonTextActive,
                          ]}
                        >
                          Wholesale Hubs
                        </Text>
                        <Text style={styles.tierSubtext}>Distributors</Text>
                      </View>
                      {draft.role === 'distributor' && (
                        <Check size={14} color={COLORS.primary} strokeWidth={3} />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() =>
                        setDraft((prev) => ({ ...prev, role: 'reseller' }))
                      }
                      style={[
                        styles.tierButton,
                        draft.role === 'reseller' && styles.tierButtonActive,
                      ]}
                    >
                      <Store
                        size={16}
                        color={
                          draft.role === 'reseller' ? COLORS.primary : COLORS.textTertiary
                        }
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.tierButtonText,
                            draft.role === 'reseller' &&
                              styles.tierButtonTextActive,
                          ]}
                        >
                          Retail Resellers
                        </Text>
                        <Text style={styles.tierSubtext}>Workshops & Trade Shops</Text>
                      </View>
                      {draft.role === 'reseller' && (
                        <Check size={14} color={COLORS.primary} strokeWidth={3} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 3. Sort Order */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionLabel}>SORT BY</Text>
                  <View style={styles.sortRow}>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() =>
                        setDraft((prev) => ({ ...prev, sortBy: 'nearest' }))
                      }
                      style={[
                        styles.sortOption,
                        draft.sortBy === 'nearest' && styles.sortOptionActive,
                      ]}
                    >
                      <Compass
                        size={15}
                        color={
                          draft.sortBy === 'nearest' ? COLORS.primary : COLORS.textTertiary
                        }
                      />
                      <Text
                        style={[
                          styles.sortOptionText,
                          draft.sortBy === 'nearest' &&
                            styles.sortOptionTextActive,
                        ]}
                      >
                        Nearest First
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() =>
                        setDraft((prev) => ({ ...prev, sortBy: 'alpha' }))
                      }
                      style={[
                        styles.sortOption,
                        draft.sortBy === 'alpha' && styles.sortOptionActive,
                      ]}
                    >
                      <ArrowDownAZ
                        size={15}
                        color={draft.sortBy === 'alpha' ? COLORS.primary : COLORS.textTertiary}
                      />
                      <Text
                        style={[
                          styles.sortOptionText,
                          draft.sortBy === 'alpha' &&
                            styles.sortOptionTextActive,
                        ]}
                      >
                        A — Z Name
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </ScrollView>

              {/* Action Bottom Bar */}
              <View style={styles.bottomBar}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleReset}
                  style={styles.resetBtn}
                >
                  <RotateCcw size={15} color="#475569" />
                  <Text style={styles.resetBtnText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleApply}
                  style={styles.applyBtn}
                >
                  <Text style={styles.applyBtnText}>
                    Apply Filters ({matchingCount} Partners)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  dragPill: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderDark,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.slate900,
  },
  activePillBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activePillBadgeText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
  },
  modalSubtitle: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.medium,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.slate100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionLabel: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.heavy,
    letterSpacing: 0.6,
    color: COLORS.textTertiary,
    marginBottom: 10,
  },
  tierOptionGrid: {
    gap: 8,
  },
  tierButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  tierButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  tierButtonText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.slate800,
  },
  tierButtonTextActive: {
    color: COLORS.primary,
  },
  tierSubtext: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.medium,
    color: COLORS.slate400,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sortOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  sortOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  sortOptionText: {
    fontSize: 12.5,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textSecondary,
  },
  sortOptionTextActive: {
    color: COLORS.primary,
    fontWeight: FONTS.weight.bold,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: COLORS.slate100,
  },
  resetBtnText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textSecondary,
  },
  applyBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 3,
  },
  applyBtnText: {
    color: COLORS.white,
    fontSize: 13.5,
    fontWeight: FONTS.weight.heavy,
    letterSpacing: 0.2,
  },
});
