import { Link } from "@remix-run/react"
import { useQueryClient } from "@tanstack/react-query"
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  FileBoxIcon,
  LinkIcon,
  PauseIcon,
  PlayIcon,
  RotateCwIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { userModelsQueryKeys } from "~/components/user-models/use-user-models"
import { formatBytes, formatDuration } from "~/lib/user-models/generation"
import {
  cancelUserModelUpload,
  clearFinishedUserModelUploads,
  dismissUserModelUpload,
  isActiveUploadStatus,
  pauseUserModelUpload,
  resumeUserModelUpload,
  type UploadJob,
  uploadJobPercent,
  useUserModelUploads,
} from "~/lib/user-models/upload-queue"
import { cn } from "~/lib/utils"

const statusText = (job: UploadJob): string => {
  switch (job.status) {
    case "hashing":
      return `ファイルを確認中 ${Math.floor(uploadJobPercent(job))}%`
    case "starting":
      return job.source === "url" ? "Civitai を確認中…" : "準備中…"
    case "uploading": {
      const progress = job.progress
      if (!progress) return "送信中…"
      const eta =
        progress.etaSeconds !== null
          ? `・残り ${formatDuration(progress.etaSeconds)}`
          : ""
      return `${formatBytes(progress.uploadedBytes)} / ${formatBytes(progress.totalBytes)}${eta}`
    }
    case "paused":
      return job.message ?? "一時停止中"
    case "completing":
      return "仕上げ中…"
    case "importing": {
      const progress = job.importProgress
      if (!progress || progress.state === "QUEUED") {
        return "取り込みの準備中…（ページを閉じても続きます）"
      }
      return `取り込み中 ${Math.floor(uploadJobPercent(job))}%（ページを閉じても続きます）`
    }
    case "done":
      if (job.source === "url") {
        return job.deduplicated
          ? "保存済みのファイルだったので、すぐ使えます"
          : "取り込みが完了しました"
      }
      return job.deduplicated ? "登録済みのファイルでした" : "完了"
    case "error":
      return job.message ?? "アップロードできませんでした"
    case "canceled":
      return "中止しました"
  }
}

