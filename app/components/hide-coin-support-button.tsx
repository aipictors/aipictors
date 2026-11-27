import { EyeOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  useHideCoinSupportState,
  useSetHideCoinSupport,
} from "~/hooks/use-hide-coin-support"
import { useTranslation } from "~/hooks/use-translation"
import { useNavigate } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"

/** 推しの表示の設定ページ（スイッチ「推し・推しランキングを表示しない」） */
export const OSHI_DISPLAY_SETTING_PATH = "/settings/oshi-display"

/**
 * 推しの欄（ユーザーページの推してくれている人など）の見出しの右に置く「推しを非表示」のボタン。
 * 押すとその場で設定（isHideCoinSupport）をオンにし、推しの表示が全部消える
 * - 確認は挟まない（自分の画面だけの表示の設定で、トーストの「元に戻す」と設定ですぐ戻せるため）
 * - 未ログイン・設定を読み込む前・すでにオンの人には出さない
 * - 推しを使う人の邪魔にならないよう、文字の読める控えめな枠線のボタンにする
 */
export function HideCoinSupportButton(props: {
  /** 狭い画面では「非表示」だけにする（見出しの行が詰まる所） */
  isShortOnMobile?: boolean
  className?: string
}) {
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
        "Oshi is now hidden. You can turn it back on in settings anytime",
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
          onClick: () => navigate(OSHI_DISPLAY_SETTING_PATH),
        },
      },
    )
  }

  const label = t("推しを非表示", "Hide Oshi")

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => void onHide()}
      aria-label={label}
      title={t(
        "推し・推しランキングをあなたの画面に表示しないようにします",
        "Hide Oshi and Oshi rankings on your screens",
      )}
      className={cn(
        "h-7 shrink-0 gap-1 rounded-full px-2.5 font-normal text-muted-foreground text-xs",
        props.className,
      )}
    >
      <EyeOff className="size-3.5" aria-hidden />
      {props.isShortOnMobile ? (
        <>
          <span className="sm:hidden">{t("非表示", "Hide")}</span>
          <span className="hidden sm:inline">{label}</span>
        </>
      ) : (
        label
      )}
    </Button>
  )
}
