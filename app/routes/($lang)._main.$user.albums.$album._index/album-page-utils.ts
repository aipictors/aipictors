import type { BreadcrumbList, CollectionPage, WithContext } from "schema-dts"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { SortType } from "~/types/sort-type"

export const ALBUM_WORKS_PER_PAGE = 32

/** これより後ろのページは最初のページとして扱う */
const ALBUM_MAX_PAGE = 100

export type AlbumWorkOrder = IntrospectionEnum<"AlbumWorkOrderBy">

export const toAlbumWorkOrder = (value: string | null): AlbumWorkOrder => {
  if (value === "DATE_CREATED" || value === "LIKES_COUNT") {
    return value
  }

  return "MANUAL"
}

export const toAlbumWorkSort = (value: string | null): SortType => {
  return value === "ASC" ? "ASC" : "DESC"
}

/**
 * URL の ?page=（1 始まり）を 0 始まりのページ番号にする
 */
export const toAlbumPageIndex = (value: string | null) => {
  const page = Number.parseInt(value ?? "1", 10)

  if (!Number.isInteger(page) || page < 1 || page > ALBUM_MAX_PAGE) {
    return 0
  }

  return page - 1
}

type AlbumForSeo = {
  title: string
  description: string
  slug?: string | null
  rating: string
  isSensitive: boolean
  worksCount: number
  thumbnailImageURL?: string | null
  createdAt?: number
  user: { login: string; name: string }
  firstWorks: {
    rating?: string | null
    largeThumbnailImageURL?: string | null
  }[]
}

type WorkForSeo = {
  id: string
  title: string
  rating?: string | null
  smallThumbnailImageURL?: string | null
}

const isAllAgesAlbum = (album: AlbumForSeo) => {
  return album.rating === "G" && !album.isSensitive
}

/**
 * R18 のシリーズ（全年齢のシリーズに混ざった R18 の作品は、一覧で画像を出さない）
 */
export const isAdultAlbum = (album: {
  rating: string
  isSensitive: boolean
}) => {
  return album.isSensitive || album.rating === "R18" || album.rating === "R18G"
}

export const isAdultWork = (work: { rating?: string | null }) => {
  return work.rating === "R18" || work.rating === "R18G"
}

/**
 * ページに出す表紙。未設定なら 1 作目の画像を使う（全年齢のシリーズでは R18 の作品を表紙にしない）
 */
export const toAlbumCoverUrl = (album: {
  rating: string
  isSensitive: boolean
  thumbnailImageURL?: string | null
  firstWorks: {
    rating?: string | null
    largeThumbnailImageURL?: string | null
    smallThumbnailImageURL?: string | null
  }[]
}) => {
  if (album.thumbnailImageURL) {
    return album.thumbnailImageURL
  }

  const firstWork = album.firstWorks[0]

  if (!firstWork || (!isAdultAlbum(album) && isAdultWork(firstWork))) {
    return null
  }

  return (
    firstWork.largeThumbnailImageURL || firstWork.smallThumbnailImageURL || null
  )
}

/**
 * OGP と構造化データに出してよい画像。
 * 全年齢のシリーズの表紙か 1 作目だけで、それ以外は SNS や検索結果に画像を出さない
 */
export const toAlbumShareImageUrl = (album: AlbumForSeo) => {
  if (!isAllAgesAlbum(album)) {
    return null
  }

  if (album.thumbnailImageURL) {
    return album.thumbnailImageURL
  }

  const firstWork = album.firstWorks[0]

  if (firstWork?.rating === "G" && firstWork.largeThumbnailImageURL) {
    return firstWork.largeThumbnailImageURL
  }

  return null
}

/**
 * title と description
 */
export const toAlbumMetaText = (album: AlbumForSeo, page: number) => {
  const count = album.worksCount
  const pagePart = page > 0 ? `（${page + 1}ページ目）` : ""
  const enPagePart = page > 0 ? ` (Page ${page + 1})` : ""
  const countPart = count > 0 ? `（全${count}作品）` : ""
  const enCountPart = count > 0 ? ` (${count} works)` : ""
  const name = album.user.name
  const description = album.description.trim()

  return {
    title: `${album.title}${countPart} - ${name}のシリーズ${pagePart}`,
    enTitle: `${album.title}${enCountPart} by ${name}${enPagePart}`,
    description: `${name}さんのシリーズ「${album.title}」${count > 0 ? `全${count}作品。` : "。"}${description || "AIイラストなどの作品を順番に見られます。"}`,
    enDescription: `"${album.title}" is a series by ${name}${count > 0 ? ` with ${count} works` : ""} on Aipictors.${description ? ` ${description}` : ""}`,
  }
}

/**
 * CollectionPage と BreadcrumbList
 */
export const toAlbumJsonLd = (props: {
  album: AlbumForSeo
  works: WorkForSeo[]
  siteUrl: string
  lang?: string
  labels: { series: string }
}): [WithContext<CollectionPage>, WithContext<BreadcrumbList>] => {
  const { album, works } = props
  const homeUrl = props.lang === "en" ? `${props.siteUrl}/en` : props.siteUrl
  const seriesListUrl = `${homeUrl}${isAdultAlbum(album) ? "/r" : ""}/albums`
  const pageUrl = `${homeUrl}/${album.user.login}/albums/${album.slug}`
  const imageUrl = toAlbumShareImageUrl(album)
  const description = album.description.trim()

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: album.title,
      description: description || undefined,
      url: pageUrl,
      image: imageUrl ?? undefined,
      isFamilyFriendly: isAllAgesAlbum(album),
      dateCreated: album.createdAt
        ? new Date(album.createdAt * 1000).toISOString()
        : undefined,
      author: {
        "@type": "Person",
        name: album.user.name,
        url: `${homeUrl}/users/${album.user.login}`,
      },
      isPartOf: { "@type": "WebSite", name: "Aipictors", url: homeUrl },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: album.worksCount,
        itemListElement: works.map((work, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${homeUrl}/posts/${work.id}`,
          name: work.title,
          image:
            isAllAgesAlbum(album) && work.rating === "G"
              ? (work.smallThumbnailImageURL ?? undefined)
              : undefined,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Aipictors", item: homeUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: props.labels.series,
          item: seriesListUrl,
        },
        { "@type": "ListItem", position: 3, name: album.title, item: pageUrl },
      ],
    },
  ]
}
