import React from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import Svg, {
  Path,
  Circle,
  Rect,
  G,
  Line,
} from 'react-native-svg';

/**
 * High-End Industrial OEM Automotive Icons for KYB App
 * Precision vector geometry with authentic automotive semantics.
 * Completely free of pseudo-3D gradients, specular glares, or AI template artifacts.
 */

// 1. HOME DASHBOARD / PORTAL ICON
export function HomeDashboard3DIcon({ size = 32, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      {/* Precision Ground Platform Line */}
      <Line x1="8" y1="42" x2="40" y2="42" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

      {/* Main Architectural Portal Structure */}
      <Path
        d="M11 21v19a2 2 0 0 0 2 2h22a2 2 0 0 0 2-2V21l-13-11-13 11z"
        fill="#F8FAFC"
        stroke="#0F172A"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Crimson Crest Gable */}
      <Path
        d="M24 7l15 12.5h-4.5L24 10.5 13.5 19.5H9L24 7z"
        fill={COLORS.primary}
      />

      {/* Central Tachometer Bay Arch */}
      <Path
        d="M18 42V28a6 6 0 0 1 12 0v14"
        fill="#0F172A"
      />

      {/* Tachometer Arc Scale */}
      <Path
        d="M20.5 28a3.5 3.5 0 0 1 7 0"
        stroke="#38BDF8"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Speedometer Needle */}
      <Line
        x1="24"
        y1="28"
        x2="26.5"
        y2="25"
        stroke="#EF4444"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Circle cx="24" cy="28" r="1.5" fill={COLORS.white} />

      {/* Ignition Spark Point Node */}
      <Circle cx="24" cy="16" r="2.5" fill={COLORS.primary} />
      <Circle cx="24" cy="16" r="1" fill={COLORS.white} />
    </Svg>
  );
}

// 2. PROFILE / CREDENTIALS ICON
export function Profile3DIcon({ size = 32, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      {/* Smart Card Base Body */}
      <Rect
        x="6"
        y="9"
        width="36"
        height="30"
        rx="4"
        fill="#F8FAFC"
        stroke="#0F172A"
        strokeWidth="2.2"
      />

      {/* Top Lanyard Clip Hole */}
      <Rect x="19" y="11" width="10" height="2" rx="1" fill="#CBD5E1" />

      {/* Metallic Chip Gold Contact */}
      <Rect x="10" y="16" width="9" height="7" rx="1.5" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
      <Line x1="14.5" y1="16" x2="14.5" y2="23" stroke="#92400E" strokeWidth="0.8" />
      <Line x1="10" y1="19.5" x2="19" y2="19.5" stroke="#92400E" strokeWidth="0.8" />

      {/* Verified Technician Profile Silhouette */}
      <Circle cx="30" cy="19" r="4.5" fill="#0F172A" />
      <Path
        d="M23 31c0-3.5 3.1-5.5 7-5.5s7 2 7 5.5"
        fill="#0F172A"
      />

      {/* Data Tracks / Circuit Lines */}
      <Line x1="10" y1="27" x2="19" y2="27" stroke={COLORS.slate400} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="10" y1="31" x2="16" y2="31" stroke={COLORS.slate400} strokeWidth="1.5" strokeLinecap="round" />

      {/* Verified Account Seal Dot */}
      <Circle cx="37" cy="13" r="3.5" fill={COLORS.primary} />
      <Path d="M35.5 13l1 1 2-2" stroke={COLORS.white} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// 3. TECHNICIAN DRAWER AVATAR ICON
export function DrawerAvatar3DIcon({ size = 36, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      {/* Outer Circle Container */}
      <Circle cx="24" cy="24" r="23" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />

      {/* Technician Silhouette with Precision Collar */}
      <Circle cx="24" cy="17" r="7" fill="#0F172A" />
      <Path
        d="M12 37c0-5.5 5.4-9 12-9s12 3.5 12 9"
        fill="#0F172A"
      />

      {/* KYB Red Service Badge Overlap */}
      <Circle cx="34" cy="34" r="7" fill={COLORS.primary} stroke={COLORS.white} strokeWidth="2" />
      {/* Wrench Silhouette on Badge */}
      <Path
        d="M32 36l3.5-3.5a1.2 1.2 0 0 1 1.7 0l.3.3a1.2 1.2 0 0 1 0 1.7L34 38l-2-2z"
        fill={COLORS.white}
      />
    </Svg>
  );
}

// 4. SIGN OUT ICON
export function DrawerSignOut3DIcon({ size = 20, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Portal Doorway Frame */}
      <Path
        d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"
        stroke={COLORS.primary}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Egress Direction Arrow */}
      <Path
        d="M14 8l5 4-5 4"
        stroke={COLORS.primary}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="7"
        y1="12"
        x2="19"
        y2="12"
        stroke={COLORS.primary}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// 5. FIND PARTS ICON - Precision Search Lens with Suspension Strut Cross-Section
export function FindParts3DIcon({ size = 32, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      {/* Precision Lens Handle */}
      <Path
        d="M29 29l12 12"
        stroke="#0F172A"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Collar Accent */}
      <Line
        x1="27"
        y1="27"
        x2="30"
        y2="30"
        stroke={COLORS.primary}
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Main Search Lens Outer Ring */}
      <Circle
        cx="20"
        cy="20"
        r="14"
        fill="#F8FAFC"
        stroke={COLORS.primary}
        strokeWidth="3.2"
      />

      {/* Internal Reticle Crosshairs */}
      <Line x1="12" y1="20" x2="16" y2="20" stroke={COLORS.slate400} strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="24" y1="20" x2="28" y2="20" stroke={COLORS.slate400} strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="20" y1="12" x2="20" y2="16" stroke={COLORS.slate400} strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="20" y1="24" x2="20" y2="28" stroke={COLORS.slate400} strokeWidth="1.2" strokeLinecap="round" />

      {/* Strut Damper Target Center */}
      <Rect x="18.5" y="16" width="3" height="6" rx="0.5" fill="#0F172A" />
      <Line x1="20" y1="22" x2="20" y2="25" stroke={COLORS.primary} strokeWidth="1.6" strokeLinecap="round" />
      <Circle cx="20" cy="20" r="1" fill={COLORS.white} />
    </Svg>
  );
}

