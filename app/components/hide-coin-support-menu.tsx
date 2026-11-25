import { EyeOff, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  useHideCoinSupportState,
  useSetHideCoinSupport,
} from "~/hooks/use-hide-coin-support"
import { useTranslation } from "~/hooks/use-translation"
import { useNavigate } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"

export const HIDE_COIN_SUPPORT_SETTING_PATH =
  "/settings/support-received#hide-coin-support"

/**
 * 推しの欄（作品ページの推しの帯・推しの欄、ユーザーページの推してくれている人）の端に置く小さな「…」。
 * 「推しを表示しない」を押すとその場で設定（isHideCoinSupport）をオンにし、推しの表示が全部消える
 * - 確認は挟まない（自分の画面だけの表示の設定で、トーストの「元に戻す」と設定ですぐ戻せるため）
 * - 未ログイン・設定を読み込む前・すでにオンの人には出さない
 */
export function HideCoinSupportMenu(props: { className?: string }) {
  const t = useTranslation()
  const { isHide, isLoaded } = useHideCoinSupportState()
  const setHideCoinSupport = useSetHideCoinSupport()
  const navigate = useNavigate()

  if (!isLoaded || isHide) return null

  const onHide = async () => {
    try {
      await setHideCoinSupport(true)
    } catch {
      toast(t("保存できませんでした", "Could not save"))
      return
    }
    toast(
      t(
        "推しを表示しないようにしました。設定からいつでも戻せます",
        "Support is now hidden. You can turn it back on in settings anytime",
      ),
      {
        duration: 8000,
        action: {
          label: t("元に戻す", "Undo"),
          onClick: () => {
            setHideCoinSupport(false).catch(() => {
              toast(t("保存できませんでした", "Could not save"))
            })
          },
        },
        cancel: {
          label: t("設定", "Settings"),
          onClick: () => navigate(HIDE_COIN_SUPPORT_SETTING_PATH),
        },
      },
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("推しの表示のメニュー", "Support display menu")}
        title={t("推しの表示", "Support display")}
        className={cn(
          "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          props.className,
        )}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => void onHide()}>
          <EyeOff className="mr-2 size-4" />
          {t("推しを表示しない", "Hide support")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
