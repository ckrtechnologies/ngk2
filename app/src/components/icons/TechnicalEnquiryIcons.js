import React from 'react';
import Svg, {
  Path,
  Circle,
  Rect,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';

/**
 * Solid, premium automotive icons designed specifically for NGK Technical Enquiry.
 * These replace generic hollow outline icons with brand-aligned solid glyphs.
 */

// 1. SOLID STORE / DEALERSHIP ICON
export function SolidStoreIcon({ size = 22, color = '#D0142C', ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Defs>
        <LinearGradient id="dealerRoofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EF4444" />
          <Stop offset="100%" stopColor="#B91C1C" />
        </LinearGradient>
      </Defs>
      {/* Store Roof Awning */}
      <Path
        d="M2.5 9L4.2 3.8A1.5 1.5 0 0 1 5.6 2.8h12.8a1.5 1.5 0 0 1 1.4 1l1.7 5.2a1 1 0 0 1-.3 1 2.2 2.2 0 0 1-3.2 0 2.2 2.2 0 0 1-3.2 0 2.2 2.2 0 0 1-3.2 0 2.2 2.2 0 0 1-3.2 0 2.2 2.2 0 0 1-3.2 0 1 1 0 0 1-.3-1z"
        fill={color === '#D0142C' ? 'url(#dealerRoofGrad)' : color}
      />
      {/* Building Body */}
      <Path
        d="M4 11.5v8a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5v-8c-.3.2-.7.3-1.1.3a2.7 2.7 0 0 1-2.1-.9 2.7 2.7 0 0 1-2.1.9 2.7 2.7 0 0 1-2.1-.9 2.7 2.7 0 0 1-2.1.9 2.7 2.7 0 0 1-2.1-.9 2.7 2.7 0 0 1-2.1.9c-.4 0-.6-.1-.9-.3z"
        fill={color}
        opacity={0.88}
      />
      {/* Entrance Doorway & Showcase Window */}
      <Rect x="10" y="14" width="4" height="7" rx="0.8" fill="#FFFFFF" />
      <Rect x="6" y="14" width="2.5" height="3.5" rx="0.5" fill="#FFFFFF" opacity={0.7} />
      <Rect x="15.5" y="14" width="2.5" height="3.5" rx="0.5" fill="#FFFFFF" opacity={0.7} />
    </Svg>
  );
}

// 2. SOLID PART / SPARK PLUG COMPONENT ICON
export function SolidPartTagIcon({ size = 18, color = '#D0142C', ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Defs>
        <LinearGradient id="tagSolidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F87171" />
          <Stop offset="50%" stopColor="#DC2626" />
          <Stop offset="100%" stopColor="#991B1B" />
        </LinearGradient>
      </Defs>
      {/* Solid Tag Body with Beveled Notch */}
      <Path
        d="M2.5 3.5A1.5 1.5 0 0 1 4 2h7.2a2 2 0 0 1 1.4.6l9.8 9.8a2 2 0 0 1 0 2.8l-7.2 7.2a2 2 0 0 1-2.8 0L2.6 12.6A2 2 0 0 1 2 11.2V3.5h.5z"
        fill={color === '#D0142C' ? 'url(#tagSolidGrad)' : color}
      />
      {/* Precision Aperture Center */}
      <Circle cx="7.5" cy="7.5" r="2.2" fill="#FFFFFF" />
      <Circle cx="7.5" cy="7.5" r="1.1" fill={color === '#D0142C' ? '#B91C1C' : '#FFFFFF'} />
      {/* Spark Plug Electrode Accents */}
      <Rect x="13.5" y="12.5" width="4" height="1.5" rx="0.5" transform="rotate(45 13.5 12.5)" fill="#FFFFFF" opacity={0.8} />
      <Rect x="15.5" y="14.5" width="3" height="1.5" rx="0.5" transform="rotate(45 15.5 14.5)" fill="#FFFFFF" opacity={0.6} />
    </Svg>
  );
}

// 3. SOLID CAR SILHOUETTE ICON
export function SolidCarSilhouetteIcon({ size = 18, color = '#2563EB', ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Defs>
        <LinearGradient id="carBodyBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#1D4ED8" />
        </LinearGradient>
      </Defs>
      {/* Aerodynamic Body Contour */}
      <Path
        d="M3 14.5l1.2-4.2a2.5 2.5 0 0 1 2.4-1.8h9.8a2.5 2.5 0 0 1 2.4 1.8l1.2 4.2h1a1.5 1.5 0 0 1 1.5 1.5v2a1 1 0 0 1-1 1h-1.6a2.8 2.8 0 0 1-5.4 0H9.5a2.8 2.8 0 0 1-5.4 0H2.5a1 1 0 0 1-1-1v-2a1.5 1.5 0 0 1 1.5-1.5H3z"
        fill={color === '#2563EB' ? 'url(#carBodyBlue)' : color}
      />
      {/* Front & Rear Windows */}
      <Path
        d="M6.6 10l.9-1.8a1 1 0 0 1 .9-.6h3.6V10H6.6zM13 10V7.6h2.6a1 1 0 0 1 .9.6l.9 1.8H13z"
        fill="#FFFFFF"
        opacity={0.9}
      />
      {/* Front Wheel */}
      <Circle cx="6.8" cy="18.5" r="2.2" fill="#0F172A" />
      <Circle cx="6.8" cy="18.5" r="0.9" fill="#E2E8F0" />
      {/* Rear Wheel */}
      <Circle cx="17.2" cy="18.5" r="2.2" fill="#0F172A" />
      <Circle cx="17.2" cy="18.5" r="0.9" fill="#E2E8F0" />
      {/* Headlight Specular Beam */}
      <Circle cx="21" cy="15.2" r="0.8" fill="#FEF08A" />
    </Svg>
  );
}

// 4. SOLID GARAGE WORKSHOP BAY ICON
export function SolidGarageBayIcon({ size = 16, color = '#4B5563', ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Garage Gable Roof & Walls */}
      <Path
        d="M12 2L2 7v13a1.5 1.5 0 0 0 1.5 1.5h17a1.5 1.5 0 0 0 1.5-1.5V7L12 2z"
        fill={color}
      />
      {/* Workshop Shutter / Vehicle Bay Open Entrance */}
      <Rect x="6" y="9.5" width="12" height="12" rx="1" fill="#FFFFFF" />
      {/* Shutter Slats */}
      <Rect x="7" y="11" width="10" height="1.6" rx="0.5" fill={color} opacity={0.4} />
      <Rect x="7" y="13.5" width="10" height="1.6" rx="0.5" fill={color} opacity={0.4} />
      <Rect x="7" y="16" width="10" height="1.6" rx="0.5" fill={color} opacity={0.4} />
      {/* Vehicle Silhouette emerging from Bay */}
      <Path
        d="M9 19.5v-1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h-6z"
        fill={color}
      />
    </Svg>
  );
}

