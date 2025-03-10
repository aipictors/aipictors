import { AuthContext } from "~/contexts/auth-context"
import { useMutation, useQuery, useSuspenseQuery } from "@apollo/client/index"
import { useContext, useEffect } from "react"
import { Button } from "~/components/ui/button"
import React from "react"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { graphql } from "gql.tada"
import { Switch } from "~/components/ui/switch"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { useTranslation } from "~/hooks/use-translation"

/**
 * 表示するコンテンツの年齢設定制限フォーム
 */
export function SettingRestrictionForm() {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <div className="flex w-full items-center justify-between">
          <Label htmlFor="show-r15">
            {t(
              "(通常モード時)R15作品を表示する",
              "Display R15 content in normal mode",
            )}
          </Label>
          <Switch
            onCheckedChange={setShowR15InNormalMode}
            checked={showR15InNormalMode}
            id="show-r15"
            disabled={showSensitiveModeToggle} // センシティブモード時は無効化
          />
        </div>
        <div className="flex w-full items-center justify-between">
          <Label htmlFor="show-sensitive-toggle">
            {t(
              "センシティブモード切り替えボタンをメニューに表示する",
              "Display sensitive mode toggle in the menu",
            )}
          </Label>
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
        </div>
        <div className="flex w-full items-center justify-between">
          <Label htmlFor="show-r18g">
            {t(
              "(センシティブモード時)R18G作品を表示する",
              "Display R18G content in sensitive mode",
            )}
          </Label>
          <Switch
            onCheckedChange={setShowR18GInSensitiveMode}
            checked={showR18GInSensitiveMode}
            id="show-r18g"
            disabled={!showSensitiveModeToggle} // センシティブモードが有効でないと無効化
          />
        </div>
      </div>
      <Separator />
      <Button
        disabled={isUpdatingUserSetting}
        onClick={onSave}
        variant={"secondary"}
      >
        {isUpdatingUserSetting ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <span>{t("保存", "Save")}</span>
        )}
      </Button>
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
      preferenceRating
    }
  }
`)
