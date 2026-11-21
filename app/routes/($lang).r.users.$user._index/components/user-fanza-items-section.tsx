import { graphql, type FragmentOf } from "gql.tada"
import { ExternalLinkIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { HomeSectionHeading } from "~/routes/($lang)._main._index/components/home-section-heading"

type Props = {
  items: FragmentOf<typeof UserFanzaItemFragment>[]
}

/**
 * R18 のプロフィールの「FANZA で販売中」（作者が登録した FANZA 同人のサークルの販売作品）
 * リンクは DMM のアフィリエイトリンク（API が返すもの）
 */
export function UserFanzaItemsSection(props: Props) {
  const t = useTranslation()

  if (props.items.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      <HomeSectionHeading
        title={t("FANZA で販売中", "On sale at FANZA")}
        description={t(
          "作者さんが FANZA で販売している作品です",
          "Works this creator sells on FANZA",
        )}
      />
      <ul className="flex snap-x gap-3 overflow-x-auto pb-2">
        {props.items.map((item) => (
          <li key={item.contentId} className="w-36 shrink-0 snap-start md:w-44">
            <a
              href={item.url}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="group block space-y-1.5"
            >
              <div className="aspect-[3/4] overflow-hidden rounded-md bg-muted">
                {item.imageUrl !== null && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    className="size-full object-cover transition-transform group-hover:scale-105"
                  />
                )}
              </div>
              <p className="line-clamp-2 font-medium text-sm leading-snug group-hover:underline">
                {item.title}
              </p>
              <p className="flex items-center gap-1 text-muted-foreground text-xs">
                {item.price !== null && (
                  <span>{t(`${item.price} 円`, `¥${item.price}`)}</span>
                )}
                <ExternalLinkIcon className="size-3" />
              </p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export const UserFanzaItemFragment = graphql(
  `fragment UserFanzaItem on FanzaItemNode @_unmask {
    contentId
    title
    url
    imageUrl
    price
  }`,
)
