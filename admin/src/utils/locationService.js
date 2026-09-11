import { BASE_URL } from '../config/api';

export const SOUTH_AFRICA_CITY_PRESETS = [
  { name: 'Sandton (Johannesburg)', city: 'Sandton', lat: -26.1076, lon: 28.0567, address: 'Sandton, Johannesburg, 2196' },
  { name: 'Johannesburg Central', city: 'Johannesburg', lat: -26.2041, lon: 28.0473, address: 'Johannesburg CBD, Gauteng, 2001' },
  { name: 'Midrand Logistics Hub', city: 'Midrand', lat: -25.9983, lon: 28.1263, address: 'Midrand, Johannesburg, 1685' },
  { name: 'Cape Town Central', city: 'Cape Town', lat: -33.9249, lon: 18.4241, address: 'Cape Town, Western Cape, 8001' },
  { name: 'Bellville (Cape Town)', city: 'Cape Town', lat: -33.8998, lon: 18.6288, address: 'Bellville, Cape Town, 7530' },
  { name: 'Durban Coastal', city: 'Durban', lat: -29.8587, lon: 31.0218, address: 'Durban, KwaZulu-Natal, 4001' },
  { name: 'Pretoria Metro', city: 'Pretoria', lat: -25.7479, lon: 28.2293, address: 'Pretoria, Gauteng, 0002' },
  { name: 'Gqeberha (Port Elizabeth)', city: 'Gqeberha', lat: -33.9608, lon: 25.6022, address: 'Gqeberha, Eastern Cape, 6001' },
  { name: 'Bloemfontein', city: 'Bloemfontein', lat: -29.0852, lon: 26.1596, address: 'Bloemfontein, Free State, 9301' },
];

/**
 * Intelligent City / Locality Extractor (Global Support, No Dummy Fallbacks)
 */
export const extractCityFromAddress = (addr, displayName = '') => {
  if (addr && typeof addr === 'object') {
    const candidate =
      addr.city ||
      addr.town ||
      addr.municipality ||
      addr.suburb ||
      addr.village ||
      addr.hamlet ||
      addr.county ||
      addr.state_district ||
      addr.state;
    if (candidate) return candidate.trim();
  }

  if (displayName && typeof displayName === 'string') {
    const parts = displayName.split(',').map((p) => p.trim());
    if (parts.length > 2) return parts[1];
    if (parts.length > 1) return parts[0];
  }

  return '';
};

/**
 * Format address strictly to standard: [Street no] [Street Name] [Suburb] [City] [State] [Code]
 */
export const formatStructuredAddress = ({
  streetNo = '',
  streetName = '',
  suburb = '',
  city = '',
  state = '',
  code = '',
} = {}) => {
  const parts = [
    String(streetNo || '').trim(),
    String(streetName || '').trim(),
    String(suburb || '').trim(),
    String(city || '').trim(),
    String(state || '').trim(),
    String(code || '').trim(),
  ].filter(Boolean);

  return parts.join(' ');
};

/**
 * Parse an address string or Nominatim address object into structured components:
 * { streetNo, streetName, suburb, city, state, code }
 */
