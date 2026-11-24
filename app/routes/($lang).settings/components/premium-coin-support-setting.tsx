import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { HandCoins } from "lucide-react"
import { useContext, useEffect, useId } from "react"
import { toast } from "sonner"
import { Switch } from "~/components/ui/switch"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import {
  SettingsSection,
  SettingsSwitchRow,
} from "~/routes/($lang).settings/components/settings-section"
import { toSupportReceiveStatus } from "~/routes/($lang).settings/utils/support-receive-status"

/**
 * 推しの受け取りの設定（パロディ作品などでお金に相当するものを受け取りたくない人向け）。アプリと同じ user_settings に保存する
 * - 推しを受け付けない: プレミアム・フリーとも推せない（推す画面に出さず、aipictors-api の推しでも断る）
 * - プレミアムコインでの推しを受け取らない: 推す画面でプレミアムコインを選べず、aipictors-api の推しでも断る
 * - フリーコインを受け取らない: フリーコインで推されても pt だけ付き、コインは届かない（aipictors-api が渡さない）
 */
export function PremiumCoinSupportSetting(props: {
  /** ページ内リンク（設定の検索から #receive-setting で飛ぶ） */
  id?: string
}) {
  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const switchId = useId()
  const freeSwitchId = useId()
  const allSwitchId = useId()

  const { data } = useQuery(premiumCoinSupportSettingQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const [updateUserSetting, { loading }] = useMutation(
    updatePremiumCoinSupportSettingMutation,
    { refetchQueries: [premiumCoinSupportSettingQuery] },
  )

  const isLoaded = data !== undefined

  // 設定の検索などから #receive-setting で来たとき、読み込んで欄が出てからそこまで動かす
  useEffect(() => {
    if (!isLoaded || !props.id) return
    if (window.location.hash !== `#${props.id}`) return
    document.getElementById(props.id)?.scrollIntoView({ block: "start" })
  }, [isLoaded, props.id])

  if (authContext.isNotLoggedIn) {
    return null
  }

  const isReject = data?.userSetting?.isRejectPremiumCoinSupport ?? false
  const isRejectFree =
    data?.userSetting?.isRejectFreeCoinSupportReceive ?? false
  const isRejectAll = data?.userSetting?.isRejectCoinSupport ?? false

  const status = toSupportReceiveStatus({
    isRejectAll,
    isRejectPremium: isReject,
    isRejectFree,
  })

  const save = async (input: {
    isRejectCoinSupport?: boolean
    isRejectPremiumCoinSupport?: boolean
    isRejectFreeCoinSupportReceive?: boolean
  }) => {
    try {
      await updateUserSetting({ variables: { input } })
      toast(t("保存しました", "Settings saved"))
    } catch {
      toast(t("保存できませんでした", "Could not save"))
    }
  }

  return (
    <SettingsSection
      id={props.id}
      icon={<HandCoins />}
      title={t("推しの受け取り（受け取り拒否）", "Receiving support")}
      description={t(
        "推し（コイン）を受け取らないようにできます。パロディ作品などで、お金に相当するものを受け取りたくないときに使えます。",
        "You can stop receiving support (coins). Use this if you do not want to receive anything equivalent to money, for example for parody works.",
      )}
    >
      {data !== undefined && (
        <p
          className={
            status.level === "open"
              ? "mb-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-700 text-sm dark:text-emerald-300"
              : "mb-3 rounded-lg bg-amber-500/10 px-3 py-2 text-amber-700 text-sm dark:text-amber-300"
          }
        >
          {t("いまの状態: ", "Current: ")}
          <span className="font-semibold">{t(status.ja, status.en)}</span>
        </p>
      )}
      <SettingsSwitchRow
        htmlFor={allSwitchId}
        title={t("推しを受け付けない", "Do not accept support")}
        description={t(
          "オンにすると、プレミアムコイン・フリーコインとも、だれもあなたを推せなくなります。これまでに受け取った分はそのままです。",
          "When on, nobody can support you with premium or free coins. Support you already received stays as is.",
        )}
      >
        <Switch
          checked={isRejectAll}
          disabled={loading || data === undefined}
          id={allSwitchId}
          onCheckedChange={(checked) => save({ isRejectCoinSupport: checked })}
        />
      </SettingsSwitchRow>
      <SettingsSwitchRow
        htmlFor={switchId}
        title={t(
          "プレミアムコインでの推しを受け取らない",
          "Do not accept support with premium coins",
        )}
        description={t(
          "オンにすると、あなたへの推しはフリーコインだけになります（推す画面でプレミアムコインを選べません）。これまでに受け取った分はそのままです。",
          "When on, others can support you only with free coins (premium coins cannot be chosen). Support you already received stays as is.",
        )}
      >
        <Switch
          checked={isReject}
          disabled={loading || data === undefined || isRejectAll}
          id={switchId}
          onCheckedChange={(checked) =>
            save({ isRejectPremiumCoinSupport: checked })
          }
        />
      </SettingsSwitchRow>
      <SettingsSwitchRow
        htmlFor={freeSwitchId}
        title={t(
          "推しでフリーコインを受け取らない",
          "Do not receive free coins from support",
        )}
        description={t(
          "オンにすると、フリーコインで推されても推しの pt だけが付き、フリーコインは届きません。これまでに受け取った分はそのままです。",
          "When on, support with free coins only adds support points and no free coins are given to you. Coins you already received stay as is.",
        )}
      >
        <Switch
          checked={isRejectFree}
          disabled={loading || data === undefined || isRejectAll}
          id={freeSwitchId}
          onCheckedChange={(checked) =>
            save({ isRejectFreeCoinSupportReceive: checked })
          }
        />
      </SettingsSwitchRow>
    </SettingsSection>
  )
}

const premiumCoinSupportSettingQuery = graphql(
  `query PremiumCoinSupportSetting {
    userSetting {
      id
      isRejectCoinSupport
      isRejectPremiumCoinSupport
      isRejectFreeCoinSupportReceive
    }
  }`,
)

const updatePremiumCoinSupportSettingMutation = graphql(
  `mutation UpdatePremiumCoinSupportSetting($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      id
      isRejectCoinSupport
      isRejectPremiumCoinSupport
      isRejectFreeCoinSupportReceive
    }
  }`,
)
