import { toResizedImageUrl } from "~/utils/resized-image-url"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { ExternalLinkIcon, MegaphoneIcon } from "lucide-react"
import { useContext } from "react"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

/** 宣伝作品の枠の色（ほかの一覧と見分けられるように） */
const PROMOTION_FRAME_CLASS =
  "rounded-xl bg-linear-to-r from-amber-400 via-pink-500 to-violet-500 p-px"

const isValidUrl = (url: string | null | undefined): url is string =>
  typeof url === "string" && /^https?:\/\//.test(url)

/**
 * 宣伝作品のしるし（サムネイルに重ねる）
 */
export function WorkPromotionMark(props: { className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none rounded bg-linear-to-r from-amber-400 to-pink-500 px-1.5 py-0.5 font-bold text-[10px] text-white leading-none shadow",
        props.className,
      )}
    >
      {"PR"}
    </span>
  )
}

/**
 * 作品ページの宣伝の帯。関連リンクがあれば大きなボタンで出す
 */
export function WorkPromotionBanner(props: {
  relatedUrl?: string | null
  userName?: string
}) {
  const t = useTranslation()
  const url = isValidUrl(props.relatedUrl) ? props.relatedUrl : null

  return (
    <div className={PROMOTION_FRAME_CLASS}>
      <div className="flex flex-col gap-3 rounded-[11px] bg-card p-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <WorkPromotionMark className="shrink-0" />
          <p className="min-w-0 text-sm">
            {t(
              `${props.userName ?? "作者"}さんの宣伝作品です`,
              `Promoted by ${props.userName ?? "the creator"}`,
            )}
          </p>
        </div>
        {url && (
          <Button asChild className="shrink-0">
            <a href={url} target="_blank" rel="sponsored noopener noreferrer">
              {t("詳しく見る", "Learn more")}
              <ExternalLinkIcon className="ml-1 size-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * ホームの宣伝枠（公開から 7 日間の宣伝作品）。なければ何も出さない
 */
export function HomePromotionWorksSection(props: { isSensitive?: boolean }) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const { data } = useQuery(PromotionWorksQuery, {
    skip: authContext.isLoading,
    variables: { limit: 6, isSensitive: props.isSensitive === true },
  })
  const works = data?.promotionWorks ?? []

  if (works.length === 0) {
    return null
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-bold text-lg">
          <MegaphoneIcon className="size-5 text-pink-500" />
          {t("クリエイターの宣伝", "From our creators")}
          <WorkPromotionMark />
        </h2>
        <Link
          to="/plus"
          className="shrink-0 text-muted-foreground text-xs hover:text-foreground"
        >
          {t("宣伝枠について", "About promotions")}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {works.map((work) => (
          <div key={work.id} className={PROMOTION_FRAME_CLASS}>
            <div className="flex h-full flex-col overflow-hidden rounded-[11px] bg-card">
              <Link to={`/posts/${work.id}`} className="block">
                <img
                  src={toResizedImageUrl(work.largeThumbnailImageURL, 640)}
                  alt={t.workTitle(work.title, work.enTitle)}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <Link
                  to={`/posts/${work.id}`}
                  className="line-clamp-2 font-bold text-sm hover:underline"
                >
                  {t.workTitle(work.title, work.enTitle)}
                </Link>
                {work.user && (
                  <Link
                    to={`/users/${work.user.login}`}
                    className="flex min-w-0 items-center gap-1.5 text-muted-foreground text-xs hover:text-foreground"
                  >
                    <img
                      src={toResizedImageUrl(withIconUrlFallback(work.user.iconUrl), 96)}
                      alt=""
                      loading="lazy"
                      className="size-5 shrink-0 rounded-full object-cover"
                    />
                    <span className="truncate">{work.user.name}</span>
                  </Link>
                )}
                {isValidUrl(work.relatedUrl) && (
                  <a
                    href={work.relatedUrl}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="mt-auto flex items-center gap-1 font-medium text-pink-600 text-xs hover:underline dark:text-pink-400"
                  >
                    {t("詳しく見る", "Learn more")}
                    <ExternalLinkIcon className="size-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

const PromotionWorksQuery = graphql(
  `query PromotionWorks($limit: Int!, $isSensitive: Boolean) {
    promotionWorks(limit: $limit, isSensitive: $isSensitive) {
      id
      title
      enTitle
      largeThumbnailImageURL
      relatedUrl
      user {
        id
        login
        name
        iconUrl
      }
    }
  }`,
)
