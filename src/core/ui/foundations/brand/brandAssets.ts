export type BrandLogoName = 'ypf' | 'ypfWhite' | 'powerApps' | 'plataformas365' | 'shpTemplate';

// Brand logos exported from the Figma "DS - Sharepoint - Fluent UI v8".
const brandLogos: Record<BrandLogoName, string> = {
  ypf: require('./assets/ypf.png'),
  ypfWhite: require('./assets/ypf-white.png'),
  powerApps: require('./assets/power-apps.png'),
  plataformas365: require('./assets/plataformas365.png'),
  shpTemplate: require('./assets/shp-template.png'),
};

export function getBrandLogoSource(name: BrandLogoName): string {
  return brandLogos[name];
}
