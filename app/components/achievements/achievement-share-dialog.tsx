import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { CheckIcon, DownloadIcon, LinkIcon, Share2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"
import {
  toAchievementShareCardUrl,
  toAchievementSharePageUrl,
  toAchievementShareText,
  toShareIntentUrls,
} from "~/lib/achievements/achievement-share"
import { cn } from "~/lib/utils"

export type AchievementShareTarget = {
  userId: string
  /** この実績を大きく出したカードにする */
  highlight?: { key: string; name: string } | null
}

type Props = {
  target: AchievementShareTarget | null
  onClose: () => void
}

const XLogo = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-5"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const LineLogo = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-5"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2C6.48 2 2 5.64 2 10.13c0 4.02 3.56 7.39 8.37 8.03.33.07.77.22.88.5.1.25.07.65.03.9l-.14.86c-.04.25-.2.99.87.54 1.07-.45 5.77-3.4 7.87-5.82C21.32 13.55 22 11.92 22 10.13 22 5.64 17.52 2 12 2zM8.08 12.6H6.1a.52.52 0 0 1-.52-.52V8.12a.52.52 0 1 1 1.04 0v3.44h1.46a.52.52 0 1 1 0 1.04zm2.04-.52a.52.52 0 1 1-1.04 0V8.12a.52.52 0 1 1 1.04 0zm4.77 0a.52.52 0 0 1-.94.31l-2.03-2.76v2.45a.52.52 0 1 1-1.04 0V8.12a.52.52 0 0 1 .94-.31l2.03 2.76V8.12a.52.52 0 1 1 1.04 0zm3.2-2.5a.52.52 0 1 1 0 1.04h-1.46v.94h1.46a.52.52 0 1 1 0 1.04h-1.98a.52.52 0 0 1-.52-.52V8.12c0-.29.23-.52.52-.52h1.98a.52.52 0 1 1 0 1.04h-1.46v.94z" />
  </svg>
)

const BlueskyLogo = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-5"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M5.2 3.7C7.5 5.4 10 8.9 11 10.9c1-2 3.5-5.5 5.8-7.2 1.7-1.2 4.4-2.2 4.4.9 0 .6-.4 5.2-.6 5.9-.7 2.6-3.3 3.2-5.6 2.8 4 .7 5 2.9 2.8 5.2-4.2 4.3-6-1.1-6.5-2.5l-.1-.3-.1.3c-.5 1.4-2.3 6.8-6.5 2.5-2.2-2.3-1.2-4.5 2.8-5.2-2.3.4-4.9-.2-5.6-2.8C1.6 9.8 1.2 5.2 1.2 4.6c0-3.1 2.7-2.1 4.4-.9z" />
  </svg>
)

const ThreadsLogo = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-5"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M17.7 11.1c-.1 0-.2-.1-.3-.1-.2-3.1-1.9-4.9-4.7-4.9-1.7 0-3.1.7-3.9 2l1.5 1c.6-.9 1.6-1.1 2.4-1.1 1 0 1.7.3 2.2.9.3.4.6 1 .7 1.7-.8-.1-1.6-.2-2.5-.1-2.5.1-4.1 1.6-4 3.6.1 1 .6 1.9 1.4 2.4.7.5 1.6.7 2.6.6 1.3-.1 2.3-.5 3-1.4.5-.7.9-1.6 1-2.7.6.4 1.1.9 1.3 1.5.4 1 .4 2.7-1 4.1-1.2 1.2-2.7 1.8-5 1.8-2.5 0-4.4-.8-5.6-2.4C5.6 16.9 5 14.8 5 12s.6-4.9 1.8-6.5C8 4 9.9 3.2 12.4 3.2c2.5 0 4.4.8 5.7 2.4.6.8 1.1 1.8 1.4 2.9l1.8-.5c-.4-1.4-1-2.6-1.8-3.6C17.8 2.3 15.4 1.2 12.4 1.2c-3.1 0-5.4 1-7 3C4 6 3.2 8.7 3.2 12s.8 6 2.2 7.8c1.6 2 4 3 7 3 2.7 0 4.6-.7 6.2-2.3 2.1-2.1 2-4.7 1.3-6.3-.4-1.2-1.2-2.1-2.2-2.8zm-4.5 4.4c-1.1.1-2.2-.4-2.3-1.4 0-.7.5-1.6 2.3-1.7h.6c.7 0 1.3.1 1.9.2-.2 2.5-1.4 2.8-2.5 2.9z" />
  </svg>
)

/**
 * 実績カードのシェア（カードの見本・X / LINE / Bluesky / Threads・リンクのコピー・画像の保存・端末の共有）
 */
