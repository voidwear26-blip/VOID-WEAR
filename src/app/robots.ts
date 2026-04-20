import { MetadataRoute } from 'next';

/**
 * VOID WEAR ROBOTS PROTOCOL
 * Guides search crawlers through the public void while guarding restricted nodes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/', 
          '/api/', 
          '/checkout/', 
          '/profile/', 
          '/*?*' // Disallow tracking parameters to prevent duplicate indexing
        ],
      },
    ],
    sitemap: 'https://void-wear.vercel.app/sitemap.xml',
  };
}
