import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { Checkbox } from "~/components/ui/checkbox"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"
import React from "react"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { Separator } from "~/components/ui/separator"
import { FollowButton } from "~/components/button/follow-button"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { Card, CardContent } from "~/components/ui/card"
import { IconUrl } from "~/components/icon-url"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel"
import { useNavigate } from "@remix-run/react"

/**
 * プロフィール設定フォーム
 */
export function UserSettingsForm() {
  const authContext = useContext(AuthContext)

  const { data: userSetting, refetch: refetchSetting } = useQuery(
    userSettingQuery,
    {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
    },
  )

  const [rating, setRating] = React.useState<string | null>(null)

  const [isAdult, setIsAdult] = useState<string | null>(null)

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
    setRating(userSetting?.userSetting?.preferenceRating ?? null)
  }, [userSetting])

  const navigate = useNavigate()

  const onSave = async () => {
    if (!rating) return

    await updateUserSetting({
      variables: {
        input: {
          isAnonymousLike: isAnonymousLike,
          isAnonymousSensitiveLike: isAnonymousSensitiveLike,
          isNotifyComment: isNotifyComment,
          preferenceRating: rating as IntrospectionEnum<"PreferenceRating">,
        },
      },
    })
    toast("保存しました")

    navigate("/settings/completed")
  }

  const recommendedUsers = userSetting?.recommendedUsers ?? []

  return (
    <>
      <div className="container m-auto space-y-4">
        <p className="font-bold">{"あなたは18歳以上ですか？"}</p>
        <div className="flex space-x-2">
          <Button
            variant={isAdult === "YES" ? "default" : "secondary"}
            onClick={() => setIsAdult("YES")}
          >
            YES
          </Button>
          <Button
            variant={isAdult === "NO" ? "default" : "secondary"}
            onClick={() => {
              setIsAdult("NO")
              setRating(null) // Reset rating if changing to NO
            }}
          >
            NO
          </Button>
        </div>
        {isAdult && (
          <div className="space-y-4">
            <p className="text-sm">
              {
                "一覧に表示する作品の年齢区分を設定できます。一部ページでは反映されないのでご注意ください。"
              }
            </p>
            <ToggleGroup
              className="flex-wrap justify-start gap-x-2"
              value={isUpdatingUserSetting ? "" : rating ?? ""}
              onValueChange={(value) => setRating(value)}
              type="single"
            >
              <ToggleGroupItem value="G" aria-label="G">
                <p className="test-sm">全年齢</p>
              </ToggleGroupItem>
              <ToggleGroupItem value="R15" aria-label="R15">
                <p className="test-sm">全年齢+R15</p>
              </ToggleGroupItem>

              {isAdult === "YES" && (
                <>
                  <ToggleGroupItem value="R18" aria-label="R18">
                    <p className="test-sm">全年齢+R15+R18</p>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="R18G" aria-label="R18G">
                    <p className="test-sm">全年齢+R15+R18+R18-G</p>
                  </ToggleGroupItem>
                </>
              )}
            </ToggleGroup>
          </div>
        )}
        <Separator />
        <p className="font-bold">{"匿名いいね"}</p>
        <p className="text-sm">
          {
            "いいねしたときに、投稿者へ自身がいいねしたことを通知するかどうか変更できます"
          }
        </p>
        <p className="text-sm">
          {
            "匿名いいねに関わらず、いいねした作品は投稿者以外、閲覧することはできません"
          }
        </p>
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
        <Separator />
        <p className="font-bold">{"おすすめクリエイター"}</p>
        <p className="text-sm">
          {
            "フォローすることでタイムライン機能でお気に入りの作品をまとめて閲覧できます！"
          }
        </p>
        <p className="text-sm">{"どんどんフォローしてみましょう！"}</p>
        <Carousel className="w-full">
          <CarouselContent>
            {recommendedUsers.map((user) => (
              <CarouselItem
                className="h-full basis-1/2 md:basis-1/3 lg:basis-1/4"
                key={user.login}
              >
                <Card>
                  <CardContent>
                    <div className="flex h-full flex-col justify-center space-y-4 pt-4">
                      <div className="flex justify-center">
                        <Avatar>
                          <AvatarImage
                            src={IconUrl(user.iconUrl)}
                            alt={user.name}
                          />
                          <AvatarFallback />
                        </Avatar>
                      </div>
                      <p className="text-center">{user.name}</p>
                      <div className="flex w-auto justify-center">
                        <FollowButton isFollow={false} targetUserId={user.id} />
                      </div>
                      {/* <p>{user.description}</p> */}
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <Separator />
        <Button
          onClick={onSave}
          disabled={isUpdatingUserSetting || !rating}
          className="ml-auto block w-full text-center"
        >
          {isUpdatingUserSetting ? (
            <Loader2Icon className="m-auto h-4 w-4 animate-spin" />
          ) : (
            "完了"
          )}
        </Button>
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
    recommendedUsers(limit: 16, offset: 0) {
      id
      login
      name
      iconUrl
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