// 6. MY GARAGE ICON - Modern Aerodynamic Coupe on Workshop Lift Platform
export function MyGarage3DIcon({ size = 32, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      {/* Lift Platform Base */}
      <Line x1="6" y1="39" x2="42" y2="39" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
      <Rect x="10" y="38" width="4" height="4" fill="#64748B" />
      <Rect x="34" y="38" width="4" height="4" fill="#64748B" />

      {/* Modern Aerodynamic Coupe Body */}
      <Path
        d="M8 29c0-1.8 1.4-3.2 3.2-3.2h2.8l4-7c1-1.8 2.8-2.8 4.8-2.8h11.4c2 0 3.8 1 4.8 2.8l4 7h2.8c1.8 0 3.2 1.4 3.2 3.2v4c0 1.2-.8 2-2 2H10c-1.2 0-2-.8-2-2v-4z"
        fill="#0F172A"
        stroke="#0F172A"
        strokeWidth="1"
      />

      {/* Glass Cabin */}
      <Path
        d="M17 25l3.5-5.5h14l3.5 5.5H17z"
        fill="#38BDF8"
        opacity="0.85"
      />
      {/* B-Pillar */}
      <Line x1="26" y1="19.5" x2="26" y2="25" stroke="#0F172A" strokeWidth="1.5" />

      {/* Headlight & Tail Light */}
      <Path d="M40 28l2 .5v1.5l-2 .5v-2.5z" fill="#FEF08A" />
      <Path d="M8 28l-1 .5v1.5l1 .5v-2.5z" fill="#EF4444" />

      {/* Wheels - Front & Rear Alloy */}
      <Circle cx="15" cy="34" r="5" fill="#1E293B" stroke="#E2E8F0" strokeWidth="1.5" />
      <Circle cx="15" cy="34" r="2" fill={COLORS.primary} />
      <Circle cx="33" cy="34" r="5" fill="#1E293B" stroke="#E2E8F0" strokeWidth="1.5" />
      <Circle cx="33" cy="34" r="2" fill={COLORS.primary} />
    </Svg>
  );
}

// 7. TECH ENQUIRY ICON - Diagnostic Oscilloscope Telemetry Bubble
export function TechEnquiry3DIcon({ size = 32, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      {/* Dialogue Speech Bubble */}
      <Path
        d="M7 11a5 5 0 0 1 5-5h24a5 5 0 0 1 5 5v17a5 5 0 0 1-5 5H18l-8 7v-7a5 5 0 0 1-3-4.5V11z"
        fill="#0F172A"
        stroke="#0F172A"
        strokeWidth="1.5"
      />

      {/* Oscilloscope Screen Bezel */}
      <Rect x="12" y="11" width="24" height="15" rx="3" fill="#0B1329" stroke="#334155" strokeWidth="1" />

      {/* Sinusoidal Diagnostic Pulse Waveform */}
      <Path
        d="M14 18.5h3l2.5-4.5 3 8.5 3-5 2.5 3 2.5-2h3.5"
        stroke={COLORS.primary}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Online Telemetry Status Indicator */}
      <Circle cx="32" cy="14" r="1.5" fill={COLORS.primary} />
    </Svg>
  );
}

