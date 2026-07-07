import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://marigoldinsights.org';
  const routes = [
    '',
    '/solutions/citizens',
    '/solutions/organizations',
    '/solutions/state-agencies',
    '/compliance',
    '/perspectives',
    '/partners',
    '/roadmap',
    '/deploy',
    '/anniversary',
    '/store',
    '/registry',
    '/sandbox'
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : route.startsWith('/solutions') ? 0.8 : 0.7,
  }));
}
