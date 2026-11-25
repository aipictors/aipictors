import { useMutation, useQuery } from "@apollo/client/index"
import { useLocation } from "@remix-run/react"
import { EyeOff } from "lucide-react"
import { useContext, useEffect, useId } from "react"
import { toast } from "sonner"
import { Switch } from "~/components/ui/switch"
import { AuthContext } from "~/contexts/auth-context"
import {
  hideCoinSupportQuery,
  updateHideCoinSupportSettingMutation,
} from "~/hooks/use-hide-coin-support"
import { useTranslation } from "~/hooks/use-translation"
import {
  SettingsSection,
  SettingsSwitchRow,
} from "~/routes/($lang).settings/components/settings-section"

/**
 * 推し・推しランキングを自分の画面に出さない設定。アプリと同じ user_settings に保存する
 * - 表示だけの設定。推しの受け付け（PremiumCoinSupportSetting の「推しを受け付けない」）とは別で、記録・報酬も変わらない
 * - 読むのは ~/hooks/use-hide-coin-support（同じクエリなので保存すると画面全体にすぐ反映される）
 */
export function HideCoinSupportSetting(props: {
  /** ページ内リンク（#hide-coin-support） */
  id?: string
}) {
  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const switchId = useId()

  const { data } = useQuery(hideCoinSupportQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const [updateUserSetting, { loading }] = useMutation(
    updateHideCoinSupportSettingMutation,
    { refetchQueries: [hideCoinSupportQuery] },
  )

  const isLoaded = data !== undefined

  // #hide-coin-support 付きで来たら、ここまで動かす
  const location = useLocation()
  useEffect(() => {
    if (!isLoaded || !props.id) return
    if (location.hash !== `#${props.id}`) return
    document.getElementById(props.id)?.scrollIntoView({ block: "start" })
  }, [isLoaded, props.id, location.hash, location.key])

  if (authContext.isNotLoggedIn) {
    return null
  }

  const isHide = data?.userSetting?.isHideCoinSupport ?? false

  const save = async (checked: boolean) => {
    try {
      await updateUserSetting({
        variables: { input: { isHideCoinSupport: checked } },
      })
      toast(t("保存しました", "Settings saved"))
    } catch {
      toast(t("保存できませんでした", "Could not save"))
    }
  }

  return (
    <SettingsSection
      id={props.id}
      icon={<EyeOff />}
      title={t("推しの表示", "Oshi display")}
      description={t(
        "推し（コインでの応援）や推しランキングを見たくないときに、あなたの画面から隠せます。",
        "Hide Oshi (support with coins) and Oshi rankings from your own screens.",
      )}
    >
      <SettingsSwitchRow
        htmlFor={switchId}
        title={t(
          "推し・推しランキングを表示しない",
          "Hide Oshi and Oshi rankings",
        )}
        description={t(
          "推しに関する表示（推すボタン、コメントの推し、推しの帯、推しの数、推しランキング、推しの通知など）をすべてあなたの画面から消します。推しだけのコメントは出さず、本文のある推し付きコメントは普通のコメントとして本文だけ出します。ほかの人の画面は変わりません。推しを受け付けるかどうか（応援コイン受け取りの設定）はそのままで、これまでに受け取った推しの記録や報酬も消えません。",
          "Removes everything about Oshi from your screens (Oshi buttons, Oshi on comments, the Oshi strip, Oshi counts, Oshi rankings, Oshi notifications and more). Oshi-only comments are hidden, and comments with text show just the text like a normal comment. Other people's screens do not change. Whether you accept Oshi (Received Support Coins settings) stays as is, and Oshi you already received and its rewards stay as is.",
        )}
      >
        <Switch
          checked={isHide}
          disabled={loading || data === undefined}
          id={switchId}
          onCheckedChange={(checked) => save(checked)}
        />
      </SettingsSwitchRow>
    </SettingsSection>
  )
}