export function AchievementShareDialog(props: Props) {
  const t = useTranslation()
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const target = props.target

  // 開いたときの最新の数（カードの URL とシェアの文に使う）
  const { data } = useQuery(achievementShareSummaryQuery, {
    skip: target === null,
    variables: { userId: target?.userId ?? "" },
    fetchPolicy: "network-only",
  })

  if (target === null) {
    return null
  }

  const summary = data?.achievementSummary ?? null

  if (summary === null) {
    return (
      <Dialog open={true} onOpenChange={(open) => !open && props.onClose()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {t("実績カードをシェア", "Share your achievement card")}
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-[1200/630] w-full animate-pulse rounded-xl bg-gradient-to-br from-indigo-950 via-violet-900 to-pink-800" />
        </DialogContent>
      </Dialog>
    )
  }

  const cardUrl = toAchievementShareCardUrl({
    userId: target.userId,
    unlockedCount: summary.unlockedCount,
    highlight: target.highlight?.key,
  })
  const pageUrl = toAchievementSharePageUrl({
    userId: target.userId,
    highlight: target.highlight?.key,
  })
  const text = toAchievementShareText({
    level: summary.level,
    unlockedCount: summary.unlockedCount,
    totalCount: summary.totalCount,
    highlightName: target.highlight?.name,
  })
  const intents = toShareIntentUrls({ text, url: pageUrl })

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${pageUrl}`)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      toast.error(t("コピーできませんでした", "Failed to copy"))
    }
  }

  const loadCardFile = async () => {
    const response = await fetch(cardUrl)
    const blob = await response.blob()
    return new File([blob], "aipictors-achievements.png", { type: "image/png" })
  }

  const saveImage = async () => {
    try {
      const file = await loadCardFile()
      const url = URL.createObjectURL(file)
      const link = document.createElement("a")
      link.href = url
      link.download = file.name
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      toast.error(t("画像を保存できませんでした", "Failed to save the image"))
    }
  }

  // スマホでは画像ごと他のアプリ（Instagram など）に渡せる
  const canShareFiles =
    typeof navigator !== "undefined" && typeof navigator.canShare === "function"

  const shareNative = async () => {
    try {
      const file = await loadCardFile()
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${text}\n${pageUrl}` })
        return
      }
      await navigator.share({ text, url: pageUrl })
    } catch {
      // 閉じたときなど
    }
  }

  const services = [
    {
      label: "X",
      href: intents.x,
      icon: <XLogo />,
      className:
        "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black",
    },
    {
      label: "LINE",
      href: intents.line,
      icon: <LineLogo />,
      className: "bg-[#06c755] text-white hover:brightness-95",
    },
    {
      label: "Bluesky",
      href: intents.bluesky,
      icon: <BlueskyLogo />,
      className: "bg-[#0a7aff] text-white hover:brightness-95",
    },
    {
      label: "Threads",
      href: intents.threads,
      icon: <ThreadsLogo />,
      className: "bg-zinc-900 text-white hover:bg-zinc-700",
    },
  ]

  return (
    <Dialog open={true} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {target.highlight
              ? t("達成した実績をシェア", "Share this achievement")
              : t("実績カードをシェア", "Share your achievement card")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "このカードが X や Discord に大きく表示されます",
              "This card shows up large on X, Discord and more",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-xl border bg-gradient-to-br from-indigo-950 via-violet-900 to-pink-800">
          {!isImageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-white/10" />
          )}
          <img
            ref={(element) => {
              // キャッシュから読めたときは onLoad より先に読み終わっていることがある
              if (element?.complete && element.naturalWidth > 0) {
                setIsImageLoaded(true)
              }
            }}
            src={cardUrl}
            alt={t("実績カード", "Achievement card")}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-500",
              isImageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {services.map((service) => (
            <a
              key={service.label}
              href={service.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex h-11 items-center justify-center gap-2 rounded-full font-bold text-sm transition active:scale-95",
                service.className,
              )}
            >
              {service.icon}
              {service.label}
            </a>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={copyLink}
            className="flex h-10 items-center justify-center gap-2 rounded-full border bg-card font-bold text-sm transition hover:bg-muted active:scale-95"
          >
            {isCopied ? (
              <CheckIcon className="size-4 text-emerald-500" />
            ) : (
              <LinkIcon className="size-4" />
            )}
            {isCopied
              ? t("コピーしました", "Copied")
              : t("リンクをコピー", "Copy link")}
          </button>
          <button
            type="button"
            onClick={saveImage}
            className="flex h-10 items-center justify-center gap-2 rounded-full border bg-card font-bold text-sm transition hover:bg-muted active:scale-95"
          >
            <DownloadIcon className="size-4" />
            {t("画像を保存", "Save image")}
          </button>
          {canShareFiles && (
            <button
              type="button"
              onClick={shareNative}
              className="col-span-2 flex h-10 items-center justify-center gap-2 rounded-full border bg-card font-bold text-sm transition hover:bg-muted active:scale-95 sm:col-span-1"
            >
              <Share2Icon className="size-4" />
              {t("ほかのアプリ", "More apps")}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const achievementShareSummaryQuery = graphql(
  `query AchievementShareSummary($userId: ID) {
    achievementSummary(userId: $userId) {
      level
      unlockedCount
      totalCount
    }
  }`,
)
