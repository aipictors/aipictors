import { useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import type { FragmentOf } from "gql.tada"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import { AuthContext } from "~/contexts/auth-context"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

const PICTOR_CHAN_ICON_URL = "https://assets.aipictors.com/pictorchanicon.webp"

type Props = {
  rankings: FragmentOf<typeof AiEvaluationRankingListItemFragment>[]
  year: number
  month: number
  day: number | null
  weekIndex: number | null
}

function toAwardLabel(awardTier: string) {
  switch (awardTier) {
    case "FIRST":
      return "1位"
    case "TOP3":
      return "TOP3"
    case "TOP10":
      return "TOP10"
    case "TOP30":
      return "TOP30"
    default:
      return "ランクイン"
  }
}

function formatGeneratedAt(value: number | null | undefined) {
  if (typeof value !== "number") {
    return null
  }

  return new Date(value * 1000).toLocaleString("ja-JP")
}

function RankingCommentDialog(props: {
  title: string
  comment: string
  score: number
  awardTier: string
  generatedAt: number | null | undefined
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-8 rounded-full px-3 text-xs" variant="outline">
          コメント全文を見る
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl overflow-hidden rounded-3xl border-0 bg-linear-to-br from-amber-50 via-white to-orange-50 p-0 shadow-2xl dark:from-stone-900 dark:via-stone-950 dark:to-orange-950">
        <div className="space-y-6 p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="font-bold text-xl text-stone-900 dark:text-stone-100">
              ぴくたーちゃんの入賞コメント
            </DialogTitle>
            <DialogDescription className="text-stone-600 dark:text-stone-300">
              {props.title}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 rounded-2xl bg-amber-100/70 p-3 dark:bg-amber-500/10">
            <Avatar className="h-14 w-14 border border-white bg-white shadow-sm ring-4 ring-orange-100 dark:border-zinc-900 dark:bg-zinc-900 dark:ring-orange-950/40">
              <AvatarImage src={PICTOR_CHAN_ICON_URL} alt="ぴくたーちゃん" />
              <AvatarFallback>ぴ</AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-sm">
              <p className="font-bold text-stone-900 dark:text-stone-100">
                {toAwardLabel(props.awardTier)} / {props.score}点
              </p>
              {formatGeneratedAt(props.generatedAt) && (
                <p className="text-stone-500 dark:text-stone-400">
                  生成日時: {formatGeneratedAt(props.generatedAt)}
                </p>
              )}
            </div>
          </div>
          <div className="relative rounded-[24px] bg-white p-5 text-sm leading-7 shadow-sm ring-1 ring-amber-100 dark:bg-stone-900 dark:ring-stone-800">
            <div className="absolute -left-2 top-6 h-4 w-4 rotate-45 bg-white ring-1 ring-amber-100 dark:bg-stone-900 dark:ring-stone-800" />
            <p className="relative whitespace-pre-wrap text-stone-700 dark:text-stone-200">
              {props.comment}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RankingCommentPreview(props: {
  title: string
  comment: string
  score: number
  awardTier: string
  generatedAt: number | null | undefined
}) {
  return (
    <div className="rounded-[28px] border border-orange-200/80 bg-linear-to-br from-orange-50 via-white to-amber-50 p-4 shadow-sm dark:border-orange-900/60 dark:from-stone-900 dark:via-stone-950 dark:to-orange-950/60">
      <div className="flex items-start gap-3">
        <Link to="/pictor-chan" className="shrink-0">
          <Avatar className="size-12 border border-white bg-white shadow-sm ring-4 ring-orange-100 dark:border-zinc-900 dark:bg-zinc-900 dark:ring-orange-950/40">
            <AvatarImage src={PICTOR_CHAN_ICON_URL} alt="ぴくたーちゃん" />
            <AvatarFallback>ぴ</AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              to="/pictor-chan"
              className="font-semibold text-foreground text-sm hover:underline dark:text-zinc-100"
            >
              ぴくたーちゃん
            </Link>
            <span className="rounded-full bg-orange-100 px-2 py-0.5 font-medium text-[11px] text-orange-700 dark:bg-orange-950/70 dark:text-orange-200">
              {toAwardLabel(props.awardTier)} / {props.score}点
            </span>
            {formatGeneratedAt(props.generatedAt) && (
              <span className="text-[11px] text-muted-foreground">
                {formatGeneratedAt(props.generatedAt)}
              </span>
            )}
          </div>

          <div className="relative rounded-[22px] rounded-tl-md border border-orange-200 bg-white/95 px-4 py-3 shadow-sm dark:border-orange-900 dark:bg-zinc-900/85">
            <p className="mb-2 font-semibold text-foreground text-sm dark:text-zinc-100">
              {props.title}
            </p>
            <p className="line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-zinc-200">
              {props.comment}
            </p>
          </div>

          <div className="mt-3">
            <RankingCommentDialog
              title={props.title}
              comment={props.comment}
              score={props.score}
              awardTier={props.awardTier}
              generatedAt={props.generatedAt}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function RankingWorkCard(props: {
  workItem: FragmentOf<typeof AiEvaluationRankingListItemFragment>
  index: number
  featured?: boolean
}) {
  const { workItem, featured = false } = props

  if (!workItem.work) {
    return null
  }

  return (
    <article className="group overflow-hidden rounded-[28px] border border-border/40 bg-background/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className={featured ? "p-4 sm:p-5" : "p-3 sm:p-4"}>
        <div className={featured ? "grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:items-start" : "space-y-3"}>
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-[24px] bg-muted/30">
              <CroppedWorkSquare
                workId={workItem.work.id}
                subWorksCount={workItem.work.subWorksCount}
                imageUrl={workItem.work.smallThumbnailImageURL}
                thumbnailImagePosition={workItem.work.thumbnailImagePosition ?? 0}
                size="auto"
                imageWidth={workItem.work.smallThumbnailImageWidth}
                imageHeight={workItem.work.smallThumbnailImageHeight}
                ranking={workItem.index}
                commentsCount={workItem.work.commentsCount}
              />
              <div className="absolute top-3 left-3 rounded-full bg-black/75 px-3 py-1 font-bold text-white text-xs shadow-lg">
                {workItem.overallScore}点
              </div>
              <div className="absolute right-2 bottom-2">
                <LikeButton
                  size={featured ? 52 : 44}
                  targetWorkId={workItem.work.id}
                  targetWorkOwnerUserId={workItem.work.user?.id ?? ""}
                  defaultLiked={workItem.work.isLiked}
                  defaultLikedCount={0}
                  isBackgroundNone={true}
                  strokeWidth={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className={featured ? "line-clamp-2 font-bold text-base text-foreground sm:text-lg" : "line-clamp-2 font-bold text-sm text-foreground sm:text-base"}>
                {workItem.work.title}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-200">
                  {toAwardLabel(workItem.awardTier)}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                  #{workItem.index}
                </span>
              </div>
            </div>

            {workItem.work.user && (
              <UserNameBadge
                userId={workItem.work.user.id}
                userIconImageURL={withIconUrlFallback(workItem.work.user.iconUrl)}
                name={workItem.work.user.name}
                width={"md"}
                likesCount={workItem.work.likesCount}
              />
            )}
          </div>

          {featured && <div className="min-w-0 space-y-4">
            {workItem.index <= 5 && workItem.pictorComment ? (
              <RankingCommentPreview
                title={workItem.work.title}
                comment={workItem.pictorComment}
                score={workItem.overallScore}
                awardTier={workItem.awardTier}
                generatedAt={workItem.pictorCommentGeneratedAt}
              />
            ) : (
              <div className="flex h-full min-h-40 items-center justify-center rounded-[28px] border border-dashed border-border/50 bg-muted/20 px-6 py-10 text-center text-muted-foreground text-sm">
                コメントはまだ生成されていません。
              </div>
            )}
          </div>}
        </div>
      </div>
    </article>
  )
}

export function AiEvaluationRankingWorkList(props: Props) {
  const appContext = useContext(AuthContext)

  const { data } = useQuery(aiEvaluationWorkRankingsQuery, {
    skip: appContext.isLoading || appContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: 200,
      where: {
        year: props.year,
        month: props.month,
        ...(props.day && { day: props.day }),
        ...(props.weekIndex && { weekIndex: props.weekIndex }),
      },
    },
  })

  const rankings = data?.aiEvaluationWorkRankings ?? props.rankings
  const featuredRankings = rankings.slice(0, 3)
  const standardRankings = rankings.slice(3)

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-3 pb-8 sm:px-4 lg:px-0">
      {featuredRankings.length > 0 && (
        <div className="grid gap-5">
          {featuredRankings.map((workItem, index) => (
            <RankingWorkCard
              // biome-ignore lint/suspicious/noArrayIndexKey: Intentional
              key={index}
              workItem={workItem}
              index={index}
              featured={true}
            />
          ))}
        </div>
      )}

      {standardRankings.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {standardRankings.map((workItem, index) => (
            <RankingWorkCard
              // biome-ignore lint/suspicious/noArrayIndexKey: Intentional
              key={index + 3}
              workItem={workItem}
              index={index + 3}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const AiEvaluationRankingListItemFragment = graphql(
  `fragment AiEvaluationRankingListItem on AiEvaluationWorkRankingNode @_unmask {
    id
    index
    overallScore
    awardTier
    pictorComment
    pictorCommentGeneratedAt
    pictorCommentModel
    work {
      id
      title
      accessType
      adminAccessType
      type
      likesCount
      commentsCount
      bookmarksCount
      viewsCount
      createdAt
      rating
      isTagEditable
      smallThumbnailImageURL
      smallThumbnailImageHeight
      smallThumbnailImageWidth
      largeThumbnailImageURL
      largeThumbnailImageHeight
      largeThumbnailImageWidth
      type
      prompt
      negativePrompt
      isLiked
      thumbnailImagePosition
      description
      url
      subWorksCount
      tags {
        name
      }
      user {
        id
        name
        iconUrl
      }
    }
  }`,
)

const aiEvaluationWorkRankingsQuery = graphql(
  `query AiEvaluationWorkRankingsList($offset: Int!, $limit: Int!, $where: AiEvaluationWorkRankingsWhereInput!) {
    aiEvaluationWorkRankings(offset: $offset, limit: $limit, where: $where) {
      ...AiEvaluationRankingListItem
    }
  }`,
  [AiEvaluationRankingListItemFragment],
)