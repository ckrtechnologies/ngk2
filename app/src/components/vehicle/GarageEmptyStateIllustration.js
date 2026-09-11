import React from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { View } from 'react-native';
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

export default function GarageEmptyStateIllustration({ size = 120 }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <Defs>
          <LinearGradient id="bayGroundGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F8FAFC" />
            <Stop offset="100%" stopColor="#E2E8F0" />
          </LinearGradient>
        </Defs>

        {/* Circular Foundation Plate */}
        <Circle cx="60" cy="60" r="54" fill="url(#bayGroundGrad)" stroke="#CBD5E1" strokeWidth="1.5" />

        {/* Workshop Alignment Floor Grid */}
        <Line x1="25" y1="85" x2="95" y2="85" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" />
        <Line x1="30" y1="92" x2="90" y2="92" stroke={COLORS.slate400} strokeWidth="1" />

        {/* Hydraulic 2-Post Workshop Hoist Columns */}
        {/* Left Post */}
        <Rect x="28" y="32" width="6" height="56" rx="1.5" fill="#0F172A" />
        <Rect x="26" y="86" width="10" height="4" rx="1" fill="#0F172A" />
        {/* Left Lift Arm */}
        <Path d="M34 68l14 4v3l-14-3v-4z" fill={COLORS.primary} />

        {/* Right Post */}
        <Rect x="86" y="32" width="6" height="56" rx="1.5" fill="#0F172A" />
        <Rect x="84" y="86" width="10" height="4" rx="1" fill="#0F172A" />
        {/* Right Lift Arm */}
        <Path d="M86 68l-14 4v3l14-3v-4z" fill={COLORS.primary} />

        {/* Top Crossbeam / Cable Bridge */}
        <Line x1="31" y1="34" x2="89" y2="34" stroke="#0F172A" strokeWidth="2.5" />

        {/* Ghost / Blueprint Silhouette of Waiting Vehicle */}
        <G opacity="0.6">
          <Path
            d="M40 70c0-3 3-5.5 6-5.5h28c3 0 6 2.5 6 5.5v5H40v-5z"
            fill="#BAE6FD"
            stroke="#0284C7"
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />
          <Path
            d="M47 64.5l3-6.5c.8-1.5 2-2 4-2h12c2 0 3.2.5 4 2l3 6.5H47z"
            fill="#E0F2FE"
            stroke="#0284C7"
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />
          {/* Wheels placeholder */}
          <Circle cx="48" cy="76" r="4.5" stroke="#0284C7" strokeWidth="1.2" strokeDasharray="2 2" />
          <Circle cx="72" cy="76" r="4.5" stroke="#0284C7" strokeWidth="1.2" strokeDasharray="2 2" />
        </G>

        {/* Central Precision Calibration Crosshair */}
        <Circle cx="60" cy="50" r="8" stroke={COLORS.primary} strokeWidth="1.2" strokeDasharray="3 2" />
        <Line x1="60" y1="40" x2="60" y2="44" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="60" y1="56" x2="60" y2="60" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="50" y1="50" x2="54" y2="50" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="66" y1="50" x2="70" y2="50" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" />
        <Circle cx="60" cy="50" r="2" fill={COLORS.primary} />
      </Svg>
    </View>
  );
}
