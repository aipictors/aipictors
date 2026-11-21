import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useId } from "react"
import { toast } from "sonner"
import { Switch } from "~/components/ui/switch"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import {
  SettingsSection,
  SettingsSwitchRow,
} from "~/routes/($lang).settings/components/settings-section"

/**
 * 推しの受け取りの設定（パロディ作品などでお金に相当するものを受け取りたくない人向け）。アプリと同じ user_settings に保存する
 * - プレミアムコインでの推しを受け取らない: 推す画面でプレミアムコインを選べず、aipictors-api の推しでも断る
 * - フリーコインを受け取らない: フリーコインで推されても pt だけ付き、コインは届かない（aipictors-api が渡さない）
 */
export function PremiumCoinSupportSetting() {
  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const switchId = useId()
  const freeSwitchId = useId()

  const { data } = useQuery(premiumCoinSupportSettingQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const [updateUserSetting, { loading }] = useMutation(
    updatePremiumCoinSupportSettingMutation,
    { refetchQueries: [premiumCoinSupportSettingQuery] },
  )

  if (authContext.isNotLoggedIn) {
    return null
  }

  const isReject = data?.userSetting?.isRejectPremiumCoinSupport ?? false
  const isRejectFree = data?.userSetting?.isRejectFreeCoinSupportReceive ?? false

  const save = async (input: {
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
      title={t("推しの受け取り", "Receiving support")}
      description={t(
        "パロディ作品などで、お金に相当するものを受け取りたくないときに使えます。",
        "Use this if you do not want to receive anything equivalent to money, for example for parody works.",
      )}
    >
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
          disabled={loading || data === undefined}
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
          disabled={loading || data === undefined}
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
      isRejectPremiumCoinSupport
      isRejectFreeCoinSupportReceive
    }
  }`,
)

const updatePremiumCoinSupportSettingMutation = graphql(
  `mutation UpdatePremiumCoinSupportSetting($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      id
      isRejectPremiumCoinSupport
      isRejectFreeCoinSupportReceive
    }
  }`,
)