export const parseAddressComponents = (rawText = '', addrObj = null) => {
  const comp = {
    streetNo: '',
    streetName: '',
    suburb: '',
    city: '',
    state: '',
    code: '',
  };

  if (addrObj && typeof addrObj === 'object') {
    comp.streetNo = addrObj.house_number || addrObj.street_number || '';
    comp.streetName = addrObj.road || addrObj.street || addrObj.pedestrian || addrObj.footway || '';
    comp.suburb =
      addrObj.suburb ||
      addrObj.neighbourhood ||
      addrObj.quarter ||
      addrObj.residential ||
      addrObj.district ||
      '';
    comp.city =
      addrObj.city ||
      addrObj.town ||
      addrObj.municipality ||
      addrObj.village ||
      addrObj.hamlet ||
      '';
    comp.state = addrObj.state || addrObj.province || addrObj.region || '';
    comp.code = addrObj.postcode || addrObj.postal_code || '';

    // If city is empty, fallback to extractor
    if (!comp.city) {
      comp.city = extractCityFromAddress(addrObj, rawText);
    }
  }

  // Fallback: If raw text provided and components are empty, parse from raw text
  if (rawText && typeof rawText === 'string' && (!comp.streetName && !comp.city)) {
    let text = rawText.replace(/,\s*South Africa$/i, '').trim();

    if (text.includes(',')) {
      const segments = text.split(',').map((s) => s.trim()).filter(Boolean);
      if (segments.length >= 5) {
        const first = segments[0];
        const sm = first.match(/^(\d+[\w-]*)\s+(.+)$/);
        if (sm) {
          comp.streetNo = sm[1];
          comp.streetName = sm[2];
        } else {
          comp.streetName = first;
        }
        comp.suburb = segments[1];
        comp.city = segments[2];
        comp.state = segments[3];
        const cm = segments[4].match(/\b(\d{4,6})\b/);
        if (cm) comp.code = cm[1];
        else comp.code = segments[4];
      } else if (segments.length === 4) {
        const first = segments[0];
        const sm = first.match(/^(\d+[\w-]*)\s+(.+)$/);
        if (sm) {
          comp.streetNo = sm[1];
          comp.streetName = sm[2];
        } else {
          comp.streetName = first;
        }
        comp.suburb = segments[1];
        comp.city = segments[2];
        const last = segments[3];
        const cm = last.match(/\b(\d{4,6})\b$/);
        if (cm) {
          comp.code = cm[1];
          comp.state = last.replace(cm[1], '').trim();
        } else {
          comp.state = last;
        }
      } else {
        const first = segments[0];
        const sm = first.match(/^(\d+[\w-]*)\s+(.+)$/);
        if (sm) {
          comp.streetNo = sm[1];
          comp.streetName = sm[2];
        } else {
          comp.streetName = first;
        }
        if (segments[1]) comp.suburb = segments[1];
        if (segments[2]) comp.city = segments[2];
      }
    } else {
      // Space separated string, e.g. "4 Sydney Street Westville" or "42 Oxford Road Rosebank Johannesburg Gauteng 2196"
      const codeMatch = text.match(/\b(\d{4,6})$/);
      if (codeMatch) {
        comp.code = codeMatch[1];
        text = text.substring(0, text.length - codeMatch[0].length).trim();
      }

      const provinces = [
        'Western Cape',
        'Eastern Cape',
        'Northern Cape',
        'KwaZulu-Natal',
        'Free State',
        'North West',
        'Gauteng',
        'Limpopo',
        'Mpumalanga',
        'KZN',
      ];
      for (const prov of provinces) {
        const regex = new RegExp(`\\b${prov}$`, 'i');
        if (regex.test(text)) {
          comp.state = prov;
          text = text.replace(regex, '').trim();
          break;
        }
      }

      const streetNoMatch = text.match(/^(\d+[\w-]*)\s+/);
      if (streetNoMatch) {
        comp.streetNo = streetNoMatch[1];
        text = text.substring(streetNoMatch[0].length).trim();
      }

      const streetSuffixRegex =
        /\b(Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln|Way|Crescent|Cres|Place|Pl|Boulevard|Blvd|Close|Cl|Highway|Hwy|Terrace|Ter)\b/i;
      const suffixMatch = text.match(streetSuffixRegex);
      if (suffixMatch) {
        const idx = text.indexOf(suffixMatch[0]) + suffixMatch[0].length;
        comp.streetName = text.substring(0, idx).trim();
        const remainder = text.substring(idx).trim();
        if (remainder) {
          const remParts = remainder.split(/\s+/);
          if (remParts.length === 1) {
            comp.suburb = remParts[0];
          } else if (remParts.length === 2) {
            comp.suburb = remParts[0];
            comp.city = remParts[1];
          } else {
            comp.suburb = remParts.slice(0, -1).join(' ');
            comp.city = remParts[remParts.length - 1];
          }
        }
      } else {
        if (comp.streetNo) {
          const parts = text.split(/\s+/);
          if (parts.length > 1) {
            comp.streetName = parts.slice(0, -1).join(' ');
            comp.suburb = parts[parts.length - 1];
          } else {
            comp.streetName = text;
          }
        } else {
          comp.city = text;
        }
      }
    }
  }

  return comp;
};

/**
 * Search Address Suggestions (Live Autocomplete for Address Picker)
 */
