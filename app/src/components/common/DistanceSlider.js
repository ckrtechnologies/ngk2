import React, { useState, useRef, useEffect, useCallback } from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  PanResponder,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MapPin, Navigation } from 'lucide-react-native';

const PRESET_DISTANCES = [
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: '100 km', value: 100 },
  { label: '250 km', value: 250 },
  { label: '500 km', value: 500 },
];

const MIN_KM = 5;
const MAX_KM = 500;

export default function DistanceSlider({
  value = 50,
  onValueChange,
}) {
  const [trackWidth, setTrackWidth] = useState(280);
  const [internalKm, setInternalKm] = useState(value);
  const [textVal, setTextVal] = useState(String(value));
  const animatedProgress = useRef(new Animated.Value(0)).current;

  // Convert km value to 0..1 ratio
  const kmToRatio = useCallback((km) => {
    const clamped = Math.max(MIN_KM, Math.min(MAX_KM, km));
    if (clamped <= 100) {
      return (clamped / 100) * 0.5;
    } else {
      return 0.5 + ((clamped - 100) / 400) * 0.5;
    }
  }, []);

  // Convert ratio (0..1) to rounded km value
  const ratioToKm = useCallback((r) => {
    const clampedRatio = Math.max(0, Math.min(1, r));
    if (clampedRatio <= 0.5) {
      const km = Math.round((clampedRatio / 0.5) * 100);
      if (km <= 20) return Math.max(MIN_KM, Math.round(km / 5) * 5);
      return Math.round(km / 5) * 5;
    } else {
      const km = 100 + Math.round(((clampedRatio - 0.5) / 0.5) * 400);
      return Math.min(MAX_KM, Math.round(km / 25) * 25);
    }
  }, []);

  // Synchronize internal state when prop changes
  useEffect(() => {
    setInternalKm(value);
    setTextVal(String(value));
    const targetRatio = kmToRatio(value);
    Animated.spring(animatedProgress, {
      toValue: targetRatio,
      useNativeDriver: false,
      friction: 8,
      tension: 60,
    }).start();
  }, [value, kmToRatio, animatedProgress]);

  const trackRef = useRef(null);
  const trackLayoutRef = useRef({ px: 0, width: 280 });

  const applyPosition = (pageX, px, width) => {
    const relativeX = Math.max(0, Math.min(width, pageX - px));
    const ratio = relativeX / width;
    const km = ratioToKm(ratio);
    setInternalKm(km);
    setTextVal(String(km));
    animatedProgress.setValue(ratio);
    if (onValueChange) onValueChange(km);
  };

  const updateFromPosition = (pageX, isInitial = false) => {
    if (!trackRef.current) return;
    if (isInitial || trackLayoutRef.current.width <= 0) {
      trackRef.current.measure((fx, fy, width, height, px, py) => {
        trackLayoutRef.current = { px, width: width || 280 };
        applyPosition(pageX, px, width || 280);
      });
    } else {
      const { px, width } = trackLayoutRef.current;
      applyPosition(pageX, px, width);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        updateFromPosition(evt.nativeEvent.pageX, true);
      },
      onPanResponderMove: (evt) => {
        updateFromPosition(evt.nativeEvent.pageX, false);
      },
    })
  ).current;

  const handlePresetPress = (km) => {
    setInternalKm(km);
    setTextVal(String(km));
    const targetRatio = kmToRatio(km);
    Animated.spring(animatedProgress, {
      toValue: targetRatio,
      useNativeDriver: false,
      friction: 7,
      tension: 65,
    }).start();
    if (onValueChange) onValueChange(km);
  };

  // Handler for direct text entry
  const handleTextChange = (text) => {
    const clean = text.replace(/[^0-9]/g, '');
    setTextVal(clean);
    if (clean.length > 0) {
      const parsed = parseInt(clean, 10);
      if (!isNaN(parsed) && parsed > 0) {
        const clamped = Math.min(MAX_KM, parsed);
        setInternalKm(clamped);
        const targetRatio = kmToRatio(clamped);
        Animated.spring(animatedProgress, {
          toValue: targetRatio,
          useNativeDriver: false,
          friction: 8,
          tension: 70,
        }).start();
        if (onValueChange) onValueChange(clamped);
      }
    }
  };

  const handleBlur = () => {
    if (!textVal || parseInt(textVal, 10) <= 0) {
      setTextVal(String(internalKm));
    }
  };

  const formattedLabel = `Within ${internalKm} km`;

  return (
    <View style={styles.container}>
      {/* Header with Distance Badge */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <MapPin size={16} color={COLORS.primary} strokeWidth={2.4} />
          <Text style={styles.titleText}>Search Radius</Text>
        </View>

        <View style={styles.radiusBadge}>
          <Text style={styles.radiusBadgeText}>{formattedLabel}</Text>
        </View>
      </View>

      {/* Interactive Slider Track */}
      <View
        ref={trackRef}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0) setTrackWidth(w);
        }}
        style={styles.touchArea}
        {...panResponder.panHandlers}
      >
        <View style={styles.trackBackground}>
          {/* Active Colored Fill */}
          <Animated.View
            style={[
              styles.trackFill,
              {
                width: animatedProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        {/* Draggable Thumb */}
        <Animated.View
          style={[
            styles.thumb,
            {
              left: animatedProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, Math.max(0, trackWidth - 24)],
              }),
            },
          ]}
        >
          <View style={styles.thumbCenterDot} />
        </Animated.View>
      </View>

      {/* Min / Max Labels */}
      <View style={styles.minMaxRow}>
        <Text style={styles.minMaxText}>5 km</Text>
        <Text style={styles.minMaxText}>100 km</Text>
        <Text style={styles.minMaxText}>250 km</Text>
        <Text style={styles.minMaxText}>500 km</Text>
      </View>

      {/* Manual KM Input Box */}
      <View style={styles.inputCard}>
        <View style={styles.inputLeft}>
          <Navigation size={14} color={COLORS.primary} />
          <Text style={styles.inputLabel}>Enter distance in km:</Text>
        </View>
        <View style={styles.inputFieldBox}>
          <TextInput
            style={styles.textInput}
            value={textVal}
            onChangeText={handleTextChange}
            onBlur={handleBlur}
            keyboardType="numeric"
            placeholder="50"
            placeholderTextColor={COLORS.slate400}
            maxLength={6}
            returnKeyType="done"
            selectTextOnFocus
          />
          <View style={styles.kmBadge}>
            <Text style={styles.kmBadgeText}>KM</Text>
          </View>
        </View>
      </View>

      {/* Quick Preset Chips */}
      <View style={styles.presetsRow}>
        {PRESET_DISTANCES.map((preset) => {
          const isSelected = Math.abs(preset.value - internalKm) <= 2;

          return (
            <TouchableOpacity
              key={preset.label}
              activeOpacity={0.75}
              onPress={() => handlePresetPress(preset.value)}
              style={[
                styles.presetChip,
                isSelected && styles.presetChipActive,
              ]}
            >
              <Text
                style={[
                  styles.presetChipText,
                  isSelected && styles.presetChipTextActive,
                ]}
              >
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  radiusBadge: {
    backgroundColor: COLORS.primaryLight || '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder || 'rgba(0, 135, 82, 0.25)',
  },
  radiusBadgeText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.primary,
  },
  touchArea: {
    height: 36,
    justifyContent: 'center',
  },
  trackBackground: {
    height: 8,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xs,
  },
  thumb: {
    position: 'absolute',
    top: 6,
    width: 24,
    height: 24,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbCenterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  minMaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  minMaxText: {
    fontSize: 10,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.slate400,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: FONTS.weight.semiBold,
    color: '#334155',
  },
  inputFieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.borderDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 105,
    justifyContent: 'flex-end',
  },
  textInput: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.slate900,
    paddingVertical: 4,
    paddingHorizontal: 6,
    textAlign: 'right',
    minWidth: 50,
  },
  kmBadge: {
    backgroundColor: COLORS.primaryLight || '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    marginLeft: 4,
  },
  kmBadgeText: {
    fontSize: 10,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.primary,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: COLORS.slate100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  presetChipText: {
    fontSize: 11.5,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textSecondary,
  },
  presetChipTextActive: {
    color: COLORS.white,
    fontWeight: FONTS.weight.bold,
  },
});
