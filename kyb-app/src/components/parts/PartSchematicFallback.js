import React from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

export default function PartSchematicFallback({
  partName = '',
  brand = 'KYB',
  partNo = '',
  size = 'thumb', // 'thumb' | 'large'
}) {
  const isLarge = size === 'large';
  const displayBrand = (brand || 'KYB').toUpperCase();

  if (!isLarge) {
    return (
      <View style={styles.thumbContainer}>
        <Svg width="100%" height="100%" viewBox="0 0 80 80" preserveAspectRatio="xMidYMid meet">
          <Defs>
            <LinearGradient id="thumbBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#0B1329" />
              <Stop offset="100%" stopColor="#030712" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="80" height="80" rx="6" fill="url(#thumbBg)" />

          {/* Blueprint Crosshairs */}
          <Line x1="40" y1="10" x2="40" y2="70" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="2 2" />
          <Line x1="10" y1="40" x2="70" y2="40" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="2 2" />

          {/* Shock Absorber / Strut Technical Schematic Profile */}
          <G transform="translate(18, 10)">
            {/* Top Mount Eyelet */}
            <Circle cx="22" cy="6" r="4.5" fill="none" stroke="#94A3B8" strokeWidth="1.8" />
            <Circle cx="22" cy="6" r="2" fill="#0F172A" />

            {/* Piston Rod (Chrome) */}
            <Rect x="20.5" y="10.5" width="3" height="15" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="0.5" />

            {/* Dust Boot / Seal Collar */}
            <Rect x="17" y="24" width="10" height="4" rx="1" fill="#475569" />

            {/* Main Damper Cylinder Body */}
            <Rect x="16" y="28" width="12" height="22" rx="2" fill="#1E293B" stroke={COLORS.primary} strokeWidth="1.2" />
            <Line x1="16" y1="35" x2="28" y2="35" stroke="#334155" strokeWidth="1" />
            <Line x1="16" y1="42" x2="28" y2="42" stroke="#334155" strokeWidth="1" />

            {/* Bottom Mount Eyelet */}
            <Rect x="20.5" y="50" width="3" height="3" fill="#64748B" />
            <Circle cx="22" cy="56" r="4.5" fill="none" stroke="#94A3B8" strokeWidth="1.8" />
            <Circle cx="22" cy="56" r="2" fill="#0F172A" />
          </G>
        </Svg>
        <View style={styles.thumbBrandTag}>
          <Text style={styles.thumbBrandText} numberOfLines={1}>{displayBrand}</Text>
        </View>
      </View>
    );
  }

  // Large Modal Preview Stage
  return (
    <View style={styles.largeContainer}>
      <Svg width="100%" height="100%" viewBox="0 0 280 180" preserveAspectRatio="xMidYMid meet">
        <Defs>
          <LinearGradient id="largeBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0B1329" />
            <Stop offset="60%" stopColor="#080E1E" />
            <Stop offset="100%" stopColor="#030712" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="280" height="180" rx="10" fill="url(#largeBg)" />

        {/* Precision Engineering Matrix Grid */}
        <G opacity="0.35">
          <Line x1="0" y1="30" x2="280" y2="30" stroke="#1E293B" strokeWidth="0.8" />
          <Line x1="0" y1="70" x2="280" y2="70" stroke="#1E293B" strokeWidth="0.8" />
          <Line x1="0" y1="110" x2="280" y2="110" stroke="#1E293B" strokeWidth="0.8" />
          <Line x1="0" y1="150" x2="280" y2="150" stroke="#1E293B" strokeWidth="0.8" />

          <Line x1="40" y1="0" x2="40" y2="180" stroke="#1E293B" strokeWidth="0.8" />
          <Line x1="90" y1="0" x2="90" y2="180" stroke="#1E293B" strokeWidth="0.8" />
          <Line x1="140" y1="0" x2="140" y2="180" stroke="#1E293B" strokeWidth="0.8" />
          <Line x1="190" y1="0" x2="190" y2="180" stroke="#1E293B" strokeWidth="0.8" />
          <Line x1="240" y1="0" x2="240" y2="180" stroke="#1E293B" strokeWidth="0.8" />
        </G>

        {/* Center Crosshairs */}
        <Line x1="140" y1="15" x2="140" y2="165" stroke={COLORS.primary} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        <Line x1="20" y1="90" x2="260" y2="90" stroke={COLORS.primary} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />

        {/* Horizontal Technical KYB Gas-A-Just / Excel-G Strut Blueprint */}
        <G transform="translate(30, 65)">
          {/* Left / Top Mount Eyelet */}
          <Circle cx="15" cy="25" r="9" fill="none" stroke="#94A3B8" strokeWidth="3" />
          <Circle cx="15" cy="25" r="4.5" fill="#0F172A" />
          <Rect x="24" y="22" width="8" height="6" fill="#64748B" />

          {/* Hard-Chromed Piston Shaft */}
          <Rect x="32" y="20" width="55" height="10" rx="2" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.2" />
          <Line x1="38" y1="21" x2="82" y2="21" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* Wiper Seal & Guide Collar */}
          <Rect x="87" y="14" width="10" height="22" rx="2" fill="#475569" stroke="#334155" strokeWidth="1" />
          <Rect x="97" y="16" width="6" height="18" fill="#F59E0B" />

          {/* Outer Damper Cylinder Body (KYB Red Accent / High-Grade Steel) */}
          <Rect x="103" y="12" width="95" height="26" rx="4" fill="#1E293B" stroke={COLORS.primary} strokeWidth="1.8" />
          
          {/* Internal Gas/Hydraulic chamber markers */}
          <Line x1="125" y1="14" x2="125" y2="36" stroke="#334155" strokeWidth="1.5" strokeDasharray="2 2" />
          <Line x1="155" y1="14" x2="155" y2="36" stroke="#334155" strokeWidth="1.5" strokeDasharray="2 2" />
          <Line x1="175" y1="14" x2="175" y2="36" stroke="#334155" strokeWidth="1.5" strokeDasharray="2 2" />

          {/* KYB Gas Pressure Symbol */}
          <Circle cx="140" cy="25" r="6" fill="none" stroke={COLORS.primary} strokeWidth="1" />
          <Path d="M138 23l4 4m0-4l-4 4" stroke={COLORS.primary} strokeWidth="1" strokeLinecap="round" />

          {/* Lower Mount Base & Bushing Eye */}
          <Rect x="198" y="21" width="10" height="8" fill="#475569" />
          <Circle cx="216" cy="25" r="9" fill="none" stroke="#94A3B8" strokeWidth="3" />
          <Circle cx="216" cy="25" r="4.5" fill="#0F172A" />
        </G>

        {/* Technical Calibration Text in SVG */}
        <Line x1="45" y1="150" x2="235" y2="150" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" />
        <Line x1="45" y1="146" x2="45" y2="154" stroke="#64748B" strokeWidth="1" />
        <Line x1="235" y1="146" x2="235" y2="154" stroke="#64748B" strokeWidth="1" />
      </Svg>

      <View style={styles.largeTopTag}>
        <View style={styles.cadDot} />
        <Text style={styles.largeTopTagText}>GENUINE COMPONENT SCHEMATIC</Text>
      </View>

      <View style={styles.largeBottomTag}>
        <Text style={styles.largePartNoText} numberOfLines={1}>
          {partNo ? `#${partNo}` : `${displayBrand} OE SPECIFICATION`}
        </Text>
        <Text style={styles.largePartNameText} numberOfLines={1}>
          {partName || 'Precision Shock & Strut Component'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  thumbContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0B1329',
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbBrandTag: {
    position: 'absolute',
    bottom: 3,
    backgroundColor: 'rgba(227, 24, 55, 0.9)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  thumbBrandText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: FONTS.weight.heavy,
    letterSpacing: 0.5,
  },
  largeContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#0B1329',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeTopTag: {
    position: 'absolute',
    top: 8,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    gap: 4,
  },
  cadDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#38BDF8',
  },
  largeTopTagText: {
    color: '#BAE6FD',
    fontSize: 9,
    fontWeight: FONTS.weight.heavy,
    letterSpacing: 0.6,
  },
  largeBottomTag: {
    position: 'absolute',
    bottom: 6,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(11, 19, 41, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  largePartNoText: {
    color: COLORS.background,
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.heavy,
    letterSpacing: 0.5,
  },
  largePartNameText: {
    color: COLORS.slate400,
    fontSize: 9,
    fontWeight: FONTS.weight.semiBold,
    marginTop: 1,
  },
});
