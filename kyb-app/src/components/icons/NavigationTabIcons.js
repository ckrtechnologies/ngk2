import React from 'react';
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
} from 'react-native-svg';

/**
 * NGK App Bottom Navigation Tab Icons
 * Solid-fill ACTIVE state, translucent-stroke INACTIVE state.
 * Zero gradients. Crisp automotive-grade geometry.
 */

// 1. PORTAL / HOME TAB - Architectural Portal + Tachometer Arch
export function PortalTabIcon({ focused = false, size = 24 }) {
  if (focused) {
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* Solid House Structure */}
        <Path
          d="M16 2.5l12 9.6V26a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V12.1L16 2.5z"
          fill="#FFFFFF"
        />
        {/* Crimson Gable Crest */}
        <Path
          d="M16 3.5l10 8H22.5L16 6.5 9.5 11.5H6l10-8z"
          fill="#E31837"
        />
        {/* Central Tachometer Bay */}
        <Path
          d="M12.5 28v-9a3.5 3.5 0 0 1 7 0v9"
          fill="#E31837"
        />
        {/* Speedometer Arc */}
        <Path
          d="M14 19.5a2 2 0 0 1 4 0"
          stroke="#E31837"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {/* Needle */}
        <Line x1="16" y1="19.5" x2="17.5" y2="17" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" />
        <Circle cx="16" cy="19.5" r="1.2" fill="#0F172A" />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path
        d="M16 3.5l11.5 9.2V26a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 26V12.7L16 3.5z"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.6}
      />
      <Path
        d="M12.5 27.5v-8a3.5 3.5 0 0 1 7 0v8"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.6}
      />
    </Svg>
  );
}

// 2. SEARCH / CATALOG TAB - Precision Lens with Part Target
export function SearchTabIcon({ focused = false, size = 24 }) {
  if (focused) {
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* Outer Lens Ring */}
        <Circle cx="13" cy="13" r="9.5" fill="#FFFFFF" />
        {/* Inner NGK Crimson Core */}
        <Circle cx="13" cy="13" r="6" fill="#E31837" />
        {/* Reticle Crosshairs */}
        <Line x1="13" y1="8.5" x2="13" y2="10.5" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
        <Line x1="13" y1="15.5" x2="13" y2="17.5" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
        <Line x1="8.5" y1="13" x2="10.5" y2="13" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
        <Line x1="15.5" y1="13" x2="17.5" y2="13" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
        {/* Search Handle */}
        <Line x1="20" y1="20" x2="28" y2="28" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        {/* Handle Collar */}
        <Line x1="18.5" y1="18.5" x2="20.5" y2="20.5" stroke="#E31837" strokeWidth="3.5" strokeLinecap="round" />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle
        cx="13"
        cy="13"
        r="9"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        opacity={0.6}
      />
      <Path
        d="M19.8 19.8l7.2 7.2"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity={0.6}
      />
    </Svg>
  );
}

// 3. ENQUIRIES TAB - OBD-II Telemetry Bubble
export function EnquiriesTabIcon({ focused = false, size = 24 }) {
  if (focused) {
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* Solid Speech Bubble Body */}
        <Path
          d="M5 6a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H12l-6 5v-5a4 4 0 0 1-1-2.5V6z"
          fill="#FFFFFF"
        />
        {/* Oscilloscope Waveform */}
        <Path
          d="M9 12h2.5l2-3 3 6 2-3h3.5"
          stroke="#E31837"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Status LED */}
        <Circle cx="25" cy="7" r="2" fill="#10B981" />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path
        d="M5.5 6.5A3 3 0 0 1 8.5 3.5h15a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H12l-5.5 4.5v-4.5a3 3 0 0 1-1-2V6.5z"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.6}
      />
      <Path
        d="M10 11.5h12M10 15.5h7"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity={0.6}
      />
    </Svg>
  );
}

// 4. DEALERS TAB - Teardrop Authorized Dealership Pin
export function DealersTabIcon({ focused = false, size = 24 }) {
  if (focused) {
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* Solid White Pin Body */}
        <Path
          d="M16 2C10.5 2 6 6.5 6 12c0 7.5 10 17 10 17s10-9.5 10-17c0-5.5-4.5-10-10-10z"
          fill="#FFFFFF"
        />
        {/* Inner Circle Stage */}
        <Circle cx="16" cy="11.5" r="5.5" fill="#E31837" />
        {/* Dealership Awning */}
        <Path
          d="M13 10h6l.5 2H12.5L13 10z"
          fill="#FFFFFF"
        />
        {/* Store Pillars */}
        <Rect x="13.5" y="12" width="1" height="2.5" fill="#FFFFFF" />
        <Rect x="15.5" y="12" width="1" height="2.5" fill="#FFFFFF" />
        <Rect x="17.5" y="12" width="1" height="2.5" fill="#FFFFFF" />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path
        d="M16 3c-5 0-9 4-9 9 0 7 9 16 9 16s9-9 9-16c0-5-4-9-9-9z"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.6}
      />
      <Circle
        cx="16"
        cy="12"
        r="3"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        opacity={0.6}
      />
    </Svg>
  );
}
