import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  BookmarkIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  CopyIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  EyeIcon,
  HeartIcon,
  MessageCircleIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { useLocale } from "~/hooks/use-locale"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { cn } from "~/lib/utils"
import type { SortType } from "~/types/sort-type"
import { toAccessTypeText } from "~/utils/work/to-access-type-text"
import { toWorkTypeText } from "~/utils/work/to-work-type-text"

export type MyWork = {
  id: string
  uuid?: string | null
  title: string
  type: IntrospectionEnum<"WorkType">
  commentsCount: number
  viewsCount: number
  likesCount: number
  bookmarksCount: number
  rating?: IntrospectionEnum<"Rating"> | null
  createdAt: number
  accessType: IntrospectionEnum<"AccessType">
  isPromotion?: boolean | null
  smallThumbnailImageURL: string
}

type SharedProps = {
  works: MyWork[]
  isSelectable: boolean
  selectedIds: string[]
  onToggleSelect: (workId: string) => void
  onDelete: (work: MyWork) => void
}

const isScheduled = (work: MyWork) => work.createdAt * 1000 > Date.now()

const toEditUrl = (work: MyWork) => {
  if (work.type === "VIDEO") return `/posts/${work.id}/animation/edit`
  if (work.type === "COLUMN" || work.type === "NOVEL") {
    return `/posts/${work.id}/text/edit`
  }
  return `/posts/${work.id}/image/edit`
}

const toPostUrl = (work: MyWork) => {
  if (
    isScheduled(work) ||
    work.accessType === "PRIVATE" ||
    work.accessType === "DRAFT"
  ) {
    return `/posts/${work.id}/draft`
  }
  if (work.accessType === "LIMITED" && work.uuid) {
    return `/posts/${work.uuid}`
  }
  return `/posts/${work.id}`
}

const toDateText = (createdAt: number) => {
  const date = new Date(createdAt * 1000)
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const ACCESS_STYLES: Partial<Record<MyWork["accessType"], string>> = {
  PUBLIC: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  SILENT: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  LIMITED: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  PRIVATE: "bg-muted text-muted-foreground",
  DRAFT: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
}

const badgeClassName =
  "inline-flex h-5 items-center whitespace-nowrap rounded-full px-2 font-medium text-[11px]"

/** 公開範囲・予約・年齢・種類の目印 */
function WorkBadges(props: { work: MyWork; className?: string }) {
  const t = useTranslation()
  const locale = useLocale()
  const { work } = props
  const rating = work.rating ?? "G"

  return (
    <div className={cn("flex flex-wrap items-center gap-1", props.className)}>
      {isScheduled(work) ? (
        <span
          className={cn(
            badgeClassName,
            "bg-violet-500/15 text-violet-700 dark:text-violet-300",
          )}
        >
          {t("予約投稿", "Scheduled")}
        </span>
      ) : (
        <span className={cn(badgeClassName, ACCESS_STYLES[work.accessType])}>
          {toAccessTypeText(work.accessType)}
        </span>
      )}
      {rating !== "G" && (
        <span
          className={cn(
            badgeClassName,
            "bg-rose-500/15 text-rose-700 dark:text-rose-300",
          )}
        >
          {rating === "R15" ? "R-15" : rating === "R18" ? "R-18" : "R-18G"}
        </span>
      )}
      {work.type !== "WORK" && (
        <span className={cn(badgeClassName, "bg-muted text-muted-foreground")}>
          {toWorkTypeText({ type: work.type, lang: locale })}
        </span>
      )}
      {work.isPromotion && (
        <span className={cn(badgeClassName, "bg-muted text-muted-foreground")}>
          {t("宣伝", "Promotion")}
        </span>
      )}
    </div>
  )
}

/** いいね・ブックマーク・コメント・閲覧の数（1 行に並べる） */
function WorkStats(props: { work: MyWork }) {
  const t = useTranslation()
  const items = [
    [HeartIcon, props.work.likesCount, t("いいね", "Likes")],
    [BookmarkIcon, props.work.bookmarksCount, t("ブックマーク", "Bookmarks")],
    [MessageCircleIcon, props.work.commentsCount, t("コメント", "Comments")],
    [EyeIcon, props.work.viewsCount, t("閲覧", "Views")],
  ] as const
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-muted-foreground text-xs tabular-nums">
      {items.map(([Icon, count, label]) => (
        <span
          key={label}
          title={label}
          className="flex items-center gap-1 whitespace-nowrap"
        >
          <Icon className="size-3.5" aria-label={label} />
          {count.toLocaleString()}
        </span>
      ))}
    </div>
  )
}

