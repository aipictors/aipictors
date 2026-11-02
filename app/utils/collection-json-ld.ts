import type { Thing, WithContext } from "schema-dts"
import { config } from "~/config"

type Item = {
  name: string
  /** サイト内のパス（/posts/123 など） */
  path: string
}

type Props = {
  name: string
  /** このページのサイト内のパス */
  path: string
  items: Item[]
  lang?: string
  /** パンくずで間に挟むページ */
  parents?: Item[]
  /** 構造化データに載せる上限 */
  limit?: number
}

/**
 * 一覧ページの構造化データ（CollectionPage + ItemList + BreadcrumbList）
 */
export function createCollectionJsonLd(
  props: Props,
): Array<WithContext<Thing>> {
  const prefix = props.lang === "en" ? "/en" : ""
  const toUrl = (path: string) => `${config.siteURL}${prefix}${path}`

  const breadcrumbs = [...(props.parents ?? []), { name: props.name, path: props.path }]

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: props.name,
      url: toUrl(props.path),
      mainEntity: {
        "@type": "ItemList",
        itemListElement: props.items
          .slice(0, props.limit ?? 20)
          .map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: toUrl(item.path),
          })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Aipictors",
          item: `${config.siteURL}${prefix || "/"}`,
        },
        ...breadcrumbs.map((item, index) => ({
          "@type": "ListItem" as const,
          position: index + 2,
          name: item.name,
          item: toUrl(item.path),
        })),
      ],
    },
  ]
}
