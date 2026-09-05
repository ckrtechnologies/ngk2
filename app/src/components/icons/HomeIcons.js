import React from 'react';
import Svg, {
  Path,
  Circle,
  Rect,
  Defs,
  LinearGradient,
  Stop,
  G,
  Line,
} from 'react-native-svg';

// 0. HOME DASHBOARD 3D ICON - Automotive HQ & Digital Tachometer Gateway
export function HomeDashboard3DIcon({ size = 32, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      <Defs>
        <LinearGradient id="homeRoofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F87171" />
          <Stop offset="50%" stopColor="#DC2626" />
          <Stop offset="100%" stopColor="#991B1B" />
        </LinearGradient>
        <LinearGradient id="homeBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#F1F5F9" />
        </LinearGradient>
        <LinearGradient id="speedDialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#38BDF8" />
          <Stop offset="100%" stopColor="#0284C7" />
        </LinearGradient>
      </Defs>

      {/* Ground Foundation Shadow */}
      <Path
        d="M8 42h32"
        stroke="#E2E8F0"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Main 3D Beveled House / Automotive HQ Body */}
      <Path
        d="M10 21v18a3 3 0 0 0 3 3h22a3 3 0 0 0 3-3V21l-14-11-14 11z"
        fill="url(#homeBodyGrad)"
        stroke="#CBD5E1"
        strokeWidth="1.5"
      />

      {/* 3D Aerodynamic Crimson Roof Crest */}
      <Path
        d="M24 6l18 14.5a1.5 1.5 0 0 1-.9 2.5H38v-2L24 9.5 10 21v2H6.9a1.5 1.5 0 0 1-.9-2.5L24 6z"
        fill="url(#homeRoofGrad)"
      />
      {/* Roof Specular Glare */}
      <Path
        d="M24 8l13 10.5"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />

      {/* Central Tachometer / Gateway Core Arch */}
      <Path
        d="M17 42V28a7 7 0 0 1 14 0v14"
        fill="#0F172A"
      />

      {/* Tachometer Glow Gauge Dial */}
      <Path
        d="M20 28a4 4 0 0 1 8 0"
        stroke="url(#speedDialGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* High-Performance Redline Indicator */}
      <Path
        d="M27 26a4 4 0 0 1 1 2"
        stroke="#EF4444"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Speedometer Needle pointing to peak power */}
      <Line
        x1="24"
        y1="28"
        x2="26.5"
        y2="25"
        stroke="#F59E0B"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Circle cx="24" cy="28" r="1.8" fill="#FFFFFF" />

      {/* NGK Spark Core / Ignition LED */}
      <Circle cx="24" cy="15" r="2.5" fill="#EF4444" />
      <Circle cx="24" cy="15" r="1" fill="#FFFFFF" />
    </Svg>
  );
}

// 0.1 PROFILE CREDENTIALS 3D ICON - Digital Smart ID & Security Chip
export function Profile3DIcon({ size = 32, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      <Defs>
        <LinearGradient id="idCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#6366F1" />
          <Stop offset="50%" stopColor="#4F46E5" />
          <Stop offset="100%" stopColor="#3730A3" />
        </LinearGradient>
        <LinearGradient id="chipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FDE68A" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
      </Defs>

      {/* Card Drop Shadow Base */}
      <Rect x="7" y="10" width="34" height="28" rx="6" fill="#1E1B4B" opacity="0.3" />

      {/* Main 3D ID Card Body */}
      <Rect
        x="6"
        y="8"
        width="36"
        height="30"
        rx="5"
        fill="url(#idCardGrad)"
        stroke="#818CF8"
        strokeWidth="1.2"
      />

      {/* Top Lanyard Slot */}
      <Rect x="18" y="10" width="12" height="2" rx="1" fill="#312E81" />

      {/* Metallic Gold Smart Security Chip */}
      <Rect x="10" y="15" width="8" height="7" rx="1.5" fill="url(#chipGrad)" />
      <Line x1="14" y1="15" x2="14" y2="22" stroke="#B45309" strokeWidth="0.8" />
      <Line x1="10" y1="18.5" x2="18" y2="18.5" stroke="#B45309" strokeWidth="0.8" />

      {/* Verified User Silhouette */}
      <Circle cx="30" cy="18" r="4.5" fill="#FFFFFF" />
      <Path
        d="M23 31c0-3.5 3-5.5 7-5.5s7 2 7 5.5"
        fill="#FFFFFF"
      />

      {/* Hologram / Biometric Waves */}
      <Line x1="10" y1="26" x2="19" y2="26" stroke="#C7D2FE" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
      <Line x1="10" y1="30" x2="16" y2="30" stroke="#C7D2FE" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />

      {/* Verified Green Shield Dot */}
      <Circle cx="38" cy="12" r="3" fill="#10B981" />
      <Circle cx="38" cy="12" r="1.2" fill="#FFFFFF" />
    </Svg>
  );
}