/** 開く・編集・URL コピー・削除 */
function WorkActionsMenu(props: {
  work: MyWork
  onDelete: (work: MyWork) => void
}) {
  const t = useTranslation()
  const { work } = props
  const canCopy =
    !isScheduled(work) &&
    work.accessType !== "PRIVATE" &&
    work.accessType !== "DRAFT"

  return (
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
          <Link to={toPostUrl(work)}>
            <ExternalLinkIcon className="mr-2 size-4" />
            {t("作品を開く", "Open")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={toEditUrl(work)}>
            <PencilIcon className="mr-2 size-4" />
            {t("編集する", "Edit")}
          </Link>
        </DropdownMenuItem>
        {canCopy && (
          <DropdownMenuItem
            onSelect={() => {
              void navigator.clipboard
                .writeText(`${window.location.origin}${toPostUrl(work)}`)
                .then(() => toast(t("URLをコピーしました", "URL copied")))
            }}
          >
            <CopyIcon className="mr-2 size-4" />
            {t("URLをコピー", "Copy URL")}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => props.onDelete(work)}
        >
          <Trash2Icon className="mr-2 size-4" />
          {t("削除する", "Delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function EditButton(props: { work: MyWork }) {
  const t = useTranslation()
  return (
    <Button
      asChild
      size="icon"
      variant="ghost"
      className="size-8 shrink-0 rounded-full"
      title={t("編集する", "Edit")}
    >
      <Link to={toEditUrl(props.work)} aria-label={t("編集する", "Edit")}>
        <PencilIcon className="size-4" />
      </Link>
    </Button>
  )
}

function Thumbnail(props: { work: MyWork; className?: string }) {
  return (
    <img
      src={props.work.smallThumbnailImageURL}
      alt=""
      loading="lazy"
      decoding="async"
      className={cn("bg-muted object-cover", props.className)}
    />
  )
}

type SortableKey = Extract<
  IntrospectionEnum<"WorkOrderBy">,
  | "NAME"
  | "LIKES_COUNT"
  | "BOOKMARKS_COUNT"
  | "COMMENTS_COUNT"
  | "VIEWS_COUNT"
  | "DATE_CREATED"
>

function SortHeader(props: {
  label: string
  value: SortableKey
  orderBy: IntrospectionEnum<"WorkOrderBy">
  sort: SortType
  onSort: (orderBy: SortableKey, sort: SortType) => void
  align?: "left" | "right"
}) {
  const isActive = props.orderBy === props.value
  const Icon = !isActive
    ? ChevronsUpDownIcon
    : props.sort === "ASC"
      ? ChevronUpIcon
      : ChevronDownIcon
  return (
    <th
      scope="col"
      aria-sort={
        isActive ? (props.sort === "ASC" ? "ascending" : "descending") : "none"
      }
      className="px-2 py-2 font-medium"
    >
      <button
        type="button"
        onClick={() =>
          // 別の列を押したら大きい順・新しい順から。同じ列は向きを変える
          props.onSort(
            props.value,
            isActive && props.sort === "DESC" ? "ASC" : "DESC",
          )
        }
        className={cn(
          "inline-flex items-center gap-0.5 whitespace-nowrap rounded hover:text-foreground",
          isActive && "text-foreground",
          props.align === "right" && "flex-row-reverse",
        )}
      >
        <Icon
          className={cn("size-3.5", isActive ? "opacity-100" : "opacity-40")}
        />
        {props.label}
      </button>
    </th>
  )
}

/**
 * PC の表
 */
export function WorksTable(
  props: SharedProps & {
    orderBy: IntrospectionEnum<"WorkOrderBy">
    sort: SortType
    onSort: (orderBy: SortableKey, sort: SortType) => void
    onToggleSelectAll: () => void
  },
) {
  const t = useTranslation()
  const sortProps = {
    orderBy: props.orderBy,
    sort: props.sort,
    onSort: props.onSort,
  }
  const numberColumns = [
    ["LIKES_COUNT", t("いいね", "Likes")],
    ["BOOKMARKS_COUNT", t("ブックマーク", "Bookmarks")],
    ["COMMENTS_COUNT", t("コメント", "Comments")],
    ["VIEWS_COUNT", t("閲覧", "Views")],
  ] as const

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40 text-left text-muted-foreground text-xs">
          <tr>
            {props.isSelectable && (
              <th scope="col" className="w-10 px-3 py-2">
                <Checkbox
                  aria-label={t("このページをすべて選択", "Select all")}
                  checked={
                    props.works.length > 0 &&
                    props.works.every((work) =>
                      props.selectedIds.includes(work.id),
                    )
                  }
                  onCheckedChange={props.onToggleSelectAll}
                />
              </th>
            )}
            <SortHeader label={t("作品", "Work")} value="NAME" {...sortProps} />
            {numberColumns.map(([value, label]) => (
              <SortHeader
                key={value}
                label={label}
                value={value}
                align="right"
                {...sortProps}
              />
            ))}
            <SortHeader
              label={t("投稿日", "Date")}
              value="DATE_CREATED"
              {...sortProps}
            />
            <th scope="col" className="w-20 px-2 py-2">
              <span className="sr-only">{t("操作", "Actions")}</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {props.works.map((work) => {
            const isSelected = props.selectedIds.includes(work.id)
            return (
              <tr
                key={work.id}
                className={cn(
                  "transition-colors hover:bg-muted/40",
                  isSelected && "bg-sky-500/10",
                )}
              >
                {props.isSelectable && (
                  <td className="px-3 py-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => props.onToggleSelect(work.id)}
                      aria-label={t(
                        `「${work.title}」を選択`,
                        `Select "${work.title}"`,
                      )}
                    />
                  </td>
                )}
                <td className="px-2 py-2">
                  <Link
                    to={toPostUrl(work)}
                    className="group flex min-w-64 items-center gap-3"
                  >
                    <Thumbnail work={work} className="size-14 rounded-lg" />
                    <span className="min-w-0 space-y-1">
                      <span className="line-clamp-2 break-all font-medium leading-snug group-hover:underline">
                        {work.title}
                      </span>
                      <WorkBadges work={work} />
                    </span>
                  </Link>
                </td>
                {[
                  work.likesCount,
                  work.bookmarksCount,
                  work.commentsCount,
                  work.viewsCount,
                ].map((count, index) => (
                  <td
                    // 列の順番は変わらない
                    // biome-ignore lint/suspicious/noArrayIndexKey: 固定の 4 列
                    key={index}
                    className="whitespace-nowrap px-2 py-2 text-right tabular-nums"
                  >
                    {count.toLocaleString()}
                  </td>
                ))}
                <td className="whitespace-nowrap px-2 py-2 text-muted-foreground text-xs tabular-nums">
                  {toDateText(work.createdAt)}
                </td>
                <td className="px-2 py-2">
                  <div className="flex items-center justify-end">
                    <EditButton work={work} />
                    <WorkActionsMenu work={work} onDelete={props.onDelete} />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/**
 * スマホとタブレットの一覧
 */
export function WorksCards(props: SharedProps) {
  const t = useTranslation()
  return (
    <ul className="divide-y rounded-xl border">
      {props.works.map((work) => {
        const isSelected = props.selectedIds.includes(work.id)
        return (
          <li
            key={work.id}
            className={cn(
              "flex items-start gap-3 p-2.5",
              isSelected && "bg-sky-500/10",
            )}
          >
            {props.isSelectable && (
              <Checkbox
                className="mt-1 size-5 shrink-0"
                checked={isSelected}
                onCheckedChange={() => props.onToggleSelect(work.id)}
                aria-label={t(
                  `「${work.title}」を選択`,
                  `Select "${work.title}"`,
                )}
              />
            )}
            <Link to={toPostUrl(work)} className="shrink-0">
              <Thumbnail work={work} className="size-[72px] rounded-lg" />
            </Link>
            <div className="min-w-0 flex-1 space-y-1">
              <Link
                to={toPostUrl(work)}
                className="line-clamp-2 break-all font-medium text-sm leading-snug"
              >
                {work.title}
              </Link>
              <WorkBadges work={work} />
              <WorkStats work={work} />
              <p className="text-[11px] text-muted-foreground tabular-nums">
                {toDateText(work.createdAt)}
              </p>
            </div>
            <div className="-mt-0.5 -mr-1 flex shrink-0 items-center">
              <EditButton work={work} />
              <WorkActionsMenu work={work} onDelete={props.onDelete} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * 画像を大きく見るグリッド
 */
export function WorksGrid(props: SharedProps) {
  const t = useTranslation()
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {props.works.map((work) => {
        const isSelected = props.selectedIds.includes(work.id)
        return (
          <li
            key={work.id}
            className={cn(
              "overflow-hidden rounded-xl border bg-card",
              isSelected && "ring-2 ring-sky-500",
            )}
          >
            <div className="relative">
              <Link to={toPostUrl(work)} className="block">
                <Thumbnail work={work} className="aspect-square w-full" />
              </Link>
              {props.isSelectable && (
                <Checkbox
                  className="absolute top-2 left-2 size-5 bg-background"
                  checked={isSelected}
                  onCheckedChange={() => props.onToggleSelect(work.id)}
                  aria-label={t(
                    `「${work.title}」を選択`,
                    `Select "${work.title}"`,
                  )}
                />
              )}
              <div className="absolute right-1 bottom-1 flex rounded-full bg-background/90 shadow-sm backdrop-blur">
                <EditButton work={work} />
                <WorkActionsMenu work={work} onDelete={props.onDelete} />
              </div>
            </div>
            <div className="space-y-1.5 p-2.5">
              <Link
                to={toPostUrl(work)}
                className="line-clamp-1 break-all font-medium text-sm"
              >
                {work.title}
              </Link>
              <WorkBadges work={work} />
              <WorkStats work={work} />
              <p className="text-[11px] text-muted-foreground tabular-nums">
                {toDateText(work.createdAt)}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export const MyWorkListItemFragment = graphql(
  `fragment MyWorkListItem on WorkNode @_unmask {
    id
    uuid
    title
    type
    commentsCount
    viewsCount
    smallThumbnailImageURL
    likesCount
    rating
    bookmarksCount
    createdAt
    accessType
    isPromotion
  }`,
)
