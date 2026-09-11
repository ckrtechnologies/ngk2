import React from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';

const AppButton = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'dark' | 'ghost'
  backgroundColor,
  textColor,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  height = 48,
}) => {
  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    switch (variant) {
      case 'primary':
        return COLORS.primary;
      case 'dark':
        return COLORS.slate900;
      case 'secondary':
        return COLORS.surfaceSecondary;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (textColor) return textColor;
    switch (variant) {
      case 'primary':
      case 'dark':
        return COLORS.white;
      case 'secondary':
        return COLORS.slate800;
      case 'outline':
        return COLORS.primary;
      case 'ghost':
        return COLORS.textSecondary;
      default:
        return COLORS.white;
    }
  };

  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          minHeight: height,
          paddingVertical: 10,
          backgroundColor: disabled ? COLORS.border : getBackgroundColor(),
          borderColor: isOutline ? (disabled ? COLORS.borderDark : COLORS.primary) : 'transparent',
          borderWidth: isOutline ? 1.5 : 0,
        },
        variant === 'primary' && !disabled ? styles.primaryShadow : null,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' ? COLORS.primary : COLORS.white}
        />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              { color: disabled ? COLORS.textMuted : getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
  },
  primaryShadow: {
    ...SHADOWS.brand,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  rightIcon: {
    marginLeft: SPACING.sm,
  },
  text: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    letterSpacing: FONTS.letterSpacing.wide,
  },
});

export default AppButton;
