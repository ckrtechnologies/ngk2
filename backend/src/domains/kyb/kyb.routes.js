import { Router } from 'express';
import {
  getKybManufacturers,
  getKybModelSeries,
  getKybVehicles,
  getKybArticlesByVehicle,
  getKybArticlesByPartNumber,
  getKybPopularBrands,
  proxyKybServiceJson,
} from './kyb.controller.js';

const kybRouter = Router();

kybRouter.get('/popular-brands', getKybPopularBrands);
kybRouter.get('/manufacturers', getKybManufacturers);
kybRouter.get('/series', getKybModelSeries);
kybRouter.get('/vehicles', getKybVehicles);
kybRouter.get('/articles/by-vehicle', getKybArticlesByVehicle);
kybRouter.get('/articles/by-part', getKybArticlesByPartNumber);
kybRouter.post('/services/TecdocToCatDLB.jsonEndpoint', proxyKybServiceJson);
kybRouter.post('/serviceJson', proxyKybServiceJson);

export default kybRouter;