// 0.15 LEGACY TECHNICIAN HELMET ICON
export function DrawerAvatar3DIcon({ size = 36, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      <Defs>
        <LinearGradient id="helmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EF4444" />
          <Stop offset="60%" stopColor="#D0142C" />
          <Stop offset="100%" stopColor="#880B1F" />
        </LinearGradient>
        <LinearGradient id="visorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1E293B" />
          <Stop offset="100%" stopColor="#0F172A" />
        </LinearGradient>
        <LinearGradient id="visorGlint" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#0284C7" stopOpacity="0.1" />
        </LinearGradient>
      </Defs>

      {/* Outer Glow Disc */}
      <Circle cx="24" cy="24" r="23" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1" />

      {/* Technician / Racing Driver Helmet Silhouette */}
      <Path
        d="M24 7c-9 0-15 6.5-15 15.5 0 5 2.5 9.5 6 12v3.5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3.5c3.5-2.5 6-7 6-12C39 13.5 33 7 24 7z"
        fill="url(#helmGrad)"
      />

      {/* Visor Area */}
      <Path
        d="M13 20h22c1 0 1.8.8 1.5 1.8l-1.5 5c-.4 1.2-1.5 2.2-2.8 2.2H15.8c-1.3 0-2.4-1-2.8-2.2l-1.5-5c-.3-1 .5-1.8 1.5-1.8z"
        fill="url(#visorGrad)"
      />
      {/* Visor Aerodynamic Reflection Glint */}
      <Path
        d="M15 22h14l-2 4h-14l2-4z"
        fill="url(#visorGlint)"
      />

      {/* Chrome Chin Intake Vent */}
      <Rect x="20" y="32" width="8" height="2" rx="1" fill="#FFFFFF" opacity="0.9" />
      <Line x1="22" y1="36" x2="26" y2="36" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />

      {/* Top Specular Glint */}
      <Path
        d="M19 10c2-1 4-1.5 6-1.5"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
    </Svg>
  );
}

