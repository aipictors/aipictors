import { CheckIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

/**
 * 登録の手順（1. プロフィール 2. 表示設定 3. 好きなタグ）
 * 進んだぶんだけ色の帯が伸びる
 */
export function OnboardingSteps(props: {
  current: 1 | 2 | 3
}): React.ReactNode {
  const t = useTranslation()
  const steps = [
    { number: 1, label: t("プロフィール", "Profile") },
    { number: 2, label: t("表示設定", "Display") },
    { number: 3, label: t("好きなタグ", "Tags") },
  ] as const

  // 今の手順の途中まで伸ばす（1 → 1/6、2 → 3/6、3 → 5/6）
  const progress = ((props.current * 2 - 1) / (steps.length * 2)) * 100

  return (
    <div className="space-y-2">
      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-orange-400 transition-[width] duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ol className="grid grid-cols-3 text-xs">
        {steps.map((step) => {
          const isDone = step.number < props.current
          const isCurrent = step.number === props.current
          return (
            <li
              key={step.number}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex items-center gap-1.5",
                step.number === 2 && "justify-center",
                step.number === 3 && "justify-end",
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full font-bold text-[10px]",
                  isCurrent &&
                    "bg-gradient-to-br from-cyan-400 to-orange-400 text-white shadow-sm",
                  isDone && "bg-teal-500 text-white",
                  !isCurrent && !isDone && "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? <CheckIcon className="size-3" /> : step.number}
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
    </div>
  )
}
