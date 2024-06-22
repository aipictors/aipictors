import { Button } from "@/_components/ui/button"
import { Label } from "@/_components/ui/label"
import { Switch } from "@/_components/ui/switch"
import { AuthContext } from "@/_contexts/auth-context"
import { updateUserSettingMutation } from "@/_graphql/mutations/update-user-setting"
import { userQuery } from "@/_graphql/queries/user/user"
import { userSettingQuery } from "@/_graphql/queries/user/user-setting"
import { viewerTokenQuery } from "@/_graphql/queries/viewer/viewer-token"
import { toOmissionNumberText } from "@/_utils/to-omission-number-text"
import { useMutation, useQuery } from "@apollo/client/index"
import { Loader2Icon } from "lucide-react"
import React, { useEffect } from "react"
import { useContext } from "react"
import { toast } from "sonner"

export const SettingRequestForm = () => {
  const authContext = useContext(AuthContext)

  const { data: token, refetch: tokenRefetch } = useQuery(viewerTokenQuery)

  const viewerUserToken = token?.viewer?.token

  const { data: user } = useQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: authContext.userId?.toString() ?? "",
      worksWhere: {},
      followeesWorksWhere: {},
      followersWorksWhere: {},
      worksOffset: 0,
      worksLimit: 0,
      followeesOffset: 0,
      followeesLimit: 0,
      followeesWorksOffset: 0,
      followeesWorksLimit: 0,
      followersOffset: 0,
      followersLimit: 0,
      followersWorksOffset: 0,
      followersWorksLimit: 0,
    },
    fetchPolicy: "cache-first",
  })

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

  const receivedLikesCount = user?.user?.receivedLikesCount ?? 0

  const promptonUserId = user?.user?.promptonUser?.id ?? ""

  const featurePromptonRequest =
    userSetting?.userSetting?.featurePromptonRequest ?? false

  const onSave = async () => {
    await updateUserSetting({
      variables: {
        input: {
          featurePromptonRequest: featureCheck,
        },
      },
    })
    toast("保存しました")
  }

  const [featureCheck, setFeatureCheck] = React.useState(featurePromptonRequest)

  useEffect(() => {
    setFeatureCheck(featurePromptonRequest)
  }, [featurePromptonRequest])

  return (
    <div className="space-y-4">
      <p>{`サポートを受けるには累計いいね数が20必要です（現在：現在 ${toOmissionNumberText(
        receivedLikesCount,
      )}）`}</p>
      {receivedLikesCount >= 20 ? (
        <>
          {!promptonUserId ? (
            <div className="flex">
              <div className="flex w-full items-center justify-between">
                <Label>{"口座連携する"}</Label>
                <a
                  href={`https://prompton.io/integration?token=${viewerUserToken}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button>{"連携"}</Button>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex">
              <div className="flex w-full items-center justify-between">
                <Label>{"口座連携する"}</Label>
                <Button disabled>{"連携済み"}</Button>
              </div>
            </div>
          )}
          {promptonUserId && (
            <>
              <div className="flex">
                <div className="flex w-full items-center justify-between">
                  <Label htmlFor="airplane-mode">
                    {"サポートの送信を許可する"}
                  </Label>
                  <Switch
                    onCheckedChange={setFeatureCheck}
                    checked={featureCheck}
                    id="airplane-mode"
                  />
                </div>
              </div>
            </>
          )}
          <Button
            disabled={isUpdatingUserSetting}
            onClick={onSave}
            className="ml-auto block w-24"
          >
            {isUpdatingUserSetting ? (
              <Loader2Icon className="m-auto h-4 w-4 animate-spin" />
            ) : (
              <p>{"更新する"}</p>
            )}
          </Button>
        </>
      ) : (
        <div className="flex">
          <div className="flex w-full justify-between">
            <Label>{"サポートの送信を許可する"}</Label>
            <Switch disabled id="airplane-mode" />
          </div>
        </div>
      )}
      {promptonUserId && (
        <a href="https://prompton.io/viewer/requests">
          <Button variant={"secondary"} className="mt-8 w-full">
            管理画面
          </Button>
        </a>
      )}
    </div>
  )
}
