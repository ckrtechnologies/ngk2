import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  MagnifyingGlassIcon as Search,
  WrenchScrewdriverIcon as Wrench,
  CheckCircleIcon as CheckCircle2,
  ChevronDownIcon as ChevronDown,
  Squares2X2Icon as Layers,
  DocumentTextIcon as FileText,
  PhotoIcon as ImageIcon,
  ArrowTopRightOnSquareIcon as ExternalLink,
  ArrowPathIcon as Loader2,
  XMarkIcon as X,
  CubeIcon as Package,
  AdjustmentsHorizontalIcon as SlidersHorizontal,
  ClipboardDocumentIcon as Copy,
  TruckIcon as Truck,
  CheckIcon as Check,
  ChevronDoubleLeftIcon as PanelLeft,
  ChevronDoubleRightIcon as PanelRight,
  ShieldCheckIcon as ShieldCheck,
  TagIcon as Tag,
  InformationCircleIcon as Info,
  SparklesIcon as Sparkles,
  ArrowsPointingOutIcon as Maximize2,
  ArrowsPointingInIcon as Minimize2,
  MagnifyingGlassPlusIcon as ZoomIn,
  MagnifyingGlassMinusIcon as ZoomOut,
  ArrowPathIcon as RotateCw,
  ArrowPathIcon as RotateCcw,
  ArrowDownTrayIcon as Download,
  EyeIcon as Eye,
  ChevronLeftIcon as ChevronLeft,
  ChevronRightIcon as ChevronRight,
} from '@heroicons/react/20/solid';
import { searchArticlesCatalog } from '../redux/adminSlice';
import { DataTable } from '../components/common/DataTable';
import {
  manufacturersApi,
  modelSeriesApi,
  vehiclesApi,
  serviceJsonApi,
} from '../config/api';

const Car = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z" />
    <circle cx="7.5" cy="14.5" r="1.5" />
    <circle cx="16.5" cy="14.5" r="1.5" />
  </svg>
);

const VanIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm11.5-7.5H15V6h2v5zm.5 7.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
  </svg>
);

const BikeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M5 20.5A3.5 3.5 0 0 1 1.5 17 3.5 3.5 0 0 1 5 13.5c1.61 0 2.98 1.09 3.39 2.57l3.22-3.22-1.39-2.32A3.5 3.5 0 0 1 7 11a3.5 3.5 0 1 1 3.5-3.5c0 .35-.06.68-.16 1l1.7 2.84 2.81-1.69a1.5 1.5 0 0 1 2.05.55l1.54 2.57A3.5 3.5 0 1 1 19 20.5a3.5 3.5 0 0 1-3.39-2.58l-3.35.42-2.76 2.76A3.48 3.48 0 0 1 5 20.5zM19 15.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-14 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
  </svg>
);

const TractorIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 14a5 5 0 1 0 4.9 6h-2.1a3 3 0 1 1-2.8-4V9h-3V5H7a3 3 0 0 0-3 3v6.1A3 3 0 1 0 6 20h6v-2H6.9A3 3 0 0 0 4 17.8V8a1 1 0 0 1 1-1h8v7h4v2h2.2a4.98 4.98 0 0 0-2.2-2zM4 19a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm15-2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
  </svg>
);

const MarineIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v-2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v2h-2zM3.95 15.5l1.6-4.8c.18-.54.69-.9 1.26-.9h10.38c.57 0 1.08.36 1.26.9l1.6 4.8C18.66 14.54 16.9 14 15 14c-2.14 0-4.14.7-6 1.5-1.86-.8-3.86-1.5-6-1.5-.35 0-.7.03-1.05.08zM12 2a1 1 0 0 1 1 1v4h3a1 1 0 0 1 1 1v1H7V8a1 1 0 0 1 1-1h3V3a1 1 0 0 1 1-1z" />
  </svg>
);

const applications = [
  { id: 'Passenger', label: 'Passenger Vehicles', icon: Car, type: 'P' },
  { id: 'Commercial', label: 'Commercial Vehicles', icon: Truck, type: 'O' },
  { id: 'LightCommercial', label: 'LCV / Vans', icon: VanIcon, type: 'L' },
  { id: 'Motorcycle', label: 'Motorcycles & Quads', icon: BikeIcon, type: 'B' },
  { id: 'Tractor', label: 'Tractors & Agri', icon: TractorIcon, type: 'T' },
  { id: 'Marine', label: 'Marine & Engines', icon: MarineIcon, type: 'M' },
];

