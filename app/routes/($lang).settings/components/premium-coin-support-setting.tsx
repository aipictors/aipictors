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
 * プレミアムコインでの推しを受け取らない設定（パロディ作品などでお金に相当するものを受け取りたくない人向け）。
 * オンにすると推す画面でプレミアムコインを選べず、aipictors-api の推しでも断る。アプリと同じ user_settings に保存する
 */
export function PremiumCoinSupportSetting() {
  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const switchId = useId()

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

  return (
    <SettingsSection
      title={t("プレミアムコインでの推し", "Support with premium coins")}
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
          onCheckedChange={async (checked) => {
            try {
              await updateUserSetting({
                variables: { input: { isRejectPremiumCoinSupport: checked } },
              })
              toast(t("保存しました", "Settings saved"))
            } catch {
              toast(t("保存できませんでした", "Could not save"))
            }
          }}
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
    }
  }`,
)

const updatePremiumCoinSupportSettingMutation = graphql(
  `mutation UpdatePremiumCoinSupportSetting($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      id
      isRejectPremiumCoinSupport
    }
  }`,
)
