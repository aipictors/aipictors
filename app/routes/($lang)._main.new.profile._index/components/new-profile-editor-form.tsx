import { useMutation, useQuery, useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import {
  CameraIcon,
  CheckIcon,
  ChevronDownIcon,
  ImagePlusIcon,
  UserRoundIcon,
} from "lucide-react"
import { useContext, useId, useState } from "react"
import { toast } from "sonner"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { CropImageField } from "~/components/crop-image-field"
import { OnboardingHero } from "~/components/onboarding-hero"
import { OnboardingNextButton } from "~/components/onboarding-next-button"
import { OnboardingSteps } from "~/components/onboarding-steps"
import { LoginPage } from "~/components/page/login-page"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { useNavigate } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { DialogWorkFragment } from "~/routes/($lang).my._index/components/select-created-works-dialog"
import { logoutFirebase } from "~/utils/auth-session-backup"
import { clearLastLoginMethod } from "~/utils/login-flow"
import { resetCookieLoginToken } from "~/utils/reset-cookie-login-token"
import { uploadPublicImage } from "~/utils/upload-public-image"

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

  // 前とは違う方法でログインすると新しいアカウントになるので、選び直せるようにする
  const onChooseAnotherMethod = async () => {
    try {
      await logoutFirebase()
      resetCookieLoginToken()
      clearLastLoginMethod()
    } catch {
      toast(t("ログアウトできませんでした。", "Could not log out."))
    }
  }

  const profileImageSrc =
    profileImage.length > 0 ? profileImage : userInfo?.iconUrl
  const headerImageSrc =
    headerImage.length > 0 ? headerImage : userInfo?.headerImageUrl

  if (authContext.isNotLoggedIn) {
    return <LoginPage />
  }

  const trimmedName = userName.trim()
  const isNameEmpty = trimmedName.length === 0

  return (
    <form
      className="mx-auto w-full max-w-lg space-y-5 px-3 pt-4 pb-28 md:pt-8"
      onSubmit={(event) => {
        event.preventDefault()
        void onSubmit()
      }}
    >
      <OnboardingSteps current={1} />

      <OnboardingHero
        pose={isNameEmpty ? "wow" : "nice"}
        line={
          isNameEmpty
            ? t("はじめまして！", "Nice to meet you!")
            : t(`${trimmedName}さん、よろしくね！`, `Hi, ${trimmedName}!`)
        }
        title={t("Aipictorsへようこそ！", "Welcome to Aipictors!")}
        description={t(
          "あなたのページを作りましょう。名前だけ決めれば、ほかはあとからでOK。",
          "Let's set up your page. Just pick a name; the rest can wait.",
        )}
      />

      {/* 入力がそのまま映る、自分のページの見本 */}
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="relative aspect-[3/1] w-full overflow-hidden bg-gradient-to-r from-cyan-200 via-teal-100 to-orange-200 dark:from-cyan-900 dark:via-teal-900 dark:to-orange-900">
          {headerImageSrc ? (
            <img
              className="absolute inset-0 size-full object-cover"
              src={headerImageSrc}
              alt=""
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center font-medium text-teal-900/50 text-xs dark:text-white/40">
              {t("ヘッダー画像（任意）", "Header image (optional)")}
            </span>
          )}
          <span className="absolute top-2 left-2 rounded-full bg-black/45 px-2 py-0.5 font-semibold text-[10px] text-white backdrop-blur-sm">
            {t("あなたのページ", "Your page")}
          </span>
          <CropImageField
            isHidePreviewImage={false}
            cropWidth={1200}
            cropHeight={400}
            onDeleteImage={() => setHeaderImage("")}
            onCropToBase64={setHeaderImage}
            fileExtension={"webp"}
          >
            <Button
              type="button"
              size="icon"
              variant="secondary"
              aria-label={t("ヘッダー画像を変更", "Change header image")}
              className="absolute top-2 right-2 size-8 rounded-full shadow"
            >
              <ImagePlusIcon className="size-4" />
            </Button>
          </CropImageField>
        </div>

        <div className="relative px-4 pb-4">
          <div className="-mt-10 relative size-20">
            {profileImageSrc ? (
              <img
                className="size-20 rounded-full border-4 border-card bg-muted object-cover shadow"
                src={profileImageSrc}
                alt=""
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-full border-4 border-card bg-gradient-to-br from-cyan-100 to-orange-100 text-teal-600/70 shadow dark:from-cyan-900 dark:to-orange-900">
                <UserRoundIcon className="size-9" />
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
                className="-right-1 absolute bottom-0 size-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow hover:opacity-90"
              >
                <CameraIcon className="size-4" />
              </Button>
            </CropImageField>
          </div>
          <p
            className={cn(
              "mt-2 truncate font-bold text-xl",
              isNameEmpty && "text-muted-foreground/50",
            )}
          >
            {isNameEmpty ? t("あなたの名前", "Your name") : trimmedName}
          </p>
          <p
            className={cn(
              "mt-1 line-clamp-2 whitespace-pre-wrap text-sm",
              profile.trim().length === 0
                ? "text-muted-foreground/50"
                : "text-muted-foreground",
            )}
          >
            {profile.trim().length === 0
              ? t("自己紹介がここに出ます", "Your bio shows up here")
              : profile}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-end justify-between">
          <label htmlFor={nicknameId} className="font-medium text-sm">
            {t("ニックネーム", "Nickname")}{" "}
            <span className="text-destructive text-xs">
              {t("必須", "Required")}
            </span>
          </label>
          <span className="text-muted-foreground text-xs tabular-nums">
            {userName.length} / 32
          </span>
        </div>
        <div className="relative">
          <Input
            id={nicknameId}
            autoFocus
            required
            maxLength={32}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder={t("みんなに表示される名前", "Name shown to everyone")}
            className="h-12 rounded-xl pr-11 text-base md:text-sm"
          />
          {!isNameEmpty && (
            <span className="-translate-y-1/2 absolute top-1/2 right-3 flex size-6 items-center justify-center rounded-full bg-teal-500 text-white motion-safe:animate-[aip-support-pop_0.4s_ease-out_both]">
              <CheckIcon className="size-3.5" />
            </span>
          )}
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
          <p className="text-muted-foreground text-xs">
            {t(
              "アイコンとヘッダーに R-18 の画像は使えません。",
              "R-18 images cannot be used for your icon or header.",
            )}
          </p>

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
                "入力するとプロフィールに公開されます。ログイン用のメールアドレスとは別です。",
                "Shown publicly on your profile if you enter one. This is separate from your login email.",
              )}
            </p>
          </div>
        </div>
      </details>

      <div className="space-y-2 rounded-xl border border-dashed p-3 text-sm">
        <p className="font-medium">
          {t(
            "前にAipictorsを使っていた方へ",
            "Already have an Aipictors account?",
          )}
        </p>
        <p className="text-muted-foreground text-xs">
          {t(
            "この画面は、はじめてのログイン方法のときに出ます。前とは違う方法（Google・X・LINE・メール）でログインすると、新しいアカウントになります。前のアカウントに戻るには、ログアウトして前に使った方法を選び直してください。",
            "This screen appears the first time a login method is used. Logging in a different way (Google, X, LINE, email) creates a new account. To get back to your existing account, log out and choose the method you used before.",
          )}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg"
          onClick={() => void onChooseAnotherMethod()}
        >
          {t("ログアウトして選び直す", "Log out and choose again")}
        </Button>
      </div>

      {/* スマホでも長いスクロールなしで押せるように、次へは画面の下に固定する */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto max-w-lg">
          <OnboardingNextButton
            type="submit"
            disabled={isUpdating || isNameEmpty}
            isLoading={isUpdating}
          >
            {isNameEmpty
              ? t("名前を入れてね", "Enter a name")
              : t("次へ", "Next")}
          </OnboardingNextButton>
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
