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
          'User-Agent': 'NGKAutomotiveApp/1.0 (https://ngkntk.co.za; tech@ngkntk.co.za)',
          Accept: 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        const source = data.originalimage?.source || data.thumbnail?.source;
        if (source && typeof source === 'string' && source.startsWith('http')) {
          memoryCache.set(cacheKey, source);
          AsyncStorage.setItem(cacheKey, source).catch(() => {});
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
