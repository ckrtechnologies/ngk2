import React from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

const headerRedBg = require('../../App_Logos_and_Icons_and_Backgrounds/background-Landing-red.jpg');

const AppHeader = ({
  title,
  subtitle,
  onBack,
  showBack = true,
  rightElement,
  centerElement,
  style,
  variant = 'solid', // 'solid' (brand primary) or 'light' / 'transparent'
  backgroundColor,
  titleColor,
  subtitleColor,
  backIconColor,
  includeTopInset = true,
  showStatusBar = true,
}) => {
  const insets = useSafeAreaInsets();
  const isSolid = variant === 'solid';

  const resolvedBgColor =
    backgroundColor || (isSolid ? COLORS.primary : 'transparent');
  const resolvedTitleColor =
    titleColor || (isSolid ? COLORS.textOnPrimary : COLORS.textPrimary);
  const resolvedSubtitleColor =
    subtitleColor || (isSolid ? COLORS.textOnPrimaryMuted : COLORS.textTertiary);
  const resolvedIconColor =
    backIconColor || (isSolid ? COLORS.white : COLORS.textPrimary);

  const containerPaddingTop = includeTopInset
    ? insets.top + (Platform.OS === 'android' ? 6 : 4)
    : 10;

  const HeaderWrapper = isSolid ? ImageBackground : View;
  const wrapperProps = isSolid
    ? { source: headerRedBg, resizeMode: 'cover' }
    : {};

  return (
    <>
      {showStatusBar && (
        <StatusBar
          barStyle={isSolid ? 'light-content' : 'dark-content'}
          backgroundColor={isSolid ? COLORS.primary : COLORS.white}
          translucent={false}
        />
      )}

      <HeaderWrapper
        {...wrapperProps}
        style={[
          styles.headerContainer,
          isSolid && styles.solidHeader,
          {
            backgroundColor: isSolid ? COLORS.primary : resolvedBgColor,
            paddingTop: containerPaddingTop,
          },
          style,
        ]}
      >
        <View style={styles.headerContent}>
          {/* Left Action / Back Button */}
          <View style={styles.leftContainer}>
            {showBack ? (
              <TouchableOpacity
                style={[
                  styles.backButton,
                  isSolid ? styles.solidBackButton : styles.lightBackButton,
                ]}
                onPress={onBack}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.75}
              >
                <ArrowLeft size={20} color={resolvedIconColor} strokeWidth={2.4} />
              </TouchableOpacity>
            ) : (
              <View style={styles.backPlaceholder} />
            )}
          </View>

          {/* Center Title or Custom Element */}
          <View style={styles.centerContainer}>
            {centerElement ? (
              centerElement
            ) : (
              <>
                {title ? (
                  <Text
                    style={[styles.title, { color: resolvedTitleColor }]}
                    numberOfLines={1}
                  >
                    {title}
                  </Text>
                ) : null}
                {subtitle ? (
                  <Text
                    style={[styles.subtitle, { color: resolvedSubtitleColor }]}
                    numberOfLines={1}
                  >
                    {subtitle}
                  </Text>
                ) : null}
              </>
            )}
          </View>

          {/* Right Action Element */}
          <View style={styles.rightContainer}>
            {rightElement ? rightElement : <View style={styles.backPlaceholder} />}
          </View>
        </View>
      </HeaderWrapper>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.md,
  },
  solidHeader: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryDark,
    ...SHADOWS.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  leftContainer: {
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  solidBackButton: {
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  lightBackButton: {
    backgroundColor: COLORS.surfaceSecondary,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backPlaceholder: {
    width: 38,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.heavy,
    letterSpacing: FONTS.letterSpacing.tight,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.family.semiBold,
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.semiBold,
    marginTop: 1,
    letterSpacing: FONTS.letterSpacing.wide,
    textAlign: 'center',
  },
  rightContainer: {
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});

export default AppHeader;

