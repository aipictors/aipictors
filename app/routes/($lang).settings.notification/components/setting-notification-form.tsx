import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { useContext, useEffect, useId, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { Switch } from "~/components/ui/switch"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation" // 翻訳用フック
import { SettingFcmForm } from "~/routes/($lang).settings.push-notification/components/setting-fcm-form"
import {
  getLikeVisibilityPreferences,
  saveLikeVisibilityPreferences,
} from "~/utils/like-visibility-preference"

/**
 * 通知設定フォーム
 */
export function SettingNotificationForm() {
  const authContext = useContext(AuthContext)
  const t = useTranslation() // 翻訳フックを使用
  const notifyCommentId = useId()
  const allAgeAnonymousId = useId()
  const sensitiveAnonymousId = useId()

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
  const [isAllAgeLikeAnonymousByDefault, setIsAllAgeLikeAnonymousByDefault] =
    useState(false)
  const [
    isSensitiveLikeAnonymousByDefault,
    setIsSensitiveLikeAnonymousByDefault,
  ] = useState(true)

  useEffect(() => {
    setIsNotifyComment(userSetting?.userSetting?.isNotifyComment ?? false)
  }, [userSetting])

  useEffect(() => {
    const preferences = getLikeVisibilityPreferences()

    setIsAllAgeLikeAnonymousByDefault(preferences.allAgeAnonymousByDefault)
    setIsSensitiveLikeAnonymousByDefault(
      preferences.sensitiveAnonymousByDefault,
    )
  }, [])

  const onSave = async () => {
    await updateUserSetting({
      variables: {
        input: {
          isNotifyComment: isNotifyComment,
        },
      },
    })

    saveLikeVisibilityPreferences({
      allAgeAnonymousByDefault: isAllAgeLikeAnonymousByDefault,
      sensitiveAnonymousByDefault: isSensitiveLikeAnonymousByDefault,
    })

    toast(t("保存しました", "Settings saved"))
  }

  return (
    <>
      <div className="space-y-4">
        <p className="font-bold">{t("通知", "Notifications")}</p>
        <div className="flex justify-between">
          <Label htmlFor={notifyCommentId}>
            {t(
              "コメントの通知を受け取る",
              "Receive notifications for comments",
            )}
          </Label>
          <Checkbox
            onCheckedChange={(value: boolean) => {
              setIsNotifyComment(value)
            }}
            checked={isNotifyComment}
            id={notifyCommentId}
          />
        </div>
        <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-sm">
          <p className="font-medium">
            {t("いいねの表示ルール", "Like visibility rules")}
          </p>
          <p className="mt-2 text-muted-foreground">
            {t(
              "ここで設定した内容は、このブラウザでいいねダイアログを開いたときの初期選択に反映されます。",
              "These settings control the default choice shown in the like dialog on this browser.",
            )}
          </p>
          <div className="mt-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor={allAgeAnonymousId}>
                  {t(
                    "全年齢作品のいいねを匿名にする",
                    "Default all-ages likes to anonymous",
                  )}
                </Label>
                <p className="text-muted-foreground text-xs">
                  {t(
                    "オフの場合は、名前を表示していいねが初期選択になります。",
                    "When off, named likes will be selected by default.",
                  )}
                </p>
              </div>
              <Switch
                id={allAgeAnonymousId}
                checked={isAllAgeLikeAnonymousByDefault}
                onCheckedChange={setIsAllAgeLikeAnonymousByDefault}
              />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor={sensitiveAnonymousId}>
                  {t(
                    "センシティブ作品のいいねを匿名にする",
                    "Default sensitive likes to anonymous",
                  )}
                </Label>
                <p className="text-muted-foreground text-xs">
                  {t(
                    "オフの場合は、名前を表示していいねが初期選択になります。",
                    "When off, named likes will be selected by default.",
                  )}
                </p>
              </div>
              <Switch
                id={sensitiveAnonymousId}
                checked={isSensitiveLikeAnonymousByDefault}
                onCheckedChange={setIsSensitiveLikeAnonymousByDefault}
              />
            </div>
          </div>
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
