import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { ChevronRight } from "lucide-react"
import { useContext, useEffect, useId, useState } from "react"
import { toast } from "sonner"
import { Switch } from "~/components/ui/switch"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation" // 翻訳用フック
import { Link } from "~/lib/app/locale-router"
import { SettingsSaveBar } from "~/routes/($lang).settings/components/settings-save-bar"
import {
  SettingsSection,
  SettingsSwitchRow,
} from "~/routes/($lang).settings/components/settings-section"

/**
 * 通知設定フォーム
 */
export function SettingNotificationForm() {
  const authContext = useContext(AuthContext)
  const t = useTranslation() // 翻訳フックを使用
  const notifyCommentId = useId()
  const notifyLikeId = useId()
  const notifyAnonymousLikeId = useId()
  const allAgeAnonymousId = useId()
  const sensitiveAnonymousId = useId()

  const { data: userSetting } = useQuery(userSettingQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const [updateUserSetting, { loading: isUpdatingUserSetting }] = useMutation(
    updateUserSettingMutation,
  )

  const [isNotifyComment, setIsNotifyComment] = useState<boolean>(
    userSetting?.userSetting?.isNotifyComment ?? false,
  )
  const [isNotifyLike, setIsNotifyLike] = useState(true)
  const [isNotifyAnonymousLike, setIsNotifyAnonymousLike] = useState(true)
  const [isAllAgeLikeAnonymousByDefault, setIsAllAgeLikeAnonymousByDefault] =
    useState(false)
  const [
    isSensitiveLikeAnonymousByDefault,
    setIsSensitiveLikeAnonymousByDefault,
  ] = useState(true)

  useEffect(() => {
    setIsNotifyComment(userSetting?.userSetting?.isNotifyComment ?? false)
    setIsNotifyLike(userSetting?.userSetting?.isNotifyLike ?? true)
    setIsNotifyAnonymousLike(
      userSetting?.userSetting?.isNotifyAnonymousLike ?? true,
    )
  }, [userSetting])

  useEffect(() => {
    setIsAllAgeLikeAnonymousByDefault(
      userSetting?.userSetting?.isAnonymousLikeAllAges ?? false,
    )
    setIsSensitiveLikeAnonymousByDefault(
      userSetting?.userSetting?.isAnonymousLikeSensitive ?? true,
    )
  }, [userSetting])

  const onSave = async () => {
    await updateUserSetting({
      variables: {
        input: {
          isNotifyComment: isNotifyComment,
          isNotifyLike: isNotifyLike,
          isNotifyAnonymousLike: isNotifyAnonymousLike,
          isAnonymousLikeAllAges: isAllAgeLikeAnonymousByDefault,
          isAnonymousLikeSensitive: isSensitiveLikeAnonymousByDefault,
        },
      },
    })

    toast(t("保存しました", "Settings saved"))
  }

  return (
    <div className="space-y-5">
      <SettingsSection title={t("通知", "Notifications")}>
        <SettingsSwitchRow
          htmlFor={notifyCommentId}
          title={t(
            "コメントの通知を受け取る",
            "Receive notifications for comments",
          )}
        >
          <Switch
            checked={isNotifyComment}
            id={notifyCommentId}
            onCheckedChange={setIsNotifyComment}
          />
        </SettingsSwitchRow>
        <SettingsSwitchRow
          htmlFor={notifyLikeId}
          title={t("いいねの通知を受け取る", "Receive notifications for likes")}
        >
          <Switch
            checked={isNotifyLike}
            id={notifyLikeId}
            onCheckedChange={setIsNotifyLike}
          />
        </SettingsSwitchRow>
        <SettingsSwitchRow
          htmlFor={notifyAnonymousLikeId}
          title={t(
            "匿名いいねの通知を受け取る",
            "Receive notifications for anonymous likes",
          )}
        >
          <Switch
            checked={isNotifyAnonymousLike}
            id={notifyAnonymousLikeId}
            onCheckedChange={setIsNotifyAnonymousLike}
          />
        </SettingsSwitchRow>
        <Link
          to="/settings/push-notification"
          className="flex min-h-12 items-center justify-between gap-3 border-t pt-2 font-medium text-sm hover:underline"
        >
          {t("Push通知の設定", "Push notification settings")}
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </Link>
      </SettingsSection>
      <SettingsSection
        title={t("いいねの表示", "Like visibility")}
        description={t(
          "いいねしたときに、作者への通知やいいね一覧で名前を出さないようにします。",
          "Hides your name in author notifications and like lists when you like a work.",
        )}
      >
        <div className="divide-y">
          <SettingsSwitchRow
            htmlFor={allAgeAnonymousId}
            title={t(
              "全年齢作品のいいねを匿名にする",
              "Default all-ages likes to anonymous",
            )}
          >
            <Switch
              checked={isAllAgeLikeAnonymousByDefault}
              id={allAgeAnonymousId}
              onCheckedChange={setIsAllAgeLikeAnonymousByDefault}
            />
          </SettingsSwitchRow>
          <SettingsSwitchRow
            htmlFor={sensitiveAnonymousId}
            title={t(
              "センシティブ作品のいいねを匿名にする",
              "Default sensitive likes to anonymous",
            )}
          >
            <Switch
              checked={isSensitiveLikeAnonymousByDefault}
              id={sensitiveAnonymousId}
              onCheckedChange={setIsSensitiveLikeAnonymousByDefault}
            />
          </SettingsSwitchRow>
        </div>
      </SettingsSection>
      <SettingsSaveBar
        isSaving={isUpdatingUserSetting}
        onSave={() => void onSave()}
      />
    </div>
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
      isNotifyLike
      isNotifyAnonymousLike
      isAnonymousLikeAllAges
      isAnonymousLikeSensitive
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
