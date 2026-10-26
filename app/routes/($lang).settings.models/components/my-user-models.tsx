import { Link } from "@remix-run/react"
import {
  ExternalLinkIcon,
  ImageOffIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PackageOpenIcon,
  PencilIcon,
  PlayIcon,
  Trash2Icon,
  UploadIcon,
  WandSparklesIcon,
} from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { useMyUserModels } from "~/components/user-models/use-user-models"
import {
  UserModelBaseBadge,
  UserModelKindBadge,
  UserModelRatingBadge,
} from "~/components/user-models/user-model-badges"
import { UserModelDeleteDialog } from "~/components/user-models/user-model-delete-dialog"
import { UserModelEditDialog } from "~/components/user-models/user-model-edit-dialog"
import { UserModelLimitCard } from "~/components/user-models/user-model-limit-card"
import { formatBytes, formatCount } from "~/lib/user-models/generation"
import type { UserModel } from "~/lib/user-models/types"
import { cn } from "~/lib/utils"
import { toDateText } from "~/utils/to-date-text"

function StatusBadge(props: { status: UserModel["status"] }) {
  const label = {
    READY: "公開中",
    UPLOADING: "アップロード未完了",
    DISABLED: "無効",
    DELETED: "削除済み",
  }[props.status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-[11px]",
        props.status === "READY" &&
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        props.status === "UPLOADING" &&
          "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        (props.status === "DISABLED" || props.status === "DELETED") &&
          "bg-destructive/10 text-destructive",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          props.status === "READY" && "bg-emerald-500",
          props.status === "UPLOADING" && "bg-amber-500",
          (props.status === "DISABLED" || props.status === "DELETED") &&
            "bg-destructive",
        )}
      />
      {label}
    </span>
  )
}

/**
 * 自分のモデル管理
 */
export function MyUserModels() {
  const query = useMyUserModels()
  const [editing, setEditing] = useState<UserModel | null>(null)
  const [deleting, setDeleting] = useState<UserModel | null>(null)

  if (query.isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (query.isError || !query.data) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
        <p className="font-medium">自分のモデルを読み込めませんでした</p>
        <p className="mt-1 text-muted-foreground">
          {query.error instanceof Error ? query.error.message : ""}
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => query.refetch()}
        >
          再読み込み
        </Button>
      </div>
    )
  }

  const { models, used, limit, planType } = query.data
  const isFull = limit > 0 && used >= limit

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-stretch">
        <UserModelLimitCard used={used} limit={limit} planType={planType} />
        <Button
          asChild={!isFull}
          disabled={isFull}
          size="lg"
          className="h-auto min-h-12 rounded-2xl px-6 font-bold"
        >
          {isFull ? (
            <span>上限に達しています</span>
          ) : (
            <Link to="/models/upload">
              <UploadIcon className="mr-2 size-5" />
              新しいモデルをアップロード
            </Link>
          )}
        </Button>
      </div>

      {models.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-14 text-center">
          <PackageOpenIcon className="size-10 text-muted-foreground" />
          <div>
            <p className="font-semibold">まだモデルがありません</p>
            <p className="mt-1 text-muted-foreground text-sm">
              LoRA
              やチェックポイントをアップロードして、みんなに使ってもらいましょう
            </p>
          </div>
        </div>
      ) : (
        <ul className="divide-y rounded-2xl border">
          {models.map((model) => (
            <li
              key={model.id}
              className="flex items-center gap-3 p-3 md:gap-4 md:p-4"
            >
              <Link
                to={`/models/u/${model.id}`}
                className="size-16 shrink-0 overflow-hidden rounded-xl bg-muted md:size-20"
              >
                {model.thumbnailUrl ? (
                  <img
                    src={model.thumbnailUrl}
                    alt={model.name}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <ImageOffIcon className="size-5" />
                  </div>
                )}
              </Link>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <UserModelKindBadge kind={model.kind} />
                  <UserModelBaseBadge
                    baseModel={model.baseModel}
                    className="bg-secondary text-secondary-foreground"
                  />
                  <UserModelRatingBadge rating={model.rating} />
                  <StatusBadge status={model.status} />
                </div>
                <Link
                  to={`/models/u/${model.id}`}
                  className="block truncate font-semibold hover:underline"
                >
                  {model.name}
                </Link>
                <p className="flex flex-wrap gap-x-3 text-muted-foreground text-xs tabular-nums">
                  <span className="flex items-center gap-0.5">
                    <PlayIcon className="size-3 fill-current" />
                    {formatCount(model.useCount)} 回
                  </span>
                  <span>{formatBytes(model.sizeBytes)}</span>
                  {model.createdAt > 0 && (
                    <span>{toDateText(model.createdAt)}</span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {model.status === "READY" && (
                  <Button
                    asChild
                    size="sm"
                    variant="secondary"
                    className="hidden rounded-full sm:inline-flex"
                  >
                    <Link to={`/generation?userModel=${model.id}`}>
                      <WandSparklesIcon className="mr-1 size-4" />
                      生成
                    </Link>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" aria-label="操作">
                      <MoreHorizontalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/models/u/${model.id}`}>
                        <ExternalLinkIcon className="mr-2 size-4" />
                        モデルページ
                      </Link>
                    </DropdownMenuItem>
                    {model.status === "READY" && (
                      <DropdownMenuItem asChild className="sm:hidden">
                        <Link to={`/generation?userModel=${model.id}`}>
                          <WandSparklesIcon className="mr-2 size-4" />
                          このモデルで生成
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {model.status === "UPLOADING" && (
                      <DropdownMenuItem asChild>
                        <Link to="/models/upload">
                          <UploadIcon className="mr-2 size-4" />
                          アップロードを再開
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onSelect={() => setEditing(model)}>
                      <PencilIcon className="mr-2 size-4" />
                      編集
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => setDeleting(model)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2Icon className="mr-2 size-4" />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <UserModelEditDialog
          key={editing.id}
          model={editing}
          isOpen={editing !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) setEditing(null)
          }}
          onUpdated={() => query.refetch()}
        />
      )}
      {deleting && (
        <UserModelDeleteDialog
          model={deleting}
          isOpen={deleting !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) setDeleting(null)
          }}
          onDeleted={() => query.refetch()}
        />
      )}
    </div>
  )
}
