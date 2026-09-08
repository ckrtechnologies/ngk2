import React, { memo } from 'react';
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
                  { color: currentItem.themeColor || '#E31837' },
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
                    (currentItem.themeColor || '#E31837') + '15',
                },
              ]}
            >
              <Text
                style={[
                  styles.tickerHighlightText,
                  { color: currentItem.themeColor || '#E31837' },
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
        color={currentItem.themeColor || '#E31837'}
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 14,
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
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 8,
    marginRight: 6,
  },
  tickerText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1F2937',
  },
  countHighlight: {
    fontWeight: '800',
  },
  tickerHighlightBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  tickerHighlightText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});

export default LiveFeatureTicker;