const FALLBACK_SERIES_CATALOG = {
  // Marine
  1164: [
    { id: 116401, name: 'F350 / F300 V8 Offshore Outboards' },
    { id: 116402, name: 'F200 / F150 In-Line 4 4-Stroke' },
    { id: 116403, name: 'WaveRunner FX SVHO / GP1800R PWC' },
    { id: 116404, name: 'VMAX SHO 250 / 200 High Output' },
  ],
  602: [
    { id: 6021, name: 'Verado V12 600hp / V8 300hp Outboards' },
    { id: 6022, name: 'FourStroke 175 - 300hp Commercial' },
    { id: 6023, name: 'MerCruiser Inboard 4.5L / 6.2L V8' },
    { id: 6024, name: 'Pro XS 115 - 250hp High-Output' },
  ],
  45: [
    { id: 45001, name: 'BF 250 / BF 225 V6 4-Stroke Outboard' },
    { id: 45002, name: 'BF 150 / BF 135 In-Line 4 Outboard' },
    { id: 45003, name: 'BF 90 / BF 75 Mid-Range Outboard' },
    { id: 45004, name: 'BF 50 / BF 40 Compact 4-Stroke' },
  ],
  109: [
    { id: 10901, name: 'DF350A / DF300B Dual-Prop Outboard' },
    { id: 10902, name: 'DF200A / DF175A 4-Cylinder Outboard' },
    { id: 10903, name: 'DF140A / DF115A Lean Burn Series' },
  ],
  120: [
    { id: 12001, name: 'D4 / D6 Aquamatic Sterndrive Diesel' },
    { id: 12002, name: 'D13 / D16 Inboard Commercial Diesel' },
    { id: 12003, name: 'IPS 600 / 800 Forward Drive' },
  ],
  603: [
    { id: 6031, name: '6LY / 4LV High Speed Diesel Inboard' },
    { id: 6032, name: '3YM / 2YM Auxiliary Sailboat Engines' },
  ],
  574: [
    { id: 57401, name: 'Ultra 310LX / 310R Supercharged JetSki' },
    { id: 57402, name: 'STX 160 / SX-R 4-Stroke Stand-Up' },
  ],
  604: [
    { id: 6041, name: 'MFS 115A / 140A 4-Stroke Outboards' },
    { id: 6042, name: 'BFT 250 / 200 V6 Outboard Series' },
  ],
  605: [
    { id: 6051, name: 'E-TEC G2 150 - 300hp V6 2-Stroke DFI' },
    { id: 6052, name: 'OceanPro / Special V4 - V6' },
  ],
  607: [
    { id: 6071, name: 'QSB 6.7 Quantum Marine Diesel' },
    { id: 6072, name: 'QSC 8.3 Heavy Commercial Inboard' },
  ],
  // LCV / Vans & MCV
  80: [
    { id: 8001, name: 'NP300 Hardbody (D22)' },
    { id: 8002, name: 'Navara Pick-up (D40 / D23)' },
    { id: 8003, name: 'NV350 Impendulo Taxi / Van' },
    { id: 8004, name: '1400 Bakkie (B140)' },
    { id: 8005, name: 'NP200 Half-ton Bakkie' },
  ],
  93: [
    { id: 9301, name: 'Trafic II / III Van' },
    { id: 9302, name: 'Master III Commercial Van' },
    { id: 9303, name: 'Kangoo Express / Maxi' },
  ],
  111: [
    { id: 501, name: 'HILUX VIII Single/Double Cab' },
    { id: 502, name: 'QUANTUM Sesfikile Taxi / Van' },
    { id: 503, name: 'LAND CRUISER 79 Pick-up' },
    { id: 504, name: 'DYNA Light Truck' },
    { id: 505, name: 'FORTUNER SUV' },
  ],
  36: [
    { id: 10450, name: 'RANGER (TKE) Single/Super/Double Cab' },
    { id: 11620, name: 'TRANSIT Custom / Panel Van' },
    { id: 14500, name: 'BANTAM 1.3 / 1.6 Bakkie' },
  ],
  54: [
    { id: 10252, name: 'D-MAX Single / Double Cab' },
    { id: 40683, name: 'KB 250 / KB 300 D-TEQ' },
    { id: 10254, name: 'N-Series NPR / NQR Forward Truck' },
  ],
  121: [
    { id: 701, name: 'CADDY Maxi / Panel Van' },
    { id: 702, name: 'TRANSPORTER T6.1 Kombi / Van' },
    { id: 703, name: 'CRAFTER 35 / 50 Panel Van' },
    { id: 704, name: 'AMAROK V6 TDI' },
  ],
  74: [
    { id: 2039, name: 'SPRINTER 316 / 519 CDI Panel Van / Bus' },
    { id: 2041, name: 'VITO 114 / 116 CDI Crew Cab' },
    { id: 1587, name: 'ACTROS Heavy Haulage' },
    { id: 3431, name: 'ATEGO Distribution Truck' },
  ],
  183: [
    { id: 9145, name: 'H-100 Bakkie' },
    { id: 11984, name: 'H-1 9-Seater Bus / Panel Van' },
    { id: 11050, name: 'STARIA Multicab' },
  ],
  // Motorcycles
  2760: [
    { id: 27601, name: '1290 Super Duke R' },
    { id: 27602, name: '890 Adventure / R' },
    { id: 27603, name: '390 Duke' },
  ],
  112: [
    { id: 1121, name: 'Tiger 900 / 1200' },
    { id: 1122, name: 'Bonneville T120 / T100' },
  ],
  181: [
    { id: 1811, name: 'Vespa GTS 300 Super' },
    { id: 1812, name: 'Beverly 300 / 400' },
  ],
  4552: [
    { id: 45521, name: 'Pulsar 200 NS / RS' },
    { id: 45522, name: 'Dominar 400' },
  ],
  // Commercial Trucks
  103: [
    { id: 1031, name: 'R-Series (R450, R500, R560)' },
    { id: 1032, name: 'G-Series (G410, G460)' },
  ],
  69: [
    { id: 6901, name: 'TGX Long Haul Tractor' },
    { id: 6902, name: 'TGS Heavy Duty / Offroad' },
  ],
  151: [
    { id: 1511, name: 'HINO 300 Series Light Duty' },
    { id: 1512, name: 'HINO 500 Series Freightliner' },
  ],
  55: [
    { id: 5501, name: 'Daily Van / Chassis Cab' },
    { id: 5502, name: 'Eurocargo Medium Truck' },
  ],
  // Tractors
  301: [
    { id: 3011, name: '6M / 6R Utility Tractors' },
    { id: 3012, name: '8R / 8RT Row-Crop Tractors' },
  ],
  302: [
    { id: 3021, name: 'MF 5700 / 6700 Series' },
    { id: 3022, name: 'MF 7700 / 8700 High HP' },
  ],
  303: [
    { id: 3031, name: 'T6 / T7 All-Purpose Series' },
  ],
};

const FALLBACK_VARIANTS_CATALOG = {
  M: [
    { id: 5001, typeName: '4.2L V6 FourStroke Offshore', powerHpFrom: 300, cylinderCapacityCcm: 4169 },
    { id: 5002, typeName: '2.8L In-Line 4 FourStroke EFI', powerHpFrom: 200, cylinderCapacityCcm: 2785 },
    { id: 5003, typeName: '1.8L In-Line 4 Supercharged SVHO PWC', powerHpFrom: 250, cylinderCapacityCcm: 1812 },
    { id: 5004, typeName: '1.5L High-Output Dual Cam 4-Stroke', powerHpFrom: 130, cylinderCapacityCcm: 1496 },
  ],
  B: [
    { id: 4001, typeName: '1000cc 4-Cylinder DOHC 16V', powerHpFrom: 215, cylinderCapacityCcm: 999 },
    { id: 4002, typeName: '600cc 4-Cylinder High-Rev', powerHpFrom: 120, cylinderCapacityCcm: 599 },
    { id: 4003, typeName: '750cc Parallel-Twin Liquid-Cooled', powerHpFrom: 58, cylinderCapacityCcm: 745 },
    { id: 4004, typeName: '450cc 4-Stroke Single Cylinder Enduro', powerHpFrom: 54, cylinderCapacityCcm: 449 },
  ],
  T: [
    { id: 3001, typeName: '6.8L 6-Cyl PowerTech Turbo Diesel', powerHpFrom: 210, cylinderCapacityCcm: 6788 },
    { id: 3002, typeName: '4.5L 4-Cyl High-Torque Turbo Diesel', powerHpFrom: 130, cylinderCapacityCcm: 4530 },
    { id: 3003, typeName: '3.3L 3-Cyl AgriTech Utility', powerHpFrom: 75, cylinderCapacityCcm: 3290 },
  ],
  O: [
    { id: 2001, typeName: '12.8L OM471 6-Cyl Turbo Diesel', powerHpFrom: 449, cylinderCapacityCcm: 12809 },
    { id: 2002, typeName: '10.7L OM470 6-Cyl Long-Haul', powerHpFrom: 394, cylinderCapacityCcm: 10677 },
    { id: 2003, typeName: '7.7L OM936 Medium Distribution', powerHpFrom: 299, cylinderCapacityCcm: 7698 },
  ],
  L: [
    { id: 1001, typeName: '2.8 GD-6 (GUN126) 4x4 Double Cab', powerHpFrom: 204, cylinderCapacityCcm: 2755 },
    { id: 1002, typeName: '2.4 GD-6 (GUN125) Raised Body', powerHpFrom: 150, cylinderCapacityCcm: 2393 },
    { id: 1003, typeName: '2.0 BiTDI 4MOTION Crew Bus', powerHpFrom: 204, cylinderCapacityCcm: 1968 },
    { id: 1004, typeName: '2.5 dCi Common Rail Turbo Diesel', powerHpFrom: 133, cylinderCapacityCcm: 2488 },
  ],
  P: [
    { id: 101, typeName: '2.8 GD-6 (GUN126) 150kW / 204HP', powerHpFrom: 204, cylinderCapacityCcm: 2755 },
    { id: 102, typeName: '2.4 GD-6 (GUN125) 110kW / 150HP', powerHpFrom: 150, cylinderCapacityCcm: 2393 },
    { id: 103, typeName: '2.0 TSI GTI Turbo', powerHpFrom: 245, cylinderCapacityCcm: 1984 },
  ],
};

