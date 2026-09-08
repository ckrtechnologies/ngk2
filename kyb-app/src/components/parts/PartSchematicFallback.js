import React from 'react';
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

          {/* Spark Plug Technical Schematic Profile */}
          <G transform="translate(15, 12)">
            {/* Terminal Stud */}
            <Rect x="22" y="4" width="6" height="5" rx="1" fill="#E2E8F0" />

            {/* Ceramic Insulator Ribs */}
            <Rect x="20" y="9" width="10" height="15" rx="2" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="0.8" />
            <Line x1="19" y1="13" x2="31" y2="13" stroke="#94A3B8" strokeWidth="1" />
            <Line x1="19" y1="17" x2="31" y2="17" stroke="#94A3B8" strokeWidth="1" />
            <Line x1="19" y1="21" x2="31" y2="21" stroke="#94A3B8" strokeWidth="1" />

            {/* Hex Nut / Metal Shell */}
            <Path d="M17 24h16l2 8H15l2-8z" fill="#334155" stroke="#0F172A" strokeWidth="0.8" />

            {/* Threaded Section */}
            <Rect x="18" y="32" width="14" height="15" fill="#1E293B" />
            <Line x1="18" y1="35" x2="32" y2="35" stroke="#64748B" strokeWidth="1" />
            <Line x1="18" y1="39" x2="32" y2="39" stroke="#64748B" strokeWidth="1" />
            <Line x1="18" y1="43" x2="32" y2="43" stroke="#64748B" strokeWidth="1" />

            {/* Ground Electrode & Center Spark Point */}
            <Path d="M22 47v6h6" stroke="#E31837" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="25" cy="50" r="1" fill="#FEF08A" />
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
        <Line x1="140" y1="15" x2="140" y2="165" stroke="#E31837" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        <Line x1="20" y1="90" x2="260" y2="90" stroke="#E31837" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />

        {/* Horizontal Technical Spark Plug Blueprint */}
        <G transform="translate(45, 62)">
          {/* Terminal Stud */}
          <Rect x="10" y="23" width="10" height="10" rx="1.5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />

          {/* Ceramic Insulator Ribs */}
          <Rect x="20" y="19" width="45" height="18" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />
          <Line x1="28" y1="16" x2="28" y2="40" stroke="#94A3B8" strokeWidth="1.5" />
          <Line x1="36" y1="16" x2="36" y2="40" stroke="#94A3B8" strokeWidth="1.5" />
          <Line x1="44" y1="16" x2="44" y2="40" stroke="#94A3B8" strokeWidth="1.5" />
          <Line x1="52" y1="16" x2="52" y2="40" stroke="#94A3B8" strokeWidth="1.5" />

          {/* Hex Nut Collar */}
          <Path d="M65 14l6 4v20l-6 4H65V14z" fill="#475569" stroke="#0F172A" strokeWidth="1.2" />
          <Rect x="71" y="16" width="22" height="24" fill="#334155" stroke="#0F172A" strokeWidth="1.2" />
          <Line x1="82" y1="16" x2="82" y2="40" stroke="#64748B" strokeWidth="1.2" />

          {/* Gasket Ring */}
          <Rect x="93" y="17" width="5" height="22" rx="1" fill="#F59E0B" />

          {/* Threaded Barrel */}
          <Rect x="98" y="19" width="45" height="18" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" />
          <Line x1="104" y1="17" x2="104" y2="39" stroke="#64748B" strokeWidth="1.4" />
          <Line x1="112" y1="17" x2="112" y2="39" stroke="#64748B" strokeWidth="1.4" />
          <Line x1="120" y1="17" x2="120" y2="39" stroke="#64748B" strokeWidth="1.4" />
          <Line x1="128" y1="17" x2="128" y2="39" stroke="#64748B" strokeWidth="1.4" />
          <Line x1="136" y1="17" x2="136" y2="39" stroke="#64748B" strokeWidth="1.4" />

          {/* Center Electrode & Ground Electrode Tip */}
          <Rect x="143" y="26" width="10" height="4" fill="#E2E8F0" />
          <Path d="M145 35h12v-12" stroke="#E31837" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />

          {/* Spark Glow Point */}
          <Circle cx="155" cy="28" r="2.5" fill="#FEF08A" />
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
          {partName || 'Precision Ignition & Sensor Component'}
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
    borderRadius: 8,
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
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  largeContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#0B1329',
    borderRadius: 12,
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
    fontWeight: '800',
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
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  largePartNameText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },
});
