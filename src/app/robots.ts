import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/explore',
          '/settings',
          '/settings/group',
          '/onboarding',
          '/setup-guide',
          '/api/',
          '/sign-in',
          '/sign-up'
        ],
      },
    ],
    sitemap: 'https://marigoldinsights.org/sitemap.xml',
  };
}
