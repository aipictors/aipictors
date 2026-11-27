import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { ExternalLinkIcon, MegaphoneIcon } from "lucide-react"
import { useContext } from "react"
import { FollowButton } from "~/components/button/follow-button"
import { LikeButton } from "~/components/like-button"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { useViewerRatings } from "~/hooks/use-viewer-ratings"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { toResizedImageUrl } from "~/utils/resized-image-url"
import { filterWorksByRatings } from "~/utils/viewer-ratings"
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
 * トップの「おすすめ作品」のカード。宣伝の作品は虹色の枠と PR の印を付け、isPlain（宣伝ではないおすすめ）は普通のカードにする。
 * workId が無いときは見本（投稿画面・案内ページのプレビュー）でリンクにしない
 */
export function PromotionWorkCard(props: {
  workId?: string
  imageUrl?: string | null
  title: string
  userLogin?: string | null
  userName?: string | null
  userIconUrl?: string | null
  relatedUrl?: string | null
  /** 作者の ID。workId と一緒に渡すと、一覧からそのままいいねできる */
  userId?: string | null
  /** 宣伝ではないおすすめ作品。PR の印も宣伝の枠も付けない */
  isPlain?: boolean
  /** トップの最初に見える画像（先に読み込む） */
  isPriority?: boolean
  /** 作者をフォローしているか（宣伝の作品だけ、作者の横にフォローボタンを出す） */
  isFollowee?: boolean
  className?: string
}) {
  const t = useTranslation()
  const href = props.workId ? `/posts/${props.workId}` : null
  const image = props.imageUrl ? (
    <img
      src={props.imageUrl}
      alt={props.title}
      loading={props.isPriority ? "eager" : "lazy"}
      fetchPriority={props.isPriority ? "high" : undefined}
      decoding="async"
      className={cn(
        "aspect-[4/3] w-full object-cover",
        props.isPlain && "rounded-xl",
      )}
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
        className={cn(
          "shrink-0 rounded-full object-cover",
          // 宣伝の作品は作者を少し大きめに（おすすめのカードは小さいまま）
          props.isPlain ? "size-5" : "size-6",
        )}
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
    <div
      className={cn(!props.isPlain && PROMOTION_FRAME_CLASS, props.className)}
    >
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden",
          !props.isPlain && "rounded-[11px] bg-card",
        )}
      >
        {href ? (
          <div className="relative">
            <Link to={href} className="block">
              {image}
            </Link>
            {!props.isPlain && (
              <WorkPromotionMark className="absolute top-1.5 left-1.5" />
            )}
            {props.workId && props.userId && (
              <div className="absolute right-0 bottom-0">
                <LikeButton
                  size={48}
                  targetWorkId={props.workId}
                  targetWorkOwnerUserId={props.userId}
                  defaultLikedCount={0}
                  isBackgroundNone={true}
                  strokeWidth={2}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            {image}
            {!props.isPlain && (
              <WorkPromotionMark className="absolute top-1.5 left-1.5" />
            )}
          </div>
        )}
        <div
          className={cn(
            "flex flex-1 flex-col gap-2",
            props.isPlain ? "pt-2" : "p-3",
          )}
        >
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
          {props.userName && (
            <div className="flex min-w-0 items-center gap-2">
              {href && props.userLogin ? (
                <Link
                  to={`/users/${props.userLogin}`}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-1.5 text-muted-foreground hover:text-foreground",
                    props.isPlain
                      ? "text-xs"
                      : "font-medium text-foreground text-xs sm:text-sm",
                  )}
                >
                  {user}
                </Link>
              ) : (
                <span
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-1.5 text-muted-foreground",
                    props.isPlain
                      ? "text-xs"
                      : "font-medium text-foreground text-xs sm:text-sm",
                  )}
                >
                  {user}
                </span>
              )}
              {/* 宣伝の作品だけ、作者をそのままフォローできる小さなボタン（未ログインはほかのフォローボタンと同じくログインの案内） */}
              {!props.isPlain && href && props.userId && (
                <div className="shrink-0">
                  <FollowButton
                    targetUserId={props.userId}
                    targetUserName={props.userName}
                    isFollow={props.isFollowee === true}
                    className="h-6 w-auto px-2.5 text-xs"
                    triggerChildren={
                      <button
                        type="button"
                        className="h-6 whitespace-nowrap rounded-full bg-clear-bright-blue px-2.5 font-bold text-white text-xs transition hover:opacity-80 active:scale-95"
                      >
                        {t("フォロー", "Follow")}
                      </button>
                    }
                  />
                </div>
              )}
            </div>
          )}
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

