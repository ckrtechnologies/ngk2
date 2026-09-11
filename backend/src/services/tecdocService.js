import axios from 'axios';
import TECDOC_CONFIG from '../config/tecdoc.js';
import memoryCache from '../common/utils/cache.js';
import ENV from '../config/env.js';

const FALLBACK_MANUFACTURERS = [
  { id: 111, manuId: 111, name: 'TOYOTA', manuName: 'TOYOTA', count: 1850 },
  { id: 16, manuId: 16, name: 'BMW', manuName: 'BMW', count: 1420 },
  { id: 5, manuId: 5, name: 'AUDI', manuName: 'AUDI', count: 1210 },
  { id: 121, manuId: 121, name: 'VOLKSWAGEN', manuName: 'VOLKSWAGEN', count: 2100 },
  { id: 74, manuId: 74, name: 'MERCEDES-BENZ', manuName: 'MERCEDES-BENZ', count: 1680 },
  { id: 80, manuId: 80, name: 'NISSAN', manuName: 'NISSAN', count: 980 },
  { id: 36, manuId: 36, name: 'FORD', manuName: 'FORD', count: 1150 },
  { id: 183, manuId: 183, name: 'HYUNDAI', manuName: 'HYUNDAI', count: 870 },
  { id: 63, manuId: 63, name: 'MARUTI SUZUKI', manuName: 'MARUTI SUZUKI', count: 640 },
  { id: 54, manuId: 54, name: 'ISUZU', manuName: 'ISUZU', count: 520 },
];

const FALLBACK_SERIES = {
  111: [
    { id: 501, modelId: 501, name: 'HILUX VIII Pickup', modelname: 'HILUX VIII Pickup', count: 48 },
    { id: 502, modelId: 502, name: 'FORTUNER', modelname: 'FORTUNER', count: 32 },
    { id: 503, modelId: 503, name: 'COROLLA Sedan', modelname: 'COROLLA Sedan', count: 64 },
    { id: 504, modelId: 504, name: 'LAND CRUISER PRADO', modelname: 'LAND CRUISER PRADO', count: 28 },
    { id: 505, modelId: 505, name: 'RAV 4 V', modelname: 'RAV 4 V', count: 36 },
  ],
  183: [
    { id: 9145, modelId: 9145, name: 'ACCENT IV (RB)', modelname: 'ACCENT IV (RB)', count: 24 },
    { id: 11984, modelId: 11984, name: 'i20 II (GB, IB)', modelname: 'i20 II (GB, IB)', count: 30 },
    { id: 11050, modelId: 11050, name: 'i10 I (PA)', modelname: 'i10 I (PA)', count: 18 },
    { id: 14758, modelId: 14758, name: 'TUCSON (TL, TLE)', modelname: 'TUCSON (TL, TLE)', count: 36 },
    { id: 16024, modelId: 16024, name: 'CRETA', modelname: 'CRETA', count: 22 },
  ],
  36: [
    { id: 10450, modelId: 10450, name: 'RANGER (TKE)', modelname: 'RANGER (TKE)', count: 44 },
    { id: 11620, modelId: 11620, name: 'ECOSPORT', modelname: 'ECOSPORT', count: 26 },
    { id: 14500, modelId: 14500, name: 'EVEREST', modelname: 'EVEREST', count: 28 },
  ],
  54: [
    { id: 10252, modelId: 10252, name: 'D-MAX I (TFR, TFS)', modelname: 'D-MAX I (TFR, TFS)', count: 38 },
    { id: 40683, modelId: 40683, name: 'D-MAX II (TFR, TFS)', modelname: 'D-MAX II (TFR, TFS)', count: 32 },
  ],
  16: [
    { id: 601, modelId: 601, name: '3 Series (G20)', modelname: '3 Series (G20)', count: 42 },
    { id: 602, modelId: 602, name: '5 Series (G30)', modelname: '5 Series (G30)', count: 38 },
    { id: 603, modelId: 603, name: 'X3 (G01)', modelname: 'X3 (G01)', count: 30 },
  ],
  121: [
    { id: 701, modelId: 701, name: 'GOLF VIII (CD1)', modelname: 'GOLF VIII (CD1)', count: 54 },
    { id: 702, modelId: 702, name: 'POLO VI (AW1)', modelname: 'POLO VI (AW1)', count: 46 },
    { id: 703, modelId: 703, name: 'AMAROK', modelname: 'AMAROK', count: 32 },
  ],
  63: [
    { id: 801, modelId: 801, name: 'ALTO (HA12, HA23)', modelname: 'ALTO (HA12, HA23)', count: 18 },
    { id: 802, modelId: 802, name: 'SWIFT IV', modelname: 'SWIFT IV', count: 24 },
  ],
  74: [
    { id: 2039, modelId: 2039, name: 'SPRINTER 2-t Van (B901, B902)', modelname: 'SPRINTER 2-t Van (B901, B902)', count: 24 },
    { id: 2041, modelId: 2041, name: 'SPRINTER 3-t Bus (B903)', modelname: 'SPRINTER 3-t Bus (B903)', count: 30 },
    { id: 1587, modelId: 1587, name: 'ACTROS', modelname: 'ACTROS', count: 29 },
    { id: 3431, modelId: 3431, name: 'ATEGO', modelname: 'ATEGO', count: 23 },
    { id: 124, modelId: 124, name: 'C-CLASS (W205)', modelname: 'C-CLASS (W205)', count: 45 },
    { id: 125, modelId: 125, name: 'E-CLASS (W213)', modelname: 'E-CLASS (W213)', count: 38 },
  ],
  // Motorcycles & Quads (B / M)
  45: [
    { id: 4501, modelId: 4501, name: 'CBR 1000RR Fireblade', modelname: 'CBR 1000RR Fireblade', count: 32 },
    { id: 4502, modelId: 4502, name: 'CRF 450R / 450L', modelname: 'CRF 450R / 450L', count: 28 },
    { id: 4503, modelId: 4503, name: 'CRF 1100L Africa Twin', modelname: 'CRF 1100L Africa Twin', count: 24 },
    { id: 4504, modelId: 4504, name: 'CB 500F / CB 500X', modelname: 'CB 500F / CB 500X', count: 30 },
    { id: 4505, modelId: 4505, name: 'NC 750X / Integra', modelname: 'NC 750X / Integra', count: 22 },
  ],
  1164: [
    { id: 11641, modelId: 11641, name: 'YZF-R1 / YZF-R1M', modelname: 'YZF-R1 / YZF-R1M', count: 35 },
    { id: 11642, modelId: 11642, name: 'MT-09 / Tracer 9', modelname: 'MT-09 / Tracer 9', count: 30 },
    { id: 11643, modelId: 11643, name: 'MT-07 / Tracer 7', modelname: 'MT-07 / Tracer 7', count: 28 },
    { id: 11644, modelId: 11644, name: 'Tenere 700 (XTZ 700)', modelname: 'Tenere 700 (XTZ 700)', count: 26 },
    { id: 11645, modelId: 11645, name: 'WR 450F / YZ 450F', modelname: 'WR 450F / YZ 450F', count: 24 },
  ],
  574: [
    { id: 5741, modelId: 5741, name: 'Ninja ZX-10R', modelname: 'Ninja ZX-10R', count: 30 },
    { id: 5742, modelId: 5742, name: 'Z900 / Z900RS', modelname: 'Z900 / Z900RS', count: 28 },
    { id: 5743, modelId: 5743, name: 'Versys 650 (KLE650)', modelname: 'Versys 650 (KLE650)', count: 25 },
    { id: 5744, modelId: 5744, name: 'KLR 650', modelname: 'KLR 650', count: 20 },
  ],
  109: [
    { id: 1091, modelId: 1091, name: 'GSX-R 1000 / R', modelname: 'GSX-R 1000 / R', count: 32 },
    { id: 1092, modelId: 1092, name: 'V-Strom 650 (DL650)', modelname: 'V-Strom 650 (DL650)', count: 28 },
    { id: 1093, modelId: 1093, name: 'Hayabusa (GSX 1300R)', modelname: 'Hayabusa (GSX 1300R)', count: 24 },
    { id: 1094, modelId: 1094, name: 'DR-Z 400S / SM', modelname: 'DR-Z 400S / SM', count: 18 },
  ],
  2760: [
    { id: 27601, modelId: 27601, name: '1290 Super Duke R', modelname: '1290 Super Duke R', count: 28 },
    { id: 27602, modelId: 27602, name: '890 Adventure / R', modelname: '890 Adventure / R', count: 26 },
    { id: 27603, modelId: 27603, name: '390 Duke', modelname: '390 Duke', count: 34 },
    { id: 27604, modelId: 27604, name: '450 EXC-F / 300 EXC', modelname: '450 EXC-F / 300 EXC', count: 22 },
  ],
  112: [
    { id: 1121, modelId: 1121, name: 'Tiger 900 / 1200', modelname: 'Tiger 900 / 1200', count: 26 },
    { id: 1122, modelId: 1122, name: 'Bonneville T120 / T100', modelname: 'Bonneville T120 / T100', count: 24 },
    { id: 1123, modelId: 1123, name: 'Street Triple 765', modelname: 'Street Triple 765', count: 28 },
  ],
  181: [
    { id: 1811, modelId: 1811, name: 'Vespa GTS 300 Super', modelname: 'Vespa GTS 300 Super', count: 22 },
    { id: 1812, modelId: 1812, name: 'Beverly 300 / 400', modelname: 'Beverly 300 / 400', count: 18 },
    { id: 1813, modelId: 1813, name: 'Medley 125 / 150', modelname: 'Medley 125 / 150', count: 16 },
  ],
  4552: [
    { id: 45521, modelId: 45521, name: 'Pulsar 200 NS / RS', modelname: 'Pulsar 200 NS / RS', count: 36 },
    { id: 45522, modelId: 45522, name: 'Dominar 400', modelname: 'Dominar 400', count: 25 },
    { id: 45523, modelId: 45523, name: 'Boxer 150', modelname: 'Boxer 150', count: 30 },
  ],
  // Commercial & Trucks (O)
  120: [
    { id: 1201, modelId: 1201, name: 'FH 16 / FH 13', modelname: 'FH 16 / FH 13', count: 48 },
    { id: 1202, modelId: 1202, name: 'FM / FMX Tipper & Rigids', modelname: 'FM / FMX Tipper & Rigids', count: 36 },
    { id: 1203, modelId: 1203, name: 'FL / FE Distribution', modelname: 'FL / FE Distribution', count: 24 },
  ],
  103: [
    { id: 1031, modelId: 1031, name: 'R-Series (R450, R500, R560)', modelname: 'R-Series (R450, R500, R560)', count: 52 },
    { id: 1032, modelId: 1032, name: 'G-Series (G410, G460)', modelname: 'G-Series (G410, G460)', count: 38 },
    { id: 1033, modelId: 1033, name: 'P-Series Construction', modelname: 'P-Series Construction', count: 30 },
  ],
  69: [
    { id: 6901, modelId: 6901, name: 'TGX Long Haul', modelname: 'TGX Long Haul', count: 42 },
    { id: 6902, modelId: 6902, name: 'TGS Heavy Duty / Offroad', modelname: 'TGS Heavy Duty / Offroad', count: 35 },
    { id: 6903, modelId: 6903, name: 'TGM / TGL Medium Distribution', modelname: 'TGM / TGL Medium Distribution', count: 28 },
  ],
  151: [
    { id: 1511, modelId: 1511, name: 'HINO 300 Series', modelname: 'HINO 300 Series', count: 38 },
    { id: 1512, modelId: 1512, name: 'HINO 500 Series', modelname: 'HINO 500 Series', count: 34 },
    { id: 1513, modelId: 1513, name: 'HINO 700 Series', modelname: 'HINO 700 Series', count: 26 },
  ],
  55: [
    { id: 5501, modelId: 5501, name: 'Daily Van / Chassis Cab', modelname: 'Daily Van / Chassis Cab', count: 46 },
    { id: 5502, modelId: 5502, name: 'Eurocargo Medium', modelname: 'Eurocargo Medium', count: 32 },
    { id: 5503, modelId: 5503, name: 'Stralis / S-Way Heavy', modelname: 'Stralis / S-Way Heavy', count: 38 },
  ],
  // Tractors & Agricultural (T)
  301: [
    { id: 3011, modelId: 3011, name: '6M / 6R Utility Tractors', modelname: '6M / 6R Utility Tractors', count: 32 },
    { id: 3012, modelId: 3012, name: '8R / 8RT Row-Crop Tractors', modelname: '8R / 8RT Row-Crop Tractors', count: 26 },
    { id: 3013, modelId: 3013, name: '5E / 5M Specialty Tractors', modelname: '5E / 5M Specialty Tractors', count: 28 },
  ],
  302: [
    { id: 3021, modelId: 3021, name: 'MF 5700 / 6700 Series', modelname: 'MF 5700 / 6700 Series', count: 30 },
    { id: 3022, modelId: 3022, name: 'MF 7700 / 8700 High HP', modelname: 'MF 7700 / 8700 High HP', count: 24 },
    { id: 3023, modelId: 3023, name: 'MF 200 Heritage Workhorse', modelname: 'MF 200 Heritage Workhorse', count: 20 },
  ],
  303: [
    { id: 3031, modelId: 3031, name: 'T6 / T7 All-Purpose Series', modelname: 'T6 / T7 All-Purpose Series', count: 28 },
    { id: 3032, modelId: 3032, name: 'TD5 Compact Series', modelname: 'TD5 Compact Series', count: 22 },
  ],
  // LCV / Vans (L)
  80: [
    { id: 8001, modelId: 8001, name: 'NP300 Hardbody (D22)', modelname: 'NP300 Hardbody (D22)', count: 42 },
    { id: 8002, modelId: 8002, name: 'Navara Pick-up (D40 / D23)', modelname: 'Navara Pick-up (D40 / D23)', count: 38 },
    { id: 8003, modelId: 8003, name: 'NV350 Impendulo Taxi / Van', modelname: 'NV350 Impendulo Taxi / Van', count: 32 },
    { id: 8004, modelId: 8004, name: '1400 Bakkie (B140)', modelname: '1400 Bakkie (B140)', count: 28 },
    { id: 8005, modelId: 8005, name: 'NP200 Half-ton Bakkie', modelname: 'NP200 Half-ton Bakkie', count: 36 },
  ],
  93: [
    { id: 9301, modelId: 9301, name: 'Trafic II / III Van', modelname: 'Trafic II / III Van', count: 28 },
    { id: 9302, modelId: 9302, name: 'Master III Commercial Van', modelname: 'Master III Commercial Van', count: 24 },
    { id: 9303, modelId: 9303, name: 'Kangoo Express / Maxi', modelname: 'Kangoo Express / Maxi', count: 20 },
  ],
  // Marine & Outboard Engines (M)
  602: [
    { id: 6021, modelId: 6021, name: 'Verado V12 600hp / V8 300hp Outboards', modelname: 'Verado V12 600hp / V8 300hp Outboards', count: 32 },
    { id: 6022, modelId: 6022, name: 'FourStroke 175 - 300hp Commercial', modelname: 'FourStroke 175 - 300hp Commercial', count: 30 },
    { id: 6023, modelId: 6023, name: 'MerCruiser Inboard 4.5L / 6.2L V8', modelname: 'MerCruiser Inboard 4.5L / 6.2L V8', count: 26 },
    { id: 6024, modelId: 6024, name: 'Pro XS 115 - 250hp High-Output', modelname: 'Pro XS 115 - 250hp High-Output', count: 24 },
  ],
  603: [
    { id: 6031, modelId: 6031, name: '6LY / 4LV High Speed Diesel Inboard', modelname: '6LY / 4LV High Speed Diesel Inboard', count: 24 },
    { id: 6032, modelId: 6032, name: '3YM / 2YM Auxiliary Sailboat Engines', modelname: '3YM / 2YM Auxiliary Sailboat Engines', count: 20 },
    { id: 6033, modelId: 6033, name: '8LV V8 Twin-Turbo Marine Diesel', modelname: '8LV V8 Twin-Turbo Marine Diesel', count: 18 },
  ],
  604: [
    { id: 6041, modelId: 6041, name: 'MFS 115A / 140A 4-Stroke Outboards', modelname: 'MFS 115A / 140A 4-Stroke Outboards', count: 22 },
    { id: 6042, modelId: 6042, name: 'BFT 250 / 200 V6 Outboard Series', modelname: 'BFT 250 / 200 V6 Outboard Series', count: 18 },
  ],
  605: [
    { id: 6051, modelId: 6051, name: 'E-TEC G2 150 - 300hp V6 2-Stroke DFI', modelname: 'E-TEC G2 150 - 300hp V6 2-Stroke DFI', count: 26 },
    { id: 6052, modelId: 6052, name: 'OceanPro / Special V4 - V6', modelname: 'OceanPro / Special V4 - V6', count: 20 },
  ],
  607: [
    { id: 6071, modelId: 6071, name: 'QSB 6.7 Quantum Marine Diesel', modelname: 'QSB 6.7 Quantum Marine Diesel', count: 24 },
    { id: 6072, modelId: 6072, name: 'QSC 8.3 Heavy Commercial Inboard', modelname: 'QSC 8.3 Heavy Commercial Inboard', count: 20 },
  ],
};

