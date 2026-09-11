import AsyncStorage from '@react-native-async-storage/async-storage';

// In-memory cache to avoid duplicate network fetches during app lifecycle
const memoryCache = new Map();

// Fallback high-quality curated automotive image assets
export const DEFAULT_VEHICLE_FALLBACK =
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80';

/**
 * Converts a string to Title Case (e.g. "MAHINDRA" -> "Mahindra", "SCORPIO N" -> "Scorpio N")
 * Required because Wikipedia REST API endpoints are case-sensitive.
 */
function toTitleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/(?:^|\s|-|\/)\w/g, (m) => m.toUpperCase());
}

/**
 * Cleans vehicle model string by stripping internal manufacturer codes,
 * Roman numerals, and slashes (e.g. "BEETLE CONVERTIBLE (1Y7)" -> "Beetle Convertible").
 */
function cleanModelString(model) {
  if (!model) return '';
  return toTitleCase(model)
    .replace(/\([^)]*\)/g, '')
    .replace(/[\/]+/g, ' ')
    .replace(/\b(I|Ii|Iii|Iv|V|Vi|Vii|Viii)\b/gi, '')
    .trim();
}

/**
 * SNO 12: Validates whether a Wikipedia article is actually about the vehicle.
 * Checks title and description for the make name or automotive keywords.
 * Prevents returning images from unrelated articles (parliament, geography, etc.).
 */
function isVehicleRelatedArticle(data, make, cleanModel, firstWord) {
  const title = (data.title || '').toLowerCase();
  const desc  = (data.description || '').toLowerCase();
  const extract = (data.extract || '').toLowerCase().slice(0, 500);
  const makeLower = (make || '').toLowerCase();
  const modelLower = (cleanModel || '').toLowerCase();
  const firstWordLower = (firstWord || '').toLowerCase();

  // Automotive keywords that indicate the article is about a vehicle
  const autoKeywords = [
    'car', 'automobile', 'vehicle', 'sedan', 'hatchback', 'suv', 'coupe',
    'convertible', 'wagon', 'truck', 'pickup', 'van', 'minivan', 'crossover',
    'motor', 'engine', 'cylinder', 'turbo', 'diesel', 'petrol', 'electric vehicle',
    'manufactured', 'production', 'model year', 'wheelbase', 'horsepower',
    'compact car', 'mid-size', 'full-size', 'sports car', 'luxury',
    'automaker', 'manufacturer',
  ];

  // Check 1: Does the title contain the vehicle make?
  if (makeLower && title.includes(makeLower)) return true;

  // Check 2: Does the description contain automotive terms?
  for (const kw of autoKeywords) {
    if (desc.includes(kw)) return true;
  }

  // Check 3: Does the article extract mention the make AND any automotive keyword?
  if (makeLower && extract.includes(makeLower)) {
    for (const kw of autoKeywords) {
      if (extract.includes(kw)) return true;
    }
  }

  // Check 4: Does the title contain the model first word AND the description isn't empty?
  if (firstWordLower && firstWordLower.length > 2 && title.includes(firstWordLower) && desc.length > 0) {
    // But reject clearly non-automotive descriptions
    const rejectKeywords = ['politician', 'city', 'town', 'country', 'river', 'building',
      'parliament', 'district', 'province', 'municipality', 'film', 'album', 'song',
      'actor', 'actress', 'painter', 'writer', 'footballer', 'cricketer'];
    for (const rk of rejectKeywords) {
      if (desc.includes(rk)) return false;
    }
    return true;
  }

  // Default: reject — not confident this is about a vehicle
  return false;
}

/**
 * Synchronous in-memory vehicle image cache lookup.
 * Returns the cached URL immediately if available in memory or explicitly on car object,
 * avoiding initial spinner flash or re-render lag.
 */
export function getCachedVehicleImageUrlSync(car) {
  if (!car) return null;

  const explicitUrl =
    car.imageUrl ||
    car.image ||
    car.photo ||
    car.img ||
    car.raw_specs?.imageUrl ||
    car.raw_specs?.photo;

  if (explicitUrl && typeof explicitUrl === 'string' && explicitUrl.startsWith('http')) {
    return explicitUrl;
  }

  const rawMake = (car.make || '').trim();
  const rawModel = (car.model || '').trim();
  if (!rawMake && !rawModel) return null;

  const make = toTitleCase(rawMake);
  const cleanModel = cleanModelString(rawModel);
  const cacheKey = `veh_v8_${make.toLowerCase()}_${cleanModel.toLowerCase()}`.replace(/[^a-z0-9_]/g, '');

  if (memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey);
    if (cached && cached !== DEFAULT_VEHICLE_FALLBACK) {
      return cached;
    }
  }

  return null;
}

