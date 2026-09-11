import React, { memo } from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';

const LiveFeatureTicker = memo(function LiveFeatureTicker({ items, onItemPress }) {
  if (!items || items.length === 0) return null;

  // Use the primary highlight item with zero timer animations for maximum performance
  const currentItem = items[0];
  const IconComp = currentItem.IconComponent;

  const handlePress = () => {
    if (currentItem.onPress) {
      currentItem.onPress();
    } else if (onItemPress) {
      onItemPress(currentItem);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={styles.tickerContainer}
    >
      <View style={styles.tickerContent}>
        <View style={styles.row}>
          {/* Custom Vibrant Icon Container */}
          <View
            style={[
              styles.iconBadge,
              {
                backgroundColor:
                  currentItem.badgeBg || (currentItem.themeColor + '18'),
              },
            ]}
          >
            {IconComp ? <IconComp size={18} /> : null}
          </View>

          {/* Headline Text */}
          <View style={styles.textContainer}>
            <Text style={styles.tickerText} numberOfLines={1}>
              <Text
                style={[
                  styles.countHighlight,
                  { color: currentItem.themeColor || COLORS.primary },
                ]}
              >
                {currentItem.countHighlight}{' '}
              </Text>
              {currentItem.text}
            </Text>
          </View>

          {/* Right Highlight Pill Badge */}
          {currentItem.highlight && (
            <View
              style={[
                styles.tickerHighlightBadge,
                {
                  backgroundColor:
                    (currentItem.themeColor || COLORS.primary) + '15',
                },
              ]}
            >
              <Text
                style={[
                  styles.tickerHighlightText,
                  { color: currentItem.themeColor || COLORS.primary },
                ]}
              >
                {currentItem.highlight}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ChevronRight
        size={14}
        color={currentItem.themeColor || COLORS.primary}
        strokeWidth={2.4}
      />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  tickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
    marginBottom: SPACING.base,
  },
  tickerContent: {
    flex: 1,
    height: 28,
    justifyContent: 'center',
    marginRight: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
    marginRight: 6,
  },
  tickerText: {
    fontFamily: FONTS.family.semiBold,
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.slate800,
  },
  countHighlight: {
    fontWeight: FONTS.weight.heavy,
  },
  tickerHighlightBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  tickerHighlightText: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.micro,
    fontWeight: FONTS.weight.heavy,
    letterSpacing: FONTS.letterSpacing.wider,
    textTransform: 'uppercase',
  },
});

export default LiveFeatureTicker;