// 0.2 SIGN OUT 3D ICON
export function DrawerSignOut3DIcon({ size = 20, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Defs>
        <LinearGradient id="exitArrowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EF4444" />
          <Stop offset="100%" stopColor="#B91C1C" />
        </LinearGradient>
      </Defs>
      {/* Door Frame */}
      <Path
        d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"
        stroke="#DC2626"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Dynamic Directional Arrow with Gradient */}
      <Path
        d="M14 8l5 4-5 4"
        stroke="url(#exitArrowGrad)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 12h12"
        stroke="url(#exitArrowGrad)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// 1. FIND PARTS 3D ICON - Precision Search Lens (Clean, Non-Overlapping)
export function FindParts3DIcon({ size = 32, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      <Defs>
        <LinearGradient id="partsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EF4444" />
          <Stop offset="100%" stopColor="#B91C1C" />
        </LinearGradient>
        <LinearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#FEE2E2" stopOpacity="0.3" />
        </LinearGradient>
        <LinearGradient id="metalCollar" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F8FAFC" />
          <Stop offset="100%" stopColor="#94A3B8" />
        </LinearGradient>
      </Defs>

      {/* Ground Foundation Shadow */}
      <Circle cx="21" cy="41" r="11" fill="#E2E8F0" opacity="0.4" />

      {/* Ergonomic Crimson Search Lens Handle */}
      <Path
        d="M30 30l11 11"
        stroke="url(#partsGrad)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Chrome Handle Neck Collar */}
      <Line
        x1="28.5"
        y1="28.5"
        x2="32"
        y2="32"
        stroke="url(#metalCollar)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* End Grip Cap */}
      <Circle cx="41" cy="41" r="2.5" fill="#7F1D1D" />

      {/* Main 3D Beveled Lens Rim */}
      <Circle
        cx="21"
        cy="21"
        r="13.5"
        fill="url(#glassGrad)"
        stroke="url(#partsGrad)"
        strokeWidth="3.6"
      />

      {/* Inner Metallic Bezel Ring */}
      <Circle
        cx="21"
        cy="21"
        r="10.5"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeOpacity="0.7"
      />

      {/* Specular Glare Arc */}
      <Path
        d="M14 16a8 8 0 0 1 11-4"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Secondary Soft Specular Glint */}
      <Circle cx="15.5" cy="15.5" r="1.5" fill="#FFFFFF" opacity="0.9" />
    </Svg>
  );
}

// 2. MY GARAGE 3D ICON - Aerodynamic Sports Coupe / GT Vehicle
export function MyGarage3DIcon({ size = 32, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      <Defs>
        <LinearGradient id="carGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#1D4ED8" />
        </LinearGradient>
        <LinearGradient id="glassCarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#93C5FD" />
          <Stop offset="100%" stopColor="#1E3A8A" />
        </LinearGradient>
      </Defs>

      {/* Garage Platform Ground Shadow */}
      <Path
        d="M6 38h36"
        stroke="#93C5FD"
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />

      {/* Main Car Silhouette Body */}
      <Path
        d="M8 28l3-7c1-2.5 3-4 6-4.5l14-1c3 0 5 1.5 6.5 4l4.5 8.5c2 1 3 2.5 3 5 0 2-1 3-3 3H7c-2 0-3-1-3-3 0-2.5 1.5-4 4-5z"
        fill="url(#carGrad)"
      />

      {/* Windshield & Cabin Glass */}
      <Path
        d="M17 19l-2 5h14l-2-5H17z"
        fill="url(#glassCarGrad)"
      />
      {/* Front Windshield Pillar */}
      <Path d="M26 19l3 5" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.4" />

      {/* Xenon LED Headlights */}
      <Path d="M39 28l3 1v2l-3-1v-2z" fill="#FEF08A" />
      <Path d="M6 28l-2 1v2l2-1v-2z" fill="#EF4444" />

      {/* Wheels - Front & Rear Alloy Wheels */}
      <Circle cx="14" cy="34" r="5" fill="#0F172A" />
      <Circle cx="14" cy="34" r="2.5" fill="#E2E8F0" />
      <Circle cx="34" cy="34" r="5" fill="#0F172A" />
      <Circle cx="34" cy="34" r="2.5" fill="#E2E8F0" />

      {/* Speed Line Glow / Wing Mirror */}
      <Rect x="18" y="24" width="4" height="2" rx="1" fill="#FFFFFF" opacity="0.8" />
    </Svg>
  );
}

// 3. TECH ENQUIRY 3D ICON - Diagnostic Telemetry Scanner & Chat Bubble
export function TechEnquiry3DIcon({ size = 32, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      <Defs>
        <LinearGradient id="enqGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#10B981" />
          <Stop offset="100%" stopColor="#047857" />
        </LinearGradient>
      </Defs>

      {/* Main Dialogue Speech Bubble */}
      <Path
        d="M8 12a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6H18l-8 6v-6a6 6 0 0 1-2-4.5V12z"
        fill="url(#enqGrad)"
      />

      {/* Diagnostic Waveform Telemetry Display Screen */}
      <Rect x="14" y="12" width="20" height="12" rx="3" fill="#064E3B" />

      {/* Real-time Oscilloscope Signal Wave */}
      <Path
        d="M16 18h2l2-3 2 6 2-4 2 2h4"
        stroke="#6EE7B7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Status LED Indicator */}
      <Circle cx="31" cy="15" r="1.5" fill="#34D399" />
    </Svg>
  );
}

