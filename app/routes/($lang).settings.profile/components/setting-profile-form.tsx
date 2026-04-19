import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2Icon, Pencil, PlusIcon } from "lucide-react"
import { Suspense, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { CropImageField } from "~/components/crop-image-field"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { SelectCreatedSensitiveWorksDialog } from "~/routes/($lang).my._index/components/select-created-sensitive-works-dialog"
import {
  DialogWorkFragment,
  SelectCreatedWorksDialog,
} from "~/routes/($lang).my._index/components/select-created-works-dialog"
import { uploadPublicImage } from "~/utils/upload-public-image"
import {
  canUseUserAvatarFrame,
  toUserAvatarFramePassLabel,
} from "~/utils/user-avatar-frame"

/**
 * プロフィール設定フォーム
 */
export function SettingProfileForm() {
  const authContext = useContext(AuthContext)
  const t = useTranslation()

  const userId = authContext.userId?.toString() ?? ""

  const { data: user, loading } = useQuery(userQuery, {
    skip:
      authContext.isLoading || authContext.isNotLoggedIn || !authContext.userId,
    variables: {
      userId,
    },
    fetchPolicy: "cache-first",
  })

  const userInfo = user?.user

  // すべてのフックを条件なしで呼び出す
  const [userName, setUserName] = useState("")
  const [profile, setProfile] = useState("")
  const [enProfile, setEnProfile] = useState("")
  const [website, setWebsite] = useState("")
  const [instagram, setInstagram] = useState("")
  const [twitter, setTwitter] = useState("")
  const [github, setGithub] = useState("")
  const [mail, setMail] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const [headerImage, setHeaderImage] = useState("")
  const [selectedUserAvatarFrameId, setSelectedUserAvatarFrameId] = useState<
    string | null
  >(null)
  const [selectedPickupWorks, setSelectedPickupWorks] = useState<
    Array<{
      id: string
      title: string
      smallThumbnailImageURL: string
    }>
  >([])
  const [selectedPickupSensitiveWorks, setSelectedPickupSensitiveWorks] =
    useState<
      Array<{
        id: string
        title: string
        smallThumbnailImageURL: string
      }>
    >([])

  const { data: token } = useQuery(viewerTokenQuery)
  const { data: avatarFrameSettingsData } = useQuery(
    profileAvatarFrameSettingsQuery,
    {
      skip:
        authContext.isLoading ||
        authContext.isNotLoggedIn ||
        !authContext.userId,
      fetchPolicy: "cache-first",
    },
  )

  const [updateProfile, { loading: isUpdating }] = useMutation(
    updateUserProfileMutation,
  )
  const [updateUserSetting] = useMutation(updateUserSettingMutation)
  const profileAvatarFrameSettings = avatarFrameSettingsData

  // userInfoが取得されたらstateを初期化
  useEffect(() => {
    if (userInfo) {
      setUserName(userInfo.name || authContext.displayName || "")
      setProfile(userInfo.biography ?? "")
      setEnProfile(userInfo.enBiography ?? "")
      setWebsite(userInfo.siteURL ?? "")
      setInstagram(userInfo.instagramAccountId ?? "")
      setTwitter(userInfo.twitterAccountId ?? "")
      setGithub(userInfo.githubAccountId ?? "")
      setMail(userInfo.mailAddress ?? "")
      setSelectedPickupWorks(
        userInfo.featuredWorks?.map((work) => ({
          id: work.id,
          title: work.title,
          smallThumbnailImageURL: work.smallThumbnailImageURL,
        })) ?? [],
      )
      setSelectedPickupSensitiveWorks(
        userInfo.featuredSensitiveWorks?.map((work) => ({
          id: work.id,
          title: work.title,
          smallThumbnailImageURL: work.smallThumbnailImageURL,
        })) ?? [],
      )
    }
  }, [userInfo, authContext.displayName])

  useEffect(() => {
    setSelectedUserAvatarFrameId(
      avatarFrameSettingsData?.userSetting?.selectedUserAvatarFrame?.id ?? null,
    )
  }, [avatarFrameSettingsData])

  // ローディング状態をフック呼び出し後に確認
  if (loading || authContext.isLoading || authContext.isNotLoggedIn) {
    return <AppLoadingPage />
  }

  if (!userInfo) {
    return <AppLoadingPage />
  }

  const onSubmit = async () => {
    if (isUpdating || authContext.userId === null) {
      return
    }

    const iconUrl = profileImage
      ? await uploadPublicImage(profileImage, token?.viewer?.token)
      : null

    const headerUrl = headerImage
      ? await uploadPublicImage(headerImage, token?.viewer?.token)
      : null

    await updateProfile({
      variables: {
        input: {
          displayName: userName,
          biography: profile,
          enBiography: enProfile,
          homeUrl: website,
          instagramAccountId: instagram,
          twitterAccountId: twitter,
          githubAccountId: github,
          mailAddress: mail,
          ...(iconUrl && {
            iconUrl: iconUrl,
          }),
          ...(headerUrl && {
            headerImageUrl: headerUrl,
          }),
          featuredWorkIds: selectedPickupWorks.map((work) => work.id),
          featuredSensitiveWorkIds: selectedPickupSensitiveWorks.map(
            (work) => work.id,
          ),
        },
      },
      refetchQueries: [
        {
          query: userQuery,
          variables: {
            userId,
          },
        },
      ],
      awaitRefetchQueries: true,
    })

    await updateUserSetting({
      variables: {
        input: {
          selectedUserAvatarFrameId,
        },
      },
      refetchQueries: [{ query: profileAvatarFrameSettingsQuery }],
      awaitRefetchQueries: true,
    })

    toast(t("プロフィールを更新しました。", "Profile updated."))
  }

  const profileImageSrc =
    profileImage.length > 0 ? profileImage : userInfo?.iconUrl

  const headerImageSrc =
    headerImage.length > 0 ? headerImage : userInfo?.headerImageUrl

  const currentPassType =
    profileAvatarFrameSettings?.viewer?.currentPass?.type ?? null
  const avatarFrames = profileAvatarFrameSettings?.userAvatarFrames ?? []
  const selectedAvatarFrame =
    avatarFrames.find((frame) => frame.id === selectedUserAvatarFrameId) ??
    profileAvatarFrameSettings?.userSetting?.selectedUserAvatarFrame ??
    null
  const canUseAvatarFrames = canUseUserAvatarFrame(currentPassType, "LITE")

  return (
    <>
      <div className="space-y-4">
        <div className="justify-between">
          <div className="relative">
            {headerImageSrc ? (
              <img
                className="h-auto max-h-96 w-full object-cover"
                src={headerImageSrc}
                alt={t("ヘッダー画像", "Header Image")}
              />
            ) : (
              <div className="h-40 w-full bg-gray-700" />
            )}
            <div className="absolute bottom-[-24px] left-2 size-32">
              <UserAvatarWithFrame
                alt={t("プロフィール画像", "Profile Image")}
                frame={selectedAvatarFrame}
                sizeClassName="size-32"
                src={profileImageSrc}
              />

              <CropImageField
                isHidePreviewImage={false}
                cropWidth={240}
                cropHeight={240}
                onDeleteImage={() => {
                  setProfileImage("")
                }}
                onCropToBase64={(base64: string) => {
                  try {
                    setProfileImage(base64)
                  } catch (error) {
                    console.error("Error in onCropToBase64:", error)
                  }
                }}
                fileExtension={"webp"}
              >
                <Button
                  className="absolute top-0 right-0 size-8 rounded-full p-0"
                  variant={"secondary"}
                >
                  <Pencil className="size-4" />
                </Button>
              </CropImageField>
            </div>

            <CropImageField
              isHidePreviewImage={false}
              cropWidth={1200}
              cropHeight={627}
              onDeleteImage={() => {
                setHeaderImage("")
              }}
              onCropToBase64={setHeaderImage}
              fileExtension={"webp"}
            >
              <Button
                className="absolute top-1 right-1 size-8 rounded-full p-0"
                variant={"secondary"}
              >
                <Pencil className="size-4" />
              </Button>
            </CropImageField>
          </div>
          <p className="mt-8">
            {t(
              "プロフィール画像やヘッダー画像にR-18画像は掲載できません。",
              "R-18 images cannot be used for profile or header images.",
            )}
          </p>
        </div>

        <div className="flex flex-col justify-between space-y-2">
          <label className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {t("アイコン枠", "Avatar Frame")}
          </label>
          <div className="space-y-3 rounded-md border p-3">
            <p className="text-muted-foreground text-sm">
              {canUseAvatarFrames
                ? t(
                    "ライト以上のサブスクユーザはアイコン枠を選択できます。枠の内容はテーブル管理された一覧から読み込みます。",
                    "Lite and above subscribers can choose an avatar frame. The available frames are loaded from the managed frame table.",
                  )
                : t(
                    "アイコン枠の利用はライト以上のサブスクユーザ向け機能です。",
                    "Avatar frames are available for Lite and higher subscribers.",
                  )}
            </p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <button
                className="rounded-lg border p-3 text-left"
                disabled={!canUseAvatarFrames}
                onClick={() => setSelectedUserAvatarFrameId(null)}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <UserAvatarWithFrame
                    alt={t("枠なし", "No Frame")}
                    sizeClassName="size-14"
                    src={profileImageSrc}
                  />
                  <div>
                    <p className="font-medium">{t("枠なし", "No Frame")}</p>
                    <p className="text-muted-foreground text-xs">
                      {t("通常のアイコン表示", "Show the normal avatar")}
                    </p>
                  </div>
                </div>
              </button>
              {avatarFrames.map((frame) => {
                const isAllowed = canUseUserAvatarFrame(
                  currentPassType,
                  frame.requiredPassType,
                )

                return (
                  <button
                    key={frame.id}
                    className="rounded-lg border p-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!isAllowed}
                    onClick={() => setSelectedUserAvatarFrameId(frame.id)}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatarWithFrame
                        alt={frame.name}
                        frame={frame}
                        sizeClassName="size-14"
                        src={profileImageSrc}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium">{frame.name}</p>
                          <span className="rounded bg-secondary px-2 py-0.5 text-[10px]">
                            {toUserAvatarFramePassLabel(frame.requiredPassType)}+
                          </span>
                        </div>
                        {frame.description && (
                          <p className="line-clamp-2 text-muted-foreground text-xs">
                            {frame.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between space-y-2">
          <label
            htmlFor="nickname"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("ニックネーム", "Nickname")}
          </label>
          <input
            type="text"
            id="nickname"
            maxLength={32}
            minLength={1}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="rounded-md border px-2 py-1"
          />
        </div>
        <div className="flex flex-col justify-between space-y-2">
          <label
            htmlFor="profile"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("プロフィール", "Profile")}
          </label>
          <AutoResizeTextarea
            id="profile"
            className="rounded-md border px-2 py-1"
            maxLength={320}
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
          />
        </div>
        <div className="flex flex-col justify-between space-y-2">
          <label
            htmlFor="enProfile"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("英語プロフィール", "English Profile")}
          </label>
          <AutoResizeTextarea
            id="enProfile"
            className="rounded-md border px-2 py-1"
            maxLength={640}
            value={enProfile}
            onChange={(e) => setEnProfile(e.target.value)}
          />
        </div>

        <div className="flex flex-col justify-between space-y-2">
          <label
            htmlFor="website"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("Webサイト", "Website")}
          </label>
          <input
            type="text"
            id="website"
            className="rounded-md border px-2 py-1"
            value={website}
            maxLength={1000}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
        <div className="flex flex-col justify-between space-y-2">
          <label
            htmlFor="instagram"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {"Instagram"}
          </label>
          <input
            type="text"
            id="instagram"
            className="rounded-md border px-2 py-1"
            value={instagram}
            placeholder={"@"}
            maxLength={255}
            onChange={(e) => setInstagram(e.target.value)}
          />
        </div>
        <div className="flex flex-col justify-between space-y-2">
          <label
            htmlFor="twitter"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("X(旧Twitter)", "X (formerly Twitter)")}
          </label>
          <input
            type="text"
            id="twitter"
            className="rounded-md border px-2 py-1"
            value={twitter}
            placeholder={"@"}
            maxLength={255}
            onChange={(e) => setTwitter(e.target.value)}
          />
        </div>
        <div className="flex flex-col justify-between space-y-2">
          <label
            htmlFor="github"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {"Github"}
          </label>
          <input
            type="text"
            id="github"
            className="rounded-md border px-2 py-1"
            value={github}
            placeholder={"@"}
            maxLength={255}
            onChange={(e) => setGithub(e.target.value)}
          />
        </div>
        <div className="flex flex-col justify-between space-y-2">
          <label
            htmlFor="mail"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("メールアドレス", "Email Address")}
          </label>
          <input
            type="text"
            id="mail"
            className="rounded-md border px-2 py-1"
            value={mail}
            placeholder={""}
            maxLength={320}
            onChange={(e) => setMail(e.target.value)}
          />
        </div>
        <div className="flex flex-col justify-between space-y-2">
          <label
            htmlFor="pickup"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("ピックアップ ※最大3つ", "Pickups (Max 3)")}
          </label>
          <Suspense fallback={<AppLoadingPage />}>
            <SelectCreatedWorksDialog
              selectedWorks={selectedPickupWorks}
              setSelectedWorks={setSelectedPickupWorks}
              limit={3}
            >
              <div className="border-2 border-transparent p-1">
                <Button className="size-16" size={"icon"} variant={"secondary"}>
                  <PlusIcon />
                </Button>
              </div>
            </SelectCreatedWorksDialog>
          </Suspense>
        </div>
        <div className="flex flex-col justify-between space-y-2">
          <label
            htmlFor="sensitive-pickup"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t(
              "センシティブピックアップ ※最大3つ",
              "Sensitive Pickups (Max 3)",
            )}
          </label>
          <Suspense fallback={<AppLoadingPage />}>
            <SelectCreatedSensitiveWorksDialog
              selectedWorks={selectedPickupSensitiveWorks}
              setSelectedWorks={setSelectedPickupSensitiveWorks}
              limit={3}
            >
              <div className="border-2 border-transparent p-1">
                <Button className="size-16" size={"icon"} variant={"secondary"}>
                  <PlusIcon />
                </Button>
              </div>
            </SelectCreatedSensitiveWorksDialog>
          </Suspense>
        </div>
        <Separator />
        <Button
          disabled={isUpdating}
          onClick={onSubmit}
          className="ml-auto block w-24"
        >
          {isUpdating ? (
            <Loader2Icon className="m-auto size-4 animate-spin" />
          ) : (
            t("更新する", "Update")
          )}
        </Button>
        <Separator />
        <a className="m-auto block" href="settings/account/login">
          <Button className="m-auto block" variant={"secondary"}>
            {t("ログイン情報を変更する", "Change Login Information")}
          </Button>
        </a>
      </div>
    </>
  )
}

