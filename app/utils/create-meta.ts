export const createMeta = (data: MetaData) => {
  const {
    title: metaTitle,
    description: metaDescription = "",
    image:
      metaImage = "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/aipictors-ogp.jpg",
    isIndex: metaIndex = true,
  } = data

  const metaTags = [
    { name: "robots", content: metaIndex ? "index" : "noindex" },
    { name: "description", content: metaDescription },
    { name: "twitter:title", content: metaTitle },
    { name: "twitter:description", content: metaDescription },
    { name: "twitter:image", content: metaImage },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:title", content: metaTitle },
    { property: "og:description", content: metaDescription },
    { property: "og:image", content: metaImage },
    { property: "og:site_name", content: metaTitle },
  ]

  return metaTags
}

export interface MetaData {
  title: string
  description?: string
  image?: string | null
  isIndex?: boolean
}
