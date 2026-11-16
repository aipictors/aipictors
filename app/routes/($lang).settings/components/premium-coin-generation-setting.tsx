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
 * 画像生成にプレミアムコインを使わない設定（user_settings、アプリと同じ）。
 * オンにすると生成はフリーコインだけで払い、足りなければ生成を受け付けない（サーバーの受け付けと消費でも確かめる）。
 * 推し・アイコン枠・宣伝枠などの生成以外には効かない
 */
export function usePremiumCoinGenerationSetting() {
  const authContext = useContext(AuthContext)
  const t = useTranslation()

  const { data } = useQuery(premiumCoinGenerationSettingQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const [updateUserSetting, { loading }] = useMutation(
    updatePremiumCoinGenerationSettingMutation,
    { refetchQueries: [premiumCoinGenerationSettingQuery] },
  )

  const setDisabled = async (checked: boolean) => {
    try {
      await updateUserSetting({
        variables: { input: { isDisablePremiumCoinGeneration: checked } },
      })
      toast(t("保存しました", "Settings saved"))
    } catch {
      toast(t("保存できませんでした", "Could not save"))
    }
  }

  return {
    isDisabled: data?.userSetting?.isDisablePremiumCoinGeneration ?? false,
    isReady: data !== undefined,
    isSaving: loading,
    setDisabled,
  }
}

/**
 * スイッチの行（設定画面と生成画面のコインのシートで使う）
 */
export function PremiumCoinGenerationSwitchRow() {
  const t = useTranslation()
  const switchId = useId()
  const setting = usePremiumCoinGenerationSetting()

  return (
    <SettingsSwitchRow
      htmlFor={switchId}
      title={t(
        "生成にプレミアムコインを使わない",
        "Do not use premium coins for generation",
      )}
      description={t(
        "オンにすると、画像生成はフリーコインだけで行います。フリーコインが足りないときは生成できません。推し・アイコン枠などには影響しません。",
        "When on, image generation uses only free coins. You cannot generate when free coins run out. Support, avatar frames and others are not affected.",
      )}
    >
      <Switch
        checked={setting.isDisabled}
        disabled={setting.isSaving || !setting.isReady}
        id={switchId}
        onCheckedChange={setting.setDisabled}
      />
    </SettingsSwitchRow>
  )
}

export function PremiumCoinGenerationSetting() {
  const authContext = useContext(AuthContext)
  const t = useTranslation()

  if (authContext.isNotLoggedIn) {
    return null
  }

  return (
    <SettingsSection
      title={t("生成に使うコイン", "Coins used for generation")}
      description={t(
        "通常はフリーコインから先に使い、足りない分はプレミアムコインを使います。",
        "Free coins are used first, and premium coins cover the rest.",
      )}
    >
      <PremiumCoinGenerationSwitchRow />
    </SettingsSection>
  )
}

const premiumCoinGenerationSettingQuery = graphql(
  `query PremiumCoinGenerationSetting {
    userSetting {
      id
      isDisablePremiumCoinGeneration
    }
  }`,
)

const updatePremiumCoinGenerationSettingMutation = graphql(
  `mutation UpdatePremiumCoinGenerationSetting($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      id
      isDisablePremiumCoinGeneration
    }
  }`,
)
