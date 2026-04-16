import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = 'https://rocommend.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const roasteries = await prisma.roastery.findMany({
    select: { id: true, updatedAt: true },
  })

  const roasteryEntries: MetadataRoute.Sitemap = roasteries.map((r) => ({
    url: `${BASE_URL}/roasteries/${r.id}`,
    lastModified: r.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: `${BASE_URL}/home`,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/roasteries`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...roasteryEntries,
  ]
}
