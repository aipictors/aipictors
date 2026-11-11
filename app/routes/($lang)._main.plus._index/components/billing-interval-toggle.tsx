import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import type { BillingInterval } from "~/routes/($lang)._main.plus._index/utils/plan-specs"

type Props = {
  value: BillingInterval
  onChange(value: BillingInterval): void
}

/**
 * プランの月払い・年払いの切り替え
 */
export function BillingIntervalToggle(props: Props) {
  const t = useTranslation()

  const options: { value: BillingInterval; label: string; note?: string }[] = [
    { value: "month", label: t("月払い", "Monthly") },
    {
      value: "year",
      label: t("年払い", "Yearly"),
      note: t("2か月分おトク", "2 months free"),
    },
  ]

  return (
    <div className="flex justify-center pb-2">
      <div
        role="radiogroup"
        aria-label={t("支払い方法", "Billing")}
        className="inline-flex rounded-full border bg-muted/60 p-1"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={props.value === option.value}
            onClick={() => props.onChange(option.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 font-bold text-sm transition-colors",
              props.value === option.value
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
            {option.note && (
              <span className="rounded-full bg-fuchsia-600 px-1.5 py-0.5 font-bold text-[10px] text-white">
                {option.note}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
