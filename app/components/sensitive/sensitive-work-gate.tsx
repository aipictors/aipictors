import { EyeIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { useIsSensitiveBlurred } from "~/hooks/use-sensitive-blur"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"

type Props = {
  workId: string
  children: React.ReactNode
}

/**
 * センシティブとした作品の画像を、押すまでぼかしておく（作品ページ）
 */
export function SensitiveWorkGate(props: Props) {
  const t = useTranslation()
  const isBlurred = useIsSensitiveBlurred(props.workId)
  const [isRevealed, setIsRevealed] = useState(false)

  if (!isBlurred || isRevealed) {
    return <>{props.children}</>
  }

  return (
    <div className="relative overflow-hidden rounded-md">
      <div
        aria-hidden
        className={cn("pointer-events-none select-none blur-3xl")}
      >
        {props.children}
      </div>
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 p-4">
        <div className="max-w-sm space-y-3 rounded-2xl bg-background/95 p-4 text-center shadow-lg">
          <p className="font-bold">
            {t(
              "センシティブな可能性がある作品です",
              "This work may be sensitive",
            )}
          </p>
          <p className="text-muted-foreground text-xs">
            {t(
              "画像の自動判定で、リアルな作風で子どもに見える人物の際どい表現の可能性があるとしたため、ぼかしています。",
              "The automatic image check flagged this work, so it is blurred.",
            )}
          </p>
          <div className="flex flex-col gap-2">
            <Button
              className="rounded-full"
              onClick={() => setIsRevealed(true)}
            >
              <EyeIcon className="mr-1.5 size-4" />
              {t("表示する", "Show")}
            </Button>
            <Link
              to="/settings/restriction"
              className="text-muted-foreground text-xs underline"
            >
              {t("ぼかしの設定を変える", "Change blur setting")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
