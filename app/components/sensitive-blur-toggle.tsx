import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useSensitiveBlurSetting } from "~/hooks/use-sensitive-blur"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = {
  className?: string
}

/**
 * センシティブな作品（リアルな作風で子どもに見える人物の際どい表現の疑い）をぼかすかの切り替え。
 * 設定はサイト全体の一覧と作品ページに効く
 */
export function SensitiveBlurToggle(props: Props) {
  const t = useTranslation()

  const { isBlur, setBlur } = useSensitiveBlurSetting()

  return (
    <button
      type="button"
      aria-pressed={isBlur}
      onClick={() => setBlur(!isBlur)}
      title={t(
        "画像の自動判定でセンシティブとした作品（リアルな作風で子どもに見える人物の際どい表現など）をぼかします",
        "Blur works flagged as sensitive by the automatic image check",
      )}
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-full border px-2.5 font-medium text-xs transition-colors",
        isBlur
          ? "bg-muted/40 text-foreground"
          : "border-amber-400/60 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        props.className,
      )}
    >
      {isBlur ? (
        <EyeOffIcon className="size-3.5" />
      ) : (
        <EyeIcon className="size-3.5" />
      )}
      <span>
        {isBlur
          ? t("センシティブをぼかす", "Blur sensitive")
          : t("センシティブを表示中", "Showing sensitive")}
      </span>
    </button>
  )
}