/**
 * Resolves a high-resolution authentic vehicle photograph.
 * Priority:
 * 1. Explicit vehicle image URL already stored on the vehicle object
 * 2. In-memory cached URL
 * 3. AsyncStorage cached URL
 * 4. Dynamic Wikipedia REST API lookup with title-casing and cleaned model terms
 * 5. Default curated automotive fallback
 */
export async function getVehicleImageUrl(car) {
  if (!car) return DEFAULT_VEHICLE_FALLBACK;

  // 1. Direct photo on vehicle object (e.g. from upload or backend)
  const explicitUrl =
    car.imageUrl ||
    car.image ||
    car.photo ||
    car.img ||
    car.raw_specs?.imageUrl ||
    car.raw_specs?.photo;

  if (explicitUrl && typeof explicitUrl === 'string' && explicitUrl.startsWith('http')) {
    return explicitUrl;
  }

  const rawMake = (car.make || '').trim();
  const rawModel = (car.model || '').trim();

  if (!rawMake && !rawModel) return DEFAULT_VEHICLE_FALLBACK;

  const make = toTitleCase(rawMake);
  const cleanModel = cleanModelString(rawModel);
  const firstWord = cleanModel.split(/[\s-]+/)[0];

  const cacheKey = `veh_v8_${make.toLowerCase()}_${cleanModel.toLowerCase()}`.replace(/[^a-z0-9_]/g, '');

  // 2. Check memory cache
  if (
    memoryCache.has(cacheKey) &&
    memoryCache.get(cacheKey) !== DEFAULT_VEHICLE_FALLBACK
  ) {
    return memoryCache.get(cacheKey);
  }

  // 3. Check persistent AsyncStorage
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (
      cached &&
      cached !== DEFAULT_VEHICLE_FALLBACK
    ) {
      memoryCache.set(cacheKey, cached);
      return cached;
    }
  } catch (e) {
    // Non-fatal, continue to fetch
  }

  // 4. Generate search candidates for Wikipedia REST API
  const queryTerms = [];
  if (make && cleanModel) {
    queryTerms.push(`${make}_${cleanModel.replace(/\s+/g, '-')}`);
    queryTerms.push(`${make}_${cleanModel.replace(/\s+/g, '_')}`);
    if (firstWord && firstWord !== cleanModel) {
      queryTerms.push(`${make}_${firstWord}`);
    }
  }
  if (cleanModel) {
    queryTerms.push(cleanModel.replace(/\s+/g, '_'));
  }
  if (firstWord) {
    queryTerms.push(firstWord);
  }
  if (make) {
    queryTerms.push(make);
  }

  // Dedup terms
  const uniqueTerms = [...new Set(queryTerms.filter(Boolean))];

  for (const term of uniqueTerms) {
    try {
      const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`;
      const res = await fetch(endpoint, {
        headers: {
          'User-Agent': 'KYBAutomotiveApp/1.0 (https://kyb.co.za; tech@kyb.co.za)',
          Accept: 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        const source = data.originalimage?.source || data.thumbnail?.source;
        if (source && typeof source === 'string' && source.startsWith('http')) {
          // SNO 12: Validate the article is actually about the vehicle
          // Reject images from unrelated articles (parliament, geography, etc.)
          if (!isVehicleRelatedArticle(data, make, cleanModel, firstWord)) {
            continue; // Skip this term, try next
          }
          // Reject SVGs, icons, and tiny images that aren't real photos
          const srcLower = source.toLowerCase();
          if (srcLower.endsWith('.svg') || srcLower.includes('icon') || srcLower.includes('logo')) {
            continue;
          }
          memoryCache.set(cacheKey, source);
          AsyncStorage.setItem(cacheKey, source).catch(() => { });
          return source;
        }
      }
    } catch (err) {
      // Try next term
    }
  }

  // 5. If no dynamic image could be resolved, cache fallback
  memoryCache.set(cacheKey, DEFAULT_VEHICLE_FALLBACK);
  return DEFAULT_VEHICLE_FALLBACK;
}
