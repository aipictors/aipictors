import { CheckIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

/**
 * 登録の手順（1. プロフィール 2. 表示設定）
 */
export function OnboardingSteps(props: { current: 1 | 2 }): React.ReactNode {
  const t = useTranslation()
  const steps = [
    { number: 1, label: t("プロフィール", "Profile") },
    { number: 2, label: t("表示設定", "Display") },
  ] as const

  return (
    <ol className="flex items-center gap-2 text-xs">
      {steps.map((step, index) => {
        const isDone = step.number < props.current
        const isCurrent = step.number === props.current
        return (
          <li key={step.number} className="flex items-center gap-2">
            {index > 0 && <span className="h-px w-6 bg-border" />}
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex size-6 items-center justify-center rounded-full font-bold",
                isCurrent && "bg-foreground text-background",
                isDone && "bg-emerald-500 text-white",
                !isCurrent && !isDone && "bg-muted text-muted-foreground",
              )}
            >
              {isDone ? <CheckIcon className="size-3.5" /> : step.number}
            </span>
            <span
              className={cn(
                isCurrent ? "font-semibold" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
