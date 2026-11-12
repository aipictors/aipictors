import { CheckIcon, CopyIcon, Share2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { config } from "~/config"
import { useLocale } from "~/hooks/use-locale"
import { useTranslation } from "~/hooks/use-translation"
import { referralCtaClassName } from "~/lib/referral/referral-rewards"
import { buildReferralUrl } from "~/lib/referral/referral-storage"
import { cn } from "~/lib/utils"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type Props = {
  /** 自分の紹介コード（読み込み中は null） */
  code: string | null
  isError: boolean
  signupCoins: number
}

/**
 * 自分の紹介リンクのコピーと共有（X・LINE・端末の共有）
 */
export function InviteLinkPanel(props: Props) {
  const t = useTranslation()
  const locale = useLocale()
  const [isCopied, setIsCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function")
  }, [])

  useEffect(() => {
    if (!isCopied) return
    const timer = window.setTimeout(() => setIsCopied(false), 2500)
    return () => window.clearTimeout(timer)
  }, [isCopied])

  if (props.isError) {
    return (
      <div className="max-w-xl rounded-2xl border bg-background/80 p-4 text-sm backdrop-blur">
        {t(
          "紹介リンクを読み込めませんでした。時間をおいてページを開き直してください。",
          "We couldn't load your invite link. Please reload the page in a moment.",
        )}
      </div>
    )
  }

  if (props.code === null) {
    return <Skeleton className="h-36 w-full max-w-xl rounded-2xl" />
  }

  const url = buildReferralUrl(
    config.siteURL,
    props.code,
    locale === "en" ? "en" : "ja",
  )
  const shareText = t(
    `AIイラストの投稿・生成サイト「Aipictors」に招待します。このリンクから登録すると、フリーコイン${props.signupCoins.toLocaleString()}枚がもらえます。`,
    `Join me on Aipictors, the AI art community. Sign up from this link and get ${props.signupCoins.toLocaleString()} free coins.`,
  )

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      toast(t("紹介リンクをコピーしました", "Invite link copied"))
    } catch {
      toast(
        t(
          "コピーできませんでした。リンクを長押しして選択してください。",
          "Couldn't copy. Please select the link manually.",
        ),
      )
    }
    trackGrowthEvent("invite_copy", "link")
  }

  const onNativeShare = async () => {
    trackGrowthEvent("invite_share", "native")
    try {
      await navigator.share({ title: "Aipictors", text: shareText, url })
    } catch {
      // 共有をやめたときは何もしない
    }
  }

  const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(`${shareText}\n#Aipictors`)}&url=${encodeURIComponent(url)}`
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`

  return (
    <div className="max-w-xl rounded-2xl border bg-background/80 p-4 backdrop-blur md:p-5">
      <label htmlFor="invite-link" className="font-bold text-sm">
        {t("あなたの紹介リンク", "Your invite link")}
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="invite-link"
          readOnly
          value={url}
          onFocus={(event) => event.currentTarget.select()}
          className="h-11 w-full min-w-0 flex-1 rounded-xl border bg-background px-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        />
        <Button
          type="button"
          onClick={onCopy}
          className={cn(referralCtaClassName, "w-full shrink-0 px-5 sm:w-auto")}
        >
          {isCopied ? (
            <CheckIcon className="mr-1.5 size-4" />
          ) : (
            <CopyIcon className="mr-1.5 size-4" />
          )}
          {isCopied ? t("コピーしました", "Copied") : t("コピー", "Copy")}
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          asChild
          variant="outline"
          className="h-10 flex-1 rounded-xl bg-background/70 sm:flex-none"
        >
          <a
            href={xUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGrowthEvent("invite_share", "x")}
          >
            {t("X でポスト", "Post on X")}
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-10 flex-1 rounded-xl bg-background/70 sm:flex-none"
        >
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGrowthEvent("invite_share", "line")}
          >
            {t("LINE で送る", "Send on LINE")}
          </a>
        </Button>
        {canNativeShare && (
          <Button
            type="button"
            variant="outline"
            onClick={onNativeShare}
            className="h-10 flex-1 rounded-xl bg-background/70 sm:flex-none"
          >
            <Share2Icon className="mr-1.5 size-4" />
            {t("その他", "More")}
          </Button>
        )}
      </div>
    </div>
  )
}
