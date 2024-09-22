import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { AuthContext } from "~/contexts/auth-context"
import { toOmissionNumberText } from "~/utils/to-omission-number-text"
import { useMutation, useQuery } from "@apollo/client/index"
import { Loader2Icon } from "lucide-react"
import React, { useEffect, useContext } from "react"
import { toast } from "sonner"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"

export function SettingRequestForm() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  const { data: token, refetch: tokenRefetch } = useQuery(viewerTokenQuery)

  const viewerUserToken = token?.viewer?.token

  const { data: user } = useQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: authContext.userId?.toString() ?? "",
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
    toast(t("保存しました", "Saved"))
  }

  const [featureCheck, setFeatureCheck] = React.useState(featurePromptonRequest)

  useEffect(() => {
    setFeatureCheck(featurePromptonRequest)
  }, [featurePromptonRequest])

  return (
    <div className="space-y-4">
      <p>
        {t(
          `サポートを受けるには累計いいね数が20必要です（現在：現在 ${toOmissionNumberText(
            receivedLikesCount,
          )}）`,
          `To receive support, you need a total of 20 likes (Currently: ${toOmissionNumberText(
            receivedLikesCount,
          )})`,
        )}
      </p>
      {receivedLikesCount >= 20 ? (
        <>
          {!promptonUserId ? (
            <div className="flex">
              <div className="flex w-full items-center justify-between">
                <Label>{t("口座連携する", "Link Account")}</Label>
                <Link
                  to={`https://prompton.io/integration?token=${viewerUserToken}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button>{t("連携", "Link")}</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex">
              <div className="flex w-full items-center justify-between">
                <Label>{t("口座連携する", "Link Account")}</Label>
                <Button disabled>{t("連携済み", "Linked")}</Button>
              </div>
            </div>
          )}
          {promptonUserId && (
            <div className="flex">
              <div className="flex w-full items-center justify-between">
                <Label htmlFor="airplane-mode">
                  {t("サポートの送信を許可する", "Allow Support Requests")}
                </Label>
                <Switch
                  onCheckedChange={setFeatureCheck}
                  checked={featureCheck}
                  id="airplane-mode"
                />
              </div>
            </div>
          )}
          <Button
            disabled={isUpdatingUserSetting}
            onClick={onSave}
            className="ml-auto block w-24"
          >
            {isUpdatingUserSetting ? (
              <Loader2Icon className="m-auto h-4 w-4 animate-spin" />
            ) : (
              <p>{t("変更を保存する", "Save Changes")}</p>
            )}
          </Button>
        </>
      ) : (
        <div className="flex">
          <div className="flex w-full justify-between">
            <Label>
              {t("サポートの送信を許可する", "Allow Support Requests")}
            </Label>
            <Switch disabled id="airplane-mode" />
          </div>
        </div>
      )}
      {promptonUserId && (
        <Link to="https://prompton.io/viewer/requests">
          <Button variant={"secondary"} className="mt-8 w-full">
            {t("リクエスト管理画面", "Request Management")}
          </Button>
        </Link>
      )}
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
      isAnonymousLike
      isAnonymousSensitiveLike
      isNotifyComment
    }
  }`,
)

const userQuery = graphql(
  `query User(
    $userId: ID!,
  ) {
    user(id: $userId) {
      id
      biography
      createdBookmarksCount
      login
      nanoid
      name
      receivedLikesCount
      receivedViewsCount
      awardsCount
      followCount
      followersCount
      worksCount
      iconUrl
      headerImageUrl
      webFcmToken
      isFollower
      isFollowee
      headerImageUrl
      biography
      enBiography
      instagramAccountId
      twitterAccountId
      githubAccountId
      siteURL
      mailAddress
      promptonUser {
        id
      }
    }
  }`,
)

const viewerTokenQuery = graphql(
  `query ViewerToken {
    viewer {
      id
      token
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
