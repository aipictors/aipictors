import { GiftIcon } from "lucide-react"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import {
  REFERRAL_COIN_TTL_DAYS,
  referralCtaClassName,
} from "~/lib/referral/referral-rewards"
import { cn } from "~/lib/utils"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type Props = {
  isLoading: boolean
  /** 紹介リンクから来た人か */
  hasReferral: boolean
  signupCoins: number
}

/**
 * 未ログインの人への案内
 * 紹介リンクから来た人には「登録するとコイン」、そうでない人にはログインして紹介リンクを作る案内
 */
export function InviteGuestPanel(props: Props) {
  const t = useTranslation()

  if (props.isLoading) {
    return <Skeleton className="h-28 w-full max-w-xl rounded-2xl" />
  }

  return (
    <div className="max-w-xl rounded-2xl border bg-background/80 p-4 backdrop-blur md:p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-sky-500 text-white">
          <GiftIcon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-bold text-base leading-snug">
            {props.hasReferral
              ? t(
                  `招待されています。登録するとフリーコイン${props.signupCoins.toLocaleString()}枚`,
                  `You're invited. Sign up and get ${props.signupCoins.toLocaleString()} free coins`,
                )
              : t(
                  "ログインすると、あなたの紹介リンクを作れます",
                  "Log in to get your invite link",
                )}
          </p>
          <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
            {props.hasReferral
              ? t(
                  `無料で登録すると、AIイラストの生成に使えるコインが自動で届きます（${REFERRAL_COIN_TTL_DAYS}日間有効）。`,
                  `Sign up free and the coins for AI image generation arrive automatically (valid for ${REFERRAL_COIN_TTL_DAYS} days).`,
                )
              : t(
                  "登録は無料です。リンクを友だちに送るだけで、コインを受け取れます。",
                  "It's free. Send your link to friends and earn coins.",
                )}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {/* biome-ignore lint/a11y/noStaticElementInteractions: 中のボタンのクリックを数えるだけ */}
        <div
          className="w-full sm:w-auto"
          onClickCapture={() => trackGrowthEvent("ref_register_click", "invite")}
        >
          <LoginDialogButton
            label={
              props.hasReferral
                ? t("無料で登録して受け取る", "Sign up free and claim")
                : t("ログイン / 無料で登録", "Log in / Sign up free")
            }
            className={cn(referralCtaClassName, "w-full px-6 sm:w-auto")}
          />
        </div>
        <Button
          asChild
          variant="outline"
          className="h-11 w-full rounded-xl bg-background/70 sm:w-auto"
        >
          <Link to="/">{t("作品を見てみる", "Browse artworks")}</Link>
        </Button>
      </div>
    </div>
  )
}
