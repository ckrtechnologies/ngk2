import React from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
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
 * AppAlertModal — Shared branded alert and confirmation bottom sheet modal.
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
          icon: <XCircle size={24} color={COLORS.primary} strokeWidth={2.4} />,
          badgeBg: COLORS.errorLight,
          primaryBg: COLORS.primary,
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={24} color={COLORS.warning} strokeWidth={2.4} />,
          badgeBg: COLORS.warningLight,
          primaryBg: COLORS.warning,
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={24} color={COLORS.primary} strokeWidth={2.4} />,
          badgeBg: COLORS.primaryLight,
          primaryBg: COLORS.primary,
        };
      case 'info':
      default:
        return {
          icon: <Info size={24} color={COLORS.info} strokeWidth={2.4} />,
          badgeBg: COLORS.infoLight,
          primaryBg: COLORS.primary,
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
                  <X size={18} color={COLORS.slate400} />
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
                  <ChevronRight size={16} color={COLORS.white} strokeWidth={2.5} />
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
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingHorizontal: 22,
    paddingTop: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : 22,
    ...SHADOWS.lg,
    position: 'relative',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.slate300,
    borderRadius: RADIUS.xxs || 2,
    alignSelf: 'center',
    marginBottom: SPACING.base,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.slate100,
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
    fontFamily: FONTS.family.bold,
    fontSize: 17,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.slate900,
    letterSpacing: FONTS.letterSpacing.tight,
  },
  messageText: {
    fontFamily: FONTS.family.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.lineHeight.sm,
    marginBottom: SPACING.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textSecondary,
  },
  primaryBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  primaryBtnText: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.white,
    letterSpacing: FONTS.letterSpacing.wide,
  },
});
