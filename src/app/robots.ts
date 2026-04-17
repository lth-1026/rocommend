import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/login', '/onboarding', '/admin/', '/api/'],
    },
    sitemap: 'https://rocommend.com/sitemap.xml',
  }
}
