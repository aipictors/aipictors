import { AuthContext } from "@/_contexts/auth-context"
import { userSettingQuery } from "@/_graphql/queries/user/user-setting"
import { useMutation, useQuery } from "@apollo/client/index"
import { useContext, useEffect } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/_components/ui/toggle-group"
import { Button } from "@/_components/ui/button"
import React from "react"
import { updateUserSettingMutation } from "@/_graphql/mutations/update-user-setting"
import type { PreferenceRating } from "@/_graphql/__generated__/graphql"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

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

  const onSave = async () => {
    await updateUserSetting({
      variables: {
        input: {
          preferenceRating: rating as PreferenceRating,
        },
      },
    })
    toast("保存しました")
  }

  useEffect(() => {
    const preferenceRating = userSetting?.userSetting?.preferenceRating

    const nowRating = preferenceRating ? preferenceRating : "R18"

    setRating(nowRating)
  }, [userSetting])

  return (
    <>
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
    </>
  )
}