/** トップの「おすすめ作品」で、宣伝の後ろに続けるおすすめ作品（宣伝ではない） */
export type PromotionFillWork = {
  id: string
  title: string
  enTitle?: string | null
  largeThumbnailImageURL: string
  rating?: string | null
  user?: {
    id: string
    login: string
    name: string
    iconUrl?: string | null
  } | null
}

/**
 * トップの「おすすめ作品」の画面幅ごとの列数と、その幅の間だけ隠す class
 * （スマホ〜 2 列・lg 3 列・xl 4 列。Tailwind が見つけられるよう class 名はそのまま書く）
 */
export const HOME_PICKS_BREAKPOINTS = [
  { columns: 2, hiddenClassName: "max-lg:hidden" },
  { columns: 3, hiddenClassName: "lg:max-xl:hidden" },
  { columns: 4, hiddenClassName: "xl:hidden" },
] as const

/** トップの「おすすめ作品」の段の数（宣伝が多くて入りきらないときだけ段を増やす） */
export const HOME_PICKS_ROWS = 2

/**
 * 宣伝の後ろに続けるおすすめ作品として渡す数（xl の 4 列 × 2 段ぶん＋年齢区分で外れる分の余り）。
 * トップではおすすめの先頭からこの数をここに使い、残りを下の一覧に回す
 */
export const HOME_PICKS_FILL_COUNT = 10

/**
 * 宣伝 promotionCount 件の後ろにおすすめ fillCount 件を並べるとき、画面幅ごとに何件まで見せれば
 * 「段の数 × 列数」ぴったりになるか。宣伝は隠さない（宣伝が入りきらないときは段を増やす）。
 * おすすめが足りない幅は段を減らし、それでも宣伝の段が埋まらないときだけ案内（inviteCount）で埋める
 */
export function toHomePicksLayout(
  promotionCount: number,
  fillCount: number,
  breakpoints: readonly {
    columns: number
    hiddenClassName: string
  }[] = HOME_PICKS_BREAKPOINTS,
) {
  const available = promotionCount + fillCount
  const totals = breakpoints.map(({ columns }) => {
    const promotionRows = Math.ceil(promotionCount / columns)
    const total = Math.max(HOME_PICKS_ROWS, promotionRows) * columns
    if (total <= available) return total
    // おすすめが足りないときは、埋まる段まで減らす（宣伝の段は残す）
    return Math.max(
      promotionRows * columns,
      Math.floor(available / columns) * columns,
    )
  })
  const hiddenClassName = (index: number) =>
    breakpoints
      .filter((_, i) => index >= (totals[i] ?? 0))
      .map((breakpoint) => breakpoint.hiddenClassName)
      .join(" ")
  return {
    /** 一覧の index 番目（宣伝 → おすすめ → 案内の通し番号）を隠す class */
    hiddenClassName,
    /** おすすめを何件目まで使うか（どの幅でも見せない分は描画しない） */
    fillCount: Math.min(
      fillCount,
      Math.max(0, Math.max(...totals) - promotionCount),
    ),
    /** おすすめが足りず、宣伝の段に空いたマスを埋める案内の数 */
    inviteCount: Math.max(0, Math.max(...totals) - available),
    /** どの幅でも何も並ばない */
    isEmpty: totals.every((total) => total === 0),
  }
}

/**
 * トップの「おすすめ作品」。宣伝中の作品（公開から 7 日間）を先頭に PR の印付きで並べ、
 * 残りをおすすめ作品で埋めて、どの画面幅でも「段の数 × 列数」ぴったりにする（空きマスを出さない）。
 * 宣伝ではない作品は PR の印も宣伝の枠も付けない。宣伝が 0 件でもおすすめだけで出す
 */
