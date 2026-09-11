import { COLORS } from '../../utils/theme';

export const BRAND_CONFIG = {
  brand: 'ngk',
  brandName: 'NGK SPARK PLUG & NTK',
  shortName: 'NGK',
  companyName: 'Niterra EMEA GmbH',
  primaryColor: COLORS.primary,
  secondaryColor: COLORS.ntkGreen,
  darkColor: COLORS.dark,
  accentColor: COLORS.accent,
  allowedSuppliers: [15, 5414],
  catalogSubtitle: 'Official Niterra TecDoc Verified Catalog',
  categories: [
    { id: 'all', label: 'All Verified' },
    { id: 'ignition', label: 'Ignition & Glow' },
    { id: 'sensors', label: 'Sensors & Electronics' },
  ],
};

export default BRAND_CONFIG;

