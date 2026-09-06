import React from 'react';
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  G,
  Ellipse,
} from 'react-native-svg';

/**
 * NotificationsEmptyIllustration
 * OEM-grade automotive telemetry illustration for notification empty states.
 * Depicts an ECU signal transmitter / OBD antenna with NGK brand colours.
 * Zero gradients. Pure precision SVG geometry.
 */
export default function NotificationsEmptyIllustration({ size = 120 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      {/* ─── Ground Plane ───────────────────────────────────────────── */}
      <Line x1="16" y1="84" x2="80" y2="84" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

      {/* ─── ECU Enclosure Body ─────────────────────────────────────── */}
      <Rect
        x="28"
        y="52"
        width="40"
        height="32"
        rx="4"
        ry="4"
        fill="#F8FAFC"
        stroke="#0F172A"
        strokeWidth="2"
      />
      {/* Connector Port Strip */}
      <Rect x="32" y="74" width="32" height="6" rx="2" fill="#0F172A" />
      {/* LED Status Row */}
      <Circle cx="37" cy="77" r="1.5" fill="#10B981" />
      <Circle cx="43" cy="77" r="1.5" fill="#D0142C" />
      <Circle cx="49" cy="77" r="1.5" fill="#FBBF24" />
      {/* Chip Grid */}
      <Rect x="33" y="57" width="8" height="8" rx="1.5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
      <Rect x="44" y="57" width="8" height="8" rx="1.5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
      <Rect x="55" y="57" width="8" height="8" rx="1.5" fill="#D0142C" />
      {/* NGK chip label lines */}
      <Line x1="34.5" y1="69" x2="44.5" y2="69" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="34.5" y1="72" x2="51" y2="72" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />

      {/* ─── Antenna Mast ───────────────────────────────────────────── */}
      <Rect x="47" y="16" width="2.5" height="36" rx="1" fill="#0F172A" />
      {/* Mast Crossbar */}
      <Line x1="44" y1="22" x2="53" y2="22" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
      {/* Guy wires */}
      <Line x1="48" y1="30" x2="40" y2="52" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      <Line x1="48.5" y1="30" x2="57" y2="52" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />

      {/* ─── Radar Pulse Arcs (inactive / muted) ─────────────────────── */}
      {/* Arc 1 – nearest */}
      <Path
        d="M43 17a6 6 0 0 1 10 0"
        stroke="#CBD5E1"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Arc 2 */}
      <Path
        d="M39 12a12 12 0 0 1 18 0"
        stroke="#CBD5E1"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Arc 3 – outermost accent */}
      <Path
        d="M36 8.5a16.5 16.5 0 0 1 24 0"
        stroke="#D0142C"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity={0.4}
      />

      {/* ─── Silence Badge ───────────────────────────────────────────── */}
      {/* Small diagonal cross at top-right of antenna tip */}
      <G transform="translate(57 8)">
        <Circle cx="6" cy="6" r="6" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
        <Line x1="3.5" y1="3.5" x2="8.5" y2="8.5" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" />
        <Line x1="8.5" y1="3.5" x2="3.5" y2="8.5" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" />
      </G>
    </Svg>
  );
}
