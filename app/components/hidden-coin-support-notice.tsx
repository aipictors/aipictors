import { EyeOff } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"

/**
 * 推し・推しランキングを表示しない設定の人が、推しのページ（推しランキングなど）を開いたときに中身の代わりに出す
 */
export function HiddenCoinSupportNotice(props: { className?: string }) {
  const t = useTranslation()
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border border-dashed px-4 py-10 text-center",
        props.className,
      )}
    >
      <EyeOff className="size-5 text-muted-foreground" aria-hidden />
      <p className="text-muted-foreground text-sm">
        {t(
          "推し・推しランキングを表示しない設定になっています。",
          "You have chosen to hide support and support rankings.",
        )}
      </p>
      <Link
        to="/settings/support-received#hide-coin-support"
        className="text-primary text-sm underline-offset-4 hover:underline"
      >
        {t("表示の設定を変える", "Change this setting")}
      </Link>
    </div>
  )
}
