import tecdocService from '../../services/tecdocService.js';
import { sendSuccess, sendError } from '../../common/utils/response.js';

export const getManufacturers = async (req, res) => {
  try {
    const { type, country, lang } = req.query;
    const manufacturers = await tecdocService.getManufacturers(type, country, lang);
    return sendSuccess(res, { data: { array: manufacturers }, count: manufacturers.length }, 'Manufacturers fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getModelSeries = async (req, res) => {
  try {
    const { manuId, mfrId, type, country, lang } = req.query;
    const id = manuId || mfrId;
    if (!id) {
      return sendError(res, 'manuId or mfrId query parameter is required', 400);
    }
    const series = await tecdocService.getModelSeries(id, type, country, lang);
    return sendSuccess(res, { data: { array: series }, count: series.length }, 'Model series fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getVehicles = async (req, res) => {
  try {
    const { manuId, mfrId, modId, seriesId, type, country, lang } = req.query;
    const manufacturerId = manuId || mfrId;
    const modelSeriesId = modId || seriesId;
    if (!manufacturerId || !modelSeriesId) {
      return sendError(res, 'manuId and modId query parameters are required', 400);
    }
    const vehicles = await tecdocService.getVehicles(manufacturerId, modelSeriesId, type, country, lang);
    return sendSuccess(res, { data: { array: vehicles }, count: vehicles.length }, 'Vehicles fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getArticlesByVehicle = async (req, res) => {
  try {
    const { linkageTargetId, carId, vehicleId, type, country, lang, brand: queryBrand } = req.query;
    const brand = queryBrand || req.headers['x-catalog-brand'] || req.headers['x-brand'];
    const id = linkageTargetId || carId || vehicleId;
    if (!id) {
      return sendError(res, 'linkageTargetId or vehicleId query parameter is required', 400);
    }
    const articles = await tecdocService.getArticlesByVehicle(id, type, country, lang, brand);
    const categorized = tecdocService.groupArticlesByCategory(articles, brand);

    return sendSuccess(
      res,
      {
        status: 200,
        articles: categorized.articles,
        count: categorized.articles.length,
        categories: categorized.categories,
        categoryCounts: categorized.categoryCounts,
      },
      'Articles fetched successfully'
    );
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getArticlesByPartNumber = async (req, res) => {
  try {
    const { searchQuery, partNumber, partNo, part, query, q, country, lang, brand: queryBrand } = req.query;
    const brand = queryBrand || req.headers['x-catalog-brand'] || req.headers['x-brand'];
    const search = searchQuery || partNumber || partNo || part || query || q;
    if (!search || !search.trim()) {
      return sendError(res, 'searchQuery or partNo query parameter is required', 400);
    }
    const articles = await tecdocService.getArticlesByPartNumber(search.trim(), country, lang, brand);
    return sendSuccess(res, { status: 200, articles, count: articles.length }, 'Articles fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getBrands = async (req, res) => {
  try {
    const { country, lang, brand: queryBrand } = req.query;
    const brand = queryBrand || req.headers['x-catalog-brand'] || req.headers['x-brand'];
    const brands = await tecdocService.getBrands(country, lang, brand);
    return sendSuccess(res, { data: { array: brands }, count: brands.length }, 'Brands fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getVehiclesByVIN = async (req, res) => {
  try {
    const { vin } = req.params;
    const { country, lang } = req.query;
    if (!vin || vin.length < 5) {
      return sendError(res, 'Valid VIN parameter is required', 400);
    }
    const vehicles = await tecdocService.getVehiclesByVIN(vin, country, lang);
    return sendSuccess(res, { vehicles }, 'VIN decoded successfully');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getPopularBrands = async (req, res) => {
  try {
    const { type } = req.query;
    if (type) {
      const brands = tecdocService.getPopularBrands(type);
      return sendSuccess(
        res,
        { data: { array: brands }, count: brands.length },
        'Popular brands fetched successfully'
      );
    }
    // Return all 3 categories in a single call for client-side instant caching
    const all = tecdocService.getAllPopularBrands();
    return sendSuccess(res, { ...all, data: all }, 'All popular brands fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

/**
 * Universal proxy endpoint for frontend components passing arbitrary TecDoc JSON payloads
 */
export const proxyServiceJson = async (req, res) => {
  try {
    const payload = req.body;
    const brand = (req.query.brand || req.headers['x-catalog-brand'] || req.headers['x-brand'] || '').toLowerCase();

    // Strictly enforce vendor supplier scoping if brand header/query is present
    if (brand === 'kyb') {
      if (payload?.getArticles) payload.getArticles.dataSupplierIds = [7729];
      if (payload?.getArticles2) payload.getArticles2.dataSupplierIds = [7729];
    } else if (brand === 'ngk' || brand === 'ntk') {
      if (payload?.getArticles) payload.getArticles.dataSupplierIds = [15, 5414];
      if (payload?.getArticles2) payload.getArticles2.dataSupplierIds = [15, 5414];
    }

    let data = await tecdocService.execute(payload);

    // Strict post-filtering to guarantee complete vendor isolation
    if (brand === 'kyb') {
      const filterKyb = (arr) =>
        (arr || []).filter((a) => {
          const b = (a.mfrName || a.brand || a.brandName || a.dataSupplierName || '').toUpperCase();
          return b.includes('KYB') || Number(a.dataSupplierId) === 7729;
        });
      if (Array.isArray(data?.articles)) data.articles = filterKyb(data.articles);
      if (Array.isArray(data?.data?.array)) data.data.array = filterKyb(data.data.array);
    } else if (brand === 'ngk' || brand === 'ntk') {
      const filterNgk = (arr) =>
        (arr || []).filter((a) => {
          const b = (a.mfrName || a.brand || a.brandName || a.dataSupplierName || '').toUpperCase();
          return (
            (b.includes('NGK') || b.includes('NTK') || Number(a.dataSupplierId) === 15 || Number(a.dataSupplierId) === 5414) &&
            !b.includes('KYB')
          );
        });
      if (Array.isArray(data?.articles)) data.articles = filterNgk(data.articles);
      if (Array.isArray(data?.data?.array)) data.data.array = filterNgk(data.data.array);
    }

    return res.status(200).json(data);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const get360Frames = async (req, res) => {
  try {
    const { gifUrl } = req.query;
    if (!gifUrl) {
      return sendError(res, 'gifUrl query parameter is required', 400);
    }
    const { extract360Frames } = await import('../../services/gif360Service.js');
    const data = await extract360Frames(gifUrl);
    return sendSuccess(res, data, '360 frames extracted successfully');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

