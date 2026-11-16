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
 * 作品ページの宣伝の帯。関連リンクがあれば大きなボタンで出す。
 * isPreview は案内ページなどの見本で、ボタンは見た目だけにして押せないようにする
 */
export function WorkPromotionBanner(props: {
  relatedUrl?: string | null
  userName?: string
  isPreview?: boolean
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
          <Button
            asChild
            className={cn("shrink-0", props.isPreview && "pointer-events-none")}
          >
            {props.isPreview ? (
              <span aria-hidden>
                {t("詳しく見る", "Learn more")}
                <ExternalLinkIcon className="ml-1 size-4" />
              </span>
            ) : (
              <a href={url} target="_blank" rel="sponsored noopener noreferrer">
                {t("詳しく見る", "Learn more")}
                <ExternalLinkIcon className="ml-1 size-4" />
              </a>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * ホームの「クリエイターの宣伝」のカード。workId が無いときは見本（投稿画面・案内ページのプレビュー）でリンクにしない
 */
export function PromotionWorkCard(props: {
  workId?: string
  imageUrl?: string | null
  title: string
  userLogin?: string | null
  userName?: string | null
  userIconUrl?: string | null
  relatedUrl?: string | null
}) {
  const t = useTranslation()
  const href = props.workId ? `/posts/${props.workId}` : null
  const image = props.imageUrl ? (
    <img
      src={props.imageUrl}
      alt={props.title}
      loading="lazy"
      decoding="async"
      className="aspect-[4/3] w-full object-cover"
    />
  ) : (
    <div className="flex aspect-[4/3] w-full items-center justify-center bg-muted text-muted-foreground text-xs">
      {t("作品の画像", "Your image")}
    </div>
  )
  const user = (
    <>
      <img
        src={toResizedImageUrl(withIconUrlFallback(props.userIconUrl), 96)}
        alt=""
        loading="lazy"
        className="size-5 shrink-0 rounded-full object-cover"
      />
      <span className="truncate">{props.userName}</span>
    </>
  )
  const learnMore = (
    <>
      {t("詳しく見る", "Learn more")}
      <ExternalLinkIcon className="size-3" />
    </>
  )
  const learnMoreClassName =
    "mt-auto flex items-center gap-1 font-medium text-pink-600 text-xs dark:text-pink-400"
  return (
    <div className={PROMOTION_FRAME_CLASS}>
      <div className="flex h-full flex-col overflow-hidden rounded-[11px] bg-card">
        {href ? (
          <Link to={href} className="block">
            {image}
          </Link>
        ) : (
          image
        )}
        <div className="flex flex-1 flex-col gap-2 p-3">
          {href ? (
            <Link
              to={href}
              className="line-clamp-2 font-bold text-sm hover:underline"
            >
              {props.title}
            </Link>
          ) : (
            <p className="line-clamp-2 font-bold text-sm">{props.title}</p>
          )}
          {props.userName &&
            (href && props.userLogin ? (
              <Link
                to={`/users/${props.userLogin}`}
                className="flex min-w-0 items-center gap-1.5 text-muted-foreground text-xs hover:text-foreground"
              >
                {user}
              </Link>
            ) : (
              <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground text-xs">
                {user}
              </span>
            ))}
          {isValidUrl(props.relatedUrl) &&
            (href ? (
              <a
                href={props.relatedUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className={cn(learnMoreClassName, "hover:underline")}
              >
                {learnMore}
              </a>
            ) : (
              <span className={learnMoreClassName}>{learnMore}</span>
            ))}
        </div>
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
          to="/promotion"
          className="shrink-0 text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
        >
          {t("宣伝枠について・自分も出す", "About promotions")}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {works.map((work) => (
          <PromotionWorkCard
            key={work.id}
            workId={work.id}
            imageUrl={toResizedImageUrl(work.largeThumbnailImageURL, 640)}
            title={t.workTitle(work.title, work.enTitle)}
            userLogin={work.user?.login}
            userName={work.user?.name}
            userIconUrl={work.user?.iconUrl}
            relatedUrl={work.relatedUrl}
          />
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
