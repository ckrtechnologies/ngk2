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

export default function VehicleBlueprintFallback({
  car,
  compact = false,
  height = 120,
}) {
  const make = (car?.make || car?.brand || car?.manufacturer || '').toUpperCase();
  const model = (car?.model || car?.series || car?.name || '').toUpperCase();
  const year = car?.year || car?.modelYear || car?.yearOfConstruction || '';
  const vehicleTitle = make || model ? `${make} ${model}`.trim() : 'VEHICLE PROFILE';

  if (compact) {
    return (
      <View style={[styles.compactContainer, { height }]}>
        {/* Technical Grid background */}
        <Svg width="100%" height="100%" viewBox="0 0 160 80" preserveAspectRatio="xMidYMid slice">
          <Defs>
            <LinearGradient id="compactBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#0B132B" />
              <Stop offset="100%" stopColor="#070B18" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="160" height="80" fill="url(#compactBgGrad)" />

          {/* Blueprint Grid Lines */}
          <Line x1="0" y1="20" x2="160" y2="20" stroke="#1E293B" strokeWidth="0.5" strokeDasharray="3 3" />
          <Line x1="0" y1="40" x2="160" y2="40" stroke="#1E293B" strokeWidth="0.5" strokeDasharray="3 3" />
          <Line x1="0" y1="60" x2="160" y2="60" stroke="#1E293B" strokeWidth="0.5" strokeDasharray="3 3" />
          <Line x1="40" y1="0" x2="40" y2="80" stroke="#1E293B" strokeWidth="0.5" strokeDasharray="3 3" />
          <Line x1="80" y1="0" x2="80" y2="80" stroke="#1E293B" strokeWidth="0.5" strokeDasharray="3 3" />
          <Line x1="120" y1="0" x2="120" y2="80" stroke="#1E293B" strokeWidth="0.5" strokeDasharray="3 3" />

          {/* Precision Vehicle Silhouette */}
          <G transform="translate(10, 8)">
            {/* Ground Line */}
            <Line x1="5" y1="44" x2="135" y2="44" stroke={COLORS.primary} strokeWidth="1.2" strokeOpacity="0.7" />

            {/* Aerodynamic Coupe Body */}
            <Path
              d="M12 36 C14 30, 20 28, 30 28 L50 27 C62 27, 72 15, 84 15 L108 15 C116 15, 126 23, 130 28 L136 32 C140 34, 142 37, 142 40 L140 42 C139 43, 137 44, 134 44 L118 44 C116 38, 108 34, 102 34 C96 34, 88 38, 86 44 L54 44 C52 38, 44 34, 38 34 C32 34, 24 38, 22 44 L8 44 C6 44, 4 42, 4 39 C4 37, 6 36, 12 36 Z"
              fill="#1E293B"
              stroke="#38BDF8"
              strokeWidth="1.2"
            />

            {/* Cabin Glass Outline */}
            <Path
              d="M58 27 L82 17 L106 17 C112 17, 118 22, 122 27 Z"
              fill="#0F172A"
              stroke="#64748B"
              strokeWidth="0.8"
            />

            {/* Wheels */}
            <Circle cx="38" cy="44" r="7" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1.2" />
            <Circle cx="38" cy="44" r="3" fill={COLORS.primary} />
            <Circle cx="102" cy="44" r="7" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1.2" />
            <Circle cx="102" cy="44" r="3" fill={COLORS.primary} />
          </G>
        </Svg>

        {/* Prominent Vehicle Title Overlay */}
        <View style={styles.compactBottomOverlay} pointerEvents="none">
          <Text style={styles.compactVehicleTitleText} numberOfLines={1}>
            {vehicleTitle}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      {/* Full Size CAD Blueprint Stage */}
      <Svg width="100%" height="100%" viewBox="0 0 340 160" preserveAspectRatio="xMidYMid meet">
        <Defs>
          <LinearGradient id="stageBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0B1329" />
            <Stop offset="50%" stopColor="#080E1E" />
            <Stop offset="100%" stopColor="#030712" />
          </LinearGradient>
          <LinearGradient id="carBodyGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#1E293B" />
            <Stop offset="50%" stopColor="#334155" />
            <Stop offset="100%" stopColor="#1E293B" />
          </LinearGradient>
        </Defs>

        {/* Blueprint Stage Background */}
        <Rect x="0" y="0" width="340" height="160" fill="url(#stageBgGrad)" />

        {/* Isometric / Engineering Matrix Grid Lines */}
        <G opacity="0.4">
          <Line x1="0" y1="30" x2="340" y2="30" stroke="#1E293B" strokeWidth="0.7" />
          <Line x1="0" y1="65" x2="340" y2="65" stroke="#1E293B" strokeWidth="0.7" />
          <Line x1="0" y1="100" x2="340" y2="100" stroke="#1E293B" strokeWidth="0.7" />
          <Line x1="0" y1="135" x2="340" y2="135" stroke="#1E293B" strokeWidth="0.7" />

          <Line x1="40" y1="0" x2="40" y2="160" stroke="#1E293B" strokeWidth="0.7" />
          <Line x1="100" y1="0" x2="100" y2="160" stroke="#1E293B" strokeWidth="0.7" />
          <Line x1="170" y1="0" x2="170" y2="160" stroke="#1E293B" strokeWidth="0.7" />
          <Line x1="240" y1="0" x2="240" y2="160" stroke="#1E293B" strokeWidth="0.7" />
          <Line x1="300" y1="0" x2="300" y2="160" stroke="#1E293B" strokeWidth="0.7" />
        </G>

        {/* Center Target Crosshairs */}
        <Line x1="170" y1="15" x2="170" y2="25" stroke={COLORS.primary} strokeWidth="1.5" />
        <Line x1="165" y1="20" x2="175" y2="20" stroke={COLORS.primary} strokeWidth="1.5" />

        {/* Dynamic Datum / Ground Reference Line with Tech Markers */}
        <Line x1="20" y1="126" x2="320" y2="126" stroke={COLORS.primary} strokeWidth="1.5" strokeOpacity="0.8" />
        <Circle cx="20" cy="126" r="2.5" fill={COLORS.primary} />
        <Circle cx="320" cy="126" r="2.5" fill={COLORS.primary} />

        {/* Vehicle Blueprint Silhouette */}
        <G transform="translate(20, 26)">
          {/* Main Car Body Profile */}
          <Path
            d="M24 78 C28 66, 40 62, 60 62 L100 60 C124 60, 144 36, 168 36 L216 36 C232 36, 252 52, 260 62 L272 70 C280 74, 284 80, 284 86 L280 90 C278 92, 274 94, 268 94 L236 94 C232 82, 216 74, 204 74 C192 74, 176 82, 172 94 L108 94 C104 82, 88 74, 76 74 C64 74, 48 82, 44 94 L16 94 C12 94, 8 90, 8 84 C8 80, 12 78, 24 78 Z"
            fill="url(#carBodyGlow)"
            stroke="#38BDF8"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />

          {/* Cabin Windshield, Roof & Rear Window */}
          <Path
            d="M116 60 L164 40 L212 40 C224 40, 236 50, 244 60 Z"
            fill="#0B1329"
            stroke={COLORS.slate400}
            strokeWidth="1"
          />
          {/* B-Pillar */}
          <Line x1="172" y1="40" x2="178" y2="60" stroke="#64748B" strokeWidth="1.4" />

          {/* Xenon Laser Headlight Contour */}
          <Path d="M276 75 L284 79 L276 81 Z" fill="#38BDF8" opacity="0.9" />

          {/* Tail Light Red Accent */}
          <Path d="M10 80 L18 80 L14 84 Z" fill="#EF4444" opacity="0.9" />

          {/* Front Alloy Wheel & Ceramic Brake Disc */}
          <Circle cx="76" cy="94" r="14" fill="#0A0F1D" stroke={COLORS.slate400} strokeWidth="1.8" />
          <Circle cx="76" cy="94" r="8" fill="#1E293B" stroke="#475569" strokeWidth="1" />
          <Circle cx="76" cy="94" r="3.5" fill={COLORS.primary} />

          {/* Rear Alloy Wheel & Ceramic Brake Disc */}
          <Circle cx="204" cy="94" r="14" fill="#0A0F1D" stroke={COLORS.slate400} strokeWidth="1.8" />
          <Circle cx="204" cy="94" r="8" fill="#1E293B" stroke="#475569" strokeWidth="1" />
          <Circle cx="204" cy="94" r="3.5" fill={COLORS.primary} />

          {/* Aerodynamic Air Flow Vector Lines */}
          <Path d="M22 62 C50 60, 80 50, 110 50" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
          <Path d="M120 34 C160 30, 210 30, 250 46" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
        </G>

        {/* Wheelbase Dimension Marker Line */}
        <Line x1="96" y1="140" x2="224" y2="140" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" />
        <Line x1="96" y1="136" x2="96" y2="144" stroke="#64748B" strokeWidth="1" />
        <Line x1="224" y1="136" x2="224" y2="144" stroke="#64748B" strokeWidth="1" />
      </Svg>

      {/* Top Left Tag: Technical CAD Blueprint */}
      <View style={styles.topBadgeRow}>
        <View style={styles.cadPill}>
          <View style={styles.cadPulseDot} />
          <Text style={styles.cadPillText}>OEM TECHNICAL PROFILE</Text>
        </View>
        {year ? (
          <View style={styles.yearPill}>
            <Text style={styles.yearPillText}>{year}</Text>
          </View>
        ) : null}
      </View>

      {/* Bottom Floating Technical Spec Banner */}
      <View style={styles.bottomOverlay}>
        <Text style={styles.vehicleTitleText} numberOfLines={1}>
          {vehicleTitle}
        </Text>
        <Text style={styles.specSubText}>
          {car?.engine || car?.fuel || car?.powerKw ? `${car.engine || ''} • ${car.fuel || ''} • ${car.powerKw ? car.powerKw + 'kW' : ''}`.replace(/^ • | • $/g, '') : 'NGK / NTK GENUINE FITMENT SPECIFIED'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#0B1329',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactContainer: {
    width: '100%',
    backgroundColor: '#0B1329',
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBadgeRow: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  cadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  cadPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
  },
  cadPillText: {
    color: '#BAE6FD',
    fontSize: 9,
    fontWeight: FONTS.weight.heavy,
    letterSpacing: 0.8,
  },
  yearPill: {
    backgroundColor: 'rgba(0, 135, 82, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  yearPillText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: FONTS.weight.heavy,
    letterSpacing: 0.5,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(11, 19, 41, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    zIndex: 2,
  },
  vehicleTitleText: {
    color: COLORS.background,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.heavy,
    letterSpacing: 0.6,
  },
  specSubText: {
    color: COLORS.slate400,
    fontSize: 9,
    fontWeight: FONTS.weight.semiBold,
    letterSpacing: 0.4,
    marginTop: 1,
  },
  compactBottomOverlay: {
    position: 'absolute',
    bottom: 3,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(11, 19, 41, 0.88)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    alignItems: 'center',
  },
  compactVehicleTitleText: {
    color: COLORS.background,
    fontSize: 9,
    fontWeight: FONTS.weight.heavy,
    letterSpacing: 0.4,
  },
});
