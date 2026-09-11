import dealerService from './dealer.service.js';
import { sendSuccess, sendError } from '../../common/utils/response.js';

export const getDealers = async (req, res) => {
  try {
    const { role, q, searchQuery, userLat, userLon, lat, lon, radius, includeUnapproved } = req.query;
    const dealers = await dealerService.getDealers({
      role,
      searchQuery: q || searchQuery,
      userLat: userLat || lat,
      userLon: userLon || lon,
      radius: radius !== undefined && radius !== null && radius !== '' ? parseFloat(radius) : null,
      includeUnapproved: includeUnapproved === 'true',
    });
    return sendSuccess(res, { dealers, count: dealers.length }, 'Dealers fetched successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400, error);
  }
};

export const updateDealerApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_approved, is_live, approval_status, rejection_reason } = req.body;
    const result = await dealerService.updateApproval(id, {
      is_approved,
      is_live,
      approval_status,
      rejection_reason,
    });
    return sendSuccess(res, { dealer: result }, 'Dealer approval updated successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400, error);
  }
};

export const geocodeAddress = async (req, res) => {
  try {
    const address = req.query.address || req.query.q;
    if (!address) {
      return sendError(res, 'Address or query parameter is required', 400);
    }
    const cleanAddress = address.trim();
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(cleanAddress)}&countrycodes=za&limit=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'NGKAutoEnterprise/1.0 (admin@ngk.com)' },
    });
    const data = await response.json();
    let item = data && data.length > 0 ? data[0] : null;

    if (!item) {
      // Fallback search without country constraint
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(cleanAddress)}&limit=1`;
      const fbResponse = await fetch(fallbackUrl, {
        headers: { 'User-Agent': 'NGKAutoEnterprise/1.0 (admin@ngk.com)' },
      });
      const fbData = await fbResponse.json();
      if (!fbData || fbData.length === 0) {
        return sendError(res, 'Could not find coordinates for this address', 404);
      }
      item = fbData[0];
    }

    const addr = item.address || {};
    const streetNo = addr.house_number || addr.street_number || '';
    const streetName = addr.road || addr.street || addr.pedestrian || '';
    const suburb = addr.suburb || addr.neighbourhood || addr.quarter || addr.district || '';
    const city = addr.city || addr.town || addr.municipality || addr.village || 'Johannesburg';
    const state = addr.state || addr.province || '';
    const code = addr.postcode || addr.postal_code || '';
    const formatted = [streetNo, streetName, suburb, city, state, code].filter(Boolean).join(' ') || item.display_name;

    return sendSuccess(res, {
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      formattedAddress: formatted,
      streetNo,
      streetName,
      suburb,
      city,
      state,
      code,
      name: item.name,
    }, 'Coordinates found', 200);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const reverseGeocodeCoords = async (req, res) => {
  try {
    const lat = req.query.lat || req.query.latitude;
    const lon = req.query.lon || req.query.longitude;
    if (!lat || !lon) {
      return sendError(res, 'Latitude and longitude parameters are required', 400);
    }
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'NGKAutoEnterprise/1.0 (admin@ngk.com)' },
    });
    const data = await response.json();
    if (!data || !data.display_name) {
      return sendError(res, 'Could not reverse geocode these coordinates', 404);
    }
    const addr = data.address || {};
    const streetNo = addr.house_number || addr.street_number || '';
    const streetName = addr.road || addr.street || addr.pedestrian || '';
    const suburb = addr.suburb || addr.neighbourhood || addr.quarter || addr.district || '';
    const city = addr.city || addr.town || addr.municipality || addr.village || 'Johannesburg';
    const state = addr.state || addr.province || '';
    const code = addr.postcode || addr.postal_code || '';
    const formatted = [streetNo, streetName, suburb, city, state, code].filter(Boolean).join(' ') || data.display_name;

    return sendSuccess(res, {
      formattedAddress: formatted,
      streetNo,
      streetName,
      suburb,
      city,
      state,
      code,
      country: addr.country || 'South Africa',
      latitude: parseFloat(data.lat || lat),
      longitude: parseFloat(data.lon || lon),
    }, 'Address found', 200);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