const FALLBACK_VEHICLES_BY_SERIES = {
  // Volkswagen
  701: [
    { id: 70101, carId: 70101, linkageTargetId: 70101, linkageTargetType: 'P', typeName: '1.4 TSI (110kW / 150HP)', modelName: 'GOLF VIII (CD1)', manuName: 'VOLKSWAGEN', yearOfConstrFrom: '2020', powerHpFrom: '150', powerKwFrom: '110', cylinderCapacityCcm: 1395 },
    { id: 70102, carId: 70102, linkageTargetId: 70102, linkageTargetType: 'P', typeName: '2.0 TSI GTI (180kW / 245HP)', modelName: 'GOLF VIII (CD1)', manuName: 'VOLKSWAGEN', yearOfConstrFrom: '2020', powerHpFrom: '245', powerKwFrom: '180', cylinderCapacityCcm: 1984 },
    { id: 70103, carId: 70103, linkageTargetId: 70103, linkageTargetType: 'P', typeName: '2.0 TDI (110kW / 150HP)', modelName: 'GOLF VIII (CD1)', manuName: 'VOLKSWAGEN', yearOfConstrFrom: '2020', powerHpFrom: '150', powerKwFrom: '110', cylinderCapacityCcm: 1968 },
    { id: 70104, carId: 70104, linkageTargetId: 70104, linkageTargetType: 'P', typeName: '2.0 TSI R 4Motion (235kW / 320HP)', modelName: 'GOLF VIII (CD1)', manuName: 'VOLKSWAGEN', yearOfConstrFrom: '2021', powerHpFrom: '320', powerKwFrom: '235', cylinderCapacityCcm: 1984 },
  ],
  702: [
    { id: 70201, carId: 70201, linkageTargetId: 70201, linkageTargetType: 'P', typeName: '1.0 TSI (70kW / 95HP)', modelName: 'POLO VI (AW1)', manuName: 'VOLKSWAGEN', yearOfConstrFrom: '2018', powerHpFrom: '95', powerKwFrom: '70', cylinderCapacityCcm: 999 },
    { id: 70202, carId: 70202, linkageTargetId: 70202, linkageTargetType: 'P', typeName: '1.0 TSI (85kW / 115HP)', modelName: 'POLO VI (AW1)', manuName: 'VOLKSWAGEN', yearOfConstrFrom: '2018', powerHpFrom: '115', powerKwFrom: '85', cylinderCapacityCcm: 999 },
    { id: 70203, carId: 70203, linkageTargetId: 70203, linkageTargetType: 'P', typeName: '2.0 GTI (147kW / 200HP)', modelName: 'POLO VI (AW1)', manuName: 'VOLKSWAGEN', yearOfConstrFrom: '2018', powerHpFrom: '200', powerKwFrom: '147', cylinderCapacityCcm: 1984 },
  ],
  703: [
    { id: 70301, carId: 70301, linkageTargetId: 70301, linkageTargetType: 'P', typeName: '2.0 BiTDI 4Motion (132kW / 180HP)', modelName: 'AMAROK (2H_, S1B)', manuName: 'VOLKSWAGEN', yearOfConstrFrom: '2012', powerHpFrom: '180', powerKwFrom: '132', cylinderCapacityCcm: 1968 },
    { id: 70302, carId: 70302, linkageTargetId: 70302, linkageTargetType: 'P', typeName: '3.0 V6 TDI 4Motion (190kW / 258HP)', modelName: 'AMAROK (2H_, S1B)', manuName: 'VOLKSWAGEN', yearOfConstrFrom: '2018', powerHpFrom: '258', powerKwFrom: '190', cylinderCapacityCcm: 2967 },
  ],
  // Toyota
  501: [
    { id: 50101, carId: 50101, linkageTargetId: 50101, linkageTargetType: 'P', typeName: '2.8 GD-6 4x4 (GUN126) 150kW / 204HP', modelName: 'HILUX VIII Pickup', manuName: 'TOYOTA', yearOfConstrFrom: '2020', powerHpFrom: '204', powerKwFrom: '150', cylinderCapacityCcm: 2755 },
    { id: 50102, carId: 50102, linkageTargetId: 50102, linkageTargetType: 'P', typeName: '2.4 GD-6 (GUN125) 110kW / 150HP', modelName: 'HILUX VIII Pickup', manuName: 'TOYOTA', yearOfConstrFrom: '2016', powerHpFrom: '150', powerKwFrom: '110', cylinderCapacityCcm: 2393 },
    { id: 50103, carId: 50103, linkageTargetId: 50103, linkageTargetType: 'P', typeName: '2.7 VVTi (TGN126) 122kW / 166HP', modelName: 'HILUX VIII Pickup', manuName: 'TOYOTA', yearOfConstrFrom: '2016', powerHpFrom: '166', powerKwFrom: '122', cylinderCapacityCcm: 2694 },
  ],
  502: [
    { id: 50201, carId: 50201, linkageTargetId: 50201, linkageTargetType: 'P', typeName: '2.8 GD-6 4x4 (GUN156) 150kW / 204HP', modelName: 'FORTUNER (_N15_)', manuName: 'TOYOTA', yearOfConstrFrom: '2020', powerHpFrom: '204', powerKwFrom: '150', cylinderCapacityCcm: 2755 },
    { id: 50202, carId: 50202, linkageTargetId: 50202, linkageTargetType: 'P', typeName: '2.4 GD-6 (GUN165) 110kW / 150HP', modelName: 'FORTUNER (_N15_)', manuName: 'TOYOTA', yearOfConstrFrom: '2016', powerHpFrom: '150', powerKwFrom: '110', cylinderCapacityCcm: 2393 },
  ],
  503: [
    { id: 50301, carId: 50301, linkageTargetId: 50301, linkageTargetType: 'P', typeName: '1.8 Hybrid (ZWE211) 90kW / 122HP', modelName: 'COROLLA Sedan (_E21_)', manuName: 'TOYOTA', yearOfConstrFrom: '2019', powerHpFrom: '122', powerKwFrom: '90', cylinderCapacityCcm: 1798 },
    { id: 50302, carId: 50302, linkageTargetId: 50302, linkageTargetType: 'P', typeName: '2.0 XR (MZEA12) 125kW / 170HP', modelName: 'COROLLA Sedan (_E21_)', manuName: 'TOYOTA', yearOfConstrFrom: '2019', powerHpFrom: '170', powerKwFrom: '125', cylinderCapacityCcm: 1987 },
  ],
  504: [
    { id: 50401, carId: 50401, linkageTargetId: 50401, linkageTargetType: 'P', typeName: '2.8 D-4D 4x4 (GDJ150) 150kW / 204HP', modelName: 'LAND CRUISER PRADO (_J15_)', manuName: 'TOYOTA', yearOfConstrFrom: '2020', powerHpFrom: '204', powerKwFrom: '150', cylinderCapacityCcm: 2755 },
    { id: 50402, carId: 50402, linkageTargetId: 50402, linkageTargetType: 'P', typeName: '4.0 V6 Dual-VVTi (GRJ150) 207kW / 282HP', modelName: 'LAND CRUISER PRADO (_J15_)', manuName: 'TOYOTA', yearOfConstrFrom: '2010', powerHpFrom: '282', powerKwFrom: '207', cylinderCapacityCcm: 3956 },
  ],
  // BMW
  601: [
    { id: 60101, carId: 60101, linkageTargetId: 60101, linkageTargetType: 'P', typeName: '320i 2.0 TwinPower (135kW / 184HP)', modelName: '3 Series (G20)', manuName: 'BMW', yearOfConstrFrom: '2019', powerHpFrom: '184', powerKwFrom: '135', cylinderCapacityCcm: 1998 },
    { id: 60102, carId: 60102, linkageTargetId: 60102, linkageTargetType: 'P', typeName: '330i 2.0 TwinPower (190kW / 258HP)', modelName: '3 Series (G20)', manuName: 'BMW', yearOfConstrFrom: '2019', powerHpFrom: '258', powerKwFrom: '190', cylinderCapacityCcm: 1998 },
    { id: 60103, carId: 60103, linkageTargetId: 60103, linkageTargetType: 'P', typeName: 'M340i xDrive 3.0 (285kW / 387HP)', modelName: '3 Series (G20)', manuName: 'BMW', yearOfConstrFrom: '2019', powerHpFrom: '387', powerKwFrom: '285', cylinderCapacityCcm: 2998 },
    { id: 60104, carId: 60104, linkageTargetId: 60104, linkageTargetType: 'P', typeName: '320d 2.0 Turbo Diesel (140kW / 190HP)', modelName: '3 Series (G20)', manuName: 'BMW', yearOfConstrFrom: '2019', powerHpFrom: '190', powerKwFrom: '140', cylinderCapacityCcm: 1995 },
  ],
  602: [
    { id: 60201, carId: 60201, linkageTargetId: 60201, linkageTargetType: 'P', typeName: '520d 2.0 Turbo Diesel (140kW / 190HP)', modelName: '5 Series (G30)', manuName: 'BMW', yearOfConstrFrom: '2017', powerHpFrom: '190', powerKwFrom: '140', cylinderCapacityCcm: 1995 },
    { id: 60202, carId: 60202, linkageTargetId: 60202, linkageTargetType: 'P', typeName: '530i 2.0 TwinPower (185kW / 252HP)', modelName: '5 Series (G30)', manuName: 'BMW', yearOfConstrFrom: '2017', powerHpFrom: '252', powerKwFrom: '185', cylinderCapacityCcm: 1998 },
  ],
  // Ford Ranger & EcoSport
  10450: [
    { id: 104501, carId: 104501, linkageTargetId: 104501, linkageTargetType: 'P', typeName: '2.0 EcoBlue Bi-Turbo 4x4 (157kW / 213HP)', modelName: 'RANGER (TKE)', manuName: 'FORD', yearOfConstrFrom: '2019', powerHpFrom: '213', powerKwFrom: '157', cylinderCapacityCcm: 1996 },
    { id: 104502, carId: 104502, linkageTargetId: 104502, linkageTargetType: 'P', typeName: '3.2 TDCi 4x4 (147kW / 200HP)', modelName: 'RANGER (TKE)', manuName: 'FORD', yearOfConstrFrom: '2015', powerHpFrom: '200', powerKwFrom: '147', cylinderCapacityCcm: 3198 },
    { id: 104503, carId: 104503, linkageTargetId: 104503, linkageTargetType: 'P', typeName: '2.2 TDCi (118kW / 160HP)', modelName: 'RANGER (TKE)', manuName: 'FORD', yearOfConstrFrom: '2015', powerHpFrom: '160', powerKwFrom: '118', cylinderCapacityCcm: 2198 },
  ],
  11620: [
    { id: 116201, carId: 116201, linkageTargetId: 116201, linkageTargetType: 'P', typeName: '1.0 EcoBoost (92kW / 125HP)', modelName: 'ECOSPORT', manuName: 'FORD', yearOfConstrFrom: '2018', powerHpFrom: '125', powerKwFrom: '92', cylinderCapacityCcm: 998 },
    { id: 116202, carId: 116202, linkageTargetId: 116202, linkageTargetType: 'P', typeName: '1.5 TDCi (74kW / 100HP)', modelName: 'ECOSPORT', manuName: 'FORD', yearOfConstrFrom: '2015', powerHpFrom: '100', powerKwFrom: '74', cylinderCapacityCcm: 1498 },
  ],
  // Isuzu D-MAX
  10252: [
    { id: 102521, carId: 102521, linkageTargetId: 102521, linkageTargetType: 'P', typeName: '3.0 Ddi 4x4 (140kW / 190HP)', modelName: 'D-MAX I (TFR, TFS)', manuName: 'ISUZU', yearOfConstrFrom: '2020', powerHpFrom: '190', powerKwFrom: '140', cylinderCapacityCcm: 2999 },
    { id: 102522, carId: 102522, linkageTargetId: 102522, linkageTargetType: 'P', typeName: '1.9 Ddi (110kW / 150HP)', modelName: 'D-MAX I (TFR, TFS)', manuName: 'ISUZU', yearOfConstrFrom: '2020', powerHpFrom: '150', powerKwFrom: '110', cylinderCapacityCcm: 1898 },
  ],
  40683: [
    { id: 406831, carId: 406831, linkageTargetId: 406831, linkageTargetType: 'P', typeName: '3.0 D-Teq 4x4 (130kW / 177HP)', modelName: 'D-MAX II (TFR, TFS)', manuName: 'ISUZU', yearOfConstrFrom: '2013', powerHpFrom: '177', powerKwFrom: '130', cylinderCapacityCcm: 2999 },
    { id: 406832, carId: 406832, linkageTargetId: 406832, linkageTargetType: 'P', typeName: '2.5 D-Teq (100kW / 136HP)', modelName: 'D-MAX II (TFR, TFS)', manuName: 'ISUZU', yearOfConstrFrom: '2013', powerHpFrom: '136', powerKwFrom: '100', cylinderCapacityCcm: 2499 },
  ],
  // Mercedes-Benz Sprinter & C-Class
  2039: [
    { id: 20391, carId: 20391, linkageTargetId: 20391, linkageTargetType: 'L', typeName: '316 CDI (120kW / 163HP)', modelName: 'SPRINTER 2-t Van (B901, B902)', manuName: 'MERCEDES-BENZ', yearOfConstrFrom: '2018', powerHpFrom: '163', powerKwFrom: '120', cylinderCapacityCcm: 2143 },
    { id: 20392, carId: 20392, linkageTargetId: 20392, linkageTargetType: 'L', typeName: '519 CDI 3.0 V6 (140kW / 190HP)', modelName: 'SPRINTER 2-t Van (B901, B902)', manuName: 'MERCEDES-BENZ', yearOfConstrFrom: '2018', powerHpFrom: '190', powerKwFrom: '140', cylinderCapacityCcm: 2987 },
  ],
  124: [
    { id: 12401, carId: 12401, linkageTargetId: 12401, linkageTargetType: 'P', typeName: 'C 200 EQ Boost (150kW / 204HP)', modelName: 'C-CLASS (W205)', manuName: 'MERCEDES-BENZ', yearOfConstrFrom: '2018', powerHpFrom: '204', powerKwFrom: '150', cylinderCapacityCcm: 1497 },
    { id: 12402, carId: 12402, linkageTargetId: 12402, linkageTargetType: 'P', typeName: 'C 220 d (143kW / 194HP)', modelName: 'C-CLASS (W205)', manuName: 'MERCEDES-BENZ', yearOfConstrFrom: '2018', powerHpFrom: '194', powerKwFrom: '143', cylinderCapacityCcm: 1950 },
    { id: 12403, carId: 12403, linkageTargetId: 12403, linkageTargetType: 'P', typeName: 'C 300 (190kW / 258HP)', modelName: 'C-CLASS (W205)', manuName: 'MERCEDES-BENZ', yearOfConstrFrom: '2018', powerHpFrom: '258', powerKwFrom: '190', cylinderCapacityCcm: 1991 },
  ],
  // Nissan NP200 / NP300
  8001: [
    { id: 80011, carId: 80011, linkageTargetId: 80011, linkageTargetType: 'L', typeName: '2.5 dCi 4x4 (98kW / 133HP)', modelName: 'NP300 Hardbody (D22)', manuName: 'NISSAN', yearOfConstrFrom: '2010', powerHpFrom: '133', powerKwFrom: '98', cylinderCapacityCcm: 2488 },
    { id: 80012, carId: 80012, linkageTargetId: 80012, linkageTargetType: 'L', typeName: '2.4i 16V 4x4 (105kW / 143HP)', modelName: 'NP300 Hardbody (D22)', manuName: 'NISSAN', yearOfConstrFrom: '2010', powerHpFrom: '143', powerKwFrom: '105', cylinderCapacityCcm: 2389 },
  ],
  8005: [
    { id: 80051, carId: 80051, linkageTargetId: 80051, linkageTargetType: 'L', typeName: '1.6 8V (64kW / 87HP)', modelName: 'NP200 Half-ton Bakkie', manuName: 'NISSAN', yearOfConstrFrom: '2008', powerHpFrom: '87', powerKwFrom: '64', cylinderCapacityCcm: 1598 },
    { id: 80052, carId: 80052, linkageTargetId: 80052, linkageTargetType: 'L', typeName: '1.5 dCi (63kW / 86HP)', modelName: 'NP200 Half-ton Bakkie', manuName: 'NISSAN', yearOfConstrFrom: '2008', powerHpFrom: '86', powerKwFrom: '63', cylinderCapacityCcm: 1461 },
  ],
  // Hyundai Accent & Tucson
  9145: [
    { id: 91451, carId: 91451, linkageTargetId: 91451, linkageTargetType: 'P', typeName: '1.6 GLS (91kW / 124HP)', modelName: 'ACCENT IV (RB)', manuName: 'HYUNDAI', yearOfConstrFrom: '2011', powerHpFrom: '124', powerKwFrom: '91', cylinderCapacityCcm: 1591 },
    { id: 91452, carId: 91452, linkageTargetId: 91452, linkageTargetType: 'P', typeName: '1.6 CRDi (94kW / 128HP)', modelName: 'ACCENT IV (RB)', manuName: 'HYUNDAI', yearOfConstrFrom: '2011', powerHpFrom: '128', powerKwFrom: '94', cylinderCapacityCcm: 1582 },
  ],
  14758: [
    { id: 147581, carId: 147581, linkageTargetId: 147581, linkageTargetType: 'P', typeName: '2.0 CRDi AWD (131kW / 178HP)', modelName: 'TUCSON (TL, TLE)', manuName: 'HYUNDAI', yearOfConstrFrom: '2015', powerHpFrom: '178', powerKwFrom: '131', cylinderCapacityCcm: 1995 },
    { id: 147582, carId: 147582, linkageTargetId: 147582, linkageTargetType: 'P', typeName: '1.6 T-GDi (130kW / 177HP)', modelName: 'TUCSON (TL, TLE)', manuName: 'HYUNDAI', yearOfConstrFrom: '2015', powerHpFrom: '177', powerKwFrom: '130', cylinderCapacityCcm: 1591 },
  ],
  // Motorcycles
  4501: [
    { id: 45011, carId: 45011, linkageTargetId: 45011, linkageTargetType: 'M', typeName: '1000cc DOHC Inline-4 (160kW / 217HP)', modelName: 'CBR 1000RR Fireblade', manuName: 'HONDA', yearOfConstrFrom: '2020', powerHpFrom: '217', powerKwFrom: '160', cylinderCapacityCcm: 999 },
    { id: 45012, carId: 45012, linkageTargetId: 45012, linkageTargetType: 'M', typeName: '1000cc SP Electronic Suspension (160kW / 217HP)', modelName: 'CBR 1000RR Fireblade', manuName: 'HONDA', yearOfConstrFrom: '2020', powerHpFrom: '217', powerKwFrom: '160', cylinderCapacityCcm: 999 },
  ],
  4502: [
    { id: 45021, carId: 45021, linkageTargetId: 45021, linkageTargetType: 'M', typeName: '449cc Unicam Single (41kW / 56HP)', modelName: 'CRF 450R / 450L', manuName: 'HONDA', yearOfConstrFrom: '2019', powerHpFrom: '56', powerKwFrom: '41', cylinderCapacityCcm: 449 },
  ],
  4503: [
    { id: 45031, carId: 45031, linkageTargetId: 45031, linkageTargetType: 'M', typeName: '1084cc SOHC Twin (75kW / 102HP)', modelName: 'CRF 1100L Africa Twin', manuName: 'HONDA', yearOfConstrFrom: '2020', powerHpFrom: '102', powerKwFrom: '75', cylinderCapacityCcm: 1084 },
  ],
  11641: [
    { id: 116411, carId: 116411, linkageTargetId: 116411, linkageTargetType: 'M', typeName: '998cc CP4 Crossplane (147kW / 200HP)', modelName: 'YZF-R1 / YZF-R1M', manuName: 'YAMAHA', yearOfConstrFrom: '2020', powerHpFrom: '200', powerKwFrom: '147', cylinderCapacityCcm: 998 },
    { id: 116412, carId: 116412, linkageTargetId: 116412, linkageTargetType: 'M', typeName: '998cc R1M Carbon Electronic (147kW / 200HP)', modelName: 'YZF-R1 / YZF-R1M', manuName: 'YAMAHA', yearOfConstrFrom: '2020', powerHpFrom: '200', powerKwFrom: '147', cylinderCapacityCcm: 998 },
  ],
  11642: [
    { id: 116421, carId: 116421, linkageTargetId: 116421, linkageTargetType: 'M', typeName: '890cc CP3 In-line 3 (87kW / 119HP)', modelName: 'MT-09 / Tracer 9', manuName: 'YAMAHA', yearOfConstrFrom: '2021', powerHpFrom: '119', powerKwFrom: '87', cylinderCapacityCcm: 890 },
  ],
  5741: [
    { id: 57411, carId: 57411, linkageTargetId: 57411, linkageTargetType: 'M', typeName: '998cc 16V DOHC In-line 4 (149kW / 203HP)', modelName: 'Ninja ZX-10R', manuName: 'KAWASAKI', yearOfConstrFrom: '2021', powerHpFrom: '203', powerKwFrom: '149', cylinderCapacityCcm: 998 },
  ],
  1091: [
    { id: 10911, carId: 10911, linkageTargetId: 10911, linkageTargetType: 'M', typeName: '999cc 4-Cylinder DOHC (149kW / 202HP)', modelName: 'GSX-R 1000 / R', manuName: 'SUZUKI', yearOfConstrFrom: '2019', powerHpFrom: '202', powerKwFrom: '149', cylinderCapacityCcm: 999 },
  ],
  27601: [
    { id: 276011, carId: 276011, linkageTargetId: 276011, linkageTargetType: 'M', typeName: '1301cc 75° V-Twin LC8 (132kW / 180HP)', modelName: '1290 Super Duke R', manuName: 'KTM', yearOfConstrFrom: '2020', powerHpFrom: '180', powerKwFrom: '132', cylinderCapacityCcm: 1301 },
  ],
  45521: [
    { id: 455211, carId: 455211, linkageTargetId: 455211, linkageTargetType: 'M', typeName: '199.5cc Triple Spark 4V (18kW / 24.5HP)', modelName: 'Pulsar 200 NS / RS', manuName: 'BAJAJ', yearOfConstrFrom: '2018', powerHpFrom: '24.5', powerKwFrom: '18', cylinderCapacityCcm: 200 },
  ],
  // Commercial Vehicles (O)
  1201: [
    { id: 12011, carId: 12011, linkageTargetId: 12011, linkageTargetType: 'O', typeName: '16.1L D16K 750hp Euro 6 (551kW / 750HP)', modelName: 'FH 16 / FH 13', manuName: 'VOLVO', yearOfConstrFrom: '2018', powerHpFrom: '750', powerKwFrom: '551', cylinderCapacityCcm: 16100 },
    { id: 12012, carId: 12012, linkageTargetId: 12012, linkageTargetType: 'O', typeName: '12.8L D13K 500hp Turbo Compound (368kW / 500HP)', modelName: 'FH 16 / FH 13', manuName: 'VOLVO', yearOfConstrFrom: '2019', powerHpFrom: '500', powerKwFrom: '368', cylinderCapacityCcm: 12800 },
  ],
  1031: [
    { id: 10311, carId: 10311, linkageTargetId: 10311, linkageTargetType: 'O', typeName: '16.4L DC16 V8 580hp (427kW / 580HP)', modelName: 'R-Series (R450, R500, R560)', manuName: 'SCANIA', yearOfConstrFrom: '2018', powerHpFrom: '580', powerKwFrom: '427', cylinderCapacityCcm: 16400 },
  ],
  // Tractors (T)
  3011: [
    { id: 30111, carId: 30111, linkageTargetId: 30111, linkageTargetType: 'T', typeName: '6.8L 6-Cyl PowerTech PVS Turbo Diesel (155kW / 210HP)', modelName: '6M / 6R Utility Tractors', manuName: 'JOHN DEERE', yearOfConstrFrom: '2020', powerHpFrom: '210', powerKwFrom: '155', cylinderCapacityCcm: 6800 },
    { id: 30112, carId: 30112, linkageTargetId: 30112, linkageTargetType: 'T', typeName: '4.5L 4-Cyl PowerTech PWL (95kW / 130HP)', modelName: '6M / 6R Utility Tractors', manuName: 'JOHN DEERE', yearOfConstrFrom: '2018', powerHpFrom: '130', powerKwFrom: '95', cylinderCapacityCcm: 4500 },
  ],
  3021: [
    { id: 30211, carId: 30211, linkageTargetId: 30211, linkageTargetType: 'T', typeName: 'AGCO Power 4.4L 4-Cyl Turbo (96kW / 130HP)', modelName: 'MF 5700 / 6700 Series', manuName: 'MASSEY FERGUSON', yearOfConstrFrom: '2019', powerHpFrom: '130', powerKwFrom: '96', cylinderCapacityCcm: 4400 },
    { id: 30212, carId: 30212, linkageTargetId: 30212, linkageTargetType: 'T', typeName: 'AGCO Power 4.9L 4-Cyl Turbo (118kW / 160HP)', modelName: 'MF 5700 / 6700 Series', manuName: 'MASSEY FERGUSON', yearOfConstrFrom: '2019', powerHpFrom: '160', powerKwFrom: '118', cylinderCapacityCcm: 4900 },
  ],
  // Marine
  6021: [
    { id: 60211, carId: 60211, linkageTargetId: 60211, linkageTargetType: 'MARINE', typeName: '7.6L V12 600hp Naturally Aspirated Outboard', modelName: 'Verado V12 600hp Outboards', manuName: 'MERCURY MARINE', yearOfConstrFrom: '2021', powerHpFrom: '600', powerKwFrom: '441', cylinderCapacityCcm: 7600 },
    { id: 60212, carId: 60212, linkageTargetId: 60212, linkageTargetType: 'MARINE', typeName: '4.6L V8 300hp FourStroke Outboard', modelName: 'Verado V8 300hp Outboards', manuName: 'MERCURY MARINE', yearOfConstrFrom: '2019', powerHpFrom: '300', powerKwFrom: '221', cylinderCapacityCcm: 4600 },
  ],
  116401: [
    { id: 1164011, carId: 1164011, linkageTargetId: 1164011, linkageTargetType: 'MARINE', typeName: '4.2L V6 Offshore 300hp 4-Stroke', modelName: 'F350 / F300 V8 Offshore Outboards', manuName: 'YAMAHA MARINE', yearOfConstrFrom: '2020', powerHpFrom: '300', powerKwFrom: '221', cylinderCapacityCcm: 4200 },
    { id: 1164012, carId: 1164012, linkageTargetId: 1164012, linkageTargetType: 'MARINE', typeName: '5.3L V8 350hp 4-Stroke Offshore', modelName: 'F350 / F300 V8 Offshore Outboards', manuName: 'YAMAHA MARINE', yearOfConstrFrom: '2018', powerHpFrom: '350', powerKwFrom: '257', cylinderCapacityCcm: 5300 },
  ]
};

