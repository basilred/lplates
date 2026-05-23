/**
 * URL для TopoJSON файлов стран.
 * Используем CDN Highcharts как надежный источник.
 */
export const MAP_CONFIG: Record<string, { url: string; center: [number, number]; scale: number }> = {
  ru: {
    url: 'https://code.highcharts.com/mapdata/countries/ru/ru-all.topo.json',
    center: [95, 60],
    scale: 150,
  },
  ua: {
    url: 'https://code.highcharts.com/mapdata/countries/ua/ua-all.topo.json',
    center: [31, 48.5],
    scale: 1200,
  },
  by: {
    url: 'https://code.highcharts.com/mapdata/countries/by/by-all.topo.json',
    center: [28, 53.5],
    scale: 2500,
  },
  cz: {
    url: 'https://code.highcharts.com/mapdata/countries/cz/cz-all.topo.json',
    center: [15.5, 49.8],
    scale: 4000,
  },
};
