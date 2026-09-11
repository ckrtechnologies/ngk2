import tecdocService from '../../services/tecdocService.js';
import { sendSuccess, sendError } from '../../common/utils/response.js';
import { normalizeMake, normalizeSeries, normalizeVehicle } from '../../common/utils/tecdocNormalizer.js';

const KYB_SUPPLIER_IDS = [7729]; // KYB Shock Absorbers & Suspension

const ALLOWED_KYB_TYPES = ['P', 'O', 'L', 'PASSENGER', 'COMMERCIAL', 'LIGHTCOMMERCIAL', 'LCV', 'LAN'];

export const getKybManufacturers = async (req, res) => {
  try {
    const { type, country, lang } = req.query;
    const rawType = (type || 'P').toUpperCase().trim();

    // Enforce KYB scope: No Tractor, No Marine
    if (!ALLOWED_KYB_TYPES.includes(rawType)) {
      return sendError(res, `Application type "${rawType}" is not supported by KYB Suspension catalog. Supported: Passenger (P), Commercial (O), LCV (L).`, 400);
    }

    const manufacturers = await tecdocService.getManufacturers(rawType, country, lang);
    const normalized = (manufacturers || []).map(normalizeMake);
    return sendSuccess(res, { data: { array: normalized }, count: normalized.length }, 'KYB Manufacturers fetched');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getKybModelSeries = async (req, res) => {
  try {
    const { manuId, mfrId, type, country, lang } = req.query;
    const id = manuId || mfrId;
    if (!id) {
      return sendError(res, 'manuId or mfrId query parameter is required', 400);
    }
    const rawType = (type || 'P').toUpperCase().trim();
    if (!ALLOWED_KYB_TYPES.includes(rawType)) {
      return sendError(res, `Application type "${rawType}" is not supported by KYB.`, 400);
    }

    const series = await tecdocService.getModelSeries(id, rawType, country, lang);
    const normalized = (series || []).map((s) => normalizeSeries(s, rawType));
    return sendSuccess(res, { data: { array: normalized }, count: normalized.length }, 'KYB Model series fetched');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getKybVehicles = async (req, res) => {
  try {
    const { manuId, mfrId, modId, seriesId, type, country, lang } = req.query;
    const manufacturerId = manuId || mfrId;
    const modelSeriesId = modId || seriesId;
    if (!manufacturerId || !modelSeriesId) {
      return sendError(res, 'manuId and modId/seriesId query parameters are required', 400);
    }
    const rawType = (type || req.query.linkingTargetType || req.query.targetType || 'P').toUpperCase().trim();
    if (!ALLOWED_KYB_TYPES.includes(rawType)) {
      return sendError(res, `Application type "${rawType}" is not supported by KYB Suspension catalog. Supported: Passenger (P), Commercial (O), LCV (L).`, 400);
    }
    const vehicles = await tecdocService.getVehicles(manufacturerId, modelSeriesId, rawType, country, lang);
    const normalized = (vehicles || []).map((v) => normalizeVehicle(v, rawType));
    return sendSuccess(res, { data: { array: normalized }, count: normalized.length }, 'KYB Vehicles fetched');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getKybArticlesByVehicle = async (req, res) => {
  try {
    const { linkageTargetId, carId, vehicleId, type, country, lang } = req.query;
    const id = linkageTargetId || carId || vehicleId;
    if (!id) {
      return sendError(res, 'linkageTargetId or vehicleId query parameter is required', 400);
    }
    const rawType = (type || 'P').toUpperCase().trim();
    const articles = await tecdocService.getArticlesByVehicle(id, rawType, country, lang, 'kyb');

    // Strict KYB vendor filter
    const filtered = (articles || []).filter((a) => {
      const b = (a.brand || a.brandName || a.mfrName || a.dataSupplierName || '').toUpperCase();
      return b.includes('KYB') || Number(a.dataSupplierId) === 7729;
    });

    const categorized = tecdocService.groupArticlesByCategory(filtered, 'kyb');
    return sendSuccess(
      res,
      {
        status: 200,
        articles: categorized.articles,
        count: categorized.articles.length,
        categories: categorized.categories,
        categoryCounts: categorized.categoryCounts,
      },
      'KYB Articles fetched successfully'
    );
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getKybArticlesByPartNumber = async (req, res) => {
  try {
    const { searchQuery, partNumber, partNo, part, query, q, country, lang } = req.query;
    const search = searchQuery || partNumber || partNo || part || query || q;
    if (!search || !search.trim()) {
      return sendError(res, 'searchQuery or partNo query parameter is required', 400);
    }
    const articles = await tecdocService.getArticlesByPartNumber(search.trim(), country, lang, 'kyb');
    const filtered = (articles || []).filter((a) => {
      const b = (a.brand || a.brandName || a.mfrName || a.dataSupplierName || '').toUpperCase();
      return b.includes('KYB') || Number(a.dataSupplierId) === 7729;
    });
    return sendSuccess(res, { status: 200, articles: filtered, count: filtered.length }, 'KYB Suspension parts found');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getKybPopularBrands = async (req, res) => {
  try {
    const { type } = req.query;
    const rawType = (type || 'P').toUpperCase().trim();
    const brands = tecdocService.getPopularBrands(rawType === 'O' ? 'O' : 'P');
    return sendSuccess(res, { data: { array: brands }, count: brands.length }, 'KYB Popular brands fetched');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const proxyKybServiceJson = async (req, res) => {
  try {
    const payload = req.body;
    if (payload?.getArticles) payload.getArticles.dataSupplierIds = KYB_SUPPLIER_IDS;
    if (payload?.getArticles2) payload.getArticles2.dataSupplierIds = KYB_SUPPLIER_IDS;

    const data = await tecdocService.execute(payload);

    const isArticleRequest = Boolean(
      payload?.getArticles ||
      payload?.getArticles2 ||
      payload?.articleDirectSearchAllNumbersWithState ||
      payload?.getArticleLinkedAllLinkingTarget3
    );

    if (isArticleRequest) {
      const filterKyb = (arr) =>
        (arr || []).filter((a) => {
          const b = (a.mfrName || a.brand || a.brandName || a.dataSupplierName || '').toUpperCase();
          return b.includes('KYB') || Number(a.dataSupplierId) === 7729;
        });

      if (Array.isArray(data?.articles)) data.articles = filterKyb(data.articles);
      if (Array.isArray(data?.data?.array)) data.data.array = filterKyb(data.data.array);
    }

    return res.status(200).json(data);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
