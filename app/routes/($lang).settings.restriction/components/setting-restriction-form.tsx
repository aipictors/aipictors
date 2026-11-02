import { AuthContext } from "~/contexts/auth-context"
import { useMutation, useQuery, useSuspenseQuery } from "@apollo/client/index"
import { useContext, useEffect } from "react"
import React from "react"
import { toast } from "sonner"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { graphql } from "gql.tada"
import { Switch } from "~/components/ui/switch"
import { useTranslation } from "~/hooks/use-translation"
import { SettingsSaveBar } from "~/routes/($lang).settings/components/settings-save-bar"
import { SettingsSwitchRow } from "~/routes/($lang).settings/components/settings-section"

/**
 * 表示するコンテンツの年齢設定制限フォーム
 */
export function SettingRestrictionForm () {
  const [showR15InNormalMode, setShowR15InNormalMode] = React.useState(false)
  const [showSensitiveModeToggle, setShowSensitiveModeToggle] =
    React.useState(false)
  const [showR18GInSensitiveMode, setShowR18GInSensitiveMode] =
    React.useState(false)

  const authContext = useContext(AuthContext)
  const t = useTranslation()

  const { data: userSetting, loading } = useQuery(userSettingQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const [updateUserSetting, { loading: isUpdatingUserSetting }] = useMutation(
    updateUserSettingMutation,
  )

  const { data: isBlurResp } = useSuspenseQuery(viewerIsBlurSensitiveImageQuery)

  const isBlurDefault = isBlurResp?.viewer?.isBlurSensitiveImage

  const [isBlur, setIsBlur] = React.useState(isBlurDefault)

  const onSave = async () => {
    // 設定に基づいてpreferenceRatingを決定
    let preferenceRating: IntrospectionEnum<"PreferenceRating"> = "G"

    if (showSensitiveModeToggle) {
      if (showR18GInSensitiveMode) {
        preferenceRating = "R18G"
      } else {
        preferenceRating = "R18"
      }
    } else {
      if (showR15InNormalMode) {
        preferenceRating = "R15"
      } else {
        preferenceRating = "G"
      }
    }

    await updateUserSetting({
      variables: {
        input: {
          preferenceRating: preferenceRating,
          isBlurSensitiveImage: isBlur,
        },
      },
    })
    toast(t("保存しました", "Settings saved"))
  }

  useEffect(() => {
    const preferenceRating = userSetting?.userSetting?.preferenceRating

    // preferenceRatingに応じて初期値を設定
    if (preferenceRating) {
      if (preferenceRating === "G") {
        setShowR15InNormalMode(false)
        setShowSensitiveModeToggle(false)
        setShowR18GInSensitiveMode(false)
      } else if (preferenceRating === "R15") {
        setShowR15InNormalMode(true)
        setShowSensitiveModeToggle(false)
        setShowR18GInSensitiveMode(false)
      } else if (preferenceRating === "R18") {
        setShowR15InNormalMode(true) // R15は含まれると仮定
        setShowSensitiveModeToggle(true)
        setShowR18GInSensitiveMode(false)
      } else if (preferenceRating === "R18G") {
        setShowR15InNormalMode(true) // R15は含まれると仮定
        setShowSensitiveModeToggle(true)
        setShowR18GInSensitiveMode(true)
      }
    } else {
      setShowR15InNormalMode(false)
      setShowSensitiveModeToggle(false)
      setShowR18GInSensitiveMode(false)
    }

    setIsBlur(isBlurDefault)
  }, [userSetting])

  const [showHeaderRatingToggle, setShowHeaderRatingToggle] =
    React.useState(true)

  React.useEffect(() => {
    setShowHeaderRatingToggle(localStorage.getItem("hideR18Button") !== "true")
  }, [])

  return (
    <div className="space-y-4">
      <div className="divide-y rounded-xl border px-4">
        <SettingsSwitchRow
            htmlFor="show-r15"
            title={t(
              "(通常モード時)R15作品を表示する",
              "Display R15 content in normal mode",
            )}
          >
<Switch
            onCheckedChange={setShowR15InNormalMode}
            checked={showR15InNormalMode}
            id="show-r15"
            disabled={showSensitiveModeToggle} // センシティブモード時は無効化
          />
          </SettingsSwitchRow>
<SettingsSwitchRow
            htmlFor="show-sensitive-toggle"
            title={t(
              "R18作品を見られるようにする（18歳以上）",
              "Allow R18 content (18+)",
            )}
          >
<Switch
            onCheckedChange={(checked) => {
              setShowSensitiveModeToggle(checked)
              if (checked) {
                // センシティブモードを有効にしたら、R15の表示設定を有効化
                setShowR15InNormalMode(true)
              } else {
                // センシティブモードを無効にしたら、R18Gの表示設定を無効化
                setShowR18GInSensitiveMode(false)
              }
            }}
            checked={showSensitiveModeToggle}
            id="show-sensitive-toggle"
          />
          </SettingsSwitchRow>
<SettingsSwitchRow
            htmlFor="show-r18g"
            title={t(
              "(センシティブモード時)R18G作品を表示する",
              "Display R18G content in sensitive mode",
            )}
          >
<Switch
            onCheckedChange={setShowR18GInSensitiveMode}
            checked={showR18GInSensitiveMode}
            id="show-r18g"
            disabled={!showSensitiveModeToggle} // センシティブモードが有効でないと無効化
          />
          </SettingsSwitchRow>
<SettingsSwitchRow
            htmlFor="show-header-rating-toggle"
            title={t(
              "ヘッダーに「全年齢／R18」の切り替えを表示する",
              'Show the "All ages / R18" switch in the header',
            )}
          >
<Switch
            onCheckedChange={(checked) => {
              // この端末だけの設定（ブラウザに保存）
              if (checked) {
                localStorage.removeItem("hideR18Button")
              } else {
                localStorage.setItem("hideR18Button", "true")
              }
              setShowHeaderRatingToggle(checked)
            }}
            checked={showHeaderRatingToggle}
            id="show-header-rating-toggle"
          />
          </SettingsSwitchRow>
</div>
      <SettingsSaveBar
        isSaving={isUpdatingUserSetting}
        onSave={() => void onSave()}
      />
    </div>
  )
}

const userSettingQuery = graphql(`
  query UserSetting {
    userSetting {
      id
      userId
      preferenceRating
    }
  }
`)

const viewerIsBlurSensitiveImageQuery = graphql(`
  query ViewerIsBlurSensitiveImage {
    viewer {
      id
      isBlurSensitiveImage
    }
  }
`)

const updateUserSettingMutation = graphql(`
  mutation UpdateUserSetting($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      id
      preferenceRating
    }
  }
`)
