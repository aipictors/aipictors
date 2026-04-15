import {
  CalendarDaysIcon,
  ChevronRightIcon,
  EyeIcon,
  FolderIcon,
  HeartIcon,
  MessageCircleIcon,
  PenIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react"
import { DashboardHomeContentContainer } from "~/routes/($lang).my._index/components/my-home-content-container"
import { useSuspenseQuery } from "@apollo/client/index"
import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { Badge } from "~/components/ui/badge"
import {
  ResponsivePhotoWorksAlbum,
  PhotoAlbumWorkFragment,
} from "~/components/responsive-photo-works-album"

type MyEventsPreviewQueryData = {
  userEvents: Array<{
    id: string
    slug: string
    title: string
    mainTag: string
    status: string
    startAt: number
    endAt: number
    entryCount: number
    participantCount: number
  }>
}

type MyEventsPreviewQueryVars = {
  offset: number
  limit: number
  where: {
    onlyMine: boolean
    sort: string
  }
}

export function DashboardHomeContents () {
  const t = useTranslation()
  const appContext = useContext(AuthContext)

  const { data = null } = useSuspenseQuery(viewerUserQuery, {
    skip:
      appContext.isLoading || appContext.isNotLoggedIn || !appContext.userId,
  })

  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title
  }

  const formatNumberWithCommas = (value: number | undefined | null) => {
    return value?.toLocaleString() || "0"
  }

  const worksResult = useSuspenseQuery(worksQuery, {
    skip:
      appContext.isLoading || appContext.isNotLoggedIn || !appContext.userId,
    variables: {
      offset: 0,
      limit: 3,
      where: {
        userId: appContext.userId || "",
        orderBy: "LIKES_COUNT",
        sort: "DESC",
      },
    },
  })

  const latestWorksResult = useSuspenseQuery(latestWorksQuery, {
    skip:
      appContext.isLoading || appContext.isNotLoggedIn || !appContext.userId,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        userId: appContext.userId || "",
        orderBy: "DATE_CREATED",
        sort: "DESC",
      },
    },
  })

  const works = worksResult.data?.works
  const latestWorks = latestWorksResult.data?.works

  const myEventsResult = useSuspenseQuery<
    MyEventsPreviewQueryData,
    MyEventsPreviewQueryVars
  >(myEventsPreviewQuery as any, {
    skip:
      appContext.isLoading || appContext.isNotLoggedIn || !appContext.userId,
    variables: {
      offset: 0,
      limit: 3,
      where: {
        onlyMine: true,
        sort: "NEWEST",
      },
    },
  })

  const myEvents = myEventsResult.data?.userEvents ?? []

  const formatEventDate = (unixTime: number) => {
    const date = new Date(unixTime * 1000)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}.${month}.${day}`
  }

  const getEventStatusVariant = (status: string) => {
    if (status === "ONGOING") {
      return "bg-red-500 text-white hover:bg-red-500/90"
    }

    if (status === "UPCOMING") {
      return "bg-sky-500 text-white hover:bg-sky-500/90"
    }

    return "bg-slate-500 text-white hover:bg-slate-500/90"
  }

  return (
    <>
      <div className="mb-4 space-y-4">
        <div className="block items-stretch space-x-0 space-y-2 md:flex md:space-x-2 md:space-y-0">
          <div className="h-auto w-full items-stretch">
            <DashboardHomeContentContainer title={t("実績", "Total Posts")}>
              <div className="rounded-md">
                <div className="mb-4">
                  <div className="flex items-center">
                    <PenIcon className="mr-2 w-3" />
                    {t("投稿数", "Posts")}
                  </div>
                  <p className="font-bold font-size-md">
                    {formatNumberWithCommas(data?.viewer?.user.worksCount)}
                  </p>
                </div>
                <div className="mb-4">
                  <div className="flex items-center">
                    <HeartIcon className="mr-2 w-3" />
                    {t("獲得いいね数", "Received Favorited")}
                  </div>
                  <p className="font-bold font-size-md">
                    {formatNumberWithCommas(
                      data?.viewer?.user.receivedLikesCount,
                    )}
                  </p>
                </div>
              </div>
            </DashboardHomeContentContainer>
            <DashboardHomeContentContainer
              title={t("合計リアクション数", "Total Reactions")}
            >
              <div className="rounded-md">
                <div className="mb-4">
                  <div className="flex items-center">
                    <EyeIcon className="mr-2 w-3" />
                    {t("自分が閲覧した数", "Views")}
                  </div>
                  <p className="font-bold font-size-md">
                    {formatNumberWithCommas(
                      data?.viewer?.user.createdViewsCount,
                    )}
                  </p>
                </div>
                <div className="mb-4">
                  <div className="flex items-center">
                    <HeartIcon className="mr-2 w-3" />
                    {t("自分がいいねした数", "Likes")}
                  </div>
                  <p className="font-bold font-size-md">
                    {formatNumberWithCommas(
                      data?.viewer?.user.createdLikesCount,
                    )}
                  </p>
                </div>
                <div className="mb-4">
                  <div className="flex items-center">
                    <FolderIcon className="mr-2 w-3" />
                    {t("自分がブックマーク数", "Bookmarks")}
                  </div>
                  <p className="font-bold font-size-md">
                    {formatNumberWithCommas(
                      data?.viewer?.user.createdBookmarksCount,
                    )}
                  </p>
                </div>
                <div className="mb-4">
                  <div className="flex items-center">
                    <MessageCircleIcon className="mr-2 w-3" />
                    {t("自分がコメント数", "Comments")}
                  </div>
                  <p className="font-bold font-size-md">
                    {formatNumberWithCommas(
                      data?.viewer?.user.createdCommentsCount,
                    )}
                  </p>
                </div>
              </div>
            </DashboardHomeContentContainer>
          </div>

          {works?.length === 0 ? null : (
            <div className="h-full w-full items-stretch">
              <DashboardHomeContentContainer
                title={t("いいねランキングトップ3", "Top 3 Most Liked")}
              >
                <div className="rounded-md">
                  {works?.map((work, index) => (
                    <Link
                      key={work.id}
                      to={`/posts/${work.id}`}
                      className={cn("mb-4 flex items-center", {
                        relative: index === 0,
                      })}
                    >
                      {index === 0 ? (
                        <div className="relative w-full">
                          <img
                            src={work.smallThumbnailImageURL}
                            alt={work.title}
                            className="h-auto w-full rounded-md object-cover"
                          />
                          {/* biome-ignore lint/nursery/useSortedClasses: false positive */}
                          {/* biome-ignore lint/style/useSelfClosingElements: false positive */}
                          <div className="absolute inset-0 bg-linear-to-b from-transparent to-black opacity-30 rounded-md"></div>
                          <div className="absolute bottom-0 left-0 p-4">
                            {/* biome-ignore lint/nursery/useSortedClasses: false positive */}
                            <div className="bg-yellow-500 rounded-full text-white w-8 text-center font-bold px-2 py-1">
                              1
                            </div>
                            {/* biome-ignore lint/nursery/useSortedClasses: false positive */}
                            <p className="font-bold text-white mt-2">
                              {work.title}
                            </p>
                            <p className="text-white opacity-80">
                              {work.likesCount} {t("いいね", "Likes")}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex w-full items-center">
                          <div className="mr-4">
                            <div
                              className={cn(
                                "w-8 rounded-full px-2 py-1 text-center font-bold text-white",
                                {
                                  "bg-gray-400": index === 1,
                                  "bg-orange-300": index === 2,
                                },
                              )}
                            >
                              {index + 1}
                            </div>
                          </div>
                          <div className="size-12 overflow-hidden rounded-md">
                            <img
                              src={work.smallThumbnailImageURL}
                              alt={work.title}
                              className="size-16 object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <p className="font-bold">
                              {truncateTitle(work.title, 32)}
                            </p>
                            <p className="opacity-80">
                              {work.likesCount} {t("いいね", "Likes")}
                            </p>
                          </div>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </DashboardHomeContentContainer>
            </div>
          )}
        </div>

        <div className="w-full">
          <DashboardHomeContentContainer title={t("マイイベント", "My events")}>
            <div className="space-y-3 rounded-md">
              {myEvents.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {myEvents.map((event) => (
                      <Link
                        key={event.id}
                        to={`/events/${event.slug}`}
                        className="rounded-xl border p-3 transition-colors hover:bg-muted/40 sm:p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="line-clamp-2 font-medium text-sm">
                            {event.title}
                          </div>
                          <Badge className={getEventStatusVariant(event.status)}>
                            {event.status === "ONGOING"
                              ? t("開催中", "Ongoing")
                              : event.status === "UPCOMING"
                                ? t("開催予定", "Upcoming")
                                : t("終了", "Ended")}
                          </Badge>
                        </div>
                        <div className="mt-2 text-muted-foreground text-xs">
                          #{event.mainTag}
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-muted-foreground text-[11px] sm:text-xs">
                          <CalendarDaysIcon className="h-3.5 w-3.5" />
                          <span>
                            {formatEventDate(event.startAt)} - {formatEventDate(event.endAt)}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] sm:gap-3 sm:text-xs">
                          <span className="inline-flex items-center gap-1">
                            <TrophyIcon className="h-3.5 w-3.5" />
                            {t("作品", "Entries")}: {event.entryCount}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <UsersIcon className="h-3.5 w-3.5" />
                            {t("参加者", "Participants")}: {event.participantCount}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Link
                      to="/my/events"
                      aria-label={t("マイイベント一覧へ", "Go to my events")}
                      title={t("マイイベント一覧へ", "Go to my events")}
                      className="inline-flex size-8 items-center justify-center rounded-full text-primary transition-opacity hover:bg-muted hover:opacity-80"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  <p>
                    {t(
                      "まだイベントを作成していません。企画を作ってマイページから管理できます。",
                      "You have not created any events yet. Create one and manage it from your dashboard.",
                    )}
                  </p>
                  <div className="mt-3 flex justify-end">
                    <Link
                      to="/events/new"
                      className="inline-flex items-center gap-1 text-primary text-sm transition-opacity hover:opacity-80"
                    >
                      {t("イベントを作成", "Create event")}
                      <ChevronRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </DashboardHomeContentContainer>
        </div>

        {(latestWorks?.length ?? 0) > 0 && (
          <div className="w-full">
            <DashboardHomeContentContainer
              title={t("最新作品", "Latest Works")}
            >
              <div className="rounded-md">
                <ResponsivePhotoWorksAlbum
                  works={latestWorks ?? []}
                  targetRowHeight={140}
                  isShowProfile={false}
                  autoPlayVideoPreview={true}
                />
              </div>
            </DashboardHomeContentContainer>
          </div>
        )}
      </div>
    </>
  )
}

const viewerUserQuery = graphql(
  `query ViewerUser {
    viewer {
      id
      user {
        id
        followersCount
        followCount
        receivedLikesCount
        receivedViewsCount
        createdLikesCount
        createdViewsCount
        createdCommentsCount
        createdBookmarksCount
        worksCount
      }
    }
  }`,
)

export const MyWorkFragment = graphql(
  `fragment MyWork on WorkNode @_unmask {
    id
    title
    smallThumbnailImageURL
    likesCount
  }`,
)

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...MyWork
    }
  }`,
  [MyWorkFragment],
)

const latestWorksQuery = graphql(
  `query LatestWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)

const myEventsPreviewQuery = graphql(
  `query MyEventsPreview($offset: Int!, $limit: Int!, $where: UserEventsWhereInput) {
    userEvents(offset: $offset, limit: $limit, where: $where) {
      id
      slug
      title
      mainTag
      status
      startAt
      endAt
      entryCount
      participantCount
    }
  }`,
)