const FALLBACK_ARTICLES = [
  {
    articleId: 5787,
    articleNo: 'ILZKR7B-11',
    partNumber: 'ILZKR7B-11',
    tradeNumbers: ['5787', 'ILZKR7B11'],
    articleName: 'Laser Iridium Spark Plug',
    dataSupplierName: 'NGK SPARK PLUG',
    dataSupplierId: 15,
    brand: 'NGK SPARK PLUG',
    imageUrl: 'https://digital-assets.tecalliance.services/images/400/db43e6b81241ab09be6ba2395a6a5dc3be371693.jpg',
    imageURL400: 'https://digital-assets.tecalliance.services/images/400/db43e6b81241ab09be6ba2395a6a5dc3be371693.jpg',
    images: [
      {
        imageURL400: 'https://digital-assets.tecalliance.services/images/400/db43e6b81241ab09be6ba2395a6a5dc3be371693.jpg',
        imageURL800: 'https://digital-assets.tecalliance.services/images/800/db43e6b81241ab09be6ba2395a6a5dc3be371693.jpg',
        imageURL200: 'https://digital-assets.tecalliance.services/images/200/db43e6b81241ab09be6ba2395a6a5dc3be371693.jpg',
        typeDescription: 'Article Picture',
        headerDescription: 'Product Photo',
      },
    ],
    specs: [
      { label: 'Thread Size', value: 'M12 x 1.25' },
      { label: 'Spanner Size', value: '16 mm' },
      { label: 'Thread Length', value: '26.5 mm' },
      { label: 'Spark Position', value: '5.0 mm' },
      { label: 'Electrode Gap', value: '1.1 mm' },
    ],
  },
  {
    articleId: 3672,
    articleNo: 'LFR6A-11',
    partNumber: 'LFR6A-11',
    tradeNumbers: ['3672', 'LFR6A11'],
    articleName: 'Yellow Line Standard Spark Plug',
    dataSupplierName: 'NGK SPARK PLUG',
    dataSupplierId: 15,
    brand: 'NGK SPARK PLUG',
    imageUrl: 'https://digital-assets.tecalliance.services/images/400/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
    imageURL400: 'https://digital-assets.tecalliance.services/images/400/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
    images: [
      {
        imageURL400: 'https://digital-assets.tecalliance.services/images/400/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
        imageURL800: 'https://digital-assets.tecalliance.services/images/800/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
        imageURL200: 'https://digital-assets.tecalliance.services/images/200/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
        typeDescription: 'Article Picture',
        headerDescription: 'Product Photo',
      },
    ],
    specs: [
      { label: 'Thread Size', value: 'M14 x 1.25' },
      { label: 'Spanner Size', value: '16 mm' },
      { label: 'Thread Length', value: '26.5 mm' },
      { label: 'Spark Position', value: '3.0 mm' },
      { label: 'Electrode Gap', value: '1.1 mm' },
    ],
  },
  {
    articleId: 3932,
    articleNo: 'DCPR7E',
    partNumber: 'DCPR7E',
    tradeNumbers: ['3932'],
    articleName: 'Standard Nickel Spark Plug',
    dataSupplierName: 'NGK SPARK PLUG',
    dataSupplierId: 15,
    brand: 'NGK SPARK PLUG',
    imageUrl: 'https://digital-assets.tecalliance.services/images/400/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
    imageURL400: 'https://digital-assets.tecalliance.services/images/400/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
    images: [
      {
        imageURL400: 'https://digital-assets.tecalliance.services/images/400/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
        imageURL800: 'https://digital-assets.tecalliance.services/images/800/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
        imageURL200: 'https://digital-assets.tecalliance.services/images/200/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
        typeDescription: 'Article Picture',
        headerDescription: 'Product Photo',
      },
    ],
    specs: [
      { label: 'Thread Size', value: 'M12 x 1.25' },
      { label: 'Spanner Size', value: '16 mm' },
      { label: 'Thread Length', value: '19.0 mm' },
      { label: 'Spark Position', value: '3.0 mm' },
      { label: 'Electrode Gap', value: '0.9 mm' },
    ],
  },
  {
    articleId: 48043,
    articleNo: 'U5014',
    partNumber: 'U5014',
    tradeNumbers: ['48043'],
    articleName: 'NGK Ignition Coil Block',
    dataSupplierName: 'NGK SPARK PLUG',
    dataSupplierId: 15,
    brand: 'NGK SPARK PLUG',
    imageUrl: 'https://digital-assets.tecalliance.services/images/400/956629741cb981435df21cfe4e8d6bee044bfc29.jpg',
    imageURL400: 'https://digital-assets.tecalliance.services/images/400/956629741cb981435df21cfe4e8d6bee044bfc29.jpg',
    images: [
      {
        imageURL400: 'https://digital-assets.tecalliance.services/images/400/956629741cb981435df21cfe4e8d6bee044bfc29.jpg',
        imageURL800: 'https://digital-assets.tecalliance.services/images/800/956629741cb981435df21cfe4e8d6bee044bfc29.jpg',
        imageURL200: 'https://digital-assets.tecalliance.services/images/200/956629741cb981435df21cfe4e8d6bee044bfc29.jpg',
        typeDescription: 'Article Picture',
        headerDescription: 'Product Photo',
      },
    ],
    specs: [
      { label: 'Connector Type', value: 'SAE' },
      { label: 'Number of Poles', value: '3' },
      { label: 'Operating Voltage', value: '12 V' },
      { label: 'Ignition Coil', value: 'Block Ignition Coil' },
    ],
  },
  {
    articleId: 333338,
    articleNo: '333338',
    partNumber: '333338',
    tradeNumbers: ['333338'],
    articleName: 'KYB Excel-G Gas Shock Absorber',
    dataSupplierName: '-KYB',
    dataSupplierId: 7729,
    brand: '-KYB',
    imageUrl: 'https://digital-assets.tecalliance.services/images/400/a59c5579be1ff74702c8856275255ab592e38e7e.jpg',
    imageURL400: 'https://digital-assets.tecalliance.services/images/400/a59c5579be1ff74702c8856275255ab592e38e7e.jpg',
    images: [
      {
        imageURL400: 'https://digital-assets.tecalliance.services/images/400/a59c5579be1ff74702c8856275255ab592e38e7e.jpg',
        imageURL800: 'https://digital-assets.tecalliance.services/images/800/a59c5579be1ff74702c8856275255ab592e38e7e.jpg',
        imageURL200: 'https://digital-assets.tecalliance.services/images/200/a59c5579be1ff74702c8856275255ab592e38e7e.jpg',
        typeDescription: 'Article Picture',
        headerDescription: 'Product Photo',
      },
    ],
    specs: [
      { label: 'Fitting Position', value: 'Front Axle' },
      { label: 'Shock Absorber Type', value: 'Gas Pressure Strut' },
      { label: 'Shock Absorber System', value: 'Twin-Tube' },
    ],
  },
  {
    articleId: 182900,
    articleNo: 'RA1829',
    partNumber: 'RA1829',
    tradeNumbers: ['RA1829'],
    articleName: 'KYB K-Flex Suspension Coil Spring',
    dataSupplierName: '-KYB',
    dataSupplierId: 7729,
    brand: '-KYB',
    imageUrl: 'https://digital-assets.tecalliance.services/images/400/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
    imageURL400: 'https://digital-assets.tecalliance.services/images/400/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
    images: [
      {
        imageURL400: 'https://digital-assets.tecalliance.services/images/400/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
        imageURL800: 'https://digital-assets.tecalliance.services/images/800/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
        imageURL200: 'https://digital-assets.tecalliance.services/images/200/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
        typeDescription: 'Article Picture',
        headerDescription: 'Product Photo',
      },
    ],
    specs: [
      { label: 'Fitting Position', value: 'Front Axle' },
      { label: 'Spring Design', value: 'Coil Spring' },
      { label: 'Weight', value: '2.14 kg' },
    ],
  },
  {
    articleId: 93501,
    articleNo: 'ILKAR7C10',
    partNumber: 'ILKAR7C10',
    tradeNumbers: ['94998'],
    articleName: 'Laser Iridium Spark Plug',
    dataSupplierName: 'NGK SPARK PLUG',
    dataSupplierId: 15,
    brand: 'NGK SPARK PLUG',
    imageUrl: 'https://digital-assets.tecalliance.services/images/400/db43e6b81241ab09be6ba2395a6a5dc3be371693.jpg',
    imageURL400: 'https://digital-assets.tecalliance.services/images/400/db43e6b81241ab09be6ba2395a6a5dc3be371693.jpg',
    images: [
      {
        imageURL400: 'https://digital-assets.tecalliance.services/images/400/db43e6b81241ab09be6ba2395a6a5dc3be371693.jpg',
        imageURL800: 'https://digital-assets.tecalliance.services/images/800/db43e6b81241ab09be6ba2395a6a5dc3be371693.jpg',
        imageURL200: 'https://digital-assets.tecalliance.services/images/200/db43e6b81241ab09be6ba2395a6a5dc3be371693.jpg',
        typeDescription: 'Article Picture',
        headerDescription: 'Product Photo',
      },
    ],
    specs: [
      { label: 'Thread Size', value: 'M12 x 1.25' },
      { label: 'Spanner Size', value: '14 mm' },
      { label: 'Spark Position', value: '5 mm' },
      { label: 'Electrode Gap', value: '1.0 mm' },
    ],
  },
  {
    articleId: 6343,
    articleNo: 'BKR6E-11',
    partNumber: 'BKR6E-11',
    articleName: 'Yellow Line Standard Spark Plug',
    dataSupplierName: 'NGK SPARK PLUG',
    dataSupplierId: 15,
    brand: 'NGK SPARK PLUG',
    imageUrl: 'https://digital-assets.tecalliance.services/images/400/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
    imageURL400: 'https://digital-assets.tecalliance.services/images/400/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
    images: [
      {
        imageURL400: 'https://digital-assets.tecalliance.services/images/400/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
        imageURL800: 'https://digital-assets.tecalliance.services/images/800/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
        imageURL200: 'https://digital-assets.tecalliance.services/images/200/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
        typeDescription: 'Article Picture',
        headerDescription: 'Product Photo',
      },
    ],
    specs: [
      { label: 'Thread Size', value: 'M14 x 1.25' },
      { label: 'Spanner Size', value: '16 mm' },
      { label: 'Spark Position', value: '3 mm' },
      { label: 'Electrode Gap', value: '1.1 mm' },
    ],
  },
  {
    articleId: 96350,
    articleNo: 'OZA659-EE4',
    partNumber: 'OZA659-EE4',
    articleName: 'NTK Lambda Oxygen Sensor',
    dataSupplierName: 'NTK VEHICLE ELECTRONICS',
    dataSupplierId: 5414,
    brand: 'NTK VEHICLE ELECTRONICS',
    imageUrl: 'https://digital-assets.tecalliance.services/images/400/956629741cb981435df21cfe4e8d6bee044bfc29.jpg',
    imageURL400: 'https://digital-assets.tecalliance.services/images/400/956629741cb981435df21cfe4e8d6bee044bfc29.jpg',
    images: [
      {
        imageURL400: 'https://digital-assets.tecalliance.services/images/400/956629741cb981435df21cfe4e8d6bee044bfc29.jpg',
        imageURL800: 'https://digital-assets.tecalliance.services/images/800/956629741cb981435df21cfe4e8d6bee044bfc29.jpg',
        imageURL200: 'https://digital-assets.tecalliance.services/images/200/956629741cb981435df21cfe4e8d6bee044bfc29.jpg',
        typeDescription: 'Article Picture',
        headerDescription: 'Product Photo',
      },
    ],
    specs: [
      { label: 'Sensor Type', value: 'Zirconia Lambda Sensor' },
      { label: 'Number of Poles', value: '4' },
      { label: 'Overall Length', value: '450 mm' },
    ],
  },
  {
    articleId: 91432,
    articleNo: 'Y-534J',
    partNumber: 'Y-534J',
    articleName: 'D-Power Diesel Glow Plug',
    dataSupplierName: 'NGK SPARK PLUG',
    dataSupplierId: 15,
    brand: 'NGK SPARK PLUG',
    imageUrl: 'https://digital-assets.tecalliance.services/images/400/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
    imageURL400: 'https://digital-assets.tecalliance.services/images/400/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
    images: [
      {
        imageURL400: 'https://digital-assets.tecalliance.services/images/400/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
        imageURL800: 'https://digital-assets.tecalliance.services/images/800/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
        imageURL200: 'https://digital-assets.tecalliance.services/images/200/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg',
        typeDescription: 'Article Picture',
        headerDescription: 'Product Photo',
      },
    ],
    specs: [
      { label: 'Voltage', value: '11.0 V' },
      { label: 'Current', value: '4.5 A' },
      { label: 'Cone Pitch', value: '93°' },
    ],
  },
  {
    articleId: 133002,
    articleNo: '133002',
    partNumber: '133002',
    articleName: 'KYB Premium Shock Absorber',
    dataSupplierName: '-KYB',
    dataSupplierId: 7729,
    brand: '-KYB',
    imageUrl: 'https://digital-assets.tecalliance.services/images/400/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
    imageURL400: 'https://digital-assets.tecalliance.services/images/400/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
    images: [
      {
        imageURL400: 'https://digital-assets.tecalliance.services/images/400/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
        imageURL800: 'https://digital-assets.tecalliance.services/images/800/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
        imageURL200: 'https://digital-assets.tecalliance.services/images/200/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
        typeDescription: 'Article Picture',
        headerDescription: 'Product Photo',
      },
    ],
    specs: [
      { label: 'Fitting Position', value: 'Rear Axle both sides' },
      { label: 'Fitting Position', value: 'Front Axle both sides' },
      { label: 'Shock Absorber Type', value: 'Oil Pressure Twin-Tube' },
    ],
  },
  {
    articleId: 333729,
    articleNo: '333729',
    partNumber: '333729',
    articleName: 'KYB Excel-G Gas Shock Absorber',
    dataSupplierName: '-KYB',
    dataSupplierId: 7729,
    brand: '-KYB',
    imageUrl: 'https://digital-assets.tecalliance.services/images/400/a59c5579be1ff74702c8856275255ab592e38e7e.jpg',
    imageURL400: 'https://digital-assets.tecalliance.services/images/400/a59c5579be1ff74702c8856275255ab592e38e7e.jpg',
    images: [
      {
        imageURL400: 'https://digital-assets.tecalliance.services/images/400/a59c5579be1ff74702c8856275255ab592e38e7e.jpg',
        imageURL800: 'https://digital-assets.tecalliance.services/images/800/a59c5579be1ff74702c8856275255ab592e38e7e.jpg',
        imageURL200: 'https://digital-assets.tecalliance.services/images/200/a59c5579be1ff74702c8856275255ab592e38e7e.jpg',
        typeDescription: 'Article Picture',
        headerDescription: 'Product Photo',
      },
    ],
    specs: [
      { label: 'Fitting Position', value: 'Front Axle Right' },
      { label: 'Shock Absorber Type', value: 'Gas Pressure Strut' },
      { label: 'Shock Absorber System', value: 'Twin-Tube' },
    ],
  },
  {
    articleId: 341368,
    articleNo: '341368',
    partNumber: '341368',
    articleName: 'KYB Gas-A-Just Monotube Damper',
    dataSupplierName: '-KYB',
    dataSupplierId: 7729,
    brand: '-KYB',
    imageUrl: 'https://digital-assets.tecalliance.services/images/400/3b0eeeac6b019c38addf282a75335a4a040abe10.jpg',
    imageURL400: 'https://digital-assets.tecalliance.services/images/400/3b0eeeac6b019c38addf282a75335a4a040abe10.jpg',
    images: [
      {
        imageURL400: 'https://digital-assets.tecalliance.services/images/400/3b0eeeac6b019c38addf282a75335a4a040abe10.jpg',
        imageURL800: 'https://digital-assets.tecalliance.services/images/800/3b0eeeac6b019c38addf282a75335a4a040abe10.jpg',
        imageURL200: 'https://digital-assets.tecalliance.services/images/200/3b0eeeac6b019c38addf282a75335a4a040abe10.jpg',
        typeDescription: 'Article Picture',
        headerDescription: 'Product Photo',
      },
    ],
    specs: [
      { label: 'Fitting Position', value: 'Rear Axle' },
      { label: 'Shock Absorber Type', value: 'High-Pressure Monotube' },
    ],
  },
  {
    articleId: 510100,
    articleNo: 'SM5101',
    partNumber: 'SM5101',
    tradeNumbers: ['SM5101'],
    articleName: 'KYB Suspension Strut Mount & Bearing Kit',
    dataSupplierName: '-KYB',
    dataSupplierId: 7729,
    brand: '-KYB',
    imageUrl: 'https://digital-assets.tecalliance.services/images/400/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
    imageURL400: 'https://digital-assets.tecalliance.services/images/400/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
    images: [
      {
        imageURL400: 'https://digital-assets.tecalliance.services/images/400/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
        imageURL800: 'https://digital-assets.tecalliance.services/images/800/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
        imageURL200: 'https://digital-assets.tecalliance.services/images/200/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
        typeDescription: 'Article Picture',
        headerDescription: 'Product Photo',
      },
    ],
    specs: [
      { label: 'Fitting Position', value: 'Front Axle' },
      { label: 'Mounting Type', value: 'Rubber-Metal Strut Mount with Roller Bearing' },
      { label: 'Component Type', value: 'Top Strut Mounting Kit' },
    ],
  },
  {
    articleId: 910002,
    articleNo: '910002',
    partNumber: '910002',
    tradeNumbers: ['910002'],
    articleName: 'KYB Strut Protection Kit (Dust Cover & Bump Stop)',
    dataSupplierName: '-KYB',
    dataSupplierId: 7729,
    brand: '-KYB',
    imageUrl: 'https://digital-assets.tecalliance.services/images/400/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
    imageURL400: 'https://digital-assets.tecalliance.services/images/400/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
    images: [
      {
        imageURL400: 'https://digital-assets.tecalliance.services/images/400/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
        imageURL800: 'https://digital-assets.tecalliance.services/images/800/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
        imageURL200: 'https://digital-assets.tecalliance.services/images/200/286e31509df221742fdb95838b78ec226bfd8efc.jpg',
        typeDescription: 'Article Picture',
        headerDescription: 'Product Photo',
      },
    ],
    specs: [
      { label: 'Fitting Position', value: 'Front Axle both sides' },
      { label: 'Scope of Delivery', value: '2x Dust Cover Bellows, 2x Compression Bump Stops' },
    ],
  },
];

