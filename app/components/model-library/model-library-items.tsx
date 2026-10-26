import { Link } from "@remix-run/react"
import {
  CheckIcon,
  ExternalLinkIcon,
  ImageOffIcon,
  MinusCircleIcon,
  MoreHorizontalIcon,
  PencilIcon,
  StarIcon,
  Trash2Icon,
  UploadIcon,
  WandSparklesIcon,
} from "lucide-react"
import type { ModelLibraryItem } from "~/components/model-library/model-library-types"
import { formatLibraryDate } from "~/components/model-library/model-library-utils"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Skeleton } from "~/components/ui/skeleton"
import {
  UserModelRatingBadge,
  UserModelStatusBadge,
} from "~/components/user-models/user-model-badges"
import { formatBytes, formatCount } from "~/lib/user-models/generation"
import { cn } from "~/lib/utils"

export type ModelLibraryItemActions = {
  /**
   * 生成に使う（LoRA は選択中なら外す）。生成に使えないときは undefined
   */
  onUse?(item: ModelLibraryItem): void
  onEdit(item: ModelLibraryItem): void
  onDelete(item: ModelLibraryItem): void
  onToggleFavorite?(item: ModelLibraryItem): void
  isSelected(item: ModelLibraryItem): boolean
  /**
   * 公開ページを別タブで開く（ダイアログ内）
   */
  openInNewTab: boolean
}

export const libraryItemHref = (item: ModelLibraryItem): string | null => {
  if (item.userModel) return `/models/u/${item.userModel.id}`
  if (item.officialCheckpoint) return `/models/${item.officialCheckpoint.id}`
  return null
}

export const canUseLibraryItem = (item: ModelLibraryItem): boolean => {
  if (item.userModel) return item.userModel.status === "READY"
  return true
}

export function ModelKindLabel(props: {
  kind: ModelLibraryItem["kind"]
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-muted-foreground text-xs",
        props.className,
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          props.kind === "LORA" ? "bg-violet-500" : "bg-sky-500",
        )}
      />
      {props.kind === "LORA" ? "LoRA" : "チェックポイント"}
    </span>
  )
}

function Thumbnail(props: { item: ModelLibraryItem; className?: string }) {
  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden bg-muted",
        props.className,
      )}
    >
      {props.item.thumbnailUrl ? (
        <img
          src={props.item.thumbnailUrl}
          alt=""
          loading="lazy"
          draggable={false}
          className="size-full object-cover"
        />
      ) : (
        <span className="flex size-full items-center justify-center text-muted-foreground/60">
          <ImageOffIcon className="size-1/3 max-h-8 max-w-8" />
        </span>
      )}
    </span>
  )
}

function ItemMenu(props: {
  item: ModelLibraryItem
  actions: ModelLibraryItemActions
  className?: string
}) {
  const { item, actions } = props
  const href = libraryItemHref(item)
  const isSelected = actions.isSelected(item)
  const canUse = actions.onUse !== undefined && canUseLibraryItem(item)
  const linkProps = actions.openInNewTab
    ? { target: "_blank", rel: "noreferrer" }
    : {}

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className={cn("size-8 shrink-0 rounded-full", props.className)}
          aria-label={`${item.name}の操作`}
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[100] w-48"
        onClick={(event) => event.stopPropagation()}
      >
        {canUse && (
          <DropdownMenuItem onSelect={() => actions.onUse?.(item)}>
            {isSelected && item.kind === "LORA" ? (
              <MinusCircleIcon className="mr-2 size-4" />
            ) : (
              <WandSparklesIcon className="mr-2 size-4" />
            )}
            {isSelected && item.kind === "LORA"
              ? "LoRA から外す"
              : "生成に使う"}
          </DropdownMenuItem>
        )}
        {item.isOwn && item.userModel?.status === "UPLOADING" && (
          <DropdownMenuItem asChild>
            <Link to="/models/upload" {...linkProps}>
              <UploadIcon className="mr-2 size-4" />
              アップロードを再開
            </Link>
          </DropdownMenuItem>
        )}
        {item.isOwn && (
          <DropdownMenuItem onSelect={() => actions.onEdit(item)}>
            <PencilIcon className="mr-2 size-4" />
            編集
          </DropdownMenuItem>
        )}
        {item.officialCheckpoint && actions.onToggleFavorite && (
          <DropdownMenuItem onSelect={() => actions.onToggleFavorite?.(item)}>
            <StarIcon
              className={cn(
                "mr-2 size-4",
                item.isFavorite && "fill-amber-400 text-amber-400",
              )}
            />
            {item.isFavorite ? "お気に入りから外す" : "お気に入りに追加"}
          </DropdownMenuItem>
        )}
        {href && (
          <DropdownMenuItem asChild>
            <Link to={href} {...linkProps}>
              <ExternalLinkIcon className="mr-2 size-4" />
              公開ページを開く
            </Link>
          </DropdownMenuItem>
        )}
        {item.isOwn && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => actions.onDelete(item)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2Icon className="mr-2 size-4" />
              削除
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type ItemProps = {
  item: ModelLibraryItem
  actions: ModelLibraryItemActions
  onActivate(item: ModelLibraryItem): void
}

function SelectedMark(props: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-background",
        props.className,
      )}
    >
      <CheckIcon className="size-3.5" strokeWidth={3} />
    </span>
  )
}