// 8. DEALER LOCATOR ICON - Storefront Pin
export function DealerLocator3DIcon({ size = 32, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      {/* Base Radius Waves */}
      <Circle cx="24" cy="42" r="8" stroke="#CBD5E1" strokeWidth="1.8" strokeDasharray="3 3" />
      <Circle cx="24" cy="42" r="3" fill={COLORS.primary} />

      {/* Precision Teardrop Pin */}
      <Path
        d="M24 5c-7.7 0-14 6.3-14 14 0 10.5 14 23 14 23s14-12.5 14-23c0-7.7-6.3-14-14-14z"
        fill={COLORS.primary}
        stroke="#B91C1C"
        strokeWidth="1.2"
      />

      {/* Storefront Silhouette inside Pin */}
      <Circle cx="24" cy="18" r="8.5" fill={COLORS.white} />

      {/* Dealership Awning Roof */}
      <Path
        d="M19 14h10l1 3H18l1-3z"
        fill="#0F172A"
      />
      {/* Store Pillars */}
      <Rect x="19.5" y="17" width="2" height="4.5" fill="#0F172A" />
      <Rect x="23" y="17" width="2" height="4.5" fill="#0F172A" />
      <Rect x="26.5" y="17" width="2" height="4.5" fill="#0F172A" />
      {/* Store Base */}
      <Rect x="18" y="21.5" width="12" height="1.5" rx="0.5" fill="#0F172A" />
    </Svg>
  );
}

