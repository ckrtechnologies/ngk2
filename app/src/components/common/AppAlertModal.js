import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { AlertTriangle, CheckCircle2, Info, XCircle, ChevronRight, X } from 'lucide-react-native';

/**
 * AppAlertModal — Shared NGK-branded alert and confirmation bottom sheet modal.
 *
 * Props:
 * - visible: boolean
 * - title: string
 * - message: string
 * - type: 'danger' | 'warning' | 'success' | 'info' (default: 'info')
 * - primaryLabel: string (default: 'Confirm')
 * - onPrimary: () => void
 * - secondaryLabel?: string (optional)
 * - onSecondary?: () => void
 * - onClose?: () => void
 */
export default function AppAlertModal({
  visible = false,
  title = '',
  message = '',
  type = 'info',
  primaryLabel = 'Confirm',
  onPrimary,
  secondaryLabel,
  onSecondary,
  onClose,
}) {
  const getTheme = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <XCircle size={24} color="#D0142C" strokeWidth={2.4} />,
          badgeBg: '#FEF2F2',
          primaryBg: '#D0142C',
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={24} color="#D97706" strokeWidth={2.4} />,
          badgeBg: '#FEF3C7',
          primaryBg: '#D97706',
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={24} color="#059669" strokeWidth={2.4} />,
          badgeBg: '#D1FAE5',
          primaryBg: '#059669',
        };
      case 'info':
      default:
        return {
          icon: <Info size={24} color="#2563EB" strokeWidth={2.4} />,
          badgeBg: '#DBEAFE',
          primaryBg: '#D0142C',
        };
    }
  };

  const theme = getTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose || onSecondary}
    >
      <TouchableWithoutFeedback onPress={onClose || onSecondary}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetCard}>
              <View style={styles.sheetHandle} />

              {/* Close Button */}
              {onClose && (
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}

              {/* Icon & Title Row */}
              <View style={styles.headerRow}>
                <View style={[styles.iconBox, { backgroundColor: theme.badgeBg }]}>
                  {theme.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.titleText}>{title}</Text>
                </View>
              </View>

              {/* Message Body */}
              {!!message && (
                <Text style={styles.messageText}>{message}</Text>
              )}

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                {secondaryLabel && (
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={onSecondary || onClose}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.secondaryBtnText}>{secondaryLabel}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: theme.primaryBg },
                    !secondaryLabel && { flex: 1 },
                  ]}
                  onPress={onPrimary}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
                  <ChevronRight size={16} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
    position: 'relative',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  messageText: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  primaryBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
