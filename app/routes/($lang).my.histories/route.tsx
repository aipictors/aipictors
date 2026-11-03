import { useQuery } from "@apollo/client/index"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { Link, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  ChevronDownIcon,
  PencilIcon,
  PlusIcon,
  ShieldIcon,
  Trash2Icon,
} from "lucide-react"
import { useContext, useState } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { Skeleton } from "~/components/ui/skeleton"
import { META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { createMeta } from "~/utils/create-meta"
import { toResizedImageUrl } from "~/utils/resized-image-url"

export const meta: MetaFunction = (props) => {
  return createMeta(META.MY_HISTORIES, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({})

const PER_PAGE = 30

const ACTION_TYPES = {
  CREATE: {
    ja: "投稿",
    en: "Posted",
    icon: PlusIcon,
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  UPDATE: {
    ja: "編集",
    en: "Edited",
    icon: PencilIcon,
    className: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
  DELETE: {
    ja: "削除",
    en: "Deleted",
    icon: Trash2Icon,
    className: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  },
  MODERATOR: {
    ja: "運営の対応",
    en: "Moderation",
    icon: ShieldIcon,
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
} as const

type ActionType = keyof typeof ACTION_TYPES

const toActionType = (value: string | null): ActionType | null => {
  return value !== null && value in ACTION_TYPES ? (value as ActionType) : null
}

type WorkActionHistoryListItem = {
  id: string
  actionType: string
  createdAt: number
  summary: string
  detail: string | null
  title: string | null
  ratingLabel: string | null
  workId: string | null
  workUrl: string | null
  thumbnailImageURL: string | null
  isModeratorAction: boolean
}

const pad = (value: number) => String(value).padStart(2, "0")

const toDateKey = (createdAt: number) => {
  const date = new Date(createdAt * 1000)
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`
}

const toTimeText = (createdAt: number) => {
  const date = new Date(createdAt * 1000)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** 値のない項目（「項目: -」）は読み飛ばせるように出さない */
const toDetailText = (detail: string) => {
  return detail
    .split("\n")
    .filter((line) => !/:\s*-\s*$/.test(line))
    .join("\n")
}

/**
 * 操作履歴: 種類で絞り込み、日付ごとにまとめる（種類とページは URL に残す）
 */
export default function MyHistories() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const [openedId, setOpenedId] = useState<string | null>(null)

  const actionType = toActionType(searchParams.get("type"))
  const page = Math.max(
    Number.parseInt(searchParams.get("page") ?? "0") || 0,
    0,
  )

  const { data: currentData, previousData } = useQuery(
    workActionHistoriesQuery,
    {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
      variables: {
        offset: page * PER_PAGE,
        limit: PER_PAGE,
        actionType,
      },
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
    },
  )

  const data = currentData ?? previousData

  const histories: WorkActionHistoryListItem[] | undefined =
    data?.viewer?.workActionHistories
  const maxCount = data?.viewer?.workActionHistoryCount ?? 0

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    }
    setOpenedId(null)
    setSearchParams(next, { replace: true, preventScrollReset: true })
  }

  const groups = (histories ?? []).reduce<
    { date: string; items: WorkActionHistoryListItem[] }[]
  >((result, history) => {
    const date = toDateKey(history.createdAt)
    const last = result[result.length - 1]
    if (last?.date === date) {
      last.items.push(history)
    } else {
      result.push({ date, items: [history] })
    }
    return result
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 gap-1 overflow-x-auto [scrollbar-width:none]">
          {([null, ...Object.keys(ACTION_TYPES)] as (ActionType | null)[]).map(
            (type) => (
              <button
                key={type ?? "all"}
                type="button"
                aria-pressed={actionType === type}
                onClick={() => update({ type, page: null })}
                className={cn(
                  "h-9 shrink-0 rounded-full px-3 font-medium text-sm transition-colors",
                  actionType === type
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {type === null
                  ? t("すべて", "All")
                  : t(ACTION_TYPES[type].ja, ACTION_TYPES[type].en)}
              </button>
            ),
          )}
        </div>
        <p className="shrink-0 text-muted-foreground text-xs tabular-nums">
          {data
            ? t(
                `${maxCount.toLocaleString()}件`,
                `${maxCount.toLocaleString()}`,
              )
            : ""}
        </p>
      </div>

      {histories === undefined && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }, (_, index) => index).map((index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      )}

      {histories?.length === 0 && (
        <p className="py-16 text-center text-muted-foreground text-sm">
          {actionType === null
            ? t(
                "まだ作品の操作履歴はありません",
                "You do not have any post history yet",
              )
            : t("この種類の履歴はありません", "No history of this type")}
        </p>
      )}

      <div
        className={cn(
          "flex flex-col gap-4 transition-opacity",
          currentData === undefined &&
            previousData !== undefined &&
            "opacity-60",
        )}
      >
        {groups.map((group) => (
          <section key={group.date}>
            <h2 className="mb-1 font-medium text-muted-foreground text-xs tabular-nums">
              {group.date}
            </h2>
            <ul className="divide-y rounded-xl border">
              {group.items.map((history) => {
                const type =
                  ACTION_TYPES[toActionType(history.actionType) ?? "UPDATE"]
                const historyKey = `${history.actionType}-${history.id}`
                const isOpened = openedId === historyKey
                const title =
                  history.title || t("タイトルなし", "Untitled post")
                return (
                  <li key={historyKey}>
                    <div className="flex items-center gap-3 p-2.5">
                      {history.thumbnailImageURL && history.workUrl ? (
                        <Link
                          to={history.workUrl}
                          className="shrink-0 overflow-hidden rounded-lg bg-muted"
                        >
                          <img
                            src={
                              toResizedImageUrl(
                                history.thumbnailImageURL,
                                96,
                              ) ?? ""
                            }
                            alt=""
                            loading="lazy"
                            className="size-12 object-cover"
                          />
                        </Link>
                      ) : (
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <type.icon className="size-4 text-muted-foreground" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-1.5 text-xs">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 font-medium",
                              type.className,
                            )}
                          >
                            {t(type.ja, type.en)}
                          </span>
                          {history.ratingLabel && (
                            <span className="text-muted-foreground">
                              {history.ratingLabel}
                            </span>
                          )}
                          <span className="text-muted-foreground tabular-nums">
                            {toTimeText(history.createdAt)}
                          </span>
                        </p>
                        {history.workUrl ? (
                          <Link
                            to={history.workUrl}
                            className="mt-0.5 block truncate font-medium text-sm hover:underline"
                          >
                            {title}
                          </Link>
                        ) : (
                          <p className="mt-0.5 truncate font-medium text-sm">
                            {title}
                          </p>
                        )}
                      </div>
                      {history.detail && (
                        <button
                          type="button"
                          aria-expanded={isOpened}
                          aria-label={t("詳細", "Details")}
                          onClick={() =>
                            setOpenedId(isOpened ? null : historyKey)
                          }
                          className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-muted"
                        >
                          <ChevronDownIcon
                            className={cn(
                              "size-4 transition-transform",
                              isOpened && "rotate-180",
                            )}
                          />
                        </button>
                      )}
                    </div>
                    {isOpened && (
                      <div className="whitespace-pre-wrap break-words border-t bg-muted/40 p-3 text-sm leading-6">
                        {toDetailText(history.detail ?? "")}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>

      {maxCount > PER_PAGE && (
        <div className="sticky bottom-0 z-10 flex justify-center border-t bg-background/95 py-2 backdrop-blur">
          <ResponsivePagination
            perPage={PER_PAGE}
            maxCount={maxCount}
            currentPage={page}
            maxPages={Math.ceil(maxCount / PER_PAGE)}
            onPageChange={(nextPage: number) =>
              update({ page: nextPage === 0 ? null : String(nextPage) })
            }
          />
        </div>
      )}
    </div>
  )
}

const workActionHistoriesQuery =
  graphql(`query ViewerWorkActionHistories($offset: Int!, $limit: Int!, $actionType: String) {
  viewer {
    id
    workActionHistoryCount(actionType: $actionType)
    workActionHistories(offset: $offset, limit: $limit, actionType: $actionType) {
      id
      actionType
      createdAt
      summary
      detail
      title
      ratingLabel
      workId
      workUrl
      thumbnailImageURL
      isModeratorAction
    }
  }
}`)