// 9. GENUINE GUARANTEE BADGE ICON
export function GenuineGuarantee3DIcon({ size = 26, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      {/* Solid Outer Shield */}
      <Path
        d="M16 2.5l11 4.5v8.5c0 8-5 13-11 14.5C10 28.5 5 23.5 5 15.5V7l11-4.5z"
        fill={COLORS.primary}
        stroke="#991B1B"
        strokeWidth="1"
      />

      {/* Inner Precision Border */}
      <Path
        d="M16 5l8.5 3.5v7c0 6.5-4 10.5-8.5 11.8C11.5 26 7.5 22 7.5 15.5v-7L16 5z"
        fill={COLORS.white}
      />

      {/* Core Certified Seal */}
      <Path
        d="M16 7l6.5 2.8v5.2c0 5-3.2 8-6.5 9.2-3.3-1.2-6.5-4.2-6.5-9.2V9.8L16 7z"
        fill={COLORS.primary}
      />

      {/* Crisp White Checkmark */}
      <Path
        d="M12 15.5l3 3 6-6"
        stroke={COLORS.white}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// 10. TICKER MICRO GLYPHS
export function TickerLiveRadarIcon({ size = 18, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx="12" cy="12" r="9" stroke={COLORS.primary} strokeWidth="2" strokeDasharray="3 2" />
      <Circle cx="12" cy="12" r="5" fill="#FEE2E2" />
      <Circle cx="12" cy="12" r="2.5" fill={COLORS.primary} />
    </Svg>
  );
}

export function TickerCatalogIcon({ size = 18, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Rect x="4" y="4" width="16" height="16" rx="2.5" fill="#0F172A" />
      <Line x1="8" y1="8" x2="16" y2="8" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="8" y1="12" x2="16" y2="12" stroke={COLORS.white} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="8" y1="16" x2="13" y2="16" stroke={COLORS.slate400} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function Ticker360Icon({ size = 18, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx="12" cy="12" r="8.5" stroke="#7C3AED" strokeWidth="2" strokeDasharray="4 2" />
      <Path d="M18 12l-2-2m2 2l-2 2" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="12" r="3.5" fill="#7C3AED" />
    </Svg>
  );
}

export function TickerDealerIcon({ size = 18, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 3a5.5 5.5 0 0 0-5.5 5.5c0 4 5.5 11 5.5 11s5.5-7 5.5-11A5.5 5.5 0 0 0 12 3z"
        fill="#F59E0B"
      />
      <Circle cx="12" cy="8.5" r="2.2" fill={COLORS.white} />
    </Svg>
  );
}

export function TickerQuoteIcon({ size = 18, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M5 6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-4l-4 3v-3H7a2 2 0 0 1-2-2V6z"
        fill={COLORS.primary}
      />
      <Path d="M8 8.5h8M8 11.5h5" stroke={COLORS.white} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

// 11. B2B ROLE BADGE ICONS - Sharp & Executive OEM Design

// Vehicle Owner Persona: Aerodynamic Coupe with Driver Smart Key
export function OwnerRole3DIcon({ size = 36, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      {/* Base Shadow */}
      <Line x1="6" y1="39" x2="42" y2="39" stroke="#FECDD3" strokeWidth="2.5" strokeLinecap="round" />

      {/* Aerodynamic Vehicle Silhouette */}
      <Path
        d="M5 28c0-1.8 1.4-3 3-3h34c1.6 0 3 1.2 3 3v6c0 1.2-1 2-2 2H7c-1 0-2-.8-2-2v-6z"
        fill={COLORS.primary}
      />
      <Path
        d="M13 25l4-8c1-1.6 2.5-2.5 4.5-2.5h12c2 0 3.5.9 4.5 2.5l4 8H13z"
        fill="#991B1B"
      />
      <Path
        d="M15 24l3.5-6.5h18l3.5 6.5H15z"
        fill="#38BDF8"
        opacity="0.85"
      />

      {/* Wheels */}
      <Circle cx="13" cy="35" r="5" fill="#0F172A" stroke={COLORS.white} strokeWidth="1.5" />
      <Circle cx="13" cy="35" r="2" fill={COLORS.primary} />
      <Circle cx="35" cy="35" r="5" fill="#0F172A" stroke={COLORS.white} strokeWidth="1.5" />
      <Circle cx="35" cy="35" r="2" fill={COLORS.primary} />

      {/* Smart Key Glyph Overlap */}
      <G transform="translate(28, 8)">
        <Circle cx="8" cy="8" r="7" fill="#0F172A" stroke={COLORS.white} strokeWidth="1.8" />
        <Circle cx="8" cy="7" r="2.5" fill="#FEF08A" />
        <Line x1="8" y1="9.5" x2="8" y2="13" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="10" y1="11" x2="8" y2="11" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" />
      </G>
    </Svg>
  );
}

// Professional Reseller Persona: Workshop Storefront & Torque Wrench
export function ResellerRole3DIcon({ size = 36, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      {/* Base Platform */}
      <Line x1="6" y1="41" x2="42" y2="41" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

      {/* Workshop Wall Base */}
      <Rect x="8" y="19" width="32" height="21" rx="2" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2" />

      {/* Workshop Shutter / Door */}
      <Rect x="17" y="27" width="14" height="13" fill="#E2E8F0" />
      <Line x1="17" y1="31" x2="31" y2="31" stroke={COLORS.slate400} strokeWidth="1.2" />
      <Line x1="17" y1="35" x2="31" y2="35" stroke={COLORS.slate400} strokeWidth="1.2" />

      {/* Commercial Store Canopy */}
      <Path
        d="M6 12l2.5-4h31L42 12l-2 7H8l-2-7z"
        fill="#D97706"
      />
      <Path d="M14 12v7M24 12v7M34 12v7" stroke="#FEF3C7" strokeWidth="1.5" />

      {/* Certified Torque Wrench Crest */}
      <G transform="translate(26, 12)">
        <Circle cx="8" cy="8" r="8" fill="#0F172A" stroke={COLORS.white} strokeWidth="1.8" />
        {/* Crossed Wrench & Strut Tool */}
        <Path
          d="M5 11l6-6M11 5l1.5 1.5M6.5 9.5L5 11"
          stroke="#F59E0B"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}

// Authorized Distributor Persona: Logistics Fleet Freight & High-Cube Container
export function DistributorRole3DIcon({ size = 36, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      {/* Highway Ground Line */}
      <Line x1="4" y1="40" x2="44" y2="40" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

      {/* Heavy Logistics Container Box */}
      <Rect
        x="6"
        y="13"
        width="22"
        height="21"
        rx="2"
        fill="#0F172A"
        stroke="#0F172A"
        strokeWidth="1"
      />
      {/* Container Ribs */}
      <Line x1="11" y1="15" x2="11" y2="32" stroke="#334155" strokeWidth="1.2" />
      <Line x1="16" y1="15" x2="16" y2="32" stroke="#334155" strokeWidth="1.2" />
      <Line x1="21" y1="15" x2="21" y2="32" stroke="#334155" strokeWidth="1.2" />

      {/* Tractor Truck Cab */}
      <Path
        d="M28 20h7l5 7.5v6.5h-12V20z"
        fill={COLORS.primary}
        stroke="#B91C1C"
        strokeWidth="1"
      />

      {/* Driver Window */}
      <Path d="M30 22h4.5l3 5H30V22z" fill="#38BDF8" opacity="0.85" />

      {/* Wheels */}
      <Circle cx="11" cy="37" r="4" fill="#1E293B" stroke={COLORS.white} strokeWidth="1.2" />
      <Circle cx="19" cy="37" r="4" fill="#1E293B" stroke={COLORS.white} strokeWidth="1.2" />
      <Circle cx="35" cy="37" r="4.5" fill="#1E293B" stroke={COLORS.white} strokeWidth="1.2" />
      <Circle cx="35" cy="37" r="1.8" fill={COLORS.primary} />
    </Svg>
  );
}
