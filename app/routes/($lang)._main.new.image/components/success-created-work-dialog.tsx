import {
  CheckIcon,
  ExternalLinkIcon,
  PlusIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { useEffect } from "react"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog"
import { WorkAutoModerationPostNotice } from "~/components/work/work-auto-moderation"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { cn } from "~/lib/utils"
import { PostNextSteps } from "~/routes/($lang)._main.new.image/components/post-next-steps"
import { XIntent } from "~/routes/($lang)._main.posts.$post._index/components/work-action-share-x"

type Props = {
  title: string | null
  description: string | null
  isOpen: boolean
  imageBase64: string | null
  workId: string | null
  uuid: string | null
  shareTags: string[]
  createdAt: number
  accessType: IntrospectionEnum<"AccessType">
  /** 画像の自動判定の結果を出す（画像の作品だけ） */
  showAutoModeration?: boolean
  /** 新しく投稿した（編集の更新ではない）。「投稿しました」と次の一手を出す */
  isNew?: boolean
  /** 性器が写っていたので、全年齢・R15 から R18 に変えて投稿した */
  isRatingChangedToR18?: boolean
  /** 投稿時に自動でモザイクをかけた画像の枚数（R18 の投稿だけ。null なら出さない） */
  mosaicImageCount?: number | null
}

export function SuccessCreatedWorkDialog(props: Props) {
  const t = useTranslation()

  const getRandomColor = () => {
    const colors = ["#ff0", "#ff8c00", "#e6e6fa", "#00f", "#8a2be2", "#ff69b4"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const createConfetti = (container: HTMLElement) => {
    Array.from({ length: 3 }).map(() => {
      const confetti = document.createElement("div")
      confetti.style.position = "absolute"
      confetti.style.width = "10px"
      confetti.style.height = "10px"
      confetti.style.backgroundColor = getRandomColor()
      confetti.style.top = `${-50 + Math.random() * 50}px`
      confetti.style.left = `${Math.random() * 100}%`
      confetti.style.opacity = `${0.2 + Math.random() * 0.3}`
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`
      confetti.style.transition = `top ${2 + Math.random()}s ease-in, opacity ${
        2 + Math.random()
      }s ease-in`

      container.appendChild(confetti)

      setTimeout(() => {
        confetti.style.top = "100%"
        confetti.style.opacity = "0"
      }, 100)
    })
  }

  useEffect(() => {
    if (!props.isOpen || typeof document === "undefined") return
    // 投稿・更新した直後の 10 分は拠点のキャッシュを使わずに最新の内容を表示する（app/lib/edge-page-cache.ts）
    document.cookie = "aip_fresh=1; max-age=600; path=/; samesite=lax"
  }, [props.isOpen])

  useEffect(() => {
    // 一度だけ投稿作品URLをfetchする処理を追加
    const fetchWorkUrl = async () => {
      try {
        const url = props.uuid
          ? `https://www.aipictors.com/posts/${props.uuid}`
          : `https://www.aipictors.com/works/${props.workId}`
        const response = await fetch(url)
        if (!response.ok) {
          console.error("Fetch failed:", response.status)
        }
      } catch (error) {
        console.error("Fetch error:", error)
      }
    }

    if (props.workId || props.uuid) {
      fetchWorkUrl()
    }

    setTimeout(() => {
      const confettiContainer = document.getElementById(
        "confetti-container",
      ) as HTMLElement
      if (confettiContainer) {
        confettiContainer.innerHTML = ""
        createConfetti(confettiContainer)
        const interval = setInterval(() => {
          createConfetti(confettiContainer)
        }, 1000)
        return () => clearInterval(interval)
      }
    }, 1000)
  }, [props.isOpen, props.workId, props.uuid])

  const link = () => {
    if (
      props.accessType === "DRAFT" ||
      props.accessType === "PRIVATE" ||
      isReserved()
    ) {
      return `/posts/${props.workId}/draft`
    }
    if (props.accessType === "LIMITED") {
      return `/posts/${props.uuid}`
    }
    return `/posts/${props.workId}`
  }

  // 予約投稿かどうか
  const isReserved = () => {
    const reservedDate = new Date(props.createdAt * 1000 + 3600000 * 9)
    const now = new Date(Date.now() + 3600000 * 9)
    return reservedDate > now
  }

  const shareText = t(
    `AIイラスト投稿サイトAipictorsに投稿された作品\n「${props.title}」\n\n${props.description}`,
    `Work posted on AI Illustration Posting Site Aipictors\n"${props.title}"\n\n${props.description}`,
  )

  return (
    <>
      <Dialog
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            // ページ遷移
            if (typeof document !== "undefined") {
              window.location.href = link()
            }
          }
        }}
        open={props.isOpen}
      >
        <DialogContent className="max-h-[90dvh] gap-4 overflow-y-auto rounded-2xl">
          <div className="-mx-6 -mt-6 relative overflow-hidden rounded-t-2xl bg-gradient-to-b from-sky-500/15 to-transparent px-6 pt-8 pb-2">
            <div
              id="confetti-container"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            />
            <div className="relative mx-auto w-fit">
              {props.imageBase64 ? (
                <Link to={link()}>
                  <img
                    className="size-32 rounded-2xl object-cover shadow-lg ring-4 ring-background transition-opacity hover:opacity-90"
                    src={props.imageBase64}
                    alt=""
                  />
                </Link>
              ) : (
                <div className="size-32 rounded-2xl bg-muted" />
              )}
              <span className="-right-2 -bottom-2 absolute flex size-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-4 ring-background">
                <CheckIcon className="size-5" strokeWidth={3} />
              </span>
            </div>
          </div>
          <div className="space-y-1 text-center">
            <DialogTitle className="font-bold text-xl">
              {props.isNew
                ? isReserved()
                  ? t("予約投稿しました", "Your work has been scheduled")
                  : t("作品を投稿しました！", "Your work has been posted!")
                : t("作品が更新されました", "The work has been updated")}
            </DialogTitle>
            <DialogDescription className="line-clamp-1 text-muted-foreground text-sm">
              {props.title}
            </DialogDescription>
          </div>
          {props.mosaicImageCount !== undefined &&
            props.mosaicImageCount !== null && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs leading-5">
                <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <p>
                  {props.isRatingChangedToR18 &&
                    t(
                      "モザイクが必要な部分が写っていたため、年齢種別を「R-18」にして投稿しました。",
                      "Genitals were detected, so the work was posted as R-18. ",
                    )}
                  {props.mosaicImageCount > 0
                    ? t(
                        `${props.mosaicImageCount}枚に自動でモザイクをかけて投稿しました。`,
                        `Mosaic was applied automatically to ${props.mosaicImageCount} image(s).`,
                      )
                    : t(
                        "自動モザイクで確認しました（モザイクが必要な所は見つかりませんでした）。",
                        "Checked with auto mosaic (nothing needed a mosaic).",
                      )}
                </p>
              </div>
            )}
          <div
            className={cn(
              "mt-1 grid gap-2",
              props.isNew ? "grid-cols-2" : "grid-cols-1",
            )}
          >
            {props.isNew && (
              <Button
                variant="secondary"
                className="h-11 rounded-xl"
                onClick={() => {
                  if (typeof document !== "undefined") {
                    window.location.href = window.location.pathname
                  }
                }}
              >
                <PlusIcon className="mr-1.5 size-4" />
                {t("続けて投稿", "Post another")}
              </Button>
            )}
            <Button
              className="h-11 rounded-xl font-bold"
              onClick={() => {
                if (typeof document !== "undefined") {
                  window.location.href = link()
                }
              }}
            >
              <ExternalLinkIcon className="mr-1.5 size-4" />
              {t("作品を見る", "View work")}
            </Button>
          </div>
          {props.showAutoModeration && props.isOpen && (
            <WorkAutoModerationPostNotice workId={props.workId} />
          )}
          <p className="text-center text-sm opacity-80">
            {t("この作品をシェアする", "Share this work")}
          </p>
          <div className="w-full">
            <XIntent
              text={shareText}
              url={`${
                props.accessType === "LIMITED"
                  ? `https://www.aipictors.com/posts/${props.uuid}`
                  : `https://www.aipictors.com/posts/${props.workId}`
              }\n`}
              hashtags={props.shareTags}
            />
          </div>
          {props.isNew &&
            props.isOpen &&
            props.workId !== null &&
            (props.accessType === "PUBLIC" || props.accessType === "SILENT") &&
            !isReserved() && <PostNextSteps workId={props.workId} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
