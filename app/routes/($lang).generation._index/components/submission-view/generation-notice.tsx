import { Link } from "@remix-run/react"
import { InfoIcon, TriangleAlertIcon, WrenchIcon } from "lucide-react"
import { useEffect, useState } from "react"
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
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import type {
  GenerationNotice,
  GenerationNoticeKind,
} from "~/utils/generation-notice"

/** 取り直す間隔（API 側は 30 秒キャッシュ） */
const REFRESH_INTERVAL_MS = 60_000

const DISCORD_INVITE_URL = "https://discord.gg/hcQggQEYfn"

/**
 * 生成画面のお知らせ（なければ null）
 */
export function useGenerationNotice() {
  const [notice, setNotice] = useState<GenerationNotice | null>(null)

  useEffect(() => {
    let isCancelled = false
    const load = async () => {
      if (document.visibilityState === "hidden") return
      try {
        const response = await fetch("/api/generation/notice")
        if (!response.ok) return
        const body = (await response.json()) as {
          data: GenerationNotice | null
        }
        if (!isCancelled) setNotice(body.data)
      } catch {
        // 取れなければ前回のまま
      }
    }
    load()
    const intervalId = setInterval(load, REFRESH_INTERVAL_MS)
    document.addEventListener("visibilitychange", load)
    return () => {
      isCancelled = true
      clearInterval(intervalId)
      document.removeEventListener("visibilitychange", load)
    }
  }, [])

  return notice
}

const useNoticeText = (notice: GenerationNotice) => {
  const t = useTranslation()
  const defaults: Record<
    GenerationNoticeKind,
    { title: string; message: string }
  > = {
    maintenance: {
      title: t("画像生成を一時停止しています", "Image generation is paused"),
      message: t(
        "生成機能のメンテナンス中です。終わるまで生成できません。終わりしだい再開します。",
        "Image generation is under maintenance and unavailable until it is finished.",
      ),
    },
    unstable: {
      title: t(
        "画像生成のアップデート中です",
        "Image generation is being updated",
      ),
      message: t(
        "ただいま生成機能のアップデートを行っています。生成に時間がかかったり、失敗したり、以前と違う仕上がりになったりすることがあります。",
        "We are updating image generation. Generation may be slow, fail, or look different from before.",
      ),
    },
    changed: {
      title: t("生成の仕組みを変更しました", "Image generation has changed"),
      message: t(
        "生成の仕組みを新しくしました。以前と仕上がりが違ったり、うまく動かなかったりする場合があります。",
        "We changed how image generation works. Results may differ from before, or something may not work as expected.",
      ),
    },
  }
  return {
    title: notice.title ?? defaults[notice.kind].title,
    message: notice.message ?? defaults[notice.kind].message,
  }
}

const KindIcon = (props: {
  kind: GenerationNoticeKind
  className?: string
}) => {
  if (props.kind === "maintenance") {
    return <WrenchIcon className={props.className} />
  }
  if (props.kind === "unstable") {
    return <TriangleAlertIcon className={props.className} />
  }
  return <InfoIcon className={props.className} />
}

/**
 * 生成ボタンの上に出す 1 行のお知らせ（押すと詳しく）
 */
export function GenerationNoticeBanner(props: {
  notice: GenerationNotice
  onOpen: () => void
}) {
  const t = useTranslation()
  const text = useNoticeText(props.notice)

  return (
    <button
      type="button"
      onClick={props.onOpen}
      className={cn(
        "flex w-full min-w-0 items-center gap-2 rounded-md border px-3 py-1.5 text-left text-xs",
        props.notice.kind === "maintenance"
          ? "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          : "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
      )}
    >
      <KindIcon kind={props.notice.kind} className="size-3.5 shrink-0" />
      <span className="min-w-0 flex-1 truncate font-medium">{text.title}</span>
      <span className="shrink-0 underline underline-offset-2">
        {t("詳しく", "Details")}
      </span>
    </button>
  )
}

/**
 * お知らせのダイアログ
 * - mode="confirm": 生成ボタンを押したとき（maintenance 以外は「このまま生成する」も出す）
 * - mode="info": 帯を押したとき
 */
export function GenerationNoticeDialog(props: {
  notice: GenerationNotice | null
  mode: "confirm" | "info"
  onProceed: () => void
  onClose: () => void
}) {
  const t = useTranslation()

  if (props.notice === null) return null

  const canProceed =
    props.mode === "confirm" && props.notice.kind !== "maintenance"

  return (
    <AlertDialog
      open={true}
      onOpenChange={(isOpen) => {
        if (!isOpen) props.onClose()
      }}
    >
      <GenerationNoticeDialogContent
        notice={props.notice}
        footer={
          <AlertDialogFooter>
            {canProceed ? (
              <>
                <AlertDialogCancel>{t("やめる", "Cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={props.onProceed}>
                  {t("このまま生成する", "Generate anyway")}
                </AlertDialogAction>
              </>
            ) : (
              <AlertDialogAction onClick={props.onClose}>
                {t("閉じる", "Close")}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        }
      />
    </AlertDialog>
  )
}

function GenerationNoticeDialogContent(props: {
  notice: GenerationNotice
  footer: React.ReactNode
}) {
  const t = useTranslation()
  const text = useNoticeText(props.notice)

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2">
          <KindIcon
            kind={props.notice.kind}
            className={cn(
              "size-5 shrink-0",
              props.notice.kind === "maintenance"
                ? "text-red-500"
                : "text-amber-500",
            )}
          />
          {text.title}
        </AlertDialogTitle>
        <AlertDialogDescription className="whitespace-pre-wrap text-left">
          {text.message}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="space-y-2 text-muted-foreground text-sm">
        <p>
          {t(
            "おかしな動きや、以前と違うところがあれば教えてください。確認して直します。",
            "If something looks wrong or different from before, please let us know and we will fix it.",
          )}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Link to="/support/chat" className="text-primary underline">
            {t("お問い合わせ", "Contact support")}
          </Link>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Discord
          </a>
          {props.notice.linkUrl && (
            <a
              href={props.notice.linkUrl}
              target={
                props.notice.linkUrl.startsWith("/") ? undefined : "_blank"
              }
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {props.notice.linkLabel ?? t("詳しいお知らせ", "Details")}
            </a>
          )}
        </div>
      </div>
      {props.footer}
    </AlertDialogContent>
  )
}
