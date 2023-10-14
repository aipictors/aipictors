import { Config } from "config"
import type { MetadataRoute } from "next"

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const eventRoutes = [
    {
      url: `${Config.appURL}/events/wakiaiai`,
      lastModified: new Date(),
    },
  ]

  return [...eventRoutes]
}

export default sitemap