/**
 * グリッド表示のカード
 */
export function ModelLibraryGridItem(props: ItemProps) {
  const { item, actions } = props
  const isSelected = actions.isSelected(item)
  const isUnavailable = item.userModel !== null && !canUseLibraryItem(item)

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-colors",
        isSelected
          ? "border-primary ring-1 ring-primary"
          : "hover:border-foreground/20 hover:bg-muted/30",
      )}
    >
      <button
        type="button"
        onClick={() => props.onActivate(item)}
        className="relative block w-full text-left focus-visible:outline-none"
        aria-pressed={isSelected}
        aria-label={item.name}
      >
        <Thumbnail
          item={item}
          className={cn("aspect-square w-full", isUnavailable && "opacity-50")}
        />
        {item.baseLabel && (
          <span className="absolute bottom-2 left-2 inline-flex items-center rounded-md bg-black/55 px-1.5 py-0.5 font-medium text-[10px] text-white leading-none backdrop-blur-sm">
            {item.baseLabel}
          </span>
        )}
      </button>
      <div className="pointer-events-none absolute top-2 left-2 flex flex-wrap gap-1">
        {item.isNew && (
          <span className="rounded-md bg-blue-500 px-1.5 py-0.5 font-bold text-[10px] text-white leading-none">
            New
          </span>
        )}
        {item.userModel && (
          <UserModelRatingBadge rating={item.userModel.rating} />
        )}
      </div>
      {isSelected && <SelectedMark className="absolute top-2 right-2" />}
      {item.isFavorite && !isSelected && (
        <StarIcon className="absolute top-2 right-2 size-4 fill-amber-400 text-amber-400 drop-shadow" />
      )}
      <div className="flex items-start gap-1 p-2.5 pr-1.5">
        <button
          type="button"
          onClick={() => props.onActivate(item)}
          className="min-w-0 flex-1 text-left"
          tabIndex={-1}
        >
          <p
            className="truncate font-medium text-sm leading-5"
            title={item.name}
          >
            {item.name}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-muted-foreground text-xs">
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                item.kind === "LORA" ? "bg-violet-500" : "bg-sky-500",
              )}
            />
            <span>{item.kind === "LORA" ? "LoRA" : "Checkpoint"}</span>
            {item.sizeBytes ? (
              <>
                <span aria-hidden>·</span>
                <span className="truncate tabular-nums">
                  {formatBytes(item.sizeBytes)}
                </span>
              </>
            ) : null}
          </p>
          {item.isOwn &&
            item.userModel &&
            item.userModel.status !== "READY" && (
              <UserModelStatusBadge
                status={item.userModel.status}
                className="mt-1.5"
              />
            )}
        </button>
        <ItemMenu item={item} actions={actions} className="-mt-0.5" />
      </div>
    </div>
  )
}

/**
 * リスト表示の行
 */
