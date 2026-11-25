import { CheckIcon, Loader2Icon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import type { PostStage } from "~/routes/($lang)._main.new.image/hooks/use-post-image-submit"

type Props = {
  isOpen: boolean
  progress: number // 0から100までの数値
  text?: string
  /** 投稿の段階（新規投稿の画面だけ渡す。ないときはアップロード中とだけ出す） */
  stage?: PostStage
  /** 投稿前に自動でモザイクをかける（R18） */
  isAutoMosaic?: boolean
}

type StepKey = "mosaic" | "upload" | "create"

/**
 * 投稿中の表示（段階・進み具合・処理中の画像）
 */
export function CreatingWorkDialog(props: Props) {
  const t = useTranslation()
  const progress = Math.min(100, Math.max(0, Math.round(props.progress)))

  const steps: { key: StepKey; label: string }[] = [
    ...(props.isAutoMosaic
      ? [{ key: "mosaic" as const, label: t("モザイク", "Mosaic") }]
      : []),
    { key: "upload", label: t("アップロード", "Upload") },
    { key: "create", label: t("作品を作成", "Create") },
  ]
  const currentKey: StepKey | null =
    props.stage === undefined ||
    props.stage.kind === "idle" ||
    props.stage.kind === "done"
      ? null
      : props.stage.kind
  const currentIndex =
    currentKey === null ? 0 : steps.findIndex((step) => step.key === currentKey)

  const mosaic = props.stage?.kind === "mosaic" ? props.stage : null

  const title =
    props.text ??
    (mosaic?.isChecking
      ? t("画像を確認中", "Checking images")
      : mosaic !== null
        ? t("モザイク処理中", "Applying mosaic")
        : currentKey === "create"
          ? t("作品を作成中", "Creating your work")
          : t("アップロード中", "Uploading"))

  return (
    <Dialog open={props.isOpen}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-sm gap-5 rounded-2xl p-6 [&>button:last-child]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* 処理中の画像（モザイク中はモザイクが走るように見せる） */}
        <div className="flex justify-center">
          <div className="relative size-28 overflow-hidden rounded-2xl bg-muted shadow-inner">
            {mosaic?.preview ? (
              <>
                <img
                  src={mosaic.preview}
                  alt=""
                  className="size-full object-cover blur-[1px]"
                />
                <div className="absolute inset-0 animate-pulse bg-[length:14px_14px] bg-[linear-gradient(45deg,rgba(0,0,0,0.25)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.25)_50%,rgba(0,0,0,0.25)_75%,transparent_75%)]" />
                <div className="mosaic-scan absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-emerald-400/60 to-transparent" />
              </>
            ) : (
              <div className="flex size-full items-center justify-center">
                <Loader2Icon className="size-10 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1 text-center">
          <DialogTitle className="font-bold text-lg">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs leading-5">
            {mosaic !== null
              ? mosaic.total > 0
                ? t(
                    `画像を確認しています（${Math.min(mosaic.done + 1, mosaic.total)} / ${mosaic.total}）`,
                    `Checking images (${Math.min(mosaic.done + 1, mosaic.total)} / ${mosaic.total})`,
                  )
                : t("準備しています", "Preparing")
              : t(
                  "画面を閉じずにそのままお待ちください",
                  "Please keep this screen open",
                )}
          </DialogDescription>
        </div>

        {/* 段階 */}
        {props.stage !== undefined && (
          <ol className="flex flex-wrap items-center justify-center gap-1">
            {steps.map((step, index) => {
              const isDone = index < currentIndex
              const isCurrent = index === currentIndex
              return (
                <li key={step.key} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <span
                      className={cn(
                        "h-px w-3 bg-border",
                        isDone || isCurrent ? "bg-primary" : "",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[11px]",
                      isCurrent && "bg-primary/10 font-bold text-primary",
                      isDone && "text-primary",
                      !isDone && !isCurrent && "text-muted-foreground",
                    )}
                  >
                    {isDone ? (
                      <CheckIcon className="size-3.5" />
                    ) : isCurrent ? (
                      <Loader2Icon className="size-3.5 animate-spin" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-current" />
                    )}
                    {step.label}
                  </span>
                </li>
              )
            })}
          </ol>
        )}

        <div className="space-y-1.5">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-[width] duration-500 ease-out"
              style={{ width: `${Math.max(4, progress)}%` }}
            />
          </div>
          <p className="text-right font-medium text-muted-foreground text-xs tabular-nums">
            {`${progress}%`}
          </p>
        </div>
        <style>{`
          @keyframes mosaic-scan { 0% { top: -2rem } 100% { top: 100% } }
          .mosaic-scan { animation: mosaic-scan 1.4s ease-in-out infinite; }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}