const userQuery = graphql(
  `query User(
    $userId: ID!,
  ) {
    user(id: $userId) {
      id
      biography
      login
      nanoid
      name
      iconUrl
      headerImageUrl
      featuredSensitiveWorks {
        ...DialogWork
      }
      featuredWorks {
        ...DialogWork
      }
      enBiography
      instagramAccountId
      twitterAccountId
      githubAccountId
      siteURL
      mailAddress
    }
  }`,
  [DialogWorkFragment],
)

const viewerTokenQuery = graphql(
  `query ViewerToken {
    viewer {
      id
      token
    }
  }`,
)

const profileAvatarFrameSettingsQuery = graphql(
  `query ProfileAvatarFrameSettings {
    viewer {
      id
      currentPass {
        id
        type
      }
    }
    userSetting {
      id
      selectedUserAvatarFrame {
        id
        name
        description
        requiredPassType
        frameType
        backgroundStyle
        overlayImageUrl
        borderPadding
      }
    }
    userAvatarFrames {
      id
      name
      description
      requiredPassType
      frameType
      backgroundStyle
      overlayImageUrl
      borderPadding
    }
  }`,
)

const updateUserSettingMutation = graphql(
  `mutation UpdateUserSetting($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      id
      selectedUserAvatarFrame {
        id
      }
    }
  }`,
)

const updateUserProfileMutation = graphql(
  `mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      name
    }
  }`,
)