// 4. DEALER LOCATOR 3D ICON - Geo Pin + Authorized Storefront Canopy
export function DealerLocator3DIcon({ size = 32, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      <Defs>
        <LinearGradient id="dealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#B45309" />
        </LinearGradient>
      </Defs>

      {/* Concentric Base Ground Radar Wave */}
      <Circle cx="24" cy="41" r="10" stroke="#FDE68A" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
      <Circle cx="24" cy="41" r="4" fill="#B45309" opacity="0.3" />

      {/* Main 3D Teardrop Pin */}
      <Path
        d="M24 5c-7.7 0-14 6.3-14 14 0 10.5 14 23 14 23s14-12.5 14-23c0-7.7-6.3-14-14-14z"
        fill="url(#dealGrad)"
      />

      {/* Inner White Target Stage */}
      <Circle cx="24" cy="18" r="8.5" fill="#FFFFFF" />

      {/* Authorized Dealership Storefront Façade */}
      <Path
        d="M19 14h10l1 3H18l1-3z"
        fill="#D97706"
      />
      {/* Store Columns */}
      <Rect x="19" y="17" width="2" height="4" fill="#78350F" />
      <Rect x="23" y="17" width="2" height="4" fill="#78350F" />
      <Rect x="27" y="17" width="2" height="4" fill="#78350F" />
      {/* Base Floor */}
      <Rect x="18" y="21" width="12" height="1.5" rx="0.5" fill="#D97706" />
    </Svg>
  );
}

