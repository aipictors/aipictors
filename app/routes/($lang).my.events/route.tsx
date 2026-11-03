import { useMutation, useQuery } from "@apollo/client/index"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { Link, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  CalendarDaysIcon,
  CopyIcon,
  EllipsisIcon,
  EyeIcon,
  FilePenIcon,
  FlagIcon,
  GlobeIcon,
  ImagesIcon,
  LockIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import { Skeleton } from "~/components/ui/skeleton"
import { META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { createMeta } from "~/utils/create-meta"

type VisibilityType = "DRAFT" | "PUBLIC" | "PRIVATE"

type MyEvent = {
  id: string
  slug: string
  title: string
  thumbnailImageUrl: string | null
  headerImageUrl: string | null
  mainTag: string
  status: string
  visibilityType: VisibilityType
  startAt: number
  endAt: number
  entryCount: number
  participantCount: number
  viewCount: number
  favoriteCount: number
  rankingEnabled: boolean
}

type MyEventsQueryData = { userEvents: MyEvent[] }

type MyEventsQueryVars = {
  offset: number
  limit: number
  where: { onlyMine: boolean; sort: string }
}

type UpdateStatusData = {
  updateUserEventStatus: { id: string; slug: string; status: string } | null
}

type UpdateStatusVars = {
  input: { slug: string; visibilityType: VisibilityType; forceEnd: boolean }
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.MY, { title: "マイイベント" }, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({})

/**
 * 公開状態を先に見て、公開中のものだけ開催の状態で分ける
 */
const toPhase = (event: MyEvent) => {
  if (event.visibilityType === "DRAFT") return "DRAFT"
  if (event.visibilityType === "PRIVATE") return "PRIVATE"
  if (event.status === "ONGOING") return "ONGOING"
  if (event.status === "UPCOMING") return "UPCOMING"
  return "ENDED"
}

const PHASES = {
  ONGOING: {
    ja: "開催中",
    en: "Ongoing",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  UPCOMING: {
    ja: "開催予定",
    en: "Upcoming",
    className: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
  ENDED: {
    ja: "終了",
    en: "Ended",
    className: "bg-muted text-muted-foreground",
  },
  DRAFT: {
    ja: "下書き",
    en: "Draft",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  PRIVATE: {
    ja: "非公開",
    en: "Private",
    className: "bg-muted text-muted-foreground",
  },
} as const

type Phase = keyof typeof PHASES

const toDateText = (seconds: number) => {
  const date = new Date(seconds * 1000)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

type PendingAction = {
  event: MyEvent
  visibilityType: VisibilityType
  forceEnd: boolean
  titleJa: string
  titleEn: string
  descriptionJa: string
  descriptionEn: string
  labelJa: string
  labelEn: string
}

/**
 * 自分が作ったイベント: 状態で絞り込み、タイトルで検索。公開状態を変える操作は確認してから行う
 */
export default function MyEventsRoute() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState("")
  const [pending, setPending] = useState<PendingAction | null>(null)

  const phase = searchParams.get("status")
  const activePhase =
    phase !== null && phase in PHASES ? (phase as Phase) : null

  const { data, refetch } = useQuery<MyEventsQueryData, MyEventsQueryVars>(
    myEventsQuery as never,
    {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
      fetchPolicy: "cache-and-network",
      variables: {
        offset: 0,
        limit: 100,
        where: { onlyMine: true, sort: "NEWEST" },
      },
    },
  )

  const [updateStatus, { loading: isUpdating }] = useMutation<
    UpdateStatusData,
    UpdateStatusVars
  >(updateUserEventStatusMutation as never)

  const events = data?.userEvents

  const countOf = (target: Phase) =>
    events?.filter((event) => toPhase(event) === target).length ?? 0

  const keyword = search.trim().toLowerCase()

  const visibleEvents = events?.filter((event) => {
    if (activePhase !== null && toPhase(event) !== activePhase) return false
    if (keyword === "") return true
    return (
      event.title.toLowerCase().includes(keyword) ||
      event.mainTag.toLowerCase().includes(keyword)
    )
  })

  const onConfirm = async () => {
    if (pending === null) return
    try {
      await updateStatus({
        variables: {
          input: {
            slug: pending.event.slug,
            visibilityType: pending.visibilityType,
            forceEnd: pending.forceEnd,
          },
        },
      })
      toast(t("イベントの状態を更新しました", "Event status updated"))
      void refetch()
    } catch {
      toast.error(t("更新できませんでした", "Failed to update event status"))
    }
    setPending(null)
  }

  const onCopyUrl = (event: MyEvent) => {
    void navigator.clipboard
      .writeText(`${window.location.origin}/events/${event.slug}`)
      .then(() => toast(t("URLをコピーしました", "URL copied")))
  }

  return (
    <div className="flex flex-col gap-3 pb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-bold text-xl">
            {t("マイイベント", "My events")}
          </h1>
          <p className="text-muted-foreground text-xs">
            {t(
              "作成したイベントの確認と、公開状態の変更ができます",
              "Check your events and change their visibility",
            )}
          </p>
        </div>
        <Button className="h-10 shrink-0 gap-1.5 rounded-full" asChild>
          <Link to="/events/new">
            <PlusIcon className="size-4" />
            {t("新規作成", "Create new")}
          </Link>
        </Button>
      </div>

      <div className="relative">
        <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("タイトル・タグで検索", "Search by title or tag")}
          aria-label={t("タイトル・タグで検索", "Search by title or tag")}
          className="h-10 pl-9"
        />
      </div>

      <div className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
        {([null, ...Object.keys(PHASES)] as (Phase | null)[]).map((item) => (
          <button
            key={item ?? "all"}
            type="button"
            aria-pressed={activePhase === item}
            onClick={() => {
              const next = new URLSearchParams(searchParams)
              if (item === null) {
                next.delete("status")
              } else {
                next.set("status", item)
              }
              setSearchParams(next, { replace: true, preventScrollReset: true })
            }}
            className={cn(
              "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 font-medium text-sm transition-colors",
              activePhase === item
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {item === null
              ? t("すべて", "All")
              : t(PHASES[item].ja, PHASES[item].en)}
            <span className="text-xs tabular-nums opacity-70">
              {item === null ? (events?.length ?? 0) : countOf(item)}
            </span>
          </button>
        ))}
      </div>

      {events === undefined && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      )}

      {visibleEvents?.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <CalendarDaysIcon className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            {events?.length === 0
              ? t(
                  "まだ作成したイベントはありません。最初の企画を作成しましょう",
                  "You have not created any events yet",
                )
              : t("条件に合うイベントはありません", "No events match")}
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {visibleEvents?.map((event) => {
          const current = toPhase(event)
          const canEnd = current === "ONGOING" || current === "UPCOMING"
          const isPublic = event.visibilityType === "PUBLIC"
          return (
            <li
              key={event.id}
              className="flex gap-3 rounded-xl border p-3 md:gap-4"
            >
              <Link
                to={`/events/${event.slug}`}
                className="block size-20 shrink-0 overflow-hidden rounded-lg bg-muted md:size-28"
              >
                <img
                  alt=""
                  src={
                    event.thumbnailImageUrl ||
                    event.headerImageUrl ||
                    "/images/opepnepe.png"
                  }
                  loading="lazy"
                  className="size-full object-cover"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "mr-1.5 inline-block rounded-full px-2 py-0.5 align-middle font-medium text-[11px]",
                        PHASES[current].className,
                      )}
                    >
                      {t(PHASES[current].ja, PHASES[current].en)}
                    </span>
                    <Link
                      to={`/events/${event.slug}`}
                      className="break-words align-middle font-medium text-sm hover:underline md:text-base"
                    >
                      {event.title}
                    </Link>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={t("その他の操作", "More actions")}
                        className="size-8 shrink-0 rounded-full"
                      >
                        <EllipsisIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/events/${event.slug}/edit`}>
                          <PencilIcon className="mr-2 size-4" />
                          {t("編集する", "Edit")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onCopyUrl(event)}>
                        <CopyIcon className="mr-2 size-4" />
                        {t("URLをコピー", "Copy URL")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {!isPublic && (
                        <DropdownMenuItem
                          onSelect={() =>
                            setPending({
                              event,
                              visibilityType: "PUBLIC",
                              forceEnd: false,
                              titleJa: "イベントを公開しますか？",
                              titleEn: "Publish this event?",
                              descriptionJa:
                                "イベント一覧に表示され、誰でも見られるようになります。",
                              descriptionEn:
                                "It appears in the event list and anyone can see it.",
                              labelJa: "公開する",
                              labelEn: "Publish",
                            })
                          }
                        >
                          <GlobeIcon className="mr-2 size-4" />
                          {t("公開する", "Publish")}
                        </DropdownMenuItem>
                      )}
                      {event.visibilityType !== "DRAFT" && (
                        <DropdownMenuItem
                          onSelect={() =>
                            setPending({
                              event,
                              visibilityType: "DRAFT",
                              forceEnd: false,
                              titleJa: "下書きに戻しますか？",
                              titleEn: "Move back to draft?",
                              descriptionJa:
                                "イベント一覧から消え、ほかの人は見られなくなります。",
                              descriptionEn:
                                "It leaves the event list and others can no longer see it.",
                              labelJa: "下書きに戻す",
                              labelEn: "Move to draft",
                            })
                          }
                        >
                          <FilePenIcon className="mr-2 size-4" />
                          {t("下書きに戻す", "Move to draft")}
                        </DropdownMenuItem>
                      )}
                      {event.visibilityType !== "PRIVATE" && (
                        <DropdownMenuItem
                          onSelect={() =>
                            setPending({
                              event,
                              visibilityType: "PRIVATE",
                              forceEnd: false,
                              titleJa: "非公開にしますか？",
                              titleEn: "Make this private?",
                              descriptionJa:
                                "イベント一覧から消え、ほかの人は見られなくなります。",
                              descriptionEn:
                                "It leaves the event list and others can no longer see it.",
                              labelJa: "非公開にする",
                              labelEn: "Make private",
                            })
                          }
                        >
                          <LockIcon className="mr-2 size-4" />
                          {t("非公開にする", "Make private")}
                        </DropdownMenuItem>
                      )}
                      {canEnd && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() =>
                            setPending({
                              event,
                              visibilityType: "PUBLIC",
                              forceEnd: true,
                              titleJa: "イベントを終了しますか？",
                              titleEn: "End this event?",
                              descriptionJa:
                                "終了日時が今の時刻になります。続けるには編集で日程を変え直す必要があります。",
                              descriptionEn:
                                "The end time becomes now. To continue it, you need to edit the schedule again.",
                              labelJa: "終了する",
                              labelEn: "End event",
                            })
                          }
                        >
                          <FlagIcon className="mr-2 size-4" />
                          {t("終了する", "End event")}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="flex flex-wrap gap-x-2 text-muted-foreground text-xs">
                  <span className="truncate">#{event.mainTag}</span>
                  <span className="tabular-nums">
                    {toDateText(event.startAt)} 〜 {toDateText(event.endAt)}
                  </span>
                </p>
                <p className="flex flex-wrap gap-x-3 gap-y-0.5 text-muted-foreground text-xs tabular-nums">
                  <span
                    className="flex items-center gap-1"
                    title={t("作品", "Entries")}
                  >
                    <ImagesIcon className="size-3" />
                    {event.entryCount.toLocaleString()}
                  </span>
                  <span
                    className="flex items-center gap-1"
                    title={t("参加者", "Participants")}
                  >
                    <UsersIcon className="size-3" />
                    {event.participantCount.toLocaleString()}
                  </span>
                  <span
                    className="flex items-center gap-1"
                    title={t("閲覧", "Views")}
                  >
                    <EyeIcon className="size-3" />
                    {event.viewCount.toLocaleString()}
                  </span>
                  <span
                    className="flex items-center gap-1"
                    title={t("お気に入り", "Favorites")}
                  >
                    <StarIcon className="size-3" />
                    {event.favoriteCount.toLocaleString()}
                  </span>
                  {event.rankingEnabled && (
                    <span className="flex items-center gap-1">
                      <TrophyIcon className="size-3" />
                      {t("ランキングあり", "Ranking")}
                    </span>
                  )}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending && t(pending.titleJa, pending.titleEn)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending && t(pending.descriptionJa, pending.descriptionEn)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("キャンセル", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isUpdating}
              onClick={() => void onConfirm()}
            >
              {pending && t(pending.labelJa, pending.labelEn)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const myEventsQuery = graphql(
  `query MyUserEvents($offset: Int!, $limit: Int!, $where: UserEventsWhereInput) {
    userEvents(offset: $offset, limit: $limit, where: $where) {
      id
      slug
      title
      thumbnailImageUrl
      headerImageUrl
      mainTag
      status
      visibilityType
      startAt
      endAt
      entryCount
      participantCount
      viewCount
      favoriteCount
      rankingEnabled
    }
  }`,
)

const updateUserEventStatusMutation = graphql(
  `mutation UpdateUserEventStatus($input: UpdateUserEventStatusInput!) {
    updateUserEventStatus(input: $input) {
      id
      slug
      status
    }
  }`,
)