export const searchAddressSuggestions = async (queryText) => {
  if (!queryText || queryText.trim().length < 2) return [];
  const clean = queryText.trim();

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(clean)}&limit=6`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'NGKApp/1.0 (support@ngk.com)',
        'Accept-Language': 'en',
      },
    });
    const data = await res.json();

    if (!Array.isArray(data)) return [];

    return data.map((item) => {
      const addr = item.address || {};
      const components = parseAddressComponents(item.display_name, addr);
      const structuredAddress = formatStructuredAddress(components);
      const city = components.city || extractCityFromAddress(addr, item.display_name);

      const area =
        [components.streetNo, components.streetName, components.suburb].filter(Boolean).join(' ') ||
        city ||
        item.display_name.split(',')[0];

      return {
        address: structuredAddress || item.display_name,
        display_name: item.display_name,
        city: city || (item.display_name.split(',')[0] || '').trim(),
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        primaryText: area,
        secondaryText: structuredAddress || item.display_name,
        country: addr.country || '',
        components,
      };
    });
  } catch (err) {
    console.warn('Address autocomplete search error:', err.message);
    return [];
  }
};

/**
 * Reverse geocode coordinates to human-readable address & city
 */
export const reverseGeocode = async (lat, lon) => {
  if (!lat || !lon) throw new Error('Latitude and Longitude are required');

  // 1. Try Backend Proxy first
  try {
    const res = await fetch(`${BASE_URL}/dealers/reverse-geocode?lat=${lat}&lon=${lon}`);
    const data = await res.json();
    if (data && data.success && data.formattedAddress) {
      const components = {
        streetNo: data.streetNo || data.house_number || '',
        streetName: data.streetName || data.road || '',
        suburb: data.suburb || '',
        city: data.city || '',
        state: data.state || '',
        code: data.code || data.postcode || '',
      };
      const formatted = formatStructuredAddress(components) || data.formattedAddress;

      return {
        address: formatted,
        city: data.city || extractCityFromAddress(null, data.formattedAddress),
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        components,
      };
    }
  } catch {
    // Fall back to direct Nominatim
  }

  // 2. Direct Nominatim fallback
  const directUrl = `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
  const directRes = await fetch(directUrl, {
    headers: {
      'User-Agent': 'NGKApp/1.0 (support@ngk.com)',
      'Accept-Language': 'en',
    },
  });
  const directData = await directRes.json();
  if (!directData || !directData.display_name) {
    throw new Error('Address not found for these coordinates');
  }

  const addr = directData.address || {};
  const components = parseAddressComponents(directData.display_name, addr);
  const formatted = formatStructuredAddress(components) || directData.display_name;
  const city = components.city || extractCityFromAddress(addr, directData.display_name);

  return {
    address: formatted,
    city,
    latitude: parseFloat(directData.lat || lat),
    longitude: parseFloat(directData.lon || lon),
    components,
  };
};

/**
 * Geocode text address into latitude and longitude coordinates
 */
export const geocodeAddress = async (addressText) => {
  if (!addressText || !addressText.trim()) throw new Error('Address text is required');
  const clean = addressText.trim();

  // 1. Try Backend Proxy first
  try {
    const res = await fetch(`${BASE_URL}/dealers/geocode?address=${encodeURIComponent(clean)}`);
    const data = await res.json();
    if (data && data.success && data.latitude && data.longitude) {
      const components = {
        streetNo: data.streetNo || data.house_number || '',
        streetName: data.streetName || data.road || '',
        suburb: data.suburb || '',
        city: data.city || '',
        state: data.state || '',
        code: data.code || data.postcode || '',
      };
      const formatted = formatStructuredAddress(components) || data.formattedAddress || clean;
      return {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        formattedAddress: formatted,
        city: data.city || extractCityFromAddress(null, formatted),
        components,
      };
    }
  } catch {
    // Fall back to direct Nominatim
  }

  // 2. Direct Nominatim fallback
  const fbUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(clean)}&limit=1`;
  const fbRes = await fetch(fbUrl, {
    headers: {
      'User-Agent': 'NGKApp/1.0 (support@ngk.com)',
      'Accept-Language': 'en',
    },
  });
  const fbData = await fbRes.json();
  if (fbData && fbData.length > 0) {
    const item = fbData[0];
    const components = parseAddressComponents(item.display_name, item.address);
    const formatted = formatStructuredAddress(components) || item.display_name;
    const city = components.city || extractCityFromAddress(item.address, item.display_name);
    return {
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      formattedAddress: formatted,
      city,
      components,
    };
  }

  throw new Error('Could not find coordinates for this address. Please verify address details.');
};

/**
 * Detect user's current GPS position via browser Geolocation and prefetch address text
 */
export const detectCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Browser geolocation is not supported on this device'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const result = await reverseGeocode(latitude, longitude);
          resolve(result);
        } catch {
          // If reverse geocoding fails, return raw coordinates without dummy city
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            address: `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
            city: '',
          });
        }
      },
      (err) => {
        reject(new Error(err.message || 'Unable to retrieve your current location'));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
};
