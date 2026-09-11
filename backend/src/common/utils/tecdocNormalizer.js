/**
 * Utility for normalizing TecDoc Pegasus 3.0 entity properties
 * Resolves naming and case inconsistencies across API versions and mock/live data
 */

export const normalizeMake = (item) => {
  if (!item) return null;
  const id = Number(item.manuId || item.id || item.mfrId || 0);
  const name = String(item.manuName || item.name || item.mfrName || item.brandName || '').trim();
  return {
    ...item,
    id,
    manuId: id,
    mfrId: id,
    name,
    manuName: name,
    mfrName: name,
  };
};

export const normalizeSeries = (item, linkingTargetType = 'P') => {
  if (!item) return null;
  const id = Number(item.modelId || item.id || item.seriesId || item.vehicleModelSeriesId || 0);
  const name = String(
    item.modelname ||
    item.modelName ||
    item.name ||
    item.seriesName ||
    item.vehicleModelSeriesName ||
    ''
  ).trim();
  const type = String(item.linkingTargetType || item.linkageTargetType || linkingTargetType || 'P').toUpperCase();

  return {
    ...item,
    id,
    modelId: id,
    seriesId: id,
    vehicleModelSeriesId: id,
    name,
    modelname: name,
    modelName: name,
    seriesName: name,
    vehicleModelSeriesName: name,
    linkingTargetType: type,
    linkageTargetType: type,
  };
};

export const normalizeVehicle = (item, defaultType = 'P') => {
  if (!item) return null;
  const id = Number(item.linkageTargetId || item.carId || item.id || item.vehicleId || 0);
  const description = String(
    item.description ||
    item.typeName ||
    item.vehicleSalesDescription ||
    item.modelName ||
    item.name ||
    ''
  ).trim();
  const type = String(item.linkageTargetType || item.linkingTargetType || defaultType || 'P').toUpperCase();

  return {
    ...item,
    id,
    carId: id,
    linkageTargetId: id,
    vehicleId: id,
    description,
    typeName: description,
    modelName: item.modelName || description,
    linkageTargetType: type,
    linkingTargetType: type,
    powerKwFrom: item.powerKwFrom || item.kiloWattsFrom || item.kw || null,
    powerHpFrom: item.powerHpFrom || item.horsePowerFrom || item.hp || null,
    yearOfConstrFrom: item.yearOfConstrFrom || item.beginYearMonth || null,
    yearOfConstrTo: item.yearOfConstrTo || item.endYearMonth || null,
  };
};
