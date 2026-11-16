import { cn } from "~/lib/utils"
import {
  isMedalRank,
  RANK_MEDAL_STYLES,
  RankCrown,
} from "~/components/ranking/ranking-medal"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Crown, Heart } from "lucide-react"
import { useContext } from "react"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  works: any[]
  slug: string
  eventSource: "OFFICIAL" | "USER"
  revealSensitiveThumbnails?: boolean
}

const isSensitiveWork = (work: { rating?: string | null }) => {
  return work.rating === "R18" || work.rating === "R18G"
}

/**
 * イベントランキング作品一覧
 */
export function EventAwardWorkList(props: Props) {
  const authContext = useContext(AuthContext)

  const { data: resp } = useQuery(appAwardEventQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      slug: props.slug,
    },
  })

  const allAgesWorks =
    props.eventSource === "OFFICIAL"
      ? (resp?.appEvent?.allAgesAwardWorks ??
        props.works.filter((work) => !isSensitiveWork(work)))
      : (resp?.userEvent?.allAgesAwardWorks ??
        props.works.filter((work) => !isSensitiveWork(work)))

  const sensitiveWorks =
    props.eventSource === "OFFICIAL"
      ? (resp?.appEvent?.sensitiveAwardWorks ??
        props.works.filter((work) => isSensitiveWork(work)))
      : (resp?.userEvent?.sensitiveAwardWorks ??
        props.works.filter((work) => isSensitiveWork(work)))

  const t = useTranslation()

  const rankingSections = [
    {
      key: "all-ages",
      title: t("全年齢", "All Ages"),
      works: allAgesWorks,
    },
    {
      key: "sensitive",
      title: t("センシティブ", "Sensitive"),
      works: sensitiveWorks,
    },
  ].filter((section) => section.works.length > 0)

  return (
    <section className="relative space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-lg md:text-xl">
          <Crown
            className="size-5 fill-[#F5C542] text-[#C98A0C]"
            aria-hidden="true"
          />
          {t("入賞・ランキング", "Awards & ranking")}
        </h2>
        {/* 昨日の日付 // /2024/05/01 */}
        <Link to={`/events/${props.slug}/award`}>
          <Button variant={"secondary"} size={"sm"} className="rounded-full">
            {t("すべて見る", "All")}
          </Button>
        </Link>
      </div>

      <div className="space-y-5">
        {rankingSections.map((section) => (
          <div key={section.key} className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-foreground">
                {section.title}
              </h3>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            <div className="overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex min-w-max items-end gap-3 pr-3">
                {section.works.map((work, index) => (
                  <div
                    key={`${section.key}-${work.id}-${index.toString()}`}
                    className={cn(
                      "flex-none space-y-2",
                      isMedalRank(index + 1)
                        ? "w-36 sm:w-48"
                        : "w-28 self-end sm:w-36",
                    )}
                  >
                    <div className="flex h-7 items-end justify-center">
                      <RankCrown
                        rank={index + 1}
                        className={index === 0 ? "size-7" : "size-6"}
                      />
                    </div>
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-xl",
                        isMedalRank(index + 1) &&
                          cn(
                            "ring-4",
                            RANK_MEDAL_STYLES[(index + 1) as 1 | 2 | 3].ring,
                          ),
                      )}
                    >
                      <CroppedWorkSquare
                        title={t.workTitle(work.title, work.enTitle)}
                        workId={work.id}
                        imageUrl={work.smallThumbnailImageURL}
                        subWorksCount={work.subWorksCount}
                        thumbnailImagePosition={
                          work.thumbnailImagePosition ?? 0
                        }
                        size="lg"
                        imageWidth={work.smallThumbnailImageWidth}
                        imageHeight={work.smallThumbnailImageHeight}
                        ranking={index + 1}
                        shouldMaskSensitive={
                          !props.revealSensitiveThumbnails &&
                          isSensitiveWork(work)
                        }
                      />
                      <div className="absolute right-0 bottom-0">
                        <LikeButton
                          size={56}
                          targetWorkId={work.id}
                          targetWorkOwnerUserId={work.user?.id ?? ""}
                          defaultLiked={work.isLiked}
                          defaultLikedCount={0}
                          isBackgroundNone={true}
                          strokeWidth={2}
                          isParticle={true}
                        />
                      </div>
                    </div>
                    <p className="overflow-hidden text-ellipsis text-nowrap font-bold text-md">
                      {t.workTitle(work.title, work.enTitle)}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <UserNameBadge
                        userId={work.user?.id ?? ""}
                        userIconImageURL={withIconUrlFallback(
                          work.user?.iconUrl,
                        )}
                        name={work.user?.name ?? ""}
                        width={"lg"}
                      />
                      <div
                        data-list-like-count
                        className="flex items-center space-x-1"
                      >
                        <Heart className="size-3 shrink-0 fill-gray-400 text-gray-400" />
                        <span className="text-xs">{work.likesCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export const EventAwardWorkListItemFragment = graphql(
  `fragment EventAwardWorkListItem on WorkNode @_unmask {
    id
    title
    enTitle
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
    uuid
  }`,
)

const appAwardEventQuery = graphql(
  `query EventAwardWorksSplit($slug: String!) {
    appEvent(slug: $slug) {
      allAgesAwardWorks: awardWorks(offset: 0, limit: 20, isSensitive: false) {
        ...EventAwardWorkListItem
      }
      sensitiveAwardWorks: awardWorks(offset: 0, limit: 20, isSensitive: true) {
        ...EventAwardWorkListItem
      }
    }
    userEvent(slug: $slug) {
      allAgesAwardWorks: awardWorks(offset: 0, limit: 20, isSensitive: false) {
        ...EventAwardWorkListItem
      }
      sensitiveAwardWorks: awardWorks(offset: 0, limit: 20, isSensitive: true) {
        ...EventAwardWorkListItem
      }
    }
  }`,
  [EventAwardWorkListItemFragment],
)
