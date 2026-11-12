import { GiftIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { toApproxUsdText } from "~/utils/to-approx-usd-text"
import { toTrialDateText } from "~/utils/to-trial-date-text"

type Props = {
  /** お試しの終わり（UNIX 秒） */
  trialEnd: number
  /** 解約の手続き済み */
  isCancelScheduled: boolean
  /** 解約ボタンの id（「解約はこちら」の移動先） */
  cancelAnchorId: string
}

/**
 * 無料お試し中の人への案内（いつまで無料か・いつからいくらか・解約の場所）
 */
export function TrialStatusBanner(props: Props) {
  const t = useTranslation()
  const date = toTrialDateText(props.trialEnd, t.isEnglish)

  return (
    <div className="mb-4 rounded-2xl border border-violet-500/40 bg-violet-500/5 p-4 md:p-5">
      <p className="flex items-center gap-2 font-bold">
        <GiftIcon className="size-5 shrink-0 text-violet-500" />
        {t("ライトを無料でお試し中です", "You're on the Lite free trial")}
      </p>
      {props.isCancelScheduled ? (
        <p className="mt-2 text-sm leading-relaxed">
          {t(
            `解約の手続きが済んでいます。${date} まではそのまま使えて、料金はかかりません。`,
            `Your cancellation is set. You can keep using Lite until ${date}, and you won't be charged.`,
          )}
        </p>
      ) : (
        <>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-background/70 px-3 py-2">
              <dt className="text-muted-foreground text-xs">
                {t("無料の期間", "Free until")}
              </dt>
              <dd className="font-bold">{t(`${date} まで`, date)}</dd>
            </div>
            <div className="rounded-xl bg-background/70 px-3 py-2">
              <dt className="text-muted-foreground text-xs">
                {t("その後の料金", "After that")}
              </dt>
              <dd className="font-bold">
                {t(
                  `${date} から ¥480/月（税込）`,
                  `¥480/mo from ${date} (${toApproxUsdText(480)})`,
                )}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-sm leading-relaxed">
            {t(
              "お試し中に解約すれば料金はかかりません。解約しても、お試しの終わりまではそのまま使えます。何もしなければ自動で更新されます。",
              "Cancel during the trial and you won't be charged — you keep access until the trial ends. If you do nothing, it renews automatically, charged in JPY.",
            )}{" "}
            <a
              href={`#${props.cancelAnchorId}`}
              className="font-bold text-violet-700 underline underline-offset-2 dark:text-violet-300"
            >
              {t("解約はこちら", "Cancel here")}
            </a>
          </p>
        </>
      )}
    </div>
  )
}