export function ModelLibraryListItem(props: ItemProps) {
  const { item, actions } = props
  const isSelected = actions.isSelected(item)
  const isUnavailable = item.userModel !== null && !canUseLibraryItem(item)

  return (
    <div
      className={cn(
        "group grid @2xl:grid-cols-[minmax(0,1fr)_7.5rem_6.5rem_5rem_5rem_6rem_auto] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b px-2 py-1.5 last:border-b-0",
        isSelected ? "bg-primary/5" : "hover:bg-muted/50",
      )}
    >
      <button
        type="button"
        onClick={() => props.onActivate(item)}
        className="flex min-w-0 items-center gap-3 rounded-md py-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-pressed={isSelected}
      >
        <span className="relative">
          <Thumbnail
            item={item}
            className={cn("size-10 rounded-md", isUnavailable && "opacity-50")}
          />
          {isSelected && (
            <SelectedMark className="-top-1.5 -right-1.5 absolute size-5" />
          )}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-medium text-sm" title={item.name}>
              {item.name}
            </span>
            {item.isFavorite && (
              <StarIcon className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
            )}
            {item.isNew && (
              <span className="shrink-0 rounded bg-blue-500 px-1 py-0.5 font-bold text-[10px] text-white leading-none">
                New
              </span>
            )}
            {item.userModel && (
              <UserModelRatingBadge rating={item.userModel.rating} />
            )}
          </span>
          <span className="mt-0.5 flex @2xl:hidden items-center gap-2 text-muted-foreground text-xs">
            <ModelKindLabel kind={item.kind} />
            {item.baseLabel && <span>{item.baseLabel}</span>}
            {item.sizeBytes ? <span>{formatBytes(item.sizeBytes)}</span> : null}
          </span>
          {item.isOwn &&
            item.userModel &&
            item.userModel.status !== "READY" && (
              <UserModelStatusBadge
                status={item.userModel.status}
                className="mt-1"
              />
            )}
        </span>
      </button>
      <ModelKindLabel kind={item.kind} className="@2xl:inline-flex hidden" />
      <span className="@2xl:block hidden truncate text-muted-foreground text-xs">
        {item.baseLabel ?? "—"}
      </span>
      <span className="@2xl:block hidden text-muted-foreground text-xs tabular-nums">
        {item.sizeBytes ? formatBytes(item.sizeBytes) : "—"}
      </span>
      <span className="@2xl:block hidden text-muted-foreground text-xs tabular-nums">
        {item.useCount !== null ? `${formatCount(item.useCount)} 回` : "—"}
      </span>
      <span className="@2xl:block hidden text-muted-foreground text-xs tabular-nums">
        {formatLibraryDate(item.updatedAt)}
      </span>
      <ItemMenu item={item} actions={actions} />
    </div>
  )
}

/**
 * リスト表示の見出し行
 */
export function ModelLibraryListHeader() {
  return (
    <div className="sticky top-0 z-10 @2xl:grid hidden grid-cols-[minmax(0,1fr)_7.5rem_6.5rem_5rem_5rem_6rem_2rem] gap-3 border-b bg-background/95 px-2 py-2 font-medium text-muted-foreground text-xs backdrop-blur">
      <span className="pl-[3.25rem]">名前</span>
      <span>種類</span>
      <span>ベース</span>
      <span>サイズ</span>
      <span>使用回数</span>
      <span>更新日</span>
      <span />
    </div>
  )
}

const skeletonKeys = Array.from({ length: 12 }, (_, index) => `s-${index}`)

export function ModelLibrarySkeleton(props: { viewMode: "grid" | "list" }) {
  if (props.viewMode === "list") {
    return (
      <div>
        {skeletonKeys.slice(0, 8).map((key) => (
          <div key={key} className="flex items-center gap-3 border-b px-2 py-2">
            <Skeleton className="size-10 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="grid @3xl:grid-cols-4 @5xl:grid-cols-5 @7xl:grid-cols-6 @lg:grid-cols-3 grid-cols-2 gap-3">
      {skeletonKeys.map((key) => (
        <div key={key} className="overflow-hidden rounded-xl border">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-1.5 p-2.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
