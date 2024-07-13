import { Button } from "@/_components/ui/button"
import { Label } from "@/_components/ui/label"
import { Switch } from "@/_components/ui/switch"
import { AuthContext } from "@/_contexts/auth-context"
import { toOmissionNumberText } from "@/_utils/to-omission-number-text"
import { useMutation, useQuery } from "@apollo/client/index"
import { Loader2Icon } from "lucide-react"
import React, { useEffect } from "react"
import { useContext } from "react"
import { toast } from "sonner"
import { Link } from "@remix-run/react"
import { userSettingFieldsFragment } from "@/_graphql/fragments/user-setting-fields"
import { graphql } from "gql.tada"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"

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
      bookmarksOffset: 0,
      bookmarksLimit: 0,
      bookmarksWhere: {},
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
                <Link
                  to={`https://prompton.io/integration?token=${viewerUserToken}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button>{"連携"}</Button>
                </Link>
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
        <Link to="https://prompton.io/viewer/requests">
          <Button variant={"secondary"} className="mt-8 w-full">
            管理画面
          </Button>
        </Link>
      )}
    </div>
  )
}

const userSettingQuery = graphql(
  `query UserSetting {
    userSetting {
      ...UserSettingFields
    }
  }`,
  [userSettingFieldsFragment],
)

const userQuery = graphql(
  `query User(
    $userId: ID!,
    $worksOffset: Int!,
    $worksLimit: Int!,
    $worksWhere: UserWorksWhereInput,
    $followeesOffset: Int!,
    $followeesLimit: Int!,
    $followeesWorksOffset: Int!,
    $followeesWorksLimit: Int!,
    $followeesWorksWhere: UserWorksWhereInput,
    $followersOffset: Int!,
    $followersLimit: Int!,
    $followersWorksOffset: Int!,
    $followersWorksLimit: Int!
    $followersWorksWhere: UserWorksWhereInput,
    $bookmarksOffset: Int!,
    $bookmarksLimit: Int!,
    $bookmarksWhere: UserWorksWhereInput,
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
      works(offset: $worksOffset, limit: $worksLimit, where: $worksWhere) {
        ...PartialWorkFields
      }
      followees(offset: $followeesOffset, limit: $followeesLimit) {
        id
        name
        iconUrl
        headerImageUrl
        biography
        isFollower
        isFollowee
        enBiography
        works(offset: $followeesWorksOffset, limit: $followeesWorksLimit, where: $followeesWorksWhere) {
          ...PartialWorkFields
        }
      }
      followers(offset: $followersOffset, limit: $followersLimit) {
        id
        name
        iconUrl
        headerImageUrl
        biography
        isFollower
        isFollowee
        enBiography
        works(offset: $followersWorksOffset, limit: $followersWorksLimit, where: $followersWorksWhere) {
          ...PartialWorkFields
        }
      }
      bookmarkWorks(offset: $bookmarksOffset, limit: $bookmarksLimit, where: $bookmarksWhere) {
        ...PartialWorkFields
      }
      featuredSensitiveWorks {
        ...PartialWorkFields
      }
      featuredWorks {
        ...PartialWorkFields
      }
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
  [partialWorkFieldsFragment],
)

const viewerTokenQuery = graphql(
  `query ViewerToken {
    viewer {
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
