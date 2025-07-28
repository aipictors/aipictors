import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { CropImageField } from "~/components/crop-image-field"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { DialogWorkFragment } from "~/routes/($lang).my._index/components/select-created-works-dialog"
import { useQuery, useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2Icon, Pencil } from "lucide-react"
import { useContext, useState } from "react"
import { useMutation } from "@apollo/client/index"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { toast } from "sonner"
import { Card, CardContent } from "~/components/ui/card"
import { useNavigate } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"

/**
 * プロフィール設定フォーム
 */
export function ProfileEditorForm() {
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const { data: user } = useSuspenseQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: authContext.userId?.toString() ?? "",
    },
    fetchPolicy: "cache-first",
  })

  const navigate = useNavigate()

  const userInfo = user?.user

  const [userName, setUserName] = useState(userInfo?.name ?? "")

  const [profile, setProfile] = useState(userInfo?.biography ?? "")

  const [enProfile, setEnProfile] = useState(userInfo?.enBiography ?? "")

  const [website, setWebsite] = useState(userInfo?.siteURL ?? "")

  const [instagram, setInstagram] = useState(userInfo?.instagramAccountId ?? "")

  const [twitter, setTwitter] = useState(userInfo?.twitterAccountId ?? "")

  const [github, setGithub] = useState(userInfo?.githubAccountId ?? "")

  const [mail, setMail] = useState(userInfo?.mailAddress ?? "")

  const [profileImage, setProfileImage] = useState("")

  const [headerImage, setHeaderImage] = useState("")

  const { data: token, refetch: tokenRefetch } = useQuery(viewerTokenQuery)

  const [selectedPickupWorks, _setSelectedPickupWorks] = useState(
    userInfo?.featuredWorks ?? [],
  )

  const [selectedPickupSensitiveWorks, _setSelectedPickupSensitiveWorks] =
    useState(userInfo?.featuredSensitiveWorks ?? [])

  const [updateProfile, { loading: isUpdating }] = useMutation(
    updateUserProfileMutation,
  )

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
    })

    toast(t("プロフィールを更新しました。", "Profile updated."))

    navigate("/new/settings")
  }

  const profileImageSrc =
    profileImage.length > 0 ? profileImage : userInfo?.iconUrl

  const headerImageSrc =
    headerImage.length > 0 ? headerImage : userInfo?.headerImageUrl

  return (
    <>
      <div className="container m-auto space-y-4">
        <Card>
          <CardContent className="m-0 p-4 text-xl">
            <p>{t("Aipictorsへようこそ！", "Welcome to Aipictors!")}</p>
            <p>
              {t(
                "Aipictorsで使用するプロフィールを設定しましょう！",
                "Let's set up your profile for Aipictors!",
              )}
            </p>
            <p>
              {t(
                "プロフィールを設定することで様々な機能をご利用いただけます！",
                "By setting up your profile, you can use various features!",
              )}
            </p>
            <p>
              {t(
                "設定から内容はいつでも変更できます",
                "You can change these settings anytime.",
              )}
            </p>
          </CardContent>
        </Card>
        <div className="justify-between">
          <div className="relative">
            {headerImageSrc ? (
              <img
                className="h-auto max-h-64 w-full object-cover"
                src={headerImageSrc}
                alt="header"
              />
            ) : (
              <div className="h-40 w-full bg-gray-700" />
            )}
            <div className="absolute bottom-[-24px] left-2 size-32">
              {profileImageSrc ? (
                <img
                  className="absolute size-32 rounded-full border-2"
                  src={profileImageSrc}
                  alt="header"
                />
              ) : (
                <div className="size-32 rounded-full border-2 bg-gray-700" />
              )}

              <CropImageField
                isHidePreviewImage={false}
                cropWidth={240}
                cropHeight={240}
                onDeleteImage={() => {
                  setProfileImage("")
                }}
                onCropToBase64={(base64: string) => {
                  try {
                    console.log("base64", base64)
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
              "You cannot upload R-18 images as profile or header images.",
            )}
          </p>
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
            defaultValue="Aipictors/AIイラスト投稿サイト・AI小説投稿サイト・AI絵"
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
          <p className="font-semibold">
            {t("SNSリンク（@マークは不要）", "SNS Links (without @)")}
          </p>
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
            {t("X(旧Twitter)", "X(formerly Twitter)")}
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
        <Separator />
        <Button
          disabled={isUpdating}
          onClick={onSubmit}
          className="ml-auto block w-full"
        >
          {isUpdating ? (
            <Loader2Icon className="m-auto size-4 animate-spin" />
          ) : (
            <p>{t("次へ", "Next")}</p>
          )}
        </Button>
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
      headerImageUrl
      featuredSensitiveWorks {
        ...DialogWork
      }
      featuredWorks {
        ...DialogWork
      }
      biography
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

const updateUserProfileMutation = graphql(
  `mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      name
    }
  }`,
)