// 5. GENUINE GUARANTEE 3D SEAL ICON
export function GenuineGuarantee3DIcon({ size = 26, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      <Defs>
        <LinearGradient id="guarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#D0142C" />
          <Stop offset="100%" stopColor="#880B1F" />
        </LinearGradient>
      </Defs>
      {/* Golden Outer Shield Rim */}
      <Path
        d="M16 2.5l11 4.5v8.5c0 8-5 13-11 14.5C10 28.5 5 23.5 5 15.5V7l11-4.5z"
        fill="#FBBF24"
      />
      {/* Inner Red Core Shield */}
      <Path
        d="M16 4.5l9 3.8v7.2c0 6.8-4.2 11-9 12.3-4.8-1.3-9-5.5-9-12.3V8.3l9-3.8z"
        fill="url(#guarGrad)"
      />
      {/* Crisp White Checkmark */}
      <Path
        d="M11 15.5l3.5 3.5 7-7"
        stroke="#FFFFFF"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// 6. TICKER USP ICONS

// Live Radar Beacon
export function TickerLiveRadarIcon({ size = 18, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx="12" cy="12" r="10" fill="#FEE2E2" />
      <Circle cx="12" cy="12" r="6.5" fill="#FECACA" />
      <Circle cx="12" cy="12" r="3.5" fill="#D0142C" />
    </Svg>
  );
}

// TecDoc Catalog Icon
export function TickerCatalogIcon({ size = 18, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Rect x="4" y="5" width="16" height="14" rx="2" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5" />
      <Line x1="7" y1="9" x2="17" y2="9" stroke="#1D4ED8" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="7" y1="13" x2="14" y2="13" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// 360° Showroom 3D Icon
export function Ticker360Icon({ size = 18, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx="12" cy="12" r="9" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="3 2" />
      <Circle cx="12" cy="12" r="4.5" fill="#EDE9FE" stroke="#6D28D9" strokeWidth="1.5" />
      <Path d="M19 12l-2-2m2 2l-2 2" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// Dealer Beacon Icon
export function TickerDealerIcon({ size = 18, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 3a6 6 0 0 0-6 6c0 4.5 6 11 6 11s6-6.5 6-11a6 6 0 0 0-6-6z"
        fill="#FEF3C7"
        stroke="#D97706"
        strokeWidth="1.5"
      />
      <Circle cx="12" cy="9" r="2" fill="#B45309" />
    </Svg>
  );
}

// Tech Quotes Icon
export function TickerQuoteIcon({ size = 18, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Rect x="4" y="4" width="16" height="13" rx="3" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" />
      <Path d="M8 17l-1 3 3-1" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8 9h8M8 12h5" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// 1. BESPOKE 3D VEHICLE OWNER ROLE ICON - Aerodynamic Sports Coupe & Personal Key
export function OwnerRole3DIcon({ size = 36, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      <Defs>
        <LinearGradient id="ownerCarBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F87171" />
          <Stop offset="45%" stopColor="#D0142C" />
          <Stop offset="100%" stopColor="#880819" />
        </LinearGradient>
        <LinearGradient id="ownerGlassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#BAE6FD" />
          <Stop offset="100%" stopColor="#0284C7" />
        </LinearGradient>
        <LinearGradient id="ownerWheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#334155" />
          <Stop offset="100%" stopColor="#0F172A" />
        </LinearGradient>
      </Defs>

      {/* Ground Shadow */}
      <Path d="M6 39h36" stroke="#FECDD3" strokeWidth="3" strokeLinecap="round" />

      {/* Car Chassis / Body Lower */}
      <Path
        d="M4 27c0-2 1.5-3.5 3.5-3.5h33c2 0 3.5 1.5 3.5 3.5v7c0 1.5-1 2.5-2.5 2.5h-35C4.5 36.5 4 35.5 4 34v-7z"
        fill="url(#ownerCarBodyGrad)"
        stroke="#991B1B"
        strokeWidth="1"
      />

      {/* Aerodynamic Cockpit / Roof */}
      <Path
        d="M12 23.5l4.5-8.5c1-1.8 2.8-2.8 4.8-2.8h13.4c2 0 3.8 1 4.8 2.8l4.5 8.5H12z"
        fill="url(#ownerCarBodyGrad)"
      />

      {/* Windshield & Cabin Glass */}
      <Path
        d="M14 22.5l3.8-6.8c.6-1.1 1.8-1.8 3-1.8h8.4c1.2 0 2.4.7 3 1.8l3.8 6.8H14z"
        fill="url(#ownerGlassGrad)"
      />

      {/* Specular Glare on Roof & Windshield */}
      <Path d="M21 15.5h6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
      <Path d="M16 22l3-5.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6" />

      {/* Xenon Headlight Beam */}
      <Path d="M41 28.5l3 .5v2.5l-3 .5v-3.5z" fill="#FEF08A" />

      {/* Front Wheel */}
      <Circle cx="13" cy="35" r="5" fill="url(#ownerWheelGrad)" stroke="#E2E8F0" strokeWidth="1.5" />
      <Circle cx="13" cy="35" r="2" fill="#94A3B8" />

      {/* Rear Wheel */}
      <Circle cx="35" cy="35" r="5" fill="url(#ownerWheelGrad)" stroke="#E2E8F0" strokeWidth="1.5" />
      <Circle cx="35" cy="35" r="2" fill="#94A3B8" />
    </Svg>
  );
}

// 2. BESPOKE 3D PROFESSIONAL RESELLER ROLE ICON - Workshop Storefront & Spark Plug Torque Wrench
export function ResellerRole3DIcon({ size = 36, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      <Defs>
        <LinearGradient id="resellerStoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FDE68A" />
          <Stop offset="50%" stopColor="#D97706" />
          <Stop offset="100%" stopColor="#78350F" />
        </LinearGradient>
        <LinearGradient id="resellerCanopyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#B45309" />
        </LinearGradient>
        <LinearGradient id="wrenchMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F1F5F9" />
          <Stop offset="50%" stopColor="#94A3B8" />
          <Stop offset="100%" stopColor="#475569" />
        </LinearGradient>
      </Defs>

      {/* Foundation Platform */}
      <Path d="M8 40h32" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />

      {/* Workshop Wall Base */}
      <Path
        d="M10 21v17a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V21H10z"
        fill="#FFFFFF"
        stroke="#E2E8F0"
        strokeWidth="1.5"
      />

      {/* Commercial 3D Store Canopy */}
      <Path
        d="M8 12l2.5-3.5h27L40 12l-2 9H10l-2-9z"
        fill="url(#resellerCanopyGrad)"
      />
      {/* Canopy Stripes */}
      <Path d="M15 12v9M24 12v9M33 12v9" stroke="#FEF3C7" strokeWidth="1.8" strokeLinecap="round" />

      {/* Store Entrance Door Glass */}
      <Rect x="18" y="25" width="12" height="15" rx="1.5" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />

      {/* Certified Gold Precision Torque Wrench Emblem */}
      <G transform="translate(18, 14)">
        <Circle cx="6" cy="6" r="10" fill="url(#resellerStoreGrad)" stroke="#FFFFFF" strokeWidth="1.5" />
        <Path
          d="M3 9l6-6M9 3l1.5 1.5M4.5 7.5L3 9"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx="6" cy="6" r="2" fill="#FFFFFF" />
      </G>
    </Svg>
  );
}

// 3. BESPOKE 3D AUTHORIZED DISTRIBUTOR ROLE ICON - Heavy Freight Tractor & Container Logistics
export function DistributorRole3DIcon({ size = 36, ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...props}>
      <Defs>
        <LinearGradient id="truckCabGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#475569" />
          <Stop offset="50%" stopColor="#1E293B" />
          <Stop offset="100%" stopColor="#0F172A" />
        </LinearGradient>
        <LinearGradient id="cargoBoxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F8FAFC" />
          <Stop offset="50%" stopColor="#E2E8F0" />
          <Stop offset="100%" stopColor="#CBD5E1" />
        </LinearGradient>
        <LinearGradient id="distBlueAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#38BDF8" />
          <Stop offset="100%" stopColor="#0284C7" />
        </LinearGradient>
      </Defs>

      {/* Highway Foundation */}
      <Path d="M4 40h40" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />

      {/* High-Cube Logistics Shipping Container */}
      <Rect
        x="6"
        y="12"
        width="22"
        height="22"
        rx="2"
        fill="url(#cargoBoxGrad)"
        stroke="#94A3B8"
        strokeWidth="1.5"
      />
      {/* Container Corrugated Ribs */}
      <Line x1="11" y1="14" x2="11" y2="32" stroke="#94A3B8" strokeWidth="1.2" />
      <Line x1="16" y1="14" x2="16" y2="32" stroke="#94A3B8" strokeWidth="1.2" />
      <Line x1="21" y1="14" x2="21" y2="32" stroke="#94A3B8" strokeWidth="1.2" />

      {/* Distributor Enterprise Network Crest on Container */}
      <Circle cx="17" cy="23" r="4" fill="url(#distBlueAccent)" />
      <Circle cx="17" cy="23" r="1.5" fill="#FFFFFF" />

      {/* Heavy Tractor Cab */}
      <Path
        d="M28 20h7l5 7.5v6.5h-12V20z"
        fill="url(#truckCabGrad)"
        stroke="#0F172A"
        strokeWidth="1"
      />

      {/* Truck Windshield & Driver Cab Window */}
      <Path d="M30 22h4.5l3.5 5.5H30V22z" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.8" />
      <Path d="M31 23.5h2" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />

      {/* Chrome Front Grille */}
      <Rect x="38" y="29.5" width="2" height="4" rx="0.5" fill="#FEF08A" />

      {/* Rear Container Wheels */}
      <Circle cx="11" cy="37" r="4" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1.2" />
      <Circle cx="19" cy="37" r="4" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1.2" />

      {/* Tractor Drive Wheels */}
      <Circle cx="35" cy="37" r="4.5" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1.2" />
      <Circle cx="35" cy="37" r="1.8" fill="#94A3B8" />
    </Svg>
  );
}

