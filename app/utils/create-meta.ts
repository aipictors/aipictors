import { config, type MetaData } from "~/config"

export const createMeta = (
  data: MetaData,
  dynamicData?: { [key: string]: string },
) => {
  const replacePlaceholders = (str: string) => {
    if (!dynamicData) return str
    return str.replace(/{{(.*?)}}/g, (_, key) => dynamicData[key.trim()] || "")
  }

  const {
    title: metaTitle,
    description: metaDescription = metadata.descriptionJA,
    image: metaImage = config.defaultOgpImageUrl,
    isIndex: metaIndex = true,
    isTop = false,
  } = data

  // テンプレートを動的に置換
  const title = replacePlaceholders(
    metaTitle
      ? `${metaTitle} - ${metadata.nameJA} - ${metadata.catchphraseJA}`
      : metadata.titleJA,
  )

  const imageUrl = metaImage?.length
    ? replacePlaceholders(metaImage)
    : metaImage

  const description = replacePlaceholders(
    metaDescription.length > 155
      ? `${metaDescription.substring(0, 152)}...`
      : metaDescription,
  )

  const metaTags = [
    { title: title },
    {
      name: "robots",
      content: metaIndex ? "index, follow" : "noindex, nofollow",
    },
    { name: "description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { property: "og:site_name", content: metadata.nameJA },
    { property: "og:type", content: isTop ? "website" : "article" },
    { property: "og:url", content: "https://www.aipictors.com" },
  ]

  return metaTags
}

// サイトのメタ情報
export const metadata = {
  nameJA: "Aipictors",
  nameEN: "Aipictors",
  get titleJA() {
    return `${this.nameJA} - ${this.catchphraseJA}`
  },
  get titleEN() {
    return `${this.nameEN} - ${this.catchphraseEN}`
  },
  catchphraseJA: "AI画像投稿サイト・生成サイト",
  catchphraseEN: "AI Illustration & Generation",
  descriptionJA:
    "AI画像投稿サイト・生成サイト「Aipictors」で作品を公開してみよう！AIイラスト、AIフォト、AIグラビアなどプロンプトが数多く投稿されています！数十万作品の中からお気に入りの作品を見つけよう！",
}
