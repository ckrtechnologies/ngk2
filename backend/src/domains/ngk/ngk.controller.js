import tecdocService from '../../services/tecdocService.js';
import { sendSuccess, sendError } from '../../common/utils/response.js';
import { normalizeMake, normalizeSeries, normalizeVehicle } from '../../common/utils/tecdocNormalizer.js';

const NGK_SUPPLIER_IDS = [15, 5414]; // NGK Spark Plug, NTK Sensors

export const getNgkManufacturers = async (req, res) => {
  try {
    const { type, country, lang } = req.query;
    const rawType = (type || 'P').toUpperCase().trim();
    const manufacturers = await tecdocService.getManufacturers(rawType, country, lang);
    const normalized = (manufacturers || []).map(normalizeMake);
    return sendSuccess(res, { data: { array: normalized }, count: normalized.length }, 'NGK Manufacturers fetched');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getNgkModelSeries = async (req, res) => {
  try {
    const { manuId, mfrId, type, country, lang } = req.query;
    const id = manuId || mfrId;
    if (!id) {
      return sendError(res, 'manuId or mfrId query parameter is required', 400);
    }
    const rawType = (type || 'P').toUpperCase().trim();
    const series = await tecdocService.getModelSeries(id, rawType, country, lang);
    const normalized = (series || []).map((s) => normalizeSeries(s, rawType));
    return sendSuccess(res, { data: { array: normalized }, count: normalized.length }, 'NGK Model series fetched');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getNgkVehicles = async (req, res) => {
  try {
    const { manuId, mfrId, modId, seriesId, type, country, lang } = req.query;
    const manufacturerId = manuId || mfrId;
    const modelSeriesId = modId || seriesId;
    if (!manufacturerId || !modelSeriesId) {
      return sendError(res, 'manuId and modId/seriesId query parameters are required', 400);
    }
    const rawType = (type || 'P').toUpperCase().trim();
    const vehicles = await tecdocService.getVehicles(manufacturerId, modelSeriesId, rawType, country, lang);
    const normalized = (vehicles || []).map((v) => normalizeVehicle(v, rawType));
    return sendSuccess(res, { data: { array: normalized }, count: normalized.length }, 'NGK Vehicles fetched');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getNgkArticlesByVehicle = async (req, res) => {
  try {
    const { linkageTargetId, carId, vehicleId, type, country, lang } = req.query;
    const id = linkageTargetId || carId || vehicleId;
    if (!id) {
      return sendError(res, 'linkageTargetId or vehicleId query parameter is required', 400);
    }
    const rawType = (type || 'P').toUpperCase().trim();
    const articles = await tecdocService.getArticlesByVehicle(id, rawType, country, lang, 'ngk');
    
    // Strict NGK vendor filter: ensure no KYB items
    const filtered = (articles || []).filter((a) => {
      const b = (a.brand || a.brandName || a.mfrName || a.dataSupplierName || '').toUpperCase();
      return !b.includes('KYB');
    });

    const categorized = tecdocService.groupArticlesByCategory(filtered, 'ngk');
    return sendSuccess(
      res,
      {
        status: 200,
        articles: categorized.articles,
        count: categorized.articles.length,
        categories: categorized.categories,
        categoryCounts: categorized.categoryCounts,
      },
      'NGK Articles fetched successfully'
    );
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getNgkArticlesByPartNumber = async (req, res) => {
  try {
    const { searchQuery, partNumber, partNo, part, query, q, country, lang } = req.query;
    const search = searchQuery || partNumber || partNo || part || query || q;
    if (!search || !search.trim()) {
      return sendError(res, 'searchQuery or partNo query parameter is required', 400);
    }
    const articles = await tecdocService.getArticlesByPartNumber(search.trim(), country, lang, 'ngk');
    const filtered = (articles || []).filter((a) => {
      const b = (a.brand || a.brandName || a.mfrName || a.dataSupplierName || '').toUpperCase();
      return !b.includes('KYB');
    });
    return sendSuccess(res, { status: 200, articles: filtered, count: filtered.length }, 'NGK Parts found');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getNgkPopularBrands = async (req, res) => {
  try {
    const { type } = req.query;
    if (type) {
      const rawType = type.toUpperCase().trim();
      const brands = tecdocService.getPopularBrands(rawType);
      return sendSuccess(res, { data: { array: brands }, count: brands.length }, 'NGK Popular brands fetched');
    }
    const all = tecdocService.getAllPopularBrands();
    return sendSuccess(res, { ...all, data: all }, 'All NGK popular brands fetched');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const proxyNgkServiceJson = async (req, res) => {
  try {
    const payload = req.body;
    if (payload?.getArticles) payload.getArticles.dataSupplierIds = NGK_SUPPLIER_IDS;
    if (payload?.getArticles2) payload.getArticles2.dataSupplierIds = NGK_SUPPLIER_IDS;

    const data = await tecdocService.execute(payload);

    const isArticleRequest = Boolean(
      payload?.getArticles ||
      payload?.getArticles2 ||
      payload?.articleDirectSearchAllNumbersWithState ||
      payload?.getArticleLinkedAllLinkingTarget3
    );

    if (isArticleRequest) {
      const filterNgk = (arr) =>
        (arr || []).filter((a) => {
          const b = (a.mfrName || a.brand || a.brandName || a.dataSupplierName || '').toUpperCase();
          return !b.includes('KYB');
        });

      if (Array.isArray(data?.articles)) data.articles = filterNgk(data.articles);
      if (Array.isArray(data?.data?.array)) data.data.array = filterNgk(data.data.array);
    }

    return res.status(200).json(data);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
