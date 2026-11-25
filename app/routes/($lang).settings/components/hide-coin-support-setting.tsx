import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { EyeOff } from "lucide-react"
import { useContext, useEffect, useId } from "react"
import { toast } from "sonner"
import { Switch } from "~/components/ui/switch"
import { AuthContext } from "~/contexts/auth-context"
import { hideCoinSupportQuery } from "~/hooks/use-hide-coin-support"
import { useTranslation } from "~/hooks/use-translation"
import {
  SettingsSection,
  SettingsSwitchRow,
} from "~/routes/($lang).settings/components/settings-section"

/**
 * 推し・推しランキングを自分の画面に出さない設定（推し合いの空気がつらい人向け）。アプリと同じ user_settings に保存する
 * - 表示だけの設定。推しの受け付け（PremiumCoinSupportSetting の「推しを受け付けない」）とは別で、記録・報酬も変わらない
 * - 読むのは ~/hooks/use-hide-coin-support（同じクエリなので保存すると画面全体にすぐ反映される）
 */
export function HideCoinSupportSetting(props: {
  /** ページ内リンク（設定の検索から #hide-coin-support で飛ぶ） */
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

  useEffect(() => {
    if (!isLoaded || !props.id) return
    if (window.location.hash !== `#${props.id}`) return
    document.getElementById(props.id)?.scrollIntoView({ block: "start" })
  }, [isLoaded, props.id])

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
      title={t("推しの表示", "Support display")}
      description={t(
        "推し（コインでの応援）や推しランキングを見たくないときに、あなたの画面から隠せます。",
        "Hide support (coins) and support rankings from your own screens.",
      )}
    >
      <SettingsSwitchRow
        htmlFor={switchId}
        title={t(
          "推し・推しランキングを表示しない",
          "Hide support and support rankings",
        )}
        description={t(
          "オンにすると、作品ページの推すボタンや推しの欄、推しランキング、推しの通知などがあなたの画面に出なくなります。ほかの人の画面は変わりません。推しを受け付けるかどうかは上の設定のままで、これまでに受け取った推しの記録や報酬も消えません。",
          "When on, support buttons, support sections on posts, support rankings and support notifications are hidden on your screens. Other people's screens do not change. Whether you accept support follows the setting above, and support you already received and its rewards stay as is.",
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

const updateHideCoinSupportSettingMutation = graphql(
  `mutation UpdateHideCoinSupportSetting($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      id
      isHideCoinSupport
    }
  }`,
)