function JobRow(props: { job: UploadJob; modelHrefTarget?: string }) {
  const { job } = props
  const percent = uploadJobPercent(job)
  const isActive = isActiveUploadStatus(job.status)
  const isError = job.status === "error"

  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
          job.kind === "LORA"
            ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
            : "bg-sky-500/10 text-sky-600 dark:text-sky-400",
        )}
      >
        {job.source === "url" ? (
          <LinkIcon className="size-4" />
        ) : (
          <FileBoxIcon className="size-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm" title={job.fileName}>
          {job.name}
        </p>
        <p
          className={cn(
            "mt-0.5 line-clamp-2 text-xs",
            isError || (job.status === "paused" && job.message)
              ? "text-destructive"
              : "text-muted-foreground",
          )}
        >
          {statusText(job)}
        </p>
        {job.isLimitExceeded && (
          <Link
            to="/plus"
            target={props.modelHrefTarget}
            className="mt-1 inline-block font-medium text-primary text-xs hover:underline"
          >
            プランを見る
          </Link>
        )}
        {job.status === "done" && job.modelId && (
          <Link
            to={`/models/u/${job.modelId}`}
            target={props.modelHrefTarget}
            className="mt-1 inline-block font-medium text-primary text-xs hover:underline"
          >
            モデルページを見る
          </Link>
        )}
        {job.status !== "done" && !isError && (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-300",
                job.status === "paused" ? "bg-amber-500" : "bg-primary",
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center">
        {job.status === "done" && (
          <CheckCircle2Icon className="mr-1 size-5 text-emerald-500" />
        )}
        {isError && !job.isLimitExceeded && (
          <Button
            size="icon"
            variant="ghost"
            className="size-7 rounded-full"
            onClick={() => resumeUserModelUpload(job.id)}
            aria-label="やり直す"
            title="やり直す"
          >
            <RotateCwIcon className="size-3.5" />
          </Button>
        )}
        {isError && job.isLimitExceeded && (
          <AlertCircleIcon className="mr-1 size-4 text-destructive" />
        )}
        {job.status === "uploading" && job.source === "file" && (
          <Button
            size="icon"
            variant="ghost"
            className="size-7 rounded-full"
            onClick={() => pauseUserModelUpload(job.id)}
            aria-label="一時停止"
            title="一時停止"
          >
            <PauseIcon className="size-3.5" />
          </Button>
        )}
        {job.status === "paused" && (
          <Button
            size="icon"
            variant="ghost"
            className="size-7 rounded-full"
            onClick={() => resumeUserModelUpload(job.id)}
            aria-label="再開"
            title="再開"
          >
            <PlayIcon className="size-3.5" />
          </Button>
        )}
        {job.status !== "done" && job.status !== "completing" ? (
          <Button
            size="icon"
            variant="ghost"
            className="size-7 rounded-full"
            onClick={() =>
              isActive || job.status === "paused"
                ? cancelUserModelUpload(job.id)
                : dismissUserModelUpload(job.id)
            }
            aria-label="中止"
            title={isActive || job.status === "paused" ? "中止" : "閉じる"}
          >
            <XIcon className="size-3.5" />
          </Button>
        ) : null}
      </div>
    </li>
  )
}

type Props = {
  /**
   * ダイアログ内に出すとき（リンクを別タブで開く）
   */
  isInDialog?: boolean
  className?: string
}

/**
 * 右下のアップロード状況（Google ドライブのような折りたためるパネル）
 */
export function ModelLibraryUploadPanel(props: Props) {
  const jobs = useUserModelUploads()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const queryClient = useQueryClient()
  const signatureRef = useRef("")
  const finishedCount = jobs.filter((job) => job.status === "done").length
  // 取り込みが始まった・終わった（再読み込み後に復元したものを含む）ときにマイモデルを更新する
  const signature = jobs
    .filter(
      (job) => job.status === "done" || (job.source === "url" && job.modelId),
    )
    .map((job) => `${job.modelId}:${job.status}`)
    .join(",")

  useEffect(() => {
    if (signature && signature !== signatureRef.current) {
      queryClient.invalidateQueries({ queryKey: userModelsQueryKeys.all })
    }
    signatureRef.current = signature
  }, [signature, queryClient])

  if (jobs.length === 0) return null

  const activeCount = jobs.filter((job) =>
    isActiveUploadStatus(job.status),
  ).length
  const importingCount = jobs.filter(
    (job) => job.source === "url" && isActiveUploadStatus(job.status),
  ).length
  const doneCount = finishedCount
  const title =
    activeCount > 0
      ? importingCount === activeCount
        ? `${activeCount} 件を取り込み中`
        : `${activeCount} 件をアップロード中`
      : jobs.some((job) => job.status === "paused")
        ? "一時停止中のアップロードがあります"
        : jobs.some((job) => job.status === "error")
          ? "アップロードできなかったファイルがあります"
          : `${doneCount} 件のアップロードが完了`
  const canClose =
    activeCount === 0 && !jobs.some((job) => job.status === "paused")

  return (
    <div
      className={cn(
        "z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl",
        props.className,
      )}
      aria-live="polite"
    >
      <div className="flex items-center gap-1 bg-muted/60 py-1.5 pr-1.5 pl-4">
        <p className="min-w-0 flex-1 truncate font-medium text-sm">{title}</p>
        <Button
          size="icon"
          variant="ghost"
          className="size-8 rounded-full"
          onClick={() => setIsCollapsed((value) => !value)}
          aria-label={isCollapsed ? "開く" : "折りたたむ"}
          aria-expanded={!isCollapsed}
        >
          <ChevronDownIcon
            className={cn(
              "size-4 transition-transform",
              isCollapsed && "rotate-180",
            )}
          />
        </Button>
        {canClose && (
          <Button
            size="icon"
            variant="ghost"
            className="size-8 rounded-full"
            onClick={clearFinishedUserModelUploads}
            aria-label="閉じる"
          >
            <XIcon className="size-4" />
          </Button>
        )}
      </div>
      {!isCollapsed && (
        <ul className="max-h-72 divide-y overflow-y-auto">
          {jobs.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              modelHrefTarget={props.isInDialog ? "_blank" : undefined}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
