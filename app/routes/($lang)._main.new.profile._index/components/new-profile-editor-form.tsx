import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { CropImageField } from "~/components/crop-image-field"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { OnboardingSteps } from "~/components/onboarding-steps"
import { LoginPage } from "~/components/page/login-page"
import { AuthContext } from "~/contexts/auth-context"
import { DialogWorkFragment } from "~/routes/($lang).my._index/components/select-created-works-dialog"
import { useQuery, useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import {
  ChevronDownIcon,
  Loader2Icon,
  Pencil,
  UserRoundIcon,
} from "lucide-react"
import { useContext, useState, useId } from "react"
import { useMutation } from "@apollo/client/index"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { toast } from "sonner"
import { useNavigate } from "~/lib/app/locale-router"
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

    try {
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

      navigate("/new/settings")
    } catch (error) {
      // 失敗しても入力は残す
      toast(
        error instanceof Error
          ? error.message
          : t("保存できませんでした。", "Could not save."),
      )
    }
  }

  const profileImageSrc =
    profileImage.length > 0 ? profileImage : userInfo?.iconUrl
  const headerImageSrc =
    headerImage.length > 0 ? headerImage : userInfo?.headerImageUrl

  if (authContext.isNotLoggedIn) {
    return <LoginPage />
  }

  const isNameEmpty = userName.trim().length === 0

  return (
    <form
      className="mx-auto w-full max-w-lg space-y-5 px-3 pt-4 pb-28 md:pt-8"
      onSubmit={(event) => {
        event.preventDefault()
        void onSubmit()
      }}
    >
      <OnboardingSteps current={1} />

      <div className="space-y-1">
        <h1 className="font-bold text-2xl">
          {t("Aipictorsへようこそ！", "Welcome to Aipictors!")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t(
            "まずは名前を決めましょう。ほかの項目はあとからいつでも変えられます。",
            "Start by choosing a name. You can change everything later.",
          )}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative size-24 shrink-0">
          {profileImageSrc ? (
            <img
              className="size-24 rounded-full border bg-muted object-cover"
              src={profileImageSrc}
              alt=""
            />
          ) : (
            <div className="flex size-24 items-center justify-center rounded-full border border-dashed bg-muted text-muted-foreground">
              <UserRoundIcon className="size-10" />
            </div>
          )}
          <CropImageField
            isHidePreviewImage={false}
            cropWidth={240}
            cropHeight={240}
            onDeleteImage={() => setProfileImage("")}
            onCropToBase64={setProfileImage}
            fileExtension={"webp"}
          >
            <Button
              type="button"
              size="icon"
              aria-label={t("アイコンを変更", "Change icon")}
              className="absolute right-0 bottom-0 size-8 rounded-full shadow"
            >
              <Pencil className="size-4" />
            </Button>
          </CropImageField>
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <label htmlFor={nicknameId} className="font-medium text-sm">
            {t("ニックネーム", "Nickname")}{" "}
            <span className="text-destructive text-xs">
              {t("必須", "Required")}
            </span>
          </label>
          <Input
            id={nicknameId}
            autoFocus
            required
            maxLength={32}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder={t("みんなに表示される名前", "Name shown to everyone")}
            className="h-12 rounded-xl text-base md:text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={profileId} className="font-medium text-sm">
          {t("自己紹介", "About you")}{" "}
          <span className="font-normal text-muted-foreground text-xs">
            {t("任意", "Optional")}
          </span>
        </label>
        <AutoResizeTextarea
          id={profileId}
          className="w-full rounded-xl border bg-background px-3 py-3 text-base md:text-sm"
          maxLength={320}
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          placeholder={t(
            "好きなジャンルや、作っているものなど",
            "What you like or make",
          )}
        />
      </div>

      <details className="group rounded-xl border">
        <summary className="flex h-12 cursor-pointer list-none items-center justify-between px-4 font-medium text-sm [&::-webkit-details-marker]:hidden">
          {t("もっと設定する（任意）", "More options (optional)")}
          <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-4 border-t p-4">
          <div className="space-y-1.5">
            <p className="font-medium text-sm">
              {t("ヘッダー画像", "Header image")}
            </p>
            <div className="relative">
              {headerImageSrc ? (
                <img
                  className="h-28 w-full rounded-lg object-cover"
                  src={headerImageSrc}
                  alt=""
                />
              ) : (
                <div className="h-28 w-full rounded-lg bg-muted" />
              )}
              <CropImageField
                isHidePreviewImage={false}
                cropWidth={1200}
                cropHeight={627}
                onDeleteImage={() => setHeaderImage("")}
                onCropToBase64={setHeaderImage}
                fileExtension={"webp"}
              >
                <Button
                  type="button"
                  size="icon"
                  aria-label={t("ヘッダー画像を変更", "Change header image")}
                  className="absolute top-2 right-2 size-8 rounded-full shadow"
                >
                  <Pencil className="size-4" />
                </Button>
              </CropImageField>
            </div>
            <p className="text-muted-foreground text-xs">
              {t(
                "アイコンとヘッダーに R-18 の画像は使えません。",
                "R-18 images cannot be used for your icon or header.",
              )}
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor={enProfileId} className="font-medium text-sm">
              {t("英語の自己紹介", "About you in English")}
            </label>
            <AutoResizeTextarea
              id={enProfileId}
              className="w-full rounded-xl border bg-background px-3 py-3 text-base md:text-sm"
              maxLength={640}
              value={enProfile}
              onChange={(e) => setEnProfile(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor={websiteId} className="font-medium text-sm">
              {t("Webサイト", "Website")}
            </label>
            <Input
              type="url"
              id={websiteId}
              inputMode="url"
              maxLength={1000}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://"
              className="h-12 rounded-xl text-base md:text-sm"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ["X", twitterId, twitter, setTwitter],
                ["Instagram", instagramId, instagram, setInstagram],
                ["GitHub", githubId, github, setGithub],
              ] as const
            ).map(([label, id, value, setValue]) => (
              <div key={label} className="space-y-1.5">
                <label htmlFor={id} className="font-medium text-sm">
                  {label}
                </label>
                <Input
                  id={id}
                  autoCapitalize="none"
                  maxLength={255}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={t("ユーザー名", "Username")}
                  className="h-12 rounded-xl text-base md:text-sm"
                />
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label htmlFor={mailId} className="font-medium text-sm">
              {t("公開するメールアドレス", "Public email address")}
            </label>
            <Input
              type="email"
              id={mailId}
              autoCapitalize="none"
              maxLength={320}
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              className="h-12 rounded-xl text-base md:text-sm"
            />
            <p className="text-muted-foreground text-xs">
              {t(
                "入力するとプロフィールに表示されます。",
                "Shown on your profile if you enter one.",
              )}
            </p>
          </div>
        </div>
      </details>

      {/* スマホでも長いスクロールなしで押せるように、次へは画面の下に固定する */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto max-w-lg">
          <Button
            type="submit"
            disabled={isUpdating || isNameEmpty}
            className="h-12 w-full rounded-xl font-semibold"
          >
            {isUpdating ? (
              <Loader2Icon className="size-5 animate-spin" />
            ) : (
              t("次へ", "Next")
            )}
          </Button>
        </div>
      </div>
    </form>
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
