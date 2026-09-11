import { Router } from 'express';
import {
  getNgkManufacturers,
  getNgkModelSeries,
  getNgkVehicles,
  getNgkArticlesByVehicle,
  getNgkArticlesByPartNumber,
  getNgkPopularBrands,
  proxyNgkServiceJson,
} from './ngk.controller.js';

const ngkRouter = Router();

ngkRouter.get('/popular-brands', getNgkPopularBrands);
ngkRouter.get('/manufacturers', getNgkManufacturers);
ngkRouter.get('/series', getNgkModelSeries);
ngkRouter.get('/vehicles', getNgkVehicles);
ngkRouter.get('/articles/by-vehicle', getNgkArticlesByVehicle);
ngkRouter.get('/articles/by-part', getNgkArticlesByPartNumber);
ngkRouter.post('/services/TecdocToCatDLB.jsonEndpoint', proxyNgkServiceJson);
ngkRouter.post('/serviceJson', proxyNgkServiceJson);

export default ngkRouter;
