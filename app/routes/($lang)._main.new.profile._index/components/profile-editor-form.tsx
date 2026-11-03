import { useMutation, useQuery, useSuspenseQuery } from "@apollo/client/index"
import { useNavigate } from "~/lib/app/locale-router"
import { graphql } from "gql.tada"
import { Loader2Icon, Pencil } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { CropImageField } from "~/components/crop-image-field"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { DialogWorkFragment } from "~/routes/($lang).my._index/components/select-created-works-dialog"
import { uploadPublicImage } from "~/utils/upload-public-image"

/**
 * プロフィール設定フォーム
 */
export function ProfileEditorForm() {
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const userId = authContext.userId?.toString() ?? ""

  const { data: user } = useSuspenseQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId,
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

    toast(t("プロフィールを更新しました。", "Profile updated."))

    navigate("/new/settings")
  }

  const profileImageSrc =
    profileImage.length > 0 ? profileImage : userInfo?.iconUrl

  const headerImageSrc =
    headerImage.length > 0 ? headerImage : userInfo?.headerImageUrl

  return (
    <>
      <div className="container mx-auto max-w-4xl space-y-8 p-6">
        {/* ウェルカムセクション */}
        <div className="rounded-xl border border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 p-8">
          <div className="space-y-4 text-center">
            <h1 className="font-bold text-3xl text-gray-800">
              {t("Aipictorsへようこそ！", "Welcome to Aipictors!")}
            </h1>
            <p className="text-gray-600 text-lg">
              {t(
                "日本最大級のAIイラスト・小説投稿サイトです",
                "Japan's largest AI illustration and novel posting site",
              )}
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-gray-100 bg-white p-4">
                <div className="mb-2 text-2xl text-blue-500">🎨</div>
                <h3 className="font-semibold text-gray-800">
                  {t("作品投稿", "Post Artwork")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t(
                    "AIイラストや小説を投稿して、多くの人に見てもらおう",
                    "Share your AI artwork and novels with many people",
                  )}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-white p-4">
                <div className="mb-2 text-2xl text-green-500">👥</div>
                <h3 className="font-semibold text-gray-800">
                  {t("コミュニティ", "Community")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t(
                    "他のクリエイターとつながり、お互いの作品を楽しもう",
                    "Connect with other creators and enjoy each other's work",
                  )}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-white p-4">
                <div className="mb-2 text-2xl text-purple-500">🏆</div>
                <h3 className="font-semibold text-gray-800">
                  {t("コンテスト", "Contests")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t(
                    "定期的に開催されるコンテストに参加して腕試し",
                    "Participate in regular contests to test your skills",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* プロフィール設定説明 */}
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
          <h2 className="mb-4 font-bold text-gray-800 text-xl">
            {t("プロフィール設定について", "About Profile Setup")}
          </h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-sm text-white">
                1
              </span>
              <p>
                {t(
                  "ニックネームやプロフィール画像を設定して、あなたらしさを表現しましょう",
                  "Set your nickname and profile image to express yourself",
                )}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-sm text-white">
                2
              </span>
              <p>
                {t(
                  "プロフィール文章で自己紹介や興味のあることを書いてみましょう",
                  "Write a self-introduction and your interests in your profile",
                )}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-sm text-white">
                3
              </span>
              <p>
                {t(
                  "SNSアカウントを連携して、より多くの人とつながりましょう",
                  "Link your SNS accounts to connect with more people",
                )}
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-blue-800 text-sm">
              💡{" "}
              {t(
                "すべての項目は後から設定画面で変更できるので、まずは気軽に設定してみてください",
                "All items can be changed later in the settings, so feel free to start with basic setup",
              )}
            </p>
          </div>
        </div>
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

const updateUserProfileMutation = graphql(
  `mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      name
    }
  }`,
)