class TecDocService {
  constructor() {
    this.endpoint = TECDOC_CONFIG.ENDPOINT;
    this.providerId = TECDOC_CONFIG.PROVIDER_ID;
    this.defaultCountry = TECDOC_CONFIG.COUNTRY;
    this.defaultLang = TECDOC_CONFIG.LANG;
  }

  /**
   * Helper to execute HTTP POST requests to TecDoc Pegasus 3.0 endpoint
   */
  async execute(payload, apiKey = null) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const effectiveApiKey = apiKey || ENV.TECDOC_API_KEY;
    if (effectiveApiKey) {
      headers['X-Api-Key'] = effectiveApiKey;
    }

    // Auto-inject provider if missing
    if (payload && typeof payload === 'object') {
      Object.keys(payload).forEach((key) => {
        if (payload[key] && typeof payload[key] === 'object' && !payload[key].provider) {
          payload[key].provider = this.providerId;
        }
      });
    }

    try {
      const response = await axios.post(this.endpoint, payload, {
        headers,
        timeout: 20000,
      });

      // If TecAlliance returns 401 unwhitelisted IP status object inside response.data
      if (response.data && response.data.status === 401) {
        console.warn('TecAlliance reported 401 Access not allowed for current outbound IP.');
        return this.handleFallback(payload);
      }

      return response.data;
    } catch (error) {
      console.warn('TecDoc API execution error, falling back to local automotive catalog:', error.message);
      return this.handleFallback(payload);
    }
  }

  /**
   * Seamless offline/fallback provider for unwhitelisted local development IPs
   */
  handleFallback(payload) {
    if (payload.getManufacturers2 || payload.getManufacturers || payload.getLinkageTargets?.includeMfrFacets) {
      const rawType = (
        payload.getLinkageTargets?.linkageTargetType ||
        payload.getManufacturers2?.linkingTargetType ||
        payload.getManufacturers?.linkingTargetType ||
        payload.getManufacturers2?.linkageTargetType ||
        'P'
      ).toUpperCase().trim();
      let mfrs = FALLBACK_MANUFACTURERS;

      if (rawType === 'B' || rawType === 'MOTORCYCLE' || rawType === 'M' || rawType === 'BIKE') {
        mfrs = this.getPopularBrands('M').map((b) => ({
          id: b.manuId || b.id,
          manuId: b.manuId || b.id,
          mfrId: b.manuId || b.id,
          name: b.name || b.manuName,
          manuName: b.name || b.manuName,
          count: 120,
        }));
      } else if (rawType === 'MARINE' || rawType === 'BOAT') {
        mfrs = [
          { id: 11640, manuId: 11640, mfrId: 11640, name: 'YAMAHA MARINE', manuName: 'YAMAHA MARINE', count: 95 },
          { id: 602, manuId: 602, mfrId: 602, name: 'MERCURY MARINE', manuName: 'MERCURY MARINE', count: 85 },
          { id: 450, manuId: 450, mfrId: 450, name: 'HONDA MARINE', manuName: 'HONDA MARINE', count: 70 },
          { id: 1090, manuId: 1090, mfrId: 1090, name: 'SUZUKI MARINE', manuName: 'SUZUKI MARINE', count: 65 },
          { id: 1200, manuId: 1200, mfrId: 1200, name: 'VOLVO PENTA', manuName: 'VOLVO PENTA', count: 60 },
          { id: 603, manuId: 603, mfrId: 603, name: 'YANMAR', manuName: 'YANMAR', count: 50 },
          { id: 5740, manuId: 5740, mfrId: 5740, name: 'KAWASAKI WATERCRAFT', manuName: 'KAWASAKI WATERCRAFT', count: 45 },
          { id: 604, manuId: 604, mfrId: 604, name: 'TOHATSU', manuName: 'TOHATSU', count: 40 },
          { id: 605, manuId: 605, mfrId: 605, name: 'EVINRUDE / JOHNSON', manuName: 'EVINRUDE / JOHNSON', count: 35 },
          { id: 607, manuId: 607, mfrId: 607, name: 'CUMMINS MARINE', manuName: 'CUMMINS MARINE', count: 30 },
        ];
      } else if (rawType === 'O' || rawType === 'COMMERCIAL') {
        mfrs = this.getPopularBrands('O').map((b) => ({
          id: b.manuId || b.id,
          manuId: b.manuId || b.id,
          mfrId: b.manuId || b.id,
          name: b.name || b.manuName,
          manuName: b.name || b.manuName,
          count: 150,
        }));
      } else if (rawType === 'L' || rawType === 'LIGHTCOMMERCIAL' || rawType === 'LCV' || rawType === 'LAN') {
        mfrs = [
          { id: 111, manuId: 111, mfrId: 111, name: 'TOYOTA', manuName: 'TOYOTA', count: 480 },
          { id: 36, manuId: 36, mfrId: 36, name: 'FORD', manuName: 'FORD', count: 320 },
          { id: 54, manuId: 54, mfrId: 54, name: 'ISUZU', manuName: 'ISUZU', count: 290 },
          { id: 121, manuId: 121, mfrId: 121, name: 'VOLKSWAGEN', manuName: 'VOLKSWAGEN', count: 260 },
          { id: 80, manuId: 80, mfrId: 80, name: 'NISSAN', manuName: 'NISSAN', count: 210 },
          { id: 74, manuId: 74, mfrId: 74, name: 'MERCEDES-BENZ', manuName: 'MERCEDES-BENZ', count: 190 },
          { id: 183, manuId: 183, mfrId: 183, name: 'HYUNDAI', manuName: 'HYUNDAI', count: 160 },
          { id: 93, manuId: 93, mfrId: 93, name: 'RENAULT', manuName: 'RENAULT', count: 110 },
        ];
      } else if (rawType === 'T' || rawType === 'TRACTOR' || rawType === 'AGRICULTURAL') {
        mfrs = [
          { id: 301, manuId: 301, mfrId: 301, name: 'JOHN DEERE', manuName: 'JOHN DEERE', count: 220 },
          { id: 302, manuId: 302, mfrId: 302, name: 'MASSEY FERGUSON', manuName: 'MASSEY FERGUSON', count: 180 },
          { id: 303, manuId: 303, mfrId: 303, name: 'NEW HOLLAND', manuName: 'NEW HOLLAND', count: 160 },
          { id: 304, manuId: 304, mfrId: 304, name: 'CASE IH', manuName: 'CASE IH', count: 140 },
          { id: 305, manuId: 305, mfrId: 305, name: 'KUBOTA', manuName: 'KUBOTA', count: 130 },
          { id: 306, manuId: 306, mfrId: 306, name: 'DEUTZ-FAHR', manuName: 'DEUTZ-FAHR', count: 95 },
          { id: 307, manuId: 307, mfrId: 307, name: 'CLAAS', manuName: 'CLAAS', count: 85 },
        ];
      }

      return {
        data: { array: mfrs },
        mfrFacets: { counts: mfrs },
        status: 200,
      };
    }

    if (payload.getModelSeries2 || payload.getModelSeries || payload.getLinkageTargets?.includeVehicleModelSeriesFacets) {
      const mfrId = Number(
        payload.getModelSeries2?.manuId ||
        payload.getModelSeries?.manuId ||
        payload.getModelSeries2?.mfrId ||
        payload.getModelSeries?.mfrId ||
        (Array.isArray(payload.getLinkageTargets?.mfrIds) ? payload.getLinkageTargets.mfrIds[0] : payload.getLinkageTargets?.mfrIds) ||
        111
      );
      const rawType = (
        payload.getModelSeries2?.linkingTargetType ||
        payload.getModelSeries?.linkingTargetType ||
        payload.getLinkageTargets?.linkageTargetType ||
        'P'
      ).toUpperCase().trim();

      let list = FALLBACK_SERIES[mfrId];

      if (rawType === 'MARINE' || rawType === 'BOAT') {
        if (mfrId == 1164 || mfrId == 11640) {
          list = [
            { id: 116401, modelId: 116401, name: 'F350 / F300 V8 Offshore Outboards', modelname: 'F350 / F300 V8 Offshore Outboards', count: 35 },
            { id: 116402, modelId: 116402, name: 'F200 / F150 In-Line 4 4-Stroke', modelname: 'F200 / F150 In-Line 4 4-Stroke', count: 30 },
            { id: 116403, modelId: 116403, name: 'WaveRunner FX SVHO / GP1800R PWC', modelname: 'WaveRunner FX SVHO / GP1800R PWC', count: 28 },
            { id: 116404, modelId: 116404, name: 'VMAX SHO 250 / 200 High Output', modelname: 'VMAX SHO 250 / 200 High Output', count: 25 },
          ];
        } else if (mfrId == 45 || mfrId == 450) {
          list = [
            { id: 45001, modelId: 45001, name: 'BF 250 / BF 225 V6 4-Stroke Outboard', modelname: 'BF 250 / BF 225 V6 4-Stroke Outboard', count: 28 },
            { id: 45002, modelId: 45002, name: 'BF 150 / BF 135 In-Line 4 Outboard', modelname: 'BF 150 / BF 135 In-Line 4 Outboard', count: 24 },
            { id: 45003, modelId: 45003, name: 'BF 90 / BF 75 Mid-Range Outboard', modelname: 'BF 90 / BF 75 Mid-Range Outboard', count: 20 },
          ];
        } else if (mfrId == 109 || mfrId == 1090) {
          list = [
            { id: 10901, modelId: 10901, name: 'DF350A / DF300B Dual-Prop Outboard', modelname: 'DF350A / DF300B Dual-Prop Outboard', count: 30 },
            { id: 10902, modelId: 10902, name: 'DF200A / DF175A 4-Cylinder Outboard', modelname: 'DF200A / DF175A 4-Cylinder Outboard', count: 26 },
            { id: 10903, modelId: 10903, name: 'DF140A / DF115A Lean Burn Series', modelname: 'DF140A / DF115A Lean Burn Series', count: 22 },
          ];
        } else {
          list = FALLBACK_SERIES[mfrId] || FALLBACK_SERIES[602];
        }
      } else if (!list) {
        if (rawType === 'B' || rawType === 'M' || rawType === 'MOTORCYCLE') list = FALLBACK_SERIES[1164];
        else if (rawType === 'O') list = FALLBACK_SERIES[120];
        else if (rawType === 'T') list = FALLBACK_SERIES[301];
        else list = FALLBACK_SERIES[111];
      }

      const normalizedList = (list || []).map((s) => ({
        ...s,
        id: s.id || s.modelId,
        modelId: s.id || s.modelId,
        seriesId: s.id || s.modelId,
        vehicleModelSeriesId: s.id || s.modelId,
        name: s.name || s.modelname,
        modelname: s.name || s.modelname,
        modelName: s.name || s.modelname,
        seriesName: s.name || s.modelname,
        linkingTargetType: rawType,
        linkageTargetType: rawType,
      }));

      return {
        data: { array: normalizedList },
        vehicleModelSeriesFacets: { counts: normalizedList },
        status: 200,
      };
    }

    if (payload.getLinkageTargets && !payload.getLinkageTargets.includeMfrFacets && !payload.getLinkageTargets.includeVehicleModelSeriesFacets) {
      const rawType = (payload.getLinkageTargets.linkageTargetType || 'P').toUpperCase().trim();
      const mfrId = Number(
        Array.isArray(payload.getLinkageTargets.mfrIds)
          ? payload.getLinkageTargets.mfrIds[0]
          : payload.getLinkageTargets.mfrIds || 111
      );
      const seriesId = Number(
        Array.isArray(payload.getLinkageTargets.vehicleModelSeriesIds)
          ? payload.getLinkageTargets.vehicleModelSeriesIds[0]
          : payload.getLinkageTargets.vehicleModelSeriesIds || payload.getLinkageTargets.vehicleModelSeriesId || 0
      );

      let variants = FALLBACK_VEHICLES_BY_SERIES[seriesId];
      if (!variants || variants.length === 0) {
        let sName = 'Standard Trim';
        const sList = FALLBACK_SERIES[mfrId] || [];
        const found = sList.find((x) => (x.id || x.modelId) === seriesId);
        if (found) sName = found.name || found.modelname;

        variants = [
          {
            id: Number(`${seriesId || 100}01`),
            carId: Number(`${seriesId || 100}01`),
            linkageTargetId: Number(`${seriesId || 100}01`),
            linkageTargetType: rawType,
            typeName: `${sName} 2.0L Turbo (140kW / 190HP)`,
            modelName: sName,
            manuName: 'OEM',
            yearOfConstrFrom: '2020',
            powerHpFrom: '190',
            powerKwFrom: '140',
            cylinderCapacityCcm: 1984,
          },
          {
            id: Number(`${seriesId || 100}02`),
            carId: Number(`${seriesId || 100}02`),
            linkageTargetId: Number(`${seriesId || 100}02`),
            linkageTargetType: rawType,
            typeName: `${sName} 2.0L TDI / Eco (110kW / 150HP)`,
            modelName: sName,
            manuName: 'OEM',
            yearOfConstrFrom: '2019',
            powerHpFrom: '150',
            powerKwFrom: '110',
            cylinderCapacityCcm: 1968,
          },
        ];
      }

      return {
        data: { array: variants },
        linkageTargets: variants,
        status: 200,
      };
    }

    if (payload.getArticles || payload.getArticles2) {
      const rawQuery = (payload.getArticles?.searchQuery || payload.getArticles2?.searchQuery || '').trim();
      const normQ = rawQuery.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const suppliers = payload.getArticles?.dataSupplierIds || payload.getArticles2?.dataSupplierIds || [];
      let pool = FALLBACK_ARTICLES;

      if (suppliers.includes(7729)) {
        pool = FALLBACK_ARTICLES.filter((a) => (a.brand || '').toUpperCase().includes('KYB') || Number(a.dataSupplierId) === 7729);
      } else if (suppliers.includes(15) || suppliers.includes(5414)) {
        pool = FALLBACK_ARTICLES.filter((a) => !(a.brand || '').toUpperCase().includes('KYB'));
      }

      let matches = [];
      if (normQ) {
        matches = pool.filter((a) => {
          const no = (a.articleNo || a.partNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
          const name = (a.articleName || '').toUpperCase();
          const tradeNos = (a.tradeNumbers || []).map((t) => String(t).toUpperCase().replace(/[^A-Z0-9]/g, ''));
          return (
            no.includes(normQ) ||
            normQ.includes(no) ||
            tradeNos.some((t) => t.includes(normQ) || normQ.includes(t)) ||
            name.includes(rawQuery.toUpperCase())
          );
        });
      } else {
        matches = pool;
      }
      return {
        data: { array: matches },
        articles: matches,
        status: 200,
      };
    }

    if (payload.getBrands) {
      return {
        data: {
          array: [
            { brandId: 15, dataSupplierId: 15, brandName: 'NGK', dataSupplierName: 'NGK SPARK PLUG' },
            { brandId: 5414, dataSupplierId: 5414, brandName: 'NTK', dataSupplierName: 'NTK VEHICLE ELECTRONICS' },
            { brandId: 7729, dataSupplierId: 7729, brandName: '-KYB', dataSupplierName: 'KYB' },
          ],
        },
        status: 200,
      };
    }

    return { data: { array: [] }, status: 200 };
  }

  /**
   * 1. Get Vehicle Manufacturers (Pegasus 3.0 getLinkageTargets with fallback)
   */
  async getManufacturers(type = 'P', country = this.defaultCountry, lang = this.defaultLang) {
    const rawType = (type || 'P').toUpperCase().trim();
    let targetType = rawType;
    if (rawType === 'MOTORCYCLE' || rawType === 'BIKE') targetType = 'B';
    else if (rawType === 'COMMERCIAL') targetType = 'O';
    else if (rawType === 'LIGHTCOMMERCIAL' || rawType === 'LCV') targetType = 'L';
    else if (rawType === 'TRACTOR' || rawType === 'AGRICULTURAL') targetType = 'T';
    else if (rawType === 'MARINE') targetType = 'M';
    else if (rawType === 'PASSENGER') targetType = 'P';

    const cacheKey = `mfrs_${targetType}_${country}_${lang}`;
    const cached = memoryCache.get(cacheKey);
    if (cached) return cached;

    const payloadPegasus = {
      getLinkageTargets: {
        provider: this.providerId,
        linkageTargetCountry: country,
        lang: lang,
        linkageTargetType: targetType,
        includeMfrFacets: true,
        perPage: 0,
        page: 1,
      },
    };

    let data = await this.execute(payloadPegasus);
    let mfrCounts = data?.mfrFacets?.counts || data?.data?.array;

    // Fallbacks if Pegasus returns 0 records for specific categories
    if (!mfrCounts || mfrCounts.length === 0) {
      if (targetType === 'B') {
        const bikeBrands = this.getPopularBrands('M');
        mfrCounts = bikeBrands.map((b) => ({
          id: b.manuId || b.id,
          manuId: b.manuId || b.id,
          name: b.name || b.manuName,
          manuName: b.name || b.manuName,
          count: 120,
        }));
      } else if (targetType === 'M') {
        mfrCounts = [
          { id: 1164, manuId: 1164, name: 'YAMAHA MARINE', manuName: 'YAMAHA MARINE', count: 95 },
          { id: 602, manuId: 602, name: 'MERCURY MARINE', manuName: 'MERCURY MARINE', count: 85 },
          { id: 45, manuId: 45, name: 'HONDA MARINE', manuName: 'HONDA MARINE', count: 70 },
          { id: 109, manuId: 109, name: 'SUZUKI MARINE', manuName: 'SUZUKI MARINE', count: 65 },
          { id: 120, manuId: 120, name: 'VOLVO PENTA', manuName: 'VOLVO PENTA', count: 60 },
          { id: 603, manuId: 603, name: 'YANMAR', manuName: 'YANMAR', count: 50 },
          { id: 574, manuId: 574, name: 'KAWASAKI WATERCRAFT', manuName: 'KAWASAKI WATERCRAFT', count: 45 },
          { id: 604, manuId: 604, name: 'TOHATSU', manuName: 'TOHATSU', count: 40 },
          { id: 605, manuId: 605, name: 'EVINRUDE / JOHNSON', manuName: 'EVINRUDE / JOHNSON', count: 35 },
          { id: 607, manuId: 607, name: 'CUMMINS MARINE', manuName: 'CUMMINS MARINE', count: 30 },
        ];
      } else if (targetType === 'O') {
        const commBrands = this.getPopularBrands('O');
        mfrCounts = commBrands.map((b) => ({
          id: b.manuId || b.id,
          manuId: b.manuId || b.id,
          name: b.name || b.manuName,
          manuName: b.name || b.manuName,
          count: 150,
        }));
      } else if (targetType === 'L') {
        mfrCounts = [
          { id: 111, manuId: 111, name: 'TOYOTA', manuName: 'TOYOTA', count: 480 },
          { id: 36, manuId: 36, name: 'FORD', manuName: 'FORD', count: 320 },
          { id: 54, manuId: 54, name: 'ISUZU', manuName: 'ISUZU', count: 290 },
          { id: 121, manuId: 121, name: 'VOLKSWAGEN', manuName: 'VOLKSWAGEN', count: 260 },
          { id: 80, manuId: 80, name: 'NISSAN', manuName: 'NISSAN', count: 210 },
          { id: 74, manuId: 74, name: 'MERCEDES-BENZ', manuName: 'MERCEDES-BENZ', count: 190 },
          { id: 183, manuId: 183, name: 'HYUNDAI', manuName: 'HYUNDAI', count: 160 },
          { id: 93, manuId: 93, name: 'RENAULT', manuName: 'RENAULT', count: 110 },
        ];
      } else if (targetType === 'T') {
        mfrCounts = [
          { id: 301, manuId: 301, name: 'JOHN DEERE', manuName: 'JOHN DEERE', count: 220 },
          { id: 302, manuId: 302, name: 'MASSEY FERGUSON', manuName: 'MASSEY FERGUSON', count: 180 },
          { id: 303, manuId: 303, name: 'NEW HOLLAND', manuName: 'NEW HOLLAND', count: 160 },
          { id: 304, manuId: 304, name: 'CASE IH', manuName: 'CASE IH', count: 140 },
          { id: 305, manuId: 305, name: 'KUBOTA', manuName: 'KUBOTA', count: 130 },
          { id: 306, manuId: 306, name: 'DEUTZ-FAHR', manuName: 'DEUTZ-FAHR', count: 95 },
          { id: 307, manuId: 307, name: 'CLAAS', manuName: 'CLAAS', count: 85 },
        ];
      } else {
        mfrCounts = FALLBACK_MANUFACTURERS;
      }
    }

    const formatted = mfrCounts.map((m) => ({
      id: m.id || m.manuId,
      manuId: m.id || m.manuId,
      name: m.name || m.manuName,
      manuName: m.name || m.manuName,
      count: m.count || 100,
    }));

    memoryCache.set(cacheKey, formatted, 86400);
    return formatted;
  }

  /**
   * 2. Get Model Series for a Manufacturer (Pegasus 3.0)
   */
  async getModelSeries(mfrId, type = 'P', country = this.defaultCountry, lang = this.defaultLang) {
    const cacheKey = `series_${mfrId}_${type}_${country}_${lang}`;
    const cached = memoryCache.get(cacheKey);
    if (cached) return cached;

    const isCommercial = type === 'O' || type === 'COMMERCIAL';
    let seriesCounts = [];

    if (isCommercial) {
      // Query heavy commercial trucks (O) and light commercial vans/bakkies (P)
      const [resO, resP] = await Promise.all([
        this.execute({
          getLinkageTargets: {
            provider: this.providerId,
            linkageTargetCountry: country,
            lang: lang,
            linkageTargetType: 'O',
            mfrIds: [parseInt(mfrId, 10)],
            includeVehicleModelSeriesFacets: true,
            perPage: 0,
            page: 1,
          },
        }),
        this.execute({
          getLinkageTargets: {
            provider: this.providerId,
            linkageTargetCountry: country,
            lang: lang,
            linkageTargetType: 'P',
            mfrIds: [parseInt(mfrId, 10)],
            includeVehicleModelSeriesFacets: true,
            perPage: 0,
            page: 1,
          },
        }),
      ]);

      const listO = (resO?.vehicleModelSeriesFacets?.counts || resO?.data?.array || []).map((s) => ({
        ...s,
        linkingTargetType: 'O',
      }));

      const commRegex =
        /\b(SPRINTER|VITO|VIANO|CITAN|VARIO|HILUX|HIACE|QUANTUM|DYNA|PROBOX|D-MAX|KB|RANGER|TRANSIT|BANTAM|COURIER|AMAROK|CADDY|TRANSPORTER|CRAFTER|CARAVELLE|MULTIVAN|H-100|H-1|PORTER|STAREX|NAVARA|HARDBODY|NP200|NP300|1400 BAKKIE|NV200|NV350|CABSTAR)\b/i;

      const listP = (resP?.vehicleModelSeriesFacets?.counts || resP?.data?.array || [])
        .filter((s) => commRegex.test(s.name || s.modelname || ''))
        .map((s) => ({ ...s, linkingTargetType: 'P' }));

      const seen = new Set();
      for (const s of [...listP, ...listO]) {
        const sId = s.id || s.modelId;
        if (sId && !seen.has(sId)) {
          seen.add(sId);
          seriesCounts.push(s);
        }
      }

      if (seriesCounts.length === 0) {
        seriesCounts = FALLBACK_SERIES[mfrId] || FALLBACK_SERIES[120] || FALLBACK_SERIES[54] || FALLBACK_SERIES[111];
      }
    } else {
      const payloadPegasus = {
        getLinkageTargets: {
          provider: this.providerId,
          linkageTargetCountry: country,
          lang: lang,
          linkageTargetType: type,
          mfrIds: [parseInt(mfrId, 10)],
          includeVehicleModelSeriesFacets: true,
          perPage: 0,
          page: 1,
        },
      };
      const data = await this.execute(payloadPegasus);
      const rawFacets = data?.vehicleModelSeriesFacets?.counts || data?.data?.array;
      if (Array.isArray(rawFacets) && rawFacets.length > 0) {
        seriesCounts = rawFacets;
      } else {
        const rawType = (type || 'P').toUpperCase().trim();
        let defFallback = FALLBACK_SERIES[111];
        if (rawType === 'B') defFallback = FALLBACK_SERIES[1164];
        else if (rawType === 'M') defFallback = FALLBACK_SERIES[602];
        else if (rawType === 'O') defFallback = FALLBACK_SERIES[120];
        else if (rawType === 'T') defFallback = FALLBACK_SERIES[301];
        else if (rawType === 'L') defFallback = FALLBACK_SERIES[111];

        if (rawType === 'M') {
          if (mfrId == 1164) {
            seriesCounts = [
              { id: 116401, modelId: 116401, name: 'F350 / F300 V8 Offshore Outboards', modelname: 'F350 / F300 V8 Offshore Outboards', count: 35 },
              { id: 116402, modelId: 116402, name: 'F200 / F150 In-Line 4 4-Stroke', modelname: 'F200 / F150 In-Line 4 4-Stroke', count: 30 },
              { id: 116403, modelId: 116403, name: 'WaveRunner FX SVHO / GP1800R PWC', modelname: 'WaveRunner FX SVHO / GP1800R PWC', count: 28 },
              { id: 116404, modelId: 116404, name: 'VMAX SHO 250 / 200 High Output', modelname: 'VMAX SHO 250 / 200 High Output', count: 25 },
            ];
          } else if (mfrId == 45) {
            seriesCounts = [
              { id: 45001, modelId: 45001, name: 'BF 250 / BF 225 V6 4-Stroke Outboard', modelname: 'BF 250 / BF 225 V6 4-Stroke Outboard', count: 28 },
              { id: 45002, modelId: 45002, name: 'BF 150 / BF 135 In-Line 4 Outboard', modelname: 'BF 150 / BF 135 In-Line 4 Outboard', count: 24 },
              { id: 45003, modelId: 45003, name: 'BF 90 / BF 75 Mid-Range Outboard', modelname: 'BF 90 / BF 75 Mid-Range Outboard', count: 20 },
            ];
          } else if (mfrId == 109) {
            seriesCounts = [
              { id: 10901, modelId: 10901, name: 'DF350A / DF300B Dual-Prop Outboard', modelname: 'DF350A / DF300B Dual-Prop Outboard', count: 30 },
              { id: 10902, modelId: 10902, name: 'DF200A / DF175A 4-Cylinder Outboard', modelname: 'DF200A / DF175A 4-Cylinder Outboard', count: 26 },
              { id: 10903, modelId: 10903, name: 'DF140A / DF115A Lean Burn Series', modelname: 'DF140A / DF115A Lean Burn Series', count: 22 },
            ];
          } else {
            seriesCounts = FALLBACK_SERIES[mfrId] || defFallback;
          }
        } else {
          seriesCounts = FALLBACK_SERIES[mfrId] || defFallback;
        }
      }
    }

    const popPrefix =
      /^(FH|FM|FL|FE|FMX|9400|B12|B9|B7|ACTROS|ATEGO|AXOR|AROCS|SPRINTER|VITO|VIANO|CITAN|D-MAX|KB|N-SERIES|F-SERIES|NPR|NQR|NHR|NMR|FRR|FTR|FVR|R|G|P|S|TGX|TGS|TGM|TGL|CLA|TGE|XF|CF|LF|300|500|700|DAILY|EUROCARGO|STRALIS|TRAKKER|S-WAY|HILUX|QUANTUM|HIACE|DYNA|LAND CRUISER|HINO|RANGER|TRANSIT|CUSTOM|CARGO|AMAROK|CADDY|TRANSPORTER|CRAFTER)/i;

    const formatted = (seriesCounts || []).map((s) => ({
      id: s.id || s.modelId,
      modelId: s.id || s.modelId,
      name: s.name || s.modelname,
      modelname: s.name || s.modelname,
      linkingTargetType: s.linkingTargetType || type,
      count: s.count || 20,
    }));

    if (isCommercial) {
      formatted.sort((a, b) => {
        const aPop = popPrefix.test(a.name || '') ? 0 : 1;
        const bPop = popPrefix.test(b.name || '') ? 0 : 1;
        if (aPop !== bPop) return aPop - bPop;
        return (a.name || '').localeCompare(b.name || '');
      });
    }

    memoryCache.set(cacheKey, formatted, 86400);
    return formatted;
  }

  /**
   * 3. Get Vehicle Variants / Models for Series (Pegasus 3.0)
   */
  async getVehicles(mfrId, seriesId, type = 'P', country = this.defaultCountry, lang = this.defaultLang) {
    const cacheKey = `vehicles_${mfrId}_${seriesId}_${type}_${country}_${lang}`;
    const cached = memoryCache.get(cacheKey);
    if (cached) return cached;

    const payloadPegasus = {
      getLinkageTargets: {
        provider: this.providerId,
        linkageTargetCountry: country,
        lang: lang,
        linkageTargetType: type,
        mfrIds: [parseInt(mfrId, 10)],
        vehicleModelSeriesIds: [parseInt(seriesId, 10)],
        includeAll: true,
        perPage: 100,
        page: 1,
      },
    };

    const data = await this.execute(payloadPegasus);
    const targets = data?.linkageTargets || data?.data?.array || [];

    if (targets.length > 0) {
      const formatted = targets.map((v) => ({
        id: v.linkageTargetId || v.carId || v.id,
        carId: v.linkageTargetId || v.carId || v.id,
        linkageTargetId: v.linkageTargetId || v.carId,
        linkageTargetType: v.linkageTargetType || type || 'P',
        typeName: v.description || v.typeName || v.linkageTargetType || 'Standard Engine',
        modelName: v.vehicleModelSeriesName || v.modelName || 'Model Variant',
        manuName: v.mfrName || v.manuName || 'Manufacturer',
        constructionType: v.constructionType,
        yearOfConstrFrom: v.beginYearMonth || v.yearOfConstrFrom,
        yearOfConstrTo: v.endYearMonth || v.yearOfConstrTo,
        powerHpFrom: v.hp || v.powerHpFrom,
        powerKwFrom: v.kw || v.powerKwFrom,
        cylinderCapacityCcm: v.ccm || v.cylinderCapacityCcm,
        raw: v,
      }));
      memoryCache.set(cacheKey, formatted, 86400);
      return formatted;
    }

    const sid = Number(seriesId);
    if (FALLBACK_VEHICLES_BY_SERIES[sid]) {
      const formatted = FALLBACK_VEHICLES_BY_SERIES[sid];
      memoryCache.set(cacheKey, formatted, 86400);
      return formatted;
    }

    const sList = FALLBACK_SERIES[Number(mfrId)] || [];
    const foundSeries = sList.find((x) => (x.id || x.modelId) === sid);
    const seriesName = foundSeries ? (foundSeries.name || foundSeries.modelname) : 'Standard Trim';

    const fallbackGenerated = [
      {
        id: Number(`${sid || 100}01`),
        carId: Number(`${sid || 100}01`),
        linkageTargetId: Number(`${sid || 100}01`),
        linkageTargetType: type || 'P',
        typeName: `${seriesName} 2.0L Turbo (140kW / 190HP)`,
        modelName: seriesName,
        manuName: 'OEM',
        yearOfConstrFrom: '2020',
        powerHpFrom: '190',
        powerKwFrom: '140',
        cylinderCapacityCcm: 1984,
      },
      {
        id: Number(`${sid || 100}02`),
        carId: Number(`${sid || 100}02`),
        linkageTargetId: Number(`${sid || 100}02`),
        linkageTargetType: type || 'P',
        typeName: `${seriesName} 2.0L TDI / Eco (110kW / 150HP)`,
        modelName: seriesName,
        manuName: 'OEM',
        yearOfConstrFrom: '2019',
        powerHpFrom: '150',
        powerKwFrom: '110',
        cylinderCapacityCcm: 1968,
      },
    ];
    memoryCache.set(cacheKey, fallbackGenerated, 86400);
    return fallbackGenerated;
  }

  /**
   * 4. Get Verified Parts / Articles for a Vehicle
   */
  async getArticlesByVehicle(vehicleId, type = 'P', country = this.defaultCountry, lang = this.defaultLang, brand = null) {
    const normBrand = (brand || '').toLowerCase().trim();
    // In TecDoc supplier catalog for ZA (NGK/NTK/KYB), articles are linked to linkage targets
    // as type 'P' (and 'V'). Type 'O' queries return 0 articles from TecDoc.
    const primaryType = (type === 'O' || type === 'C') ? 'P' : (type || 'P');
    const payload = {
      getArticles: {
        provider: this.providerId,
        articleCountry: country,
        lang: lang,
        linkageTargetId: parseInt(vehicleId, 10),
        linkageTargetType: primaryType,
        includeAll: true,
        includeImages: true,
        includePDFs: true,
        includeGenericArticleFacets: true,
      },
    };

    if (normBrand === 'kyb') {
      payload.getArticles.dataSupplierIds = [7729];
    } else if (normBrand === 'ngk' || normBrand === 'ntk') {
      payload.getArticles.dataSupplierIds = [15, 5414];
    }

    let data = await this.execute(payload);
    let articles = data?.articles || data?.data?.array;

    // If initial query returned empty, try fallback target types ('L', 'P', 'V', 'O', 'C', or original type)
    if (!articles || articles.length === 0) {
      for (const altType of ['L', 'P', 'V', 'O', 'C', type]) {
        if (altType === primaryType) continue;
        payload.getArticles.linkageTargetType = altType;
        const altData = await this.execute(payload);
        if (altData?.articles?.length > 0) {
          articles = altData.articles;
          break;
        }
      }
    }

    // Special handling for KYB: since KYB supplier in ZA has OE cross references without direct vehicle linkage targets,
    // if brand is KYB and 0 articles returned, fetch verified KYB suspension items
    if (normBrand === 'kyb') {
      if (!articles || articles.length === 0) {
        const kybPayload = {
          getArticles: {
            provider: this.providerId,
            articleCountry: country,
            lang: lang,
            dataSupplierIds: [7729],
            perPage: 24,
            page: 1,
            includeAll: true,
          },
        };
        const kybData = await this.execute(kybPayload);
        if (kybData?.articles?.length > 0) {
          articles = kybData.articles;
        }
      }

      // Ensure catalog has coverage across all suspension categories (Shocks, Struts, Springs, Mounts)
      const existing = articles || [];
      const hasSprings = existing.some((a) => (a.title || a.articleName || '').toLowerCase().includes('spring'));
      const hasMounts = existing.some((a) => {
        const t = (a.title || a.articleName || '').toLowerCase();
        return t.includes('mount') || t.includes('kit') || t.includes('bearing') || t.includes('bellow');
      });
      const kybExtra = FALLBACK_ARTICLES.filter(
        (a) =>
          (a.brand || '').includes('KYB') &&
          ((!hasSprings && a.articleNo === 'RA1829') || (!hasMounts && (a.articleNo === 'SM5101' || a.articleNo === '910002')))
      );
      if (kybExtra.length > 0) {
        articles = [...existing, ...kybExtra];
      }
    }

    let finalArticles = articles || FALLBACK_ARTICLES;

    // Strict brand isolation filter
    if (normBrand === 'kyb') {
      finalArticles = finalArticles.filter((a) => {
        const b = (a.mfrName || a.brand || a.brandName || a.dataSupplierName || '').toUpperCase();
        return b.includes('KYB') || Number(a.dataSupplierId) === 7729;
      });
      if (finalArticles.length === 0) {
        finalArticles = FALLBACK_ARTICLES.filter((a) => (a.brand || '').toUpperCase().includes('KYB'));
      }
    } else if (normBrand === 'ngk' || normBrand === 'ntk') {
      finalArticles = finalArticles.filter((a) => {
        const b = (a.mfrName || a.brand || a.brandName || a.dataSupplierName || '').toUpperCase();
        return (b.includes('NGK') || b.includes('NTK') || Number(a.dataSupplierId) === 15 || Number(a.dataSupplierId) === 5414) && !b.includes('KYB');
      });
    }

    return this.sanitizeArticles(finalArticles);
  }

  /**
   * 5. Get Articles by Part Number Query
   */
  async getArticlesByPartNumber(searchQuery, country = this.defaultCountry, lang = this.defaultLang, brand = null) {
    let resolvedCountry = country;
    let resolvedLang = lang;
    let resolvedBrand = brand;

    if (['ngk', 'kyb', 'ntk'].includes((country || '').toLowerCase())) {
      resolvedBrand = country;
      resolvedCountry = this.defaultCountry;
    }

    const normBrand = (resolvedBrand || '').toLowerCase().trim();
    const cleanSearch = (searchQuery || '').trim();
    const payload = {
      getArticles: {
        provider: this.providerId,
        articleCountry: resolvedCountry,
        lang: resolvedLang,
        searchQuery: cleanSearch,
        searchType: 10,
        includeAll: true,
        includeImages: true,
        includePDFs: true,
      },
    };

    if (normBrand === 'kyb') {
      payload.getArticles.dataSupplierIds = [7729];
    } else if (normBrand === 'ngk' || normBrand === 'ntk') {
      payload.getArticles.dataSupplierIds = [15, 5414];
    }

    const data = await this.execute(payload);
    let articles = data?.articles || data?.data?.array || data?.getArticles?.array || [];

    if (!articles || articles.length === 0) {
      const normQ = cleanSearch.toUpperCase().replace(/[^A-Z0-9]/g, '');
      let pool = FALLBACK_ARTICLES;
      if (normBrand === 'kyb') {
        pool = FALLBACK_ARTICLES.filter((a) => (a.brand || a.brandName || '').toUpperCase().includes('KYB') || Number(a.dataSupplierId) === 7729);
      } else if (normBrand === 'ngk' || normBrand === 'ntk') {
        pool = FALLBACK_ARTICLES.filter((a) => !(a.brand || a.brandName || '').toUpperCase().includes('KYB'));
      }

      if (normQ) {
        articles = pool.filter((a) => {
          const no = (a.articleNo || a.partNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
          const name = (a.articleName || '').toUpperCase();
          const tradeNos = (a.tradeNumbers || []).map((t) => String(t).toUpperCase().replace(/[^A-Z0-9]/g, ''));
          return (
            no.includes(normQ) ||
            normQ.includes(no) ||
            tradeNos.some((t) => t.includes(normQ) || normQ.includes(t)) ||
            name.includes(cleanSearch.toUpperCase())
          );
        });
      } else {
        articles = pool;
      }
    }

    // Strict brand isolation filter
    if (normBrand === 'kyb') {
      articles = articles.filter((a) => {
        const b = (a.mfrName || a.brand || a.brandName || a.dataSupplierName || '').toUpperCase();
        return b.includes('KYB') || Number(a.dataSupplierId) === 7729;
      });
    } else if (normBrand === 'ngk' || normBrand === 'ntk') {
      articles = articles.filter((a) => {
        const b = (a.mfrName || a.brand || a.brandName || a.dataSupplierName || '').toUpperCase();
        return (b.includes('NGK') || b.includes('NTK') || Number(a.dataSupplierId) === 15 || Number(a.dataSupplierId) === 5414) && !b.includes('KYB');
      });
    }

    return this.sanitizeArticles(articles);
  }

  /**
   * 6. Get Product / Supplier Brands & Logos (getBrands)
   */
  async getBrands(country = this.defaultCountry, lang = this.defaultLang, brand = null) {
    let resolvedCountry = country;
    let resolvedLang = lang;
    let resolvedBrand = brand;

    if (['ngk', 'kyb', 'ntk'].includes((country || '').toLowerCase())) {
      resolvedBrand = country;
      resolvedCountry = this.defaultCountry;
    }

    const normBrand = (resolvedBrand || '').toLowerCase().trim();
    const cacheKey = `brands_${resolvedCountry}_${resolvedLang}`;
    let brands = memoryCache.get(cacheKey);

    if (!brands) {
      const payload = {
        getBrands: {
          provider: this.providerId,
          articleCountry: resolvedCountry,
          lang: resolvedLang,
          includeAll: true,
          includeDataSupplierLogo: true,
          includeAddressDetails: true,
        },
      };

      const data = await this.execute(payload);
      brands = data?.data?.array || data?.brands || [
        { brandId: 15, dataSupplierId: 15, brandName: 'NGK SPARK PLUG', dataSupplierName: 'NGK SPARK PLUG' },
        { brandId: 5414, dataSupplierId: 5414, brandName: 'NTK VEHICLE ELECTRONICS', dataSupplierName: 'NTK VEHICLE ELECTRONICS' },
        { brandId: 7729, dataSupplierId: 7729, brandName: '-KYB', dataSupplierName: 'KYB' },
      ];
      memoryCache.set(cacheKey, brands, 86400);
    }

    if (normBrand === 'kyb') {
      return brands.filter(
        (b) =>
          (b.mfrName || b.brandName || b.dataSupplierName || '').toUpperCase().includes('KYB') ||
          b.dataSupplierId === 7729
      );
    } else if (normBrand === 'ngk' || normBrand === 'ntk') {
      return brands.filter((b) => {
        const n = (b.mfrName || b.brandName || b.dataSupplierName || '').toUpperCase();
        return (n.includes('NGK') || n.includes('NTK') || b.dataSupplierId === 15 || b.dataSupplierId === 5414) && !n.includes('KYB');
      });
    }

    return brands;
  }

  /**
   * 7. Decode 17-digit VIN (getVehiclesByVIN)
   */
  async getVehiclesByVIN(vin, country = this.defaultCountry, lang = this.defaultLang) {
    const payload = {
      getVehiclesByVIN: {
        provider: this.providerId,
        country: country,
        lang: lang,
        vin: vin,
      },
    };

    const data = await this.execute(payload);
    return data?.data?.array || data?.matchingVehicles || [];
  }

  /**
   * 8. Get Popular Car, Motorcycle, or Commercial Brands with official CDN Logos
   */
  getPopularBrands(type = 'P') {
    const t = (type || 'P').toUpperCase();

    if (t === 'M' || t === 'MOTORCYCLE') {
      return [
        { id: 45, manuId: 45, name: 'HONDA', manuName: 'HONDA', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/honda.png' },
        { id: 109, manuId: 109, name: 'SUZUKI', manuName: 'SUZUKI', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/suzuki.png' },
        { id: 16, manuId: 16, name: 'BMW', manuName: 'BMW', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/bmw.png' },
        { id: 2760, manuId: 2760, name: 'KTM', manuName: 'KTM', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/ktm.png' },
        { id: 112, manuId: 112, name: 'TRIUMPH', manuName: 'TRIUMPH', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/triumph.png' },
        { id: 181, manuId: 181, name: 'PIAGGIO', manuName: 'PIAGGIO', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/piaggio.png' },
        { id: 4552, manuId: 4552, name: 'BAJAJ', manuName: 'BAJAJ', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/bajaj.png' },
        { id: 1164, manuId: 1164, name: 'YAMAHA', manuName: 'YAMAHA', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/yamaha.png' },
        { id: 574, manuId: 574, name: 'KAWASAKI', manuName: 'KAWASAKI', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/kawasaki.png' },
      ];
    }

    if (t === 'O' || t === 'C' || t === 'COMMERCIAL') {
      return [
        { id: 54, manuId: 54, name: 'ISUZU', manuName: 'ISUZU', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/isuzu.png' },
        { id: 74, manuId: 74, name: 'MERCEDES-BENZ', manuName: 'MERCEDES-BENZ', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mercedes-benz.png' },
        { id: 120, manuId: 120, name: 'VOLVO', manuName: 'VOLVO', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/volvo.png' },
        { id: 103, manuId: 103, name: 'SCANIA', manuName: 'SCANIA', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/scania.png' },
        { id: 69, manuId: 69, name: 'MAN', manuName: 'MAN', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/man.png' },
        { id: 151, manuId: 151, name: 'HINO', manuName: 'HINO', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/hino.png' },
        { id: 24, manuId: 24, name: 'DAF', manuName: 'DAF', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/daf.png' },
        { id: 55, manuId: 55, name: 'IVECO', manuName: 'IVECO', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/iveco.png' },
        { id: 36, manuId: 36, name: 'FORD', manuName: 'FORD', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/ford.png' },
      ];
    }

    // Default: Passenger Cars (P)
    return [
      { id: 111, manuId: 111, name: 'TOYOTA', manuName: 'TOYOTA', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/toyota.png' },
      { id: 121, manuId: 121, name: 'VOLKSWAGEN', manuName: 'VOLKSWAGEN', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/volkswagen.png' },
      { id: 16, manuId: 16, name: 'BMW', manuName: 'BMW', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/bmw.png' },
      { id: 74, manuId: 74, name: 'MERCEDES-BENZ', manuName: 'MERCEDES-BENZ', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mercedes-benz.png' },
      { id: 36, manuId: 36, name: 'FORD', manuName: 'FORD', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/ford.png' },
      { id: 5, manuId: 5, name: 'AUDI', manuName: 'AUDI', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/audi.png' },
      { id: 80, manuId: 80, name: 'NISSAN', manuName: 'NISSAN', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/nissan.png' },
      { id: 183, manuId: 183, name: 'HYUNDAI', manuName: 'HYUNDAI', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/hyundai.png' },
      { id: 54, manuId: 54, name: 'ISUZU', manuName: 'ISUZU', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/isuzu.png' },
    ];
  }

  /**
   * 9. Get all popular brands in all 3 categories in a single call
   */
  getAllPopularBrands() {
    return {
      passenger: this.getPopularBrands('P'),
      motorcycle: this.getPopularBrands('M'),
      commercial: this.getPopularBrands('O'),
    };
  }

  /**
   * Helper to format article specifications and document URLs
   */
  sanitizeArticles(articles) {
    return (articles || []).map((a) => {
      const genericDesc =
        a.genericArticles && a.genericArticles.length > 0
          ? a.genericArticles[0].genericArticleDescription
          : a.genericArticleDescription;

      const title = a.articleName || genericDesc || a.mfrName || a.dataSupplierName || 'Automotive Component';
      const partNumber = a.articleNo || a.articleNumber || a.directArticle?.articleNo || a.partNumber || '';

      const specs = [...(a.specs || [])];
      if (specs.length === 0) {
        const rawCriteria =
          (Array.isArray(a.articleCriteria) ? a.articleCriteria : a.articleCriteria?.array) ||
          (Array.isArray(a.directArticle?.articleCriteria) ? a.directArticle?.articleCriteria : a.directArticle?.articleCriteria?.array) ||
          (Array.isArray(a.articleAttributes?.array) ? a.articleAttributes.array : (Array.isArray(a.articleAttributes) ? a.articleAttributes : [])) ||
          (Array.isArray(a.immediateAttributs?.array) ? a.immediateAttributs.array : []);

        if (Array.isArray(rawCriteria) && rawCriteria.length > 0) {
          rawCriteria.forEach((c) => {
            const label = c.criteriaDescription || c.criteriaName || c.label || c.attrName || c.name || '';
            const val = c.formattedValue || c.rawValue || c.value || c.attrValue || '';
            if (label && val && val !== '-') {
              specs.push({ label, value: val });
            }
          });
        }
      }

      let images = a.images || [];
      let imageUrl =
        a.imageUrl ||
        a.imageURL800 ||
        a.imageURL400 ||
        a.imageURL200 ||
        images?.[0]?.imageURL800 ||
        images?.[0]?.imageURL400 ||
        images?.[0]?.imageURL200 ||
        null;

      if (!imageUrl || images.length === 0) {
        const lowerDesc = (
          title +
          ' ' +
          (a.articleName || '') +
          ' ' +
          (a.brand || '') +
          ' ' +
          (a.brandName || '') +
          ' ' +
          (a.mfrName || '')
        ).toLowerCase();
        let fallbackImgUrl = 'https://digital-assets.tecalliance.services/images/400/db43e6b81241ab09be6ba2395a6a5dc3be371693.jpg';
        let imgTypeDesc = 'OEM Product Photo';

        if (lowerDesc.includes('kyb') || lowerDesc.includes('shock') || lowerDesc.includes('damper') || lowerDesc.includes('strut')) {
          if (lowerDesc.includes('strut')) {
            fallbackImgUrl = 'https://digital-assets.tecalliance.services/images/400/a59c5579be1ff74702c8856275255ab592e38e7e.jpg';
            imgTypeDesc = 'KYB Suspension Strut';
          } else if (lowerDesc.includes('gas') || lowerDesc.includes('just') || lowerDesc.includes('monotube')) {
            fallbackImgUrl = 'https://digital-assets.tecalliance.services/images/400/3b0eeeac6b019c38addf282a75335a4a040abe10.jpg';
            imgTypeDesc = 'KYB Gas-A-Just Monotube Damper';
          } else {
            fallbackImgUrl = 'https://digital-assets.tecalliance.services/images/400/286e31509df221742fdb95838b78ec226bfd8efc.jpg';
            imgTypeDesc = 'KYB Excel-G Twin-Tube Shock Absorber';
          }
        } else if (lowerDesc.includes('glow')) {
          fallbackImgUrl = 'https://digital-assets.tecalliance.services/images/400/e3e8660767f8d225b469d6b8aa4300bcba419b40.jpg';
          imgTypeDesc = 'NGK D-Power Diesel Glow Plug';
        } else if (lowerDesc.includes('coil') || lowerDesc.includes('lead') || lowerDesc.includes('cable')) {
          fallbackImgUrl = 'https://digital-assets.tecalliance.services/images/400/04607d6d30b012c7e1397cb27758371f3229ecaa.jpg';
          imgTypeDesc = 'NGK Ignition Coil';
        } else if (lowerDesc.includes('sensor') || lowerDesc.includes('lambda') || lowerDesc.includes('oxygen') || lowerDesc.includes('o2')) {
          fallbackImgUrl = 'https://digital-assets.tecalliance.services/images/400/956629741cb981435df21cfe4e8d6bee044bfc29.jpg';
          imgTypeDesc = 'NTK Zirconia Oxygen Sensor';
        } else {
          fallbackImgUrl = 'https://digital-assets.tecalliance.services/images/400/db43e6b81241ab09be6ba2395a6a5dc3be371693.jpg';
          imgTypeDesc = 'NGK Laser Iridium Spark Plug';
        }

        imageUrl = fallbackImgUrl;
        if (images.length === 0) {
          images = [
            {
              imageURL50: fallbackImgUrl.replace('/400/', '/50/'),
              imageURL100: fallbackImgUrl.replace('/400/', '/100/'),
              imageURL200: fallbackImgUrl.replace('/400/', '/200/'),
              imageURL400: fallbackImgUrl,
              imageURL800: fallbackImgUrl.replace('/400/', '/800/'),
              imageURL1600: fallbackImgUrl.replace('/400/', '/1600/'),
              typeDescription: imgTypeDesc,
              headerDescription: 'Product Photo',
              assetSource: 'catalog',
            },
          ];
        }
      }

      return {
        id: a.articleId || a.directArticle?.articleId || partNumber,
        articleId: a.articleId || a.directArticle?.articleId || partNumber,
        articleNumber: partNumber,
        partNumber: partNumber,
        title: title,
        articleName: title,
        brandName: a.brand || a.mfrName || a.dataSupplierName || (String(a.dataSupplierId) === '7729' ? '-KYB' : 'NGK SPARK PLUG'),
        mfrName: a.mfrName || a.brand || a.dataSupplierName || (String(a.dataSupplierId) === '7729' ? '-KYB' : 'NGK SPARK PLUG'),
        dataSupplierName: a.dataSupplierName || a.mfrName || a.brand || (String(a.dataSupplierId) === '7729' ? '-KYB' : 'NGK SPARK PLUG'),
        dataSupplierId: a.dataSupplierId || (a.brandName?.toUpperCase()?.includes('KYB') ? 7729 : 15),
        tradeNumbers: a.tradeNumbers || [partNumber],
        genericArticles: a.genericArticles || [{ genericArticleDescription: title }],
        specs: specs,
        articleCriteria: a.articleCriteria || [],
        images: images,
        images360: (images || []).filter(
          (img) =>
            img.fileName?.toLowerCase()?.includes('360') ||
            img.headerDescription?.toLowerCase()?.includes('360')
        ),
        oenNumbers: a.oenNumbers || [],
        imageUrl: imageUrl,
        raw: a,
      };
    });
  }

  /**
   * Categorize single article into top-level automotive systems
   */
  categorizeArticle(article) {
    const genericId = Number(article.genericArticles?.[0]?.genericArticleId || article.genericArticleId || 0);
    const desc = (
      article.genericArticles?.[0]?.genericArticleDescription ||
      article.articleName ||
      article.title ||
      ''
    ).toLowerCase();

    // 1. Ignition & Glow Systems (NGK)
    if (
      [686, 243, 689, 685].includes(genericId) ||
      desc.includes('spark plug') ||
      desc.includes('glow plug') ||
      desc.includes('ignition') ||
      desc.includes('bougie')
    ) {
      let sub = 'Spark Plugs';
      if (desc.includes('glow')) sub = 'Glow Plugs';
      else if (desc.includes('coil')) sub = 'Ignition Coils';
      else if (desc.includes('cable') || desc.includes('lead') || desc.includes('wire')) sub = 'Ignition Leads';

      return {
        id: 'ignition',
        name: 'Ignition & Glow',
        icon: 'Zap',
        subCategory: sub,
      };
    }

    // 2. Sensors & Engine Electronics (NTK)
    if (
      [3922, 3923, 3925, 3926].includes(genericId) ||
      desc.includes('lambda') ||
      desc.includes('oxygen sensor') ||
      desc.includes('o2 sensor') ||
      desc.includes('sensor') ||
      desc.includes('probe') ||
      desc.includes('transmitter') ||
      desc.includes('flow meter')
    ) {
      let sub = 'Engine Sensors';
      if (desc.includes('lambda') || desc.includes('oxygen') || desc.includes('o2')) sub = 'Lambda / O2 Sensors';
      else if (desc.includes('temp')) sub = 'Temperature Sensors';
      else if (desc.includes('pressure') || desc.includes('map')) sub = 'Pressure Sensors';

      return {
        id: 'sensors',
        name: 'Sensors & Electronics',
        icon: 'Activity',
        subCategory: sub,
      };
    }

    // 3. Suspension & Damping (KYB)
    if (
      [854, 855, 856].includes(genericId) ||
      desc.includes('shock') ||
      desc.includes('damper') ||
      desc.includes('strut') ||
      desc.includes('spring') ||
      desc.includes('amortisseur')
    ) {
      let sub = 'Shock Absorbers';
      if (desc.includes('spring')) sub = 'Coil Springs';
      else if (desc.includes('mount') || desc.includes('bearing')) sub = 'Strut Mounts';

      return {
        id: 'suspension',
        name: 'Suspension & Damping',
        icon: 'ShieldCheck',
        subCategory: sub,
      };
    }

    // 4. Other Components
    return {
      id: 'general',
      name: 'Other Components',
      icon: 'Layers',
      subCategory: 'Components',
    };
  }

  /**
   * Group an array of articles into categorized buckets with counts and metadata
   */
  groupArticlesByCategory(articles = [], brand = null) {
    const normBrand = (brand || '').toLowerCase().trim();
    const categoryMap = {
      ignition: { id: 'ignition', name: 'Ignition & Glow', icon: 'Zap', count: 0, articles: [] },
      sensors: { id: 'sensors', name: 'Sensors & Electronics', icon: 'Activity', count: 0, articles: [] },
      suspension: { id: 'suspension', name: 'Suspension & Damping', icon: 'ShieldCheck', count: 0, articles: [] },
      general: { id: 'general', name: 'Other Components', icon: 'Layers', count: 0, articles: [] },
    };

    const enrichedArticles = articles.map((article) => {
      const category = this.categorizeArticle(article);
      categoryMap[category.id].count += 1;
      categoryMap[category.id].articles.push(article);
      return { ...article, category };
    });

    let categories = Object.values(categoryMap).filter((cat) => cat.count > 0);

    if (normBrand === 'kyb') {
      categories = categories.filter((c) => c.id === 'suspension' || c.id === 'general');
    } else if (normBrand === 'ngk' || normBrand === 'ntk') {
      categories = categories.filter((c) => c.id === 'ignition' || c.id === 'sensors' || c.id === 'general');
    }

    return {
      articles: enrichedArticles,
      totalCount: enrichedArticles.length,
      categories,
      categoryCounts: {
        all: enrichedArticles.length,
        ignition: categoryMap.ignition.count,
        sensors: categoryMap.sensors.count,
        suspension: categoryMap.suspension.count,
        general: categoryMap.general.count,
      },
    };
  }
}

export const tecdocService = new TecDocService();
export default tecdocService;
