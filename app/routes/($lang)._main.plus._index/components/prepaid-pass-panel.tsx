import { Loader2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { usePrepaidPass } from "~/hooks/use-prepaid-pass"
import { useTranslation } from "~/hooks/use-translation"
import { getPlanSpec } from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { toDateText } from "~/utils/to-date-text"
import { toMoneyNumberText } from "~/utils/to-money-number-text"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type Props = {
  /**
   * このプランのパスだけ出す（パスの延長のとき）
   */
  onlyPassType?: "LITE" | "STANDARD" | "PREMIUM"
}

const PASS_TYPES = ["LITE", "STANDARD", "PREMIUM"] as const

/**
 * 自動更新なしのプラン（1 か月・1 年のパス）の購入。PayPay で払いたい人向け
 */
export function PrepaidPassPanel(props: Props) {
  const t = useTranslation()

  const prepaid = usePrepaidPass()

  if (!prepaid.isLoggedIn) return null

  const paypay = prepaid.status?.paypayAvailable === true
  const types = props.onlyPassType ? [props.onlyPassType] : PASS_TYPES
  const activePass = prepaid.status?.pass ?? null

  return (
    <div className="mt-6 space-y-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
      <div>
        <p className="font-bold">
          {activePass
            ? t(
                `パスを延長する（今の期限: ${toDateText(activePass.periodEnd)}）`,
                `Extend your pass (expires ${toDateText(activePass.periodEnd)})`,
              )
            : paypay
              ? t("PayPayでも払えます（自動更新なしのパス）", "Pay with PayPay (non-renewing pass)")
              : t("自動更新なしで買う（1か月・1年のパス）", "Buy a non-renewing pass")}
        </p>
        <p className="text-muted-foreground text-xs leading-5">
          {paypay
            ? t(
                "PayPay・クレジットカードの1回払いで、1か月または1年プランを使えます。自動で更新されないので解約の手続きは要りません。期限が切れる前にもう一度買うと、期限が延びます。初月半額は対象外です。",
                "Pay once with PayPay or card for 1 month or 1 year. No auto-renewal; buy again to extend. First-month discount not included.",
              )
            : t(
                "クレジットカードの1回払いで、1か月または1年プランを使えます（PayPayは準備中です）。自動で更新されないので解約の手続きは要りません。期限が切れる前にもう一度買うと、期限が延びます。初月半額は対象外です。",
                "Pay once by card for 1 month or 1 year (PayPay coming soon). No auto-renewal; buy again to extend.",
              )}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {types.map((type) => {
          const spec = getPlanSpec(type)
          return (
            <div key={type} className="space-y-1.5 rounded-xl border bg-background p-3">
              <p className="font-bold text-sm">{t(spec.name, spec.enName)}</p>
              {(["month", "year"] as const).map((interval) => (
                <Button
                  key={interval}
                  size="sm"
                  variant="outline"
                  className="w-full justify-between"
                  disabled={prepaid.isLoading}
                  onClick={() => {
                    trackGrowthEvent(`prepaid_checkout_${type}`, interval)
                    void prepaid.startCheckout(type, interval)
                  }}
                >
                  <span>{interval === "year" ? t("1年", "1 year") : t("1か月", "1 month")}</span>
                  {prepaid.isLoadingFor(type, interval) ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <span className="font-bold">
                      {`¥${toMoneyNumberText(interval === "year" ? spec.yearlyPrice : spec.price)}`}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
