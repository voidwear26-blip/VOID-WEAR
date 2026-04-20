import { MetadataRoute } from 'next';

/**
 * VOID WEAR ROBOTS PROTOCOL
 * Optimized for https://voidwear.co.in
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
          '/*?*'
        ],
      },
    ],
    sitemap: 'https://voidwear.co.in/sitemap.xml',
  };
}
