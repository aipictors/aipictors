import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { SettingFcmForm } from "~/routes/($lang).settings.push-notification/components/setting-fcm-form"
import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"

/**
 * 通知設定フォーム
 */
export function SettingNotificationForm() {
  const authContext = useContext(AuthContext)

  const { data: userSetting, refetch: refetchSetting } = useQuery(
    userSettingQuery,
    {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
    },
  )

  const [updateUserSetting, { loading: isUpdatingUserSetting }] = useMutation(
    updateUserSettingMutation,
  )

  const [isAnonymousLike, setIsAnonymousLike] = useState<boolean>(
    userSetting?.userSetting?.isAnonymousLike ?? false,
  )

  const [isAnonymousSensitiveLike, setIsAnonymousSensitiveLike] =
    useState<boolean>(
      userSetting?.userSetting?.isAnonymousSensitiveLike ?? false,
    )

  const [isNotifyComment, setIsNotifyComment] = useState<boolean>(
    userSetting?.userSetting?.isNotifyComment ?? false,
  )

  useEffect(() => {
    setIsAnonymousLike(userSetting?.userSetting?.isAnonymousLike ?? false)
    setIsAnonymousSensitiveLike(
      userSetting?.userSetting?.isAnonymousSensitiveLike ?? false,
    )
    setIsNotifyComment(userSetting?.userSetting?.isNotifyComment ?? false)
  }, [userSetting])

  const onSave = async () => {
    await updateUserSetting({
      variables: {
        input: {
          isAnonymousLike: isAnonymousLike,
          isAnonymousSensitiveLike: isAnonymousSensitiveLike,
          isNotifyComment: isNotifyComment,
        },
      },
    })
    toast("保存しました")
  }

  return (
    <>
      <div className="space-y-4">
        <p className="font-bold">{"匿名いいね"}</p>
        <div className="flex justify-between">
          <label
            htmlFor="1"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {"全年齢作品を匿名でいいねする"}
          </label>
          <Checkbox
            onCheckedChange={(value: boolean) => {
              setIsAnonymousLike(value)
            }}
            checked={isAnonymousLike}
            id="terms"
          />
        </div>
        <div className="flex justify-between">
          <label
            htmlFor="2"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {"センシティブ作品を匿名でいいねする"}
          </label>
          <Checkbox
            onCheckedChange={(value: boolean) => {
              setIsAnonymousSensitiveLike(value)
            }}
            checked={isAnonymousSensitiveLike}
            id="terms"
          />
        </div>
      </div>
      <div className="space-y-4">
        <p className="font-bold">{"通知"}</p>
        <div className="flex justify-between">
          <label
            htmlFor="5"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {"コメントの通知を受け取る"}
          </label>
          <Checkbox
            onCheckedChange={(value: boolean) => {
              setIsNotifyComment(value)
            }}
            checked={isNotifyComment}
            id="terms"
          />
        </div>
      </div>
      <Button
        onClick={onSave}
        disabled={isUpdatingUserSetting}
        className="ml-auto block w-24 text-center"
      >
        {isUpdatingUserSetting ? (
          <Loader2Icon className="m-auto h-4 w-4 animate-spin" />
        ) : (
          "更新する"
        )}
      </Button>
      <Separator />
      <div className="w-full space-y-4">
        <p className="font-bold text-2xl">{"Push通知設定"}</p>
        <p>Push通知を設定することができます。</p>
        <p>
          PCブラウザに対応しています。スマートフォンのブラウザは対応していません。スマートフォンの場合は、今後アプリで通知に対応する予定です。
          通知を受信できるブラウザは1つのみとなります。最後に設定したブラウザ宛に通知されます。
        </p>
        <p>
          Push通知内容、サイト上の通知内容と共通です。現行サイトの右上プロフィールアイコン
          → 設定 → 通知・いいね、から選択できます。
        </p>
        <Separator />
        <SettingFcmForm />
        <Separator />
        <p>
          Push通知を受け取るためには、上記ボタンクリック後に、ブラウザの設定で通知を許可してください。
        </p>
        <p>
          設定後にテスト通知が届きます。通知が表示されない場合は以下を確認してください。
        </p>
        <p>■Windows11の場合</p>
        <p>
          設定 →
          通知、で通知がONになっていること、ご利用のブラウザの通知がONになっていることを確認してください。
        </p>
        <p>
          設定 → フォーカス、でフォーカスをONにしていないか確認してください。
        </p>
      </div>
    </>
  )
}

const userSettingQuery = graphql(
  `query UserSetting {
    userSetting {
      id
      userId
      favoritedImageGenerationModelIds
      preferenceRating
      featurePromptonRequest
      isAnonymousLike
      isAnonymousSensitiveLike
      isNotifyComment
    }
  }`,
)

const updateUserSettingMutation = graphql(
  `mutation UpdateUserSetting($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      preferenceRating
    }
  }`,
)
