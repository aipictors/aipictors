import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { CropImageField } from "~/components/crop-image-field"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { DialogWorkFragment } from "~/routes/($lang).my._index/components/select-created-works-dialog"
import { useQuery, useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2Icon, Pencil } from "lucide-react"
import { useContext, useState, useId } from "react"
import { useMutation } from "@apollo/client/index"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { toast } from "sonner"
import { useNavigate } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"

/**
 * 新しいプロフィール設定フォーム
 */
export function NewProfileEditorForm() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const navigate = useNavigate()

  // Generate unique IDs for form elements
  const nicknameId = useId()
  const profileId = useId()
  const enProfileId = useId()
  const websiteId = useId()
  const instagramId = useId()
  const twitterId = useId()
  const githubId = useId()
  const mailId = useId()

  const { data: user } = useSuspenseQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: authContext.userId?.toString() ?? "",
    },
    fetchPolicy: "cache-first",
  })

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

  const { data: token } = useQuery(viewerTokenQuery)
  const [selectedPickupWorks] = useState(userInfo?.featuredWorks ?? [])
  const [selectedPickupSensitiveWorks] = useState(
    userInfo?.featuredSensitiveWorks ?? [],
  )
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
          ...(iconUrl && { iconUrl }),
          ...(headerUrl && { headerImageUrl: headerUrl }),
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
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* ウェルカムセクション */}
      <div className="rounded-xl border border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 p-8 dark:border-gray-700 dark:from-blue-900/30 dark:to-purple-900/30">
        <div className="space-y-4 text-center">
          <h1 className="font-bold text-3xl text-gray-800 dark:text-gray-100">
            {t("Aipictorsへようこそ！", "Welcome to Aipictors!")}
          </h1>
          <p className="text-gray-600 text-lg dark:text-gray-300">
            {t(
              "日本最大級のAIイラスト・小説投稿サイトです",
              "Japan's largest AI illustration and novel posting site",
            )}
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 text-2xl text-blue-500">🎨</div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                {t("作品投稿", "Post Artwork")}
              </h3>
              <p className="text-gray-600 text-sm dark:text-gray-300">
                {t(
                  "AIイラストや小説を投稿して、多くの人に見てもらおう",
                  "Share your AI artwork and novels with many people",
                )}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 text-2xl text-green-500">👥</div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                {t("コミュニティ", "Community")}
              </h3>
              <p className="text-gray-600 text-sm dark:text-gray-300">
                {t(
                  "他のクリエイターとつながり、お互いの作品を楽しもう",
                  "Connect with other creators and enjoy each other's work",
                )}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 text-2xl text-purple-500">🏆</div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                {t("コンテスト", "Contests")}
              </h3>
              <p className="text-gray-600 text-sm dark:text-gray-300">
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
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-600 dark:bg-yellow-900/30">
        <h2 className="mb-4 font-bold text-gray-800 text-xl dark:text-gray-100">
          {t("プロフィール設定について", "About Profile Setup")}
        </h2>
        <div className="space-y-3 text-gray-700 dark:text-gray-300">
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
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-600 dark:bg-blue-900/30">
          <p className="text-blue-800 text-sm dark:text-blue-200">
            💡{" "}
            {t(
              "すべての項目は後から設定画面で変更できるので、まずは気軽に設定してみてください",
              "All items can be changed later in the settings, so feel free to start with basic setup",
            )}
          </p>
        </div>
      </div>

      {/* プロフィール画像設定 */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="p-6">
          <h2 className="mb-4 font-bold text-gray-800 text-xl dark:text-gray-100">
            {t("プロフィール画像・ヘッダー画像", "Profile & Header Images")}
          </h2>
          <div className="relative">
            {headerImageSrc ? (
              <img
                className="h-auto max-h-64 w-full rounded-lg object-cover"
                src={headerImageSrc}
                alt="header"
              />
            ) : (
              <div className="flex h-40 w-full items-center justify-center rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                <p className="text-gray-500 dark:text-gray-400">
                  {t("ヘッダー画像をアップロード", "Upload header image")}
                </p>
              </div>
            )}
            <div className="absolute bottom-[-24px] left-6 size-32">
              {profileImageSrc ? (
                <img
                  className="absolute size-32 rounded-full border-4 border-white bg-white"
                  src={profileImageSrc}
                  alt="profile"
                />
              ) : (
                <div className="flex size-32 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-gray-100 to-gray-200 dark:border-gray-800 dark:from-gray-700 dark:to-gray-600">
                  <span className="text-center text-gray-500 text-sm dark:text-gray-400">
                    {t("プロフィール", "Profile")}
                  </span>
                </div>
              )}

              <CropImageField
                isHidePreviewImage={false}
                cropWidth={240}
                cropHeight={240}
                onDeleteImage={() => setProfileImage("")}
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
                  className="absolute top-0 right-0 size-8 rounded-full bg-blue-500 p-0 hover:bg-blue-600"
                  variant={"secondary"}
                >
                  <Pencil className="size-4 text-white" />
                </Button>
              </CropImageField>
            </div>

            <CropImageField
              isHidePreviewImage={false}
              cropWidth={1200}
              cropHeight={627}
              onDeleteImage={() => setHeaderImage("")}
              onCropToBase64={setHeaderImage}
              fileExtension={"webp"}
            >
              <Button
                className="absolute top-1 right-1 size-8 rounded-full bg-blue-500 p-0 hover:bg-blue-600"
                variant={"secondary"}
              >
                <Pencil className="size-4 text-white" />
              </Button>
            </CropImageField>
          </div>
          <div className="mt-8 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-600 dark:bg-orange-900/30">
            <p className="text-orange-800 text-sm dark:text-orange-200">
              ⚠️{" "}
              {t(
                "プロフィール画像やヘッダー画像にR-18画像は掲載できません。",
                "R-18 images cannot be used for profile or header images.",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 基本情報設定 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-6 font-bold text-gray-800 text-xl dark:text-gray-100">
          {t("基本情報", "Basic Information")}
        </h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor={nicknameId}
              className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t("ニックネーム", "Nickname")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id={nicknameId}
              maxLength={32}
              minLength={1}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder={t(
                "あなたのニックネームを入力",
                "Enter your nickname",
              )}
            />
            <p className="text-gray-500 text-sm">
              {t(
                "他のユーザーに表示される名前です",
                "This is the name displayed to other users",
              )}
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={profileId}
              className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t("プロフィール", "Profile")}
            </label>
            <AutoResizeTextarea
              id={profileId}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              maxLength={320}
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              placeholder={t(
                "自己紹介や好きなことを書いてみましょう",
                "Write about yourself and your interests",
              )}
            />
            <p className="text-gray-500 text-sm">
              {t("最大320文字まで", "Up to 320 characters")}
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={enProfileId}
              className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t("英語プロフィール", "English Profile")}
            </label>
            <AutoResizeTextarea
              id={enProfileId}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              maxLength={640}
              value={enProfile}
              onChange={(e) => setEnProfile(e.target.value)}
              placeholder={t(
                "英語での自己紹介（オプション）",
                "Self-introduction in English (optional)",
              )}
            />
            <p className="text-gray-500 text-sm">
              {t(
                "海外のユーザーにも読んでもらえます",
                "International users can read this",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 連絡先・SNS設定 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-6 font-bold text-gray-800 text-xl dark:text-gray-100">
          {t("連絡先・SNSアカウント", "Contact & Social Media")}
        </h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor={websiteId}
              className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t("Webサイト", "Website")}
            </label>
            <input
              type="url"
              id={websiteId}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={website}
              maxLength={1000}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://your-website.com"
            />
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-600 dark:bg-blue-900/30">
            <h3 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">
              {t("SNSアカウント", "Social Media Accounts")}
            </h3>
            <p className="mb-4 text-gray-600 text-sm dark:text-gray-300">
              {t(
                "@マークは不要です。ユーザー名のみ入力してください",
                "No @ symbol needed. Enter username only",
              )}
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor={instagramId}
                  className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  📷 Instagram
                </label>
                <input
                  type="text"
                  id={instagramId}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={instagram}
                  placeholder="your_username"
                  maxLength={255}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={twitterId}
                  className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  🐦 {t("X(旧Twitter)", "X (formerly Twitter)")}
                </label>
                <input
                  type="text"
                  id={twitterId}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={twitter}
                  placeholder="your_username"
                  maxLength={255}
                  onChange={(e) => setTwitter(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={githubId}
                  className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  💻 GitHub
                </label>
                <input
                  type="text"
                  id={githubId}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={github}
                  placeholder="your_username"
                  maxLength={255}
                  onChange={(e) => setGithub(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={mailId}
              className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t("メールアドレス", "Email Address")}
            </label>
            <input
              type="email"
              id={mailId}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={mail}
              placeholder="your@email.com"
              maxLength={320}
              onChange={(e) => setMail(e.target.value)}
            />
            <p className="text-gray-500 text-sm">
              {t(
                "マイページ表示向けのため任意",
                "Optional for display on your profile page",
              )}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* 送信ボタン */}
      <div className="rounded-xl border border-green-200 bg-green-50 p-6">
        <div className="text-center">
          <h3 className="mb-2 font-bold text-gray-800 text-lg">
            {t("準備完了です！", "Ready to get started!")}
          </h3>
          <p className="mb-6 text-gray-600">
            {t(
              "次は表示設定を行います",
              "Next, we'll set up display preferences",
            )}
          </p>
          <Button
            disabled={isUpdating}
            onClick={onSubmit}
            className="h-12 w-full rounded-lg bg-blue-600 font-semibold text-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isUpdating ? (
              <div className="flex items-center gap-2">
                <Loader2Icon className="size-5 animate-spin" />
                {t("保存中...", "Saving...")}
              </div>
            ) : (
              t("次のステップへ", "Continue to Next Step")
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

const userQuery = graphql(
  `query User($userId: ID!) {
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
