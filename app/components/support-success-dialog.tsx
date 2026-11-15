import { HeartHandshake } from "lucide-react"
import {
  SupportCoinCounts,
  SupportSentBurst,
} from "~/components/support-super-chat"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { getSupportTier } from "~/utils/support-tier"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  thankYouMessage: string
  targetUserIconUrl?: string | null
  targetUserName?: string
  totalPt?: number
  /** 渡すと段階の色の帯にコインの枚数を大きく出す */
  freeCoinAmount?: number
  premiumCoinAmount?: number
}

export function SupportSuccessDialog(props: Props) {
  const t = useTranslation()
  const tier = getSupportTier(props.totalPt ?? 0)
  const hasCounts =
    props.freeCoinAmount !== undefined || props.premiumCoinAmount !== undefined

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-sm overflow-hidden rounded-3xl border-0 bg-gradient-to-b from-rose-50 via-white to-orange-50 p-0 shadow-2xl dark:from-rose-950 dark:via-slate-900 dark:to-orange-950">
        <div className="relative px-6 pt-6 pb-5">
          {props.open && props.totalPt !== undefined && (
            <SupportSentBurst totalPt={props.totalPt} />
          )}
          <DialogHeader>
            <div
              className={cn(
                "mx-auto flex h-14 w-14 items-center justify-center rounded-full motion-safe:animate-[aip-support-pop_0.5s_ease-out_both]",
                tier?.chipClassName ??
                  "bg-rose-100 text-rose-500 dark:bg-rose-900/60 dark:text-rose-200",
              )}
            >
              <HeartHandshake className="h-7 w-7" />
            </div>
            <DialogTitle className="pt-3 text-center text-lg">
              {t("推しが完了しました", "Support sent")}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            {props.totalPt !== undefined && (
              <div
                className={cn(
                  "mx-auto flex w-fit items-center gap-3 rounded-full px-4 py-1.5 font-semibold text-sm motion-safe:animate-[aip-support-pop_0.5s_ease-out_0.1s_both]",
                  tier?.chipClassName ??
                    "bg-rose-500 text-white dark:bg-rose-400 dark:text-slate-950",
                )}
              >
                {hasCounts && (
                  <SupportCoinCounts
                    support={{
                      freeCoinAmount: props.freeCoinAmount ?? 0,
                      premiumCoinAmount: props.premiumCoinAmount ?? 0,
                      totalPt: props.totalPt,
                    }}
                  />
                )}
                <span className="tabular-nums">+{props.totalPt}pt</span>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white dark:border-slate-700 dark:bg-slate-900">
                {props.targetUserIconUrl ? (
                  <img
                    src={props.targetUserIconUrl}
                    alt={props.targetUserName ?? "user"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <HeartHandshake className="h-5 w-5 text-rose-400" />
                )}
              </div>

              <div className="relative flex-1 rounded-2xl bg-white px-4 py-3 text-sm leading-6 shadow-sm ring-1 ring-rose-100 dark:bg-slate-900 dark:ring-rose-900/60">
                <div className="absolute top-4 -left-2 h-3 w-3 rotate-45 bg-white ring-1 ring-rose-100 dark:bg-slate-900 dark:ring-rose-900/60" />
                <p className="relative z-10 whitespace-pre-wrap text-foreground">
                  {props.thankYouMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