export function HomePromotionWorksSection(props: {
  isSensitive?: boolean
  fillWorks?: PromotionFillWork[]
}) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const viewerRatings = useViewerRatings()
  const { data } = useQuery(PromotionWorksQuery, {
    skip: authContext.isLoading,
    variables: { limit: 6, isSensitive: props.isSensitive === true },
  })
  // 宣伝の作品はすべて普通の大きさで先頭に並べる（表示したあとの入れ替わりが見えないよう、並びは届いた順のまま）
  const works = data?.promotionWorks ?? []

  // おすすめは既存のおすすめの一覧と同じく、閲覧者の年齢区分・R15/R18 の表示設定で絞る。宣伝と同じ作品は出さない
  const promotionIds = new Set(works.map((work) => work.id))
  const fillWorks = filterWorksByRatings(
    props.fillWorks ?? [],
    props.isSensitive
      ? viewerRatings.sensitiveRatings
      : viewerRatings.normalRatings,
  ).filter((work) => !promotionIds.has(work.id))
  const layout = toHomePicksLayout(works.length, fillWorks.length)

  if (layout.isEmpty) {
    return null
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
        <div className="min-w-0 space-y-0.5">
          <h2 className="font-bold text-lg">
            {t("おすすめ作品", "Recommended works")}
          </h2>
          {works.length > 0 && (
            <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <WorkPromotionMark />
              {t(
                "の付いた作品はクリエイターの宣伝です",
                "marks works promoted by their creators",
              )}
            </p>
          )}
        </div>
        <Link
          to="/promotion"
          className="flex shrink-0 items-center gap-1 text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
        >
          <MegaphoneIcon className="size-3.5" />
          {t("あなたの作品も宣伝できます", "Promote your work")}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
        {works.map((work, index) => (
          <PromotionWorkCard
            key={work.id}
            className={layout.hiddenClassName(index)}
            isFollowee={work.user?.isFollowee}
            workId={work.id}
            imageUrl={toResizedImageUrl(work.largeThumbnailImageURL, 640)}
            title={t.workTitle(work.title, work.enTitle)}
            userLogin={work.user?.login}
            userName={work.user?.name}
            userIconUrl={work.user?.iconUrl}
            userId={work.user?.id}
            relatedUrl={work.relatedUrl}
          />
        ))}
        {fillWorks.slice(0, layout.fillCount).map((work, index) => (
          <PromotionWorkCard
            key={`fill-${work.id}`}
            isPlain
            className={layout.hiddenClassName(works.length + index)}
            workId={work.id}
            imageUrl={toResizedImageUrl(work.largeThumbnailImageURL, 640)}
            title={t.workTitle(work.title, work.enTitle)}
            userLogin={work.user?.login}
            userName={work.user?.name}
            userIconUrl={work.user?.iconUrl}
            userId={work.user?.id}
            // 宣伝が無いときは先頭のおすすめがトップの最初に見える画像になる
            isPriority={works.length === 0 && index < 2}
          />
        ))}
        {Array.from({ length: layout.inviteCount }, (_, index) => (
          <PromotionInviteCard
            // biome-ignore lint/suspicious/noArrayIndexKey: 中身の同じ案内を並べるだけで、順番が入れ替わらない
            key={`invite-${index}`}
            className={layout.hiddenClassName(
              works.length + layout.fillCount + index,
            )}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * おすすめ作品が足りず、宣伝の段に空いたマスが出るときの案内（自分の作品も宣伝できることを知らせる。作品ではないと分かる点線の枠）
 */
function PromotionInviteCard(props: { className?: string }) {
  const t = useTranslation()
  return (
    <Link
      to="/promotion"
      className={cn(
        "flex h-full min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-center hover:bg-muted/60",
        props.className,
      )}
    >
      <MegaphoneIcon className="size-7 text-pink-500" />
      <span className="font-bold text-sm">
        {t("ここにあなたの作品を宣伝", "Promote your work here")}
      </span>
      <span className="text-muted-foreground text-xs">
        {t(
          "トップの「おすすめ作品」の先頭に 7 日間表示されます",
          "Shown first in Recommended works on the top page for 7 days",
        )}
      </span>
    </Link>
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
        isFollowee
      }
    }
  }`,
)
