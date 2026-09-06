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
      const city = extractCityFromAddress(addr, item.display_name);
      const road = addr.road || addr.pedestrian || addr.suburb || '';
      const area = [road, city].filter(Boolean).join(', ') || item.display_name.split(',')[0];

      return {
        address: item.display_name,
        city: city || (item.display_name.split(',')[0] || '').trim(),
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        primaryText: area,
        secondaryText: item.display_name,
        country: addr.country || '',
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
      return {
        address: data.formattedAddress,
        city: data.city || extractCityFromAddress(null, data.formattedAddress),
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
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
  const city = extractCityFromAddress(addr, directData.display_name);

  return {
    address: directData.display_name,
    city,
    latitude: parseFloat(directData.lat || lat),
    longitude: parseFloat(directData.lon || lon),
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
      return {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        formattedAddress: data.formattedAddress || clean,
        city: data.city || extractCityFromAddress(null, data.formattedAddress || clean),
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
    const city = extractCityFromAddress(item.address, item.display_name);
    return {
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      formattedAddress: item.display_name,
      city,
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