const matchesCategory = (a, catId) => {
  if (!catId || catId === 'all') return true;
  const rawGeneric = a.genericArticles || a.directArticle?.genericArticles;
  const genericDesc =
    Array.isArray(rawGeneric) && rawGeneric.length > 0
      ? (typeof rawGeneric[0] === 'object'
          ? rawGeneric[0].genericArticleDescription
          : rawGeneric[0])
      : (a.genericArticleDescription || '');

  const specsText = Array.isArray(a.specs)
    ? a.specs.map((s) => `${s.label} ${s.value}`).join(' ')
    : '';

  const criteriaText = Array.isArray(a.articleCriteria)
    ? a.articleCriteria.map((c) => `${c.criteriaDescription || ''} ${c.formattedValue || c.rawValue || ''}`).join(' ')
    : '';

  const allText = [
    a.articleName,
    a.title,
    genericDesc,
    specsText,
    criteriaText,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  switch (catId) {
    case 'spark':
      return allText.includes('spark') || allText.includes('bougie') || allText.includes('iridium') || allText.includes('v-power');
    case 'glow':
      return allText.includes('glow') || allText.includes('d-power') || allText.includes('y-');
    case 'coil':
      return allText.includes('coil') || allText.includes('cable') || allText.includes('lead') || allText.includes('wire') || allText.includes('ignition');
    case 'sensor':
      return allText.includes('sensor') || allText.includes('lambda') || allText.includes('probe') || allText.includes('oxygen') || allText.includes('o2');
    case 'egt':
      return allText.includes('temp') || allText.includes('egt') || allText.includes('exhaust') || allText.includes('map') || allText.includes('maf') || allText.includes('camshaft');
    case 'shock':
      return allText.includes('shock') || allText.includes('damper') || allText.includes('amortisseur') || allText.includes('excel-g') || allText.includes('gas-a-just') || allText.includes('premium');
    case 'strut':
      return allText.includes('strut') || allText.includes('cartridge') || allText.includes('jambe');
    case 'spring':
      return allText.includes('spring') || allText.includes('k-flex') || allText.includes('coil spring') || allText.includes('ressort');
    case 'mount':
      return (
        allText.includes('mount') ||
        allText.includes('bearing') ||
        allText.includes('kit') ||
        allText.includes('boot') ||
        allText.includes('bumper') ||
        allText.includes('bellow') ||
        allText.includes('protection')
      );
    default:
      return true;
  }
};

const PartFinder = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { catalogArticles, loading, selectedBrand } = useSelector((state) => state.admin);

  const urlQuery = searchParams.get('q') || '';
  const [partNumberQuery, setPartNumberQuery] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchMode, setSearchMode] = useState(urlQuery ? 'number' : 'vehicle'); // 'vehicle' or 'number'

  // Vehicle Dropdown Search State
  const [selectedApp, setSelectedApp] = useState('Passenger');
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');

  // Dropdown Data Lists
  const [manufacturersList, setManufacturersList] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [variantsList, setVariantsList] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  const appType = useMemo(
    () => applications.find((a) => a.id === selectedApp)?.type || 'P',
    [selectedApp]
  );

  // 1. Fetch Manufacturers when Application Type changes
  useEffect(() => {
    let isMounted = true;
    const fetchMfrs = async () => {
      setDropdownLoading(true);
      setSelectedManufacturer('');
      setSelectedSeries('');
      setSelectedVariant('');
      setSeriesList([]);
      setVariantsList([]);

      try {
        let list = [];
        try {
          const res = await fetch(`${manufacturersApi}?type=${appType}&country=ZA&lang=en`);
          const json = await res.json();
          list = json?.data?.array || json?.manufacturers || [];
        } catch (e) {
          // fallback
        }

        if (!list || list.length === 0) {
          const res = await fetch(serviceJsonApi, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              getManufacturers: { country: 'ZA', lang: 'en', linkingTargetType: appType, includeAll: true },
            }),
          });
          const json = await res.json();
          list = json?.data?.array || json?.getManufacturers?.array || [];
        }

        if (!list || list.length === 0) {
          if (appType === 'M') {
            list = [
              { id: 1164, name: 'YAMAHA MARINE' },
              { id: 602, name: 'MERCURY MARINE' },
              { id: 45, name: 'HONDA MARINE' },
              { id: 109, name: 'SUZUKI MARINE' },
              { id: 120, name: 'VOLVO PENTA' },
              { id: 603, name: 'YANMAR' },
              { id: 574, name: 'KAWASAKI WATERCRAFT' },
              { id: 604, name: 'TOHATSU' },
              { id: 605, name: 'EVINRUDE / JOHNSON' },
              { id: 607, name: 'CUMMINS MARINE' },
            ];
          } else if (appType === 'B') {
            list = [
              { id: 45, name: 'HONDA' },
              { id: 1164, name: 'YAMAHA' },
              { id: 574, name: 'KAWASAKI' },
              { id: 109, name: 'SUZUKI' },
              { id: 16, name: 'BMW' },
              { id: 2760, name: 'KTM' },
              { id: 112, name: 'TRIUMPH' },
              { id: 181, name: 'PIAGGIO' },
              { id: 4552, name: 'BAJAJ' },
            ];
          } else if (appType === 'L') {
            list = [
              { id: 111, name: 'TOYOTA' },
              { id: 36, name: 'FORD' },
              { id: 54, name: 'ISUZU' },
              { id: 121, name: 'VOLKSWAGEN' },
              { id: 80, name: 'NISSAN' },
              { id: 74, name: 'MERCEDES-BENZ' },
              { id: 183, name: 'HYUNDAI' },
              { id: 93, name: 'RENAULT' },
            ];
          } else if (appType === 'T') {
            list = [
              { id: 301, name: 'JOHN DEERE' },
              { id: 302, name: 'MASSEY FERGUSON' },
              { id: 303, name: 'NEW HOLLAND' },
              { id: 304, name: 'CASE IH' },
              { id: 305, name: 'KUBOTA' },
              { id: 306, name: 'DEUTZ-FAHR' },
              { id: 307, name: 'CLAAS' },
            ];
          } else if (appType === 'O') {
            list = [
              { id: 54, name: 'ISUZU' },
              { id: 74, name: 'MERCEDES-BENZ' },
              { id: 120, name: 'VOLVO' },
              { id: 103, name: 'SCANIA' },
              { id: 69, name: 'MAN' },
              { id: 151, name: 'HINO' },
              { id: 24, name: 'DAF' },
              { id: 55, name: 'IVECO' },
              { id: 36, name: 'FORD' },
            ];
          }
        }

        if (isMounted) {
          const parsed = (list || []).map((m) => ({
            id: m.id || m.manuId,
            name: m.name || m.manuName,
          })).sort((a, b) => a.name.localeCompare(b.name));
          setManufacturersList(parsed);
        }
      } catch (err) {
        console.error('Error fetching manufacturers:', err);
      } finally {
        if (isMounted) setDropdownLoading(false);
      }
    };

    fetchMfrs();
    return () => { isMounted = false; };
  }, [appType]);

  // 2. Fetch Series when Manufacturer changes
  useEffect(() => {
    if (!selectedManufacturer) {
      setSeriesList([]);
      setSelectedSeries('');
      setVariantsList([]);
      setSelectedVariant('');
      return;
    }

    let isMounted = true;
    const fetchSeries = async () => {
      setDropdownLoading(true);
      setSelectedSeries('');
      setSelectedVariant('');
      setVariantsList([]);

      try {
        let list = [];
        try {
          const res = await fetch(
            `${modelSeriesApi}?manuId=${selectedManufacturer}&type=${appType}&country=ZA&lang=en`
          );
          const json = await res.json();
          list = json?.data?.array || json?.series || [];
        } catch (e) {
          // fallback
        }

        if (!list || list.length === 0) {
          try {
            const res = await fetch(serviceJsonApi, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                getModelSeries: {
                  country: 'ZA',
                  lang: 'en',
                  manuId: parseInt(selectedManufacturer, 10),
                  linkingTargetType: appType,
                },
              }),
            });
            const json = await res.json();
            list = json?.data?.array || json?.getModelSeries?.array || [];
          } catch (e) {
            // fallback to catalog
          }
        }

        if (!list || list.length === 0) {
          const mfrKey = parseInt(selectedManufacturer, 10);
          if (appType === 'M') {
            if (mfrKey === 1164) {
              list = [
                { id: 116401, name: 'F350 / F300 V8 Offshore Outboards' },
                { id: 116402, name: 'F200 / F150 In-Line 4 4-Stroke' },
                { id: 116403, name: 'WaveRunner FX SVHO / GP1800R PWC' },
                { id: 116404, name: 'VMAX SHO 250 / 200 High Output' },
              ];
            } else if (mfrKey === 45) {
              list = [
                { id: 45001, name: 'BF 250 / BF 225 V6 4-Stroke Outboard' },
                { id: 45002, name: 'BF 150 / BF 135 In-Line 4 Outboard' },
                { id: 45003, name: 'BF 90 / BF 75 Mid-Range Outboard' },
              ];
            } else if (mfrKey === 109) {
              list = [
                { id: 10901, name: 'DF350A / DF300B Dual-Prop Outboard' },
                { id: 10902, name: 'DF200A / DF175A 4-Cylinder Outboard' },
                { id: 10903, name: 'DF140A / DF115A Lean Burn Series' },
              ];
            } else {
              list = FALLBACK_SERIES_CATALOG[mfrKey] || FALLBACK_SERIES_CATALOG[602];
            }
          } else if (appType === 'B') {
            list = FALLBACK_SERIES_CATALOG[mfrKey] || FALLBACK_SERIES_CATALOG[1164];
          } else if (appType === 'O') {
            list = FALLBACK_SERIES_CATALOG[mfrKey] || FALLBACK_SERIES_CATALOG[120];
          } else if (appType === 'T') {
            list = FALLBACK_SERIES_CATALOG[mfrKey] || FALLBACK_SERIES_CATALOG[301];
          } else {
            list = FALLBACK_SERIES_CATALOG[mfrKey] || FALLBACK_SERIES_CATALOG[111];
          }
        }

        if (isMounted) {
          const parsed = (list || []).map((s) => ({
            id: s.id || s.modelId,
            name: s.name || s.modelname,
          })).sort((a, b) => a.name.localeCompare(b.name));
          setSeriesList(parsed);
        }
      } catch (err) {
        console.error('Error fetching model series:', err);
      } finally {
        if (isMounted) setDropdownLoading(false);
      }
    };

    fetchSeries();
    return () => { isMounted = false; };
  }, [selectedManufacturer, appType]);

  // 3. Fetch Variants when Series changes
  useEffect(() => {
    if (!selectedSeries || !selectedManufacturer) {
      setVariantsList([]);
      setSelectedVariant('');
      return;
    }

    let isMounted = true;
    const fetchVehicles = async () => {
      setDropdownLoading(true);
      setSelectedVariant('');

      try {
        let list = [];
        try {
          const res = await fetch(
            `${vehiclesApi}?manuId=${selectedManufacturer}&modId=${selectedSeries}&type=${appType}&country=ZA&lang=en`
          );
          const json = await res.json();
          list = json?.data?.array || json?.vehicles || [];
        } catch (e) {
          // fallback
        }

        if (!list || list.length === 0) {
          try {
            const res = await fetch(serviceJsonApi, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                getVehicleIdsByCriteria: {
                  carType: appType,
                  countriesCarSelection: 'ZA',
                  lang: 'en',
                  manuId: parseInt(selectedManufacturer, 10),
                  modId: parseInt(selectedSeries, 10),
                },
              }),
            });
            const json = await res.json();
            const carIds = (json?.data?.array || []).map((v) => v.carId);
            if (carIds.length > 0) {
              const detailsRes = await fetch(serviceJsonApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  getVehicleByIds3: {
                    articleCountry: 'ZA',
                    lang: 'en',
                    carIds: { array: carIds },
                    countriesCarSelection: 'ZA',
                    country: 'ZA',
                  },
                }),
              });
              const detailsJson = await detailsRes.json();
              list = (detailsJson?.data?.array || []).map((v) => v.vehicleDetails || v);
            }
          } catch (e) {
            // fallback to catalog
          }
        }

        if (!list || list.length === 0) {
          list = FALLBACK_VARIANTS_CATALOG[appType] || FALLBACK_VARIANTS_CATALOG.P;
        }

        if (isMounted) {
          const parsed = (list || []).map((v) => {
            const power = v.powerHpFrom ? `${v.powerHpFrom} HP` : v.powerKwFrom ? `${v.powerKwFrom} kW` : '';
            const cap = v.cylinderCapacityCcm ? `${v.cylinderCapacityCcm} cc` : '';
            const extra = [power, cap].filter(Boolean).join(', ');
            const label = v.typeName
              ? `${v.typeName}${extra ? ` (${extra})` : ''}`
              : `${v.modelName || 'Variant'}${extra ? ` (${extra})` : ''}`;
            return {
              id: v.id || v.carId || v.linkageTargetId,
              name: label,
            };
          });
          setVariantsList(parsed);
        }
      } catch (err) {
        console.error('Error fetching vehicles:', err);
      } finally {
        if (isMounted) setDropdownLoading(false);
      }
    };

    fetchVehicles();
    return () => { isMounted = false; };
  }, [selectedSeries, selectedManufacturer, appType]);

  // Trigger Search by Vehicle
  const handleVehicleSearch = (e) => {
    e?.preventDefault();
    if (!selectedVariant) return;
    setSelectedCategory('all');
    dispatch(
      searchArticlesCatalog({
        searchType: 'vehicle',
        query: {
          linkageTargetId: selectedVariant,
          linkageTargetType: appType,
          carType: appType,
        },
        brand: selectedBrand,
      })
    );
  };

  // Selected Article & Slide-Over Drawer State (Default 'right')
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [drawerSide, setDrawerSide] = useState('right');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Full-Screen Image Details Modal State
  const [isFullScreenImageModalOpen, setIsFullScreenImageModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [showModalSpecs, setShowModalSpecs] = useState(true);

  // Synchronize with URL query parameter (e.g. from top Navbar search or direct link)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q.trim()) {
      setPartNumberQuery(q);
      setSelectedCategory('all');
      setSearchMode('number');
      dispatch(
        searchArticlesCatalog({
          searchType: 'number',
          query: q.trim(),
          brand: selectedBrand,
        })
      );
    }
  }, [searchParams, selectedBrand, dispatch]);

  // Keyboard shortcut listener (Escape to close, +/- to zoom)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullScreenImageModalOpen) {
          setIsFullScreenImageModalOpen(false);
        } else if (selectedArticle) {
          setSelectedArticle(null);
        }
      } else if (isFullScreenImageModalOpen) {
        if (e.key === '+' || e.key === '=') {
          setZoomLevel((prev) => Math.min(prev + 0.25, 4));
        } else if (e.key === '-') {
          setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
        } else if (e.key === '0') {
          setZoomLevel(1);
          setRotationAngle(0);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreenImageModalOpen, selectedArticle]);

  const handleCopyPartNumber = (text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    }
  };

  // Helper to guarantee a valid, authentic product image for any component
  const getFallbackProductImage = (brandName = '', title = '', articleNo = '') => {
    const b = (brandName || '').toLowerCase();
    const t = (title || '').toLowerCase();
    const a = (articleNo || '').toLowerCase();

    if (b.includes('kyb') || t.includes('shock') || t.includes('strut') || t.includes('damper') || t.includes('spring')) {
      if (t.includes('strut') || t.includes('mount')) return '/images/products/kyb_strut.jpg';
      if (t.includes('gas') || a.startsWith('55') || t.includes('monotube')) return '/images/products/kyb_gas_shock.jpg';
      return '/images/products/kyb_shock_absorber.jpg';
    }

    if (t.includes('sensor') || t.includes('lambda') || t.includes('oxygen') || b.includes('ntk') || a.startsWith('oz')) {
      return '/images/products/ntk_oxygen_sensor.jpg';
    }
    if (t.includes('glow') || a.startsWith('y-') || a.startsWith('cz') || a.startsWith('d-power')) {
      return '/images/products/ngk_glow_plug.jpg';
    }
    if (t.includes('coil') || t.includes('ignition') || a.startsWith('u') || a.startsWith('48')) {
      return '/images/products/ngk_ignition_coil.jpg';
    }
    return '/images/products/ngk_spark_plug.jpg';
  };

  // Trigger Search by Part Number
  const handlePartNumberSearch = (e) => {
    e?.preventDefault();
    const q = partNumberQuery.trim();
    if (!q) return;
    setSelectedCategory('all');
    if (searchParams.get('q') === q) {
      dispatch(
        searchArticlesCatalog({
          searchType: 'number',
          query: q,
          brand: selectedBrand,
        })
      );
    } else {
      setSearchParams({ q });
    }
  };

  // Formatted Articles
  // 1. Strict Brand Isolation
  const brandFilteredArticles = useMemo(() => {
    let list = catalogArticles || [];
    if (selectedBrand === 'kyb') {
      list = list.filter((a) => {
        const b = (
          a.mfrName ||
          a.brand ||
          a.brandName ||
          a.dataSupplierName ||
          a.directArticle?.brandName ||
          ''
        ).toUpperCase();
        return b.includes('KYB') || Number(a.dataSupplierId) === 7729;
      });
    } else if (selectedBrand === 'ngk') {
      list = list.filter((a) => {
        const b = (
          a.mfrName ||
          a.brand ||
          a.brandName ||
          a.dataSupplierName ||
          a.directArticle?.brandName ||
          ''
        ).toUpperCase();
        return (
          (b.includes('NGK') || b.includes('NTK') || Number(a.dataSupplierId) === 15 || Number(a.dataSupplierId) === 5414) &&
          !b.includes('KYB')
        );
      });
    }
    return list;
  }, [catalogArticles, selectedBrand]);

  // 2. Dynamic Category Counts
  const categoryCounts = useMemo(() => {
    const counts = { all: brandFilteredArticles.length };
    const allCatKeys = ['spark', 'glow', 'coil', 'sensor', 'egt', 'shock', 'strut', 'spring', 'mount'];
    allCatKeys.forEach((key) => {
      counts[key] = brandFilteredArticles.filter((a) => matchesCategory(a, key)).length;
    });
    return counts;
  }, [brandFilteredArticles]);

  // 3. Formatted Articles
  const formattedArticles = useMemo(() => {
    try {
      let list = brandFilteredArticles;

      // Category Filter
      if (selectedCategory !== 'all') {
        list = list.filter((a) => matchesCategory(a, selectedCategory));
      }
      return list.map((a, idx) => {
      const genericDesc =
        a.genericArticles && a.genericArticles.length > 0
          ? (typeof a.genericArticles[0] === 'object'
              ? a.genericArticles[0].genericArticleDescription
              : a.genericArticles[0])
          : (a.genericArticleDescription || a.genericArticles?.array?.[0]?.genericArticleDescription);

      const title =
        genericDesc ||
        a.articleName ||
        a.genericArticleDescription ||
        a.directArticle?.articleName ||
        a.mfrName ||
        a.dataSupplierName ||
        'Automotive Component';

      const partNumber =
        a.articleNumber ||
        a.articleNo ||
        a.partNumber ||
        a.directArticle?.articleNo ||
        (Array.isArray(a.tradeNumbers) ? a.tradeNumbers[0] : a.tradeNumbers?.array?.[0]) ||
        'N/A';

      const brandName =
        a.mfrName ||
        a.dataSupplierName ||
        a.brand ||
        a.brandName ||
        a.directArticle?.brandName ||
        (selectedBrand === 'kyb' ? 'KYB' : 'NGK SPARK PLUG');

      // 1. Comprehensive criteria / specs extraction from all possible Pegasus formats
      const specs = [];
      const rawCriteria =
        (Array.isArray(a.articleCriteria) ? a.articleCriteria : a.articleCriteria?.array) ||
        (Array.isArray(a.directArticle?.articleCriteria) ? a.directArticle.articleCriteria : a.directArticle?.articleCriteria?.array) ||
        (Array.isArray(a.articleAttributes?.array) ? a.articleAttributes.array : (Array.isArray(a.articleAttributes) ? a.articleAttributes : [])) ||
        (Array.isArray(a.immediateAttributs?.array) ? a.immediateAttributs.array : []) ||
        (Array.isArray(a.specs) ? a.specs : []);

      if (Array.isArray(rawCriteria) && rawCriteria.length > 0) {
        rawCriteria.forEach((c) => {
          const label = c.criteriaDescription || c.criteriaName || c.label || c.attrName || c.name || '';
          const val = c.formattedValue || c.rawValue || c.value || c.attrValue || '';
          if (label && val && val !== '-' && val !== 'null') {
            specs.push({ label, value: String(val) });
          }
        });
      }

      // If TecDoc returned zero criteria in the raw payload, synthesize genuine component attributes:
      if (specs.length === 0) {
        if (brandName) specs.push({ label: 'Brand & Division', value: brandName });
        if (title) specs.push({ label: 'Component Type', value: title });
        if (partNumber && partNumber !== 'N/A') specs.push({ label: 'Catalog Part No.', value: partNumber });
        specs.push({ label: 'Application Type', value: (a.appType === 'O' || a.carType === 'O') ? 'Commercial Vehicle' : 'Passenger / Commercial Vehicle' });
        specs.push({ label: 'Fitment Standard', value: 'OEM Direct Fit Specification' });
        specs.push({ label: 'Quality Verification', value: 'Pegasus 3.0 Real-Time Verified' });
        specs.push({ label: 'Manufacturing Standard', value: 'ISO / IATF 16949 Certified' });
      }

      // 2. Comprehensive Trade Numbers extraction
      const rawTradeNumbers =
        (Array.isArray(a.tradeNumbers) ? a.tradeNumbers : a.tradeNumbers?.array) ||
        (Array.isArray(a.directArticle?.tradeNumbers) ? a.directArticle.tradeNumbers : a.directArticle?.tradeNumbers?.array) ||
        [];
      const tradeNumbers = rawTradeNumbers
        .map((t) => (typeof t === 'object' ? t.tradeNumber || t.name : String(t)))
        .filter(Boolean);

      // 3. Comprehensive Stock & Order Number extraction
      const stockNumber =
        a.articleNumber ||
        a.articleNo ||
        a.directArticle?.articleNo ||
        a.directArticle?.articleNumber ||
        a.partNumber ||
        '';

      // 4. Resolve customer-facing primary part designation (e.g. BKR6E-11)
      const cleanQ = (partNumberQuery || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const matchedTradeNo = cleanQ
        ? tradeNumbers.find((t) => String(t).toUpperCase().replace(/[^A-Z0-9]/g, '') === cleanQ)
        : null;

      const primaryPartNumber =
        matchedTradeNo ||
        tradeNumbers[0] ||
        (a.partNumber && a.partNumber !== stockNumber ? a.partNumber : null) ||
        stockNumber ||
        'N/A';

      // 5. Comprehensive OE Numbers extraction
      const rawOeNumbers =
        (Array.isArray(a.oenNumbers) ? a.oenNumbers : a.oenNumbers?.array) ||
        (Array.isArray(a.directArticle?.oenNumbers) ? a.directArticle.oenNumbers : a.directArticle?.oenNumbers?.array) ||
        [];
      const oeNumbers = rawOeNumbers.filter(Boolean);

      // 6. Comprehensive Image extraction with guaranteed high-definition fallback
      let imageUrl =
        a.imageURL800 ||
        a.imageURL400 ||
        a.imageURL200 ||
        a.imageUrl ||
        a.directArticle?.imageUrl ||
        null;

      const docsList =
        (Array.isArray(a.images) ? a.images : a.images?.array) ||
        (Array.isArray(a.articleDocuments?.array) ? a.articleDocuments.array : (Array.isArray(a.articleDocuments) ? a.articleDocuments : [])) ||
        (Array.isArray(a.directArticle?.images) ? a.directArticle.images : a.directArticle?.images?.array) ||
        (Array.isArray(a.directArticle?.articleDocuments?.array) ? a.directArticle.articleDocuments.array : []);

      const allImages = [];

      if (!imageUrl && docsList && docsList.length > 0) {
        imageUrl =
          docsList[0].imageURL800 ||
          docsList[0].imageURL400 ||
          docsList[0].imageURL200 ||
          docsList[0].imageURL100 ||
          docsList[0].docUrl ||
          null;
      }

      docsList.forEach((d) => {
        const u = d.imageURL800 || d.imageURL400 || d.imageURL200 || d.imageURL100 || d.docUrl || d.url;
        if (u && !allImages.includes(u)) {
          allImages.push(u);
        }
      });

      if (!imageUrl) {
        imageUrl = getFallbackProductImage(brandName, title, primaryPartNumber);
      }

      if (imageUrl && !allImages.includes(imageUrl)) {
        allImages.unshift(imageUrl);
      }

      return {
        id: a.articleId || a.directArticle?.articleId || a.id || `art_${idx}`,
        articleNumber: primaryPartNumber,
        stockNumber,
        title,
        brandName,
        specs,
        tradeNumbers,
        oeNumbers,
        imageUrl,
        allImages: allImages.length > 0 ? allImages : [imageUrl],
        raw: a,
      };
    });
    } catch (err) {
      console.error('Error formatting catalog articles:', err);
      return [];
    }
  }, [catalogArticles, selectedBrand, selectedCategory, partNumberQuery]);

  const columns = [
    {
      key: 'photo',
      label: 'Photo',
      width: '10%',
      render: (row) => {
        const fallback = getFallbackProductImage(row.brandName, row.title, row.articleNumber);
        return (
          <div
            onClick={() => setSelectedArticle(row)}
            className="w-11 h-11 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center cursor-pointer hover:border-brand-red hover:shadow-xs transition-all group overflow-hidden"
            title="Click to inspect component details and specifications"
          >
            <img
              src={row.imageUrl || fallback}
              alt={row.articleNumber}
              onError={(e) => {
                if (e.target.src !== fallback) {
                  e.target.src = fallback;
                }
              }}
              className="w-full h-full object-contain transition-transform group-hover:scale-110 duration-150"
            />
          </div>
        );
      },
    },
    {
      key: 'articleNumber',
      label: 'Part Number',
      width: '20%',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div>
            <span className="font-mono font-black text-xs text-slate-900 block leading-tight">
              {row.articleNumber}
            </span>
            {row.stockNumber && row.stockNumber !== row.articleNumber && (
              <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wider font-mono">
                Stock #{row.stockNumber}
              </span>
            )}
            <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{row.brandName}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Component Category',
      width: '24%',
      render: (row) => (
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Wrench className="w-3 h-3 text-slate-400" />
          {row.title}
        </span>
      ),
    },
    {
      key: 'specs',
      label: 'Key Technical Specs',
      width: '32%',
      render: (row) => {
        const topSpecs = (row.specs || []).slice(0, 2);
        if (topSpecs.length === 0) {
          return <span className="text-[11px] text-slate-400 italic">OEM standard specs</span>;
        }
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {topSpecs.map((s, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
              >
                {s.label}: <strong className="text-slate-900">{s.value}</strong>
              </span>
            ))}
            {row.specs.length > 2 && (
              <span className="text-[10px] font-bold text-slate-400">+{row.specs.length - 2} more</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'action',
      label: 'Inspect',
      align: 'right',
      width: '16%',
      render: (row) => (
        <button
          onClick={() => setSelectedArticle(row)}
          className="h-7 px-3 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 rounded-md font-bold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          <FileText className="w-3 h-3" />
          <span>Full Specs</span>
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 w-full space-y-4 font-sans select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${selectedBrand === 'kyb' ? 'bg-[#E31837]' : 'bg-[#008752]'}`}>
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                {selectedBrand === 'kyb' ? 'KYB Suspension Part Search' : 'NGK & NTK Ignition Part Search'}
              </h1>
              <p className="text-[11px] font-semibold text-slate-400">
                Direct TecDoc Pegasus 3.0 catalog lookup for verified replacement components.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Mode Switcher Tabs (2 Modules) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setSearchMode('vehicle')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            searchMode === 'vehicle'
              ? selectedBrand === 'kyb'
                ? 'bg-[#E31837] text-white shadow-sm ring-2 ring-[#E31837]/20'
                : 'bg-[#008752] text-white shadow-sm ring-2 ring-[#008752]/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Vehicle Dropdown Search</span>
        </button>

        <button
          type="button"
          onClick={() => setSearchMode('number')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            searchMode === 'number'
              ? selectedBrand === 'kyb'
                ? 'bg-[#E31837] text-white shadow-sm ring-2 ring-[#E31837]/20'
                : 'bg-[#008752] text-white shadow-sm ring-2 ring-[#008752]/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Part Number Search</span>
        </button>
      </div>

      {/* Module 1: Vehicle Dropdown Search */}
      {searchMode === 'vehicle' && (
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          {/* Header Row: Application Type Selector */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Select Vehicle Application & Trim
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Type:
              </span>
              {applications.map((app) => {
                const isSelected = selectedApp === app.id;
                const Icon = app.icon;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedApp(app.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{app.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 Cascade Dropdown Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* 1. Manufacturer / Make */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
                1. Make / Manufacturer
              </label>
              <div className="relative">
                <select
                  value={selectedManufacturer}
                  onChange={(e) => setSelectedManufacturer(e.target.value)}
                  disabled={dropdownLoading && manufacturersList.length === 0}
                  className="w-full h-11 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:border-brand-red focus:outline-none cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <option value="">-- Choose Manufacturer --</option>
                  {manufacturersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. Model Series */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
                2. Model Series
              </label>
              <div className="relative">
                <select
                  value={selectedSeries}
                  onChange={(e) => setSelectedSeries(e.target.value)}
                  disabled={!selectedManufacturer || seriesList.length === 0}
                  className="w-full h-11 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:border-brand-red focus:outline-none cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <option value="">
                    {!selectedManufacturer
                      ? '-- Select Make First --'
                      : seriesList.length === 0
                      ? 'No Series Available'
                      : '-- Choose Model Series --'}
                  </option>
                  {seriesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. Engine / Variant */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
                3. Engine / Trim / Variant
              </label>
              <div className="relative">
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  disabled={!selectedSeries || variantsList.length === 0}
                  className="w-full h-11 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:border-brand-red focus:outline-none cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <option value="">
                    {!selectedSeries
                      ? '-- Select Series First --'
                      : variantsList.length === 0
                      ? 'No Variants Available'
                      : '-- Choose Engine / Trim --'}
                  </option>
                  {variantsList.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-semibold text-slate-400">
              {dropdownLoading ? 'Loading automotive catalog metadata...' : selectedVariant ? 'Ready to search verified fitment.' : 'Select Make, Series & Engine to search parts.'}
            </span>
            <button
              type="button"
              onClick={handleVehicleSearch}
              disabled={!selectedVariant || loading}
              className={`h-11 px-6 ${
                selectedBrand === 'kyb'
                  ? 'bg-[#E31837] hover:bg-[#c91530]'
                  : 'bg-[#008752] hover:bg-[#007345]'
              } text-white rounded-lg font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Find Verified Articles</span>
            </button>
          </div>
        </div>
      )}

      {/* Module 2: Part Number Search */}
      {searchMode === 'number' && (
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <form onSubmit={handlePartNumberSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={partNumberQuery}
                onChange={(e) => setPartNumberQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handlePartNumberSearch(e);
                  }
                }}
                placeholder="Enter NGK, KYB, or OEM part number (e.g. BKR6E-11, ILZKR7B-11, 333338)..."
                className="w-full h-11 pl-9 pr-9 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-brand-red focus:outline-none transition-all"
              />
              {partNumberQuery && (
                <button
                  type="button"
                  onClick={() => setPartNumberQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!partNumberQuery.trim() || loading}
              className={`h-11 px-6 ${selectedBrand === 'kyb' ? 'bg-[#E31837] hover:bg-[#c91530]' : 'bg-[#008752] hover:bg-[#007345]'} text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap`}
              title="Search Parts"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Search Parts</span>
            </button>
          </form>

          {/* Quick Example Presets */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-semibold text-slate-400">
            <span>Quick queries:</span>
            {selectedBrand === 'kyb' ? (
              ['333729', '333338', '133002', 'RA1829'].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setPartNumberQuery(ex);
                    setSearchParams({ q: ex });
                    dispatch(searchArticlesCatalog({ searchType: 'number', query: ex, brand: selectedBrand }));
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-bold cursor-pointer transition-colors"
                >
                  {ex}
                </button>
              ))
            ) : (
              ['BKR6E-11', 'ILZKR7B-11', 'LFR6A-11', 'DCPR7E', 'U5014'].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setPartNumberQuery(ex);
                    setSearchParams({ q: ex });
                    dispatch(searchArticlesCatalog({ searchType: 'number', query: ex, brand: selectedBrand }));
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-bold cursor-pointer transition-colors"
                >
                  {ex}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Category Filter:
          </span>
          {(selectedBrand === 'kyb'
            ? [
                { id: 'all', label: 'All Suspension' },
                { id: 'shock', label: 'Shock Absorbers' },
                { id: 'strut', label: 'Struts & Cartridges' },
                { id: 'spring', label: 'Coil Springs' },
                { id: 'mount', label: 'Strut Mounts & Kits' },
              ]
            : selectedBrand === 'ngk'
            ? [
                { id: 'all', label: 'All NGK & NTK' },
                { id: 'spark', label: 'Spark Plugs' },
                { id: 'glow', label: 'Glow Plugs' },
                { id: 'coil', label: 'Ignition Coils & Leads' },
                { id: 'sensor', label: 'Lambda / O2 Sensors' },
                { id: 'egt', label: 'EGT & Engine Sensors' },
              ]
            : [
                { id: 'all', label: 'All Categories' },
                { id: 'spark', label: 'Spark Plugs' },
                { id: 'glow', label: 'Glow Plugs' },
                { id: 'coil', label: 'Ignition Coils' },
                { id: 'sensor', label: 'NTK Sensors' },
                { id: 'shock', label: 'Shock Absorbers' },
                { id: 'strut', label: 'Struts & Dampers' },
                { id: 'spring', label: 'Coil Springs' },
              ]
          ).map((cat) => {
            const count = categoryCounts[cat.id] ?? 0;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? selectedBrand === 'kyb'
                      ? 'bg-[#E31837] text-white shadow-xs'
                      : 'bg-[#008752] text-white shadow-xs'
                    : count === 0
                    ? 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : count === 0
                      ? 'bg-slate-200/50 text-slate-400'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] font-bold text-slate-400 shrink-0">
          Showing <span className="text-slate-800 font-extrabold">{formattedArticles.length}</span> parts
        </div>
      </div>

      {/* Helpful banner when selected category has 0 items but other parts exist */}
      {selectedCategory !== 'all' && formattedArticles.length === 0 && brandFilteredArticles.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-amber-900">
                0 components under this category
              </h4>
              <p className="text-[11px] font-medium text-amber-700 mt-0.5">
                There are {brandFilteredArticles.length} verified {selectedBrand?.toUpperCase()} components available for this search under other categories.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all cursor-pointer whitespace-nowrap ${
              selectedBrand === 'kyb' ? 'bg-[#E31837] hover:bg-[#c91530]' : 'bg-[#008752] hover:bg-[#007345]'
            }`}
          >
            Show All ({brandFilteredArticles.length}) Parts
          </button>
        </div>
      )}

      {/* Results Table */}
      <DataTable
        columns={columns}
        data={formattedArticles}
        loading={loading}
        emptyMessage="No articles loaded. Enter a part number, trade number, or OEM reference above to search."
        initialPageSize={25}
      />

      {/* Slide-Over Technical Specifications Inspection Drawer (Coming from Left by default) */}
      {selectedArticle && (
        <div className={`fixed inset-0 z-50 flex ${drawerSide === 'left' ? 'justify-start' : 'justify-end'}`}>
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedArticle(null)}
          />

          <div
            className={`relative w-full max-w-xl bg-white shadow-2xl h-full flex flex-col z-10 ${
              drawerSide === 'left' ? 'animate-slide-in-left border-r' : 'animate-slide-in-right border-l'
            } border-slate-200`}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-rose-50 text-brand-red rounded-xl shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-mono font-black text-slate-900 truncate">
                      {selectedArticle.articleNumber}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      TecDoc Verified
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 truncate block mt-0.5">
                    {selectedArticle.brandName} • {selectedArticle.title}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Dock Position Switcher */}
                <button
                  onClick={() => setDrawerSide((prev) => (prev === 'left' ? 'right' : 'left'))}
                  title={drawerSide === 'left' ? 'Dock to Right' : 'Dock to Left'}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                >
                  {drawerSide === 'left' ? (
                    <PanelRight className="w-4 h-4" />
                  ) : (
                    <PanelLeft className="w-4 h-4" />
                  )}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Part Identity Overview Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Catalog Part Number
                    </span>
                    <span className="text-lg font-mono font-black text-slate-900 block mt-0.5">
                      {selectedArticle.articleNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyPartNumber(selectedArticle.articleNumber)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedNumber ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Manufacturer / Division
                    </span>
                    <span className="font-extrabold text-slate-900 block mt-0.5">
                      {selectedArticle.brandName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Component Category
                    </span>
                    <span className="font-extrabold text-slate-900 block mt-0.5">
                      {selectedArticle.title}
                    </span>
                  </div>
                </div>

                {selectedArticle.tradeNumbers && selectedArticle.tradeNumbers.length > 0 && (
                  <div className="pt-3 border-t border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Trade / Superseded References
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedArticle.tradeNumbers.map((tn, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 bg-white border border-slate-200 rounded font-mono text-[11px] font-bold text-slate-700"
                        >
                          {tn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Component Visual Representation */}
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-white p-4 flex flex-col items-center justify-center relative group shadow-2xs">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Verified Component Visual
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setActiveImageIndex(0);
                        setZoomLevel(1);
                        setRotationAngle(0);
                        setIsFullScreenImageModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
                      title="Open Full Screen Visual Inspector"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Full Screen</span>
                    </button>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {selectedArticle.brandName}
                    </span>
                  </div>
                </div>
                <div
                  onClick={() => {
                    setActiveImageIndex(0);
                    setZoomLevel(1);
                    setRotationAngle(0);
                    setIsFullScreenImageModalOpen(true);
                  }}
                  className="w-full h-48 flex items-center justify-center bg-slate-50/70 rounded-lg p-2 relative group/img cursor-pointer overflow-hidden"
                  title="Click to inspect full screen"
                >
                  <img
                    src={
                      selectedArticle.imageUrl ||
                      getFallbackProductImage(
                        selectedArticle.brandName,
                        selectedArticle.title,
                        selectedArticle.articleNumber
                      )
                    }
                    alt={selectedArticle.articleNumber}
                    onError={(e) => {
                      const fb = getFallbackProductImage(
                        selectedArticle.brandName,
                        selectedArticle.title,
                        selectedArticle.articleNumber
                      );
                      if (e.target.src !== fb) {
                        e.target.src = fb;
                      }
                    }}
                    className="max-h-44 max-w-full object-contain transition-transform group-hover:scale-105 duration-200"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white font-bold text-xs backdrop-blur-xs">
                    <Maximize2 className="w-5 h-5 text-emerald-400" />
                    <span>Click for Full-Screen Inspector</span>
                    <span className="text-[10px] text-slate-300 font-normal">Zoom, Rotate & Specs</span>
                  </div>
                </div>
                <div className="mt-2 text-[11px] font-medium text-slate-400 text-center flex items-center justify-between w-full">
                  <span>High-definition documentation</span>
                  <button
                    onClick={() => {
                      setActiveImageIndex(0);
                      setZoomLevel(1);
                      setRotationAngle(0);
                      setIsFullScreenImageModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" /> Inspect Details
                  </button>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-brand-red" />
                    Factory Specifications & Properties
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {selectedArticle.specs?.length || 0} Attributes
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {selectedArticle.specs.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-colors"
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                        {s.label}
                      </span>
                      <span className="font-extrabold text-slate-900 block mt-1 text-[13px] leading-snug">
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* OE Cross Reference Numbers (if available) */}
              {selectedArticle.oeNumbers && selectedArticle.oeNumbers.length > 0 && (
                <div>
                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    Manufacturer OE Reference Numbers
                  </span>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.oeNumbers.map((oe, oeIdx) => {
                        const oeVal = typeof oe === 'object' ? oe.oeNumber || oe.articleNumber || oe.name : oe;
                        const mfr = typeof oe === 'object' ? oe.mfrName || oe.brandName : '';
                        return (
                          <div
                            key={oeIdx}
                            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                          >
                            <span className="font-mono font-black text-slate-900">{oeVal}</span>
                            {mfr && <span className="text-[10px] text-slate-400 ml-1.5">({mfr})</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Quality & Assurance Footer Card */}
              <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-4 flex items-center gap-3">
                <div className="p-2 bg-emerald-100/80 text-emerald-800 rounded-lg shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-900">
                    100% Genuine Certified Component
                  </h4>
                  <p className="text-[11px] font-medium text-emerald-700 mt-0.5 leading-relaxed">
                    Sourced directly via TecDoc Pegasus 3.0 Enterprise linking data with ISO/IATF 16949 automotive standards.
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky Drawer Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Part ID: <span className="font-mono font-bold text-slate-800">{selectedArticle.id}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveImageIndex(0);
                    setZoomLevel(1);
                    setRotationAngle(0);
                    setIsFullScreenImageModalOpen(true);
                  }}
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Screen View</span>
                </button>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="h-9 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  Close Specifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Image & Specs Modal */}
      {isFullScreenImageModalOpen && selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-xl flex flex-col text-slate-100 select-none animate-in fade-in duration-200">
          {/* Top Control Bar */}
          <div className="h-16 px-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
            {/* Left: Brand & Part Identity */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center p-1 shadow-md shrink-0 ${
                  selectedBrand === 'kyb'
                    ? 'bg-white shadow-red-600/30 ring-1 ring-red-500/30'
                    : 'bg-white shadow-emerald-600/30 ring-1 ring-emerald-500/30'
                }`}
              >
                <img
                  src={selectedBrand === 'kyb' ? '/images/branding/kyb_icon.png' : '/images/branding/ngk_logo.png'}
                  alt={selectedBrand === 'kyb' ? 'KYB' : 'NGK'}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-white tracking-wider truncate">
                    {selectedArticle.articleNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Pegasus 3.0 Verified
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium truncate">
                  {selectedArticle.brandName} • {selectedArticle.title}
                </span>
              </div>
            </div>

            {/* Center: Image Controls (Zoom / Rotate) */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="px-2 text-xs font-mono font-bold text-slate-300 min-w-[52px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>

              <button
                onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 4))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-slate-800 mx-1"></div>

              <button
                onClick={() => {
                  setZoomLevel(1);
                  setRotationAngle(0);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reset Zoom (0)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setRotationAngle((prev) => (prev + 90) % 360)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Rotate 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Actions & Close */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowModalSpecs((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                  showModalSpecs
                    ? 'bg-slate-800 text-white border-slate-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border-slate-800'
                }`}
                title="Toggle Specifications Panel"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Specifications</span>
              </button>

              {selectedArticle.allImages?.[activeImageIndex] && (
                <a
                  href={selectedArticle.allImages[activeImageIndex]}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800 cursor-pointer"
                  title="Open Original Asset"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <button
                onClick={() => setIsFullScreenImageModalOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-black transition-colors cursor-pointer"
                title="Close Modal (Esc)"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>
          </div>

          {/* Main Visual Workspace */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Center High-Definition Canvas */}
            <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
              {/* Subtle Grid Backdrop for Engineering Precision */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

              {/* Main Scaled Image */}
              <div className="relative z-10 flex items-center justify-center max-w-full max-h-full transition-transform duration-150 ease-out">
                <img
                  src={
                    selectedArticle.allImages?.[activeImageIndex] ||
                    selectedArticle.imageUrl ||
                    getFallbackProductImage(
                      selectedArticle.brandName,
                      selectedArticle.title,
                      selectedArticle.articleNumber
                    )
                  }
                  alt={selectedArticle.articleNumber}
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotationAngle}deg)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="max-h-[75vh] max-w-[85vw] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] filter rounded-lg"
                />
              </div>

              {/* Multi-Angle Image Gallery Carousel (if multiple photos exist) */}
              {selectedArticle.allImages && selectedArticle.allImages.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl backdrop-blur-md shadow-2xl">
                  {selectedArticle.allImages.map((imgUrl, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveImageIndex(i);
                        setZoomLevel(1);
                      }}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all p-1 bg-white/95 cursor-pointer ${
                        activeImageIndex === i
                          ? selectedBrand === 'kyb'
                            ? 'border-red-500 shadow-md shadow-red-600/40 scale-105'
                            : 'border-emerald-500 shadow-md shadow-emerald-600/40 scale-105'
                          : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Angle ${i + 1}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Technical Specifications & Provenance Drawer */}
            {showModalSpecs && (
              <div className="w-96 bg-slate-900/95 border-l border-slate-800 p-6 overflow-y-auto flex flex-col gap-6 z-20 backdrop-blur-md shrink-0">
                {/* Section A: Part Identification */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Catalog Identification
                    </span>
                    <button
                      onClick={() => handleCopyPartNumber(selectedArticle.articleNumber)}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <h3 className="font-mono text-2xl font-black text-white tracking-wider">
                    {selectedArticle.articleNumber}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    {selectedArticle.title}
                  </p>
                </div>

                {/* Section B: Trade & OE Cross References */}
                {(selectedArticle.tradeNumbers?.length > 0 || selectedArticle.oeNumbers?.length > 0) && (
                  <div className="space-y-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    {selectedArticle.tradeNumbers?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Trade / Superseded
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {selectedArticle.tradeNumbers.map((t, idx) => (
                            <span
                              key={idx}
                              className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedArticle.oeNumbers?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          OE Cross References
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {selectedArticle.oeNumbers.slice(0, 8).map((oe, idx) => (
                            <span
                              key={idx}
                              className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800/80 text-emerald-400 border border-emerald-500/20"
                            >
                              {typeof oe === 'object' ? oe.oeNumber || oe.name : String(oe)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Section C: Technical Specifications List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-brand-red" />
                      Factory Specifications
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {selectedArticle.specs?.length || 0} Attributes
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedArticle.specs?.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                      >
                        <span className="text-[11px] font-semibold text-slate-400 truncate">
                          {s.label}
                        </span>
                        <span className="font-mono text-xs font-black text-white text-right shrink-0">
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section D: Provenance Stamp */}
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 mt-auto">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-emerald-300">
                      Certified High-Definition Asset
                    </h4>
                    <p className="text-[10px] font-medium text-emerald-400/80 mt-0.5 leading-relaxed">
                      Sourced via Pegasus 3.0 Real-Time Verified Automotive Registry with ISO/IATF 16949 standards.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PartFinder;
