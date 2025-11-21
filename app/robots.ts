import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://fetchsub.com/sitemap.xml', // Assuming a domain, can be changed later
  };
}