// 5. SOLID VERIFIED SHIELD BADGE
export function SolidShieldVerifiedIcon({ size = 14, color = '#059669', ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Solid Shield Body */}
      <Path
        d="M12 2L4 5.5v6.2c0 5.4 3.4 10.4 8 11.8 4.6-1.4 8-6.4 8-11.8V5.5L12 2z"
        fill={color}
      />
      {/* Solid White Checkmark */}
      <Path
        d="M9.5 12l2 2 4.5-4.5"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// 6. SOLID LOCATION PIN ICON
export function SolidLocationPinIcon({ size = 14, color = '#059669', ...props }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Solid Teardrop Pin */}
      <Path
        d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7z"
        fill={color}
      />
      {/* Focal Aperture Circle */}
      <Circle cx="12" cy="9" r="2.8" fill="#FFFFFF" />
    </Svg>
  );
}

// 7. SOLID STEPPER MINUS ICON
export function SolidStepperMinusIcon({ size = 14, color = '#111827' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="10" width="16" height="4" rx="2" fill={color} />
    </Svg>
  );
}

// 8. SOLID STEPPER PLUS ICON
export function SolidStepperPlusIcon({ size = 14, color = '#111827' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="10" width="16" height="4" rx="2" fill={color} />
      <Rect x="10" y="4" width="4" height="16" rx="2" fill={color} />
    </Svg>
  );
}
