import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation" // 翻訳用フック
import { SettingFcmForm } from "~/routes/($lang).settings.push-notification/components/setting-fcm-form"

/**
 * 通知設定フォーム
 */
export function SettingNotificationForm() {
  const authContext = useContext(AuthContext)
  const t = useTranslation() // 翻訳フックを使用

  const { data: userSetting, refetch: refetchSetting } = useQuery(
    userSettingQuery,
    {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
    },
  )

  const [updateUserSetting, { loading: isUpdatingUserSetting }] = useMutation(
    updateUserSettingMutation,
  )

  const [isNotifyComment, setIsNotifyComment] = useState<boolean>(
    userSetting?.userSetting?.isNotifyComment ?? false,
  )

  useEffect(() => {
    setIsNotifyComment(userSetting?.userSetting?.isNotifyComment ?? false)
  }, [userSetting])

  const onSave = async () => {
    await updateUserSetting({
      variables: {
        input: {
          isNotifyComment: isNotifyComment,
        },
      },
    })
    toast(t("保存しました", "Settings saved"))
  }

  return (
    <>
      <div className="space-y-4">
        <p className="font-bold">{t("通知", "Notifications")}</p>
        <div className="flex justify-between">
          <label
            htmlFor="5"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t(
              "コメントの通知を受け取る",
              "Receive notifications for comments",
            )}
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
          <Loader2Icon className="m-auto size-4 animate-spin" />
        ) : (
          t("更新する", "Update")
        )}
      </Button>
      <Separator />
      <div className="w-full space-y-4">
        <p className="font-bold text-2xl">
          {t("Push通知設定", "Push Notification Settings")}
        </p>
        <p>
          {t(
            "Push通知を設定することができます。",
            "You can configure push notifications.",
          )}
        </p>
        <p>
          {t(
            "PCブラウザに対応しています。スマートフォンのブラウザは対応していません。スマートフォンの場合は、今後アプリで通知に対応する予定です。通知を受信できるブラウザは1つのみとなります。最後に設定したブラウザ宛に通知されます。",
            "Supported on PC browsers only. Smartphone browsers are not supported. Future app support for notifications is planned.",
          )}
        </p>
        <p>
          {t(
            "Push通知内容、サイト上の通知内容と共通です。現行サイトの右上プロフィールアイコン → 設定 → 通知・いいね、から選択できます。",
            "Push notification settings are shared with site notifications, accessible via the profile icon → settings → notifications.",
          )}
        </p>
        <Separator />
        <SettingFcmForm />
        <Separator />
        <p>
          {t(
            "Push通知を受け取るためには、上記ボタンクリック後に、ブラウザの設定で通知を許可してください。",
            "After configuring, enable notifications in your browser settings.",
          )}
        </p>
        <p>
          {t(
            "設定後にテスト通知が届きます。通知が表示されない場合は以下を確認してください。",
            "A test notification will be sent after configuration. If not received, check the following.",
          )}
        </p>
        <p>{t("■Windows11の場合", "■ For Windows 11")}</p>
        <p>
          {t(
            "設定 → 通知、で通知がONになっていること、ご利用のブラウザの通知がONになっていることを確認してください。",
            "Ensure notifications are ON in settings → notifications, and in your browser.",
          )}
        </p>
        <p>
          {t(
            "設定 → フォーカス、でフォーカスをONにしていないか確認してください。",
            "Check focus mode is not enabled in settings → focus.",
          )}
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
