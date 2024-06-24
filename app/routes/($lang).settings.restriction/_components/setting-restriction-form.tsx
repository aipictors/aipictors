import { AuthContext } from "@/_contexts/auth-context"
import { userSettingQuery } from "@/_graphql/queries/user/user-setting"
import { useMutation, useQuery, useSuspenseQuery } from "@apollo/client/index"
import { useContext, useEffect } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/_components/ui/toggle-group"
import { Button } from "@/_components/ui/button"
import React from "react"
import { updateUserSettingMutation } from "@/_graphql/mutations/update-user-setting"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { viewerIsBlurSensitiveImageQuery } from "@/_graphql/queries/viewer/viewer-is-blur-sensitive-image"
import { Separator } from "@/_components/ui/separator"
import { Label } from "@/_components/ui/label"
import { Switch } from "@/_components/ui/switch"

/**
 * 表示するコンテンツの年齢設定制限フォーム
 */
export const SettingRestrictionForm = () => {
  const [rating, setRating] = React.useState("G")

  const authContext = useContext(AuthContext)

  const {
    data: userSetting,
    loading,
    refetch: refetchSetting,
  } = useQuery(userSettingQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const [updateUserSetting, { loading: isUpdatingUserSetting }] = useMutation(
    updateUserSettingMutation,
  )

  const { data: isBlurResp, refetch: tokenRefetch } = useSuspenseQuery(
    viewerIsBlurSensitiveImageQuery,
  )

  const isBlurDefault = isBlurResp?.viewer?.isBlurSensitiveImage

  const [isBlur, setIsBlur] = React.useState(isBlurDefault)

  const onSave = async () => {
    await updateUserSetting({
      variables: {
        input: {
          preferenceRating: rating as IntrospectionEnum<"PreferenceRating">,
        },
      },
    })
    await updateUserSetting({
      variables: {
        input: {
          isBlurSensitiveImage: isBlur,
        },
      },
    })
    toast("保存しました")
  }

  useEffect(() => {
    const preferenceRating = userSetting?.userSetting?.preferenceRating

    const nowRating = preferenceRating ? preferenceRating : "R18"

    setRating(nowRating)

    setIsBlur(isBlurDefault)
  }, [userSetting])

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <ToggleGroup
          className="justify-start space-x-1"
          value={loading ? "" : rating}
          onValueChange={(value) => setRating(value)}
          type="single"
        >
          <ToggleGroupItem value="G" aria-label="G">
            <p className="test-sm">全年齢</p>
          </ToggleGroupItem>
          <ToggleGroupItem value="R15" aria-label="R15">
            <p className="test-sm">全年齢+R15</p>
          </ToggleGroupItem>
          <ToggleGroupItem value="R18G" aria-label="R18G">
            <p className="test-sm">全年齢+R15R+18G</p>
          </ToggleGroupItem>
          <ToggleGroupItem value="R18" aria-label="R18">
            <p className="test-sm">すべて</p>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <Separator />
      <div className="flex">
        <div className="flex w-full items-center justify-between">
          <Label htmlFor="airplane-mode">{"センシティブ画像をぼかす"}</Label>
          <Switch
            onCheckedChange={setIsBlur}
            checked={isBlur}
            id="airplane-mode"
          />
        </div>
      </div>

      <Button
        disabled={isUpdatingUserSetting}
        onClick={onSave}
        variant={"secondary"}
      >
        {isUpdatingUserSetting ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          <span>{"保存"}</span>
        )}
      </Button>
    </div>
  )
}
