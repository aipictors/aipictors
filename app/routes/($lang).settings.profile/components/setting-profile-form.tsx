import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import {
  ExternalLinkIcon,
  FrameIcon,
  ImageIcon,
  LinkIcon,
  Pencil,
  PlusIcon,
  ShieldAlertIcon,
  SparklesIcon,
  StarIcon,
  UserRoundIcon,
  XIcon,
} from "lucide-react"
import { Suspense, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { CropImageField } from "~/components/crop-image-field"
import { GachaHeaderFrameOverlay } from "~/components/gacha/gacha-header-frame-overlay"
import { Button } from "~/components/ui/button"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { SelectCreatedSensitiveWorksDialog } from "~/routes/($lang).my._index/components/select-created-sensitive-works-dialog"
import {
  DialogWorkFragment,
  SelectCreatedWorksDialog,
} from "~/routes/($lang).my._index/components/select-created-works-dialog"
import { SettingsSaveBar } from "~/routes/($lang).settings/components/settings-save-bar"
import {
  SettingsField,
  SettingsSection,
} from "~/routes/($lang).settings/components/settings-section"
import { AvatarFrameStudio } from "~/routes/($lang).settings.profile/components/avatar-frame-studio"
import { HeaderFrameSetting } from "~/routes/($lang).settings.profile/components/header-frame-setting"
import {
  PROFILE_HEADER_ANIMATED_OPTIONS,
  PROFILE_ICON_ANIMATED_OPTIONS,
} from "~/utils/animated-gif-to-webp"
import { toResizedImageUrl } from "~/utils/resized-image-url"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

/**
 * プロフィール設定フォーム
 */
const inputClassName =
  "h-11 w-full rounded-lg border bg-background px-3 text-base shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 md:text-sm"

const textareaClassName =
  "min-h-20 w-full rounded-lg border bg-background px-3 py-2 text-base leading-6 shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 md:text-sm"

/** プロフィールの中の移動（長いページなので、上から各まとまりへ飛べるようにする） */
const PROFILE_SECTIONS = [
  { id: "profile-frames", ja: "枠", en: "Frames" },
  { id: "profile-basic", ja: "基本情報", en: "Basics" },
  { id: "profile-links", ja: "リンク", en: "Links" },
  { id: "profile-pickups", ja: "ピックアップ", en: "Pickups" },
  { id: "r18-profile", ja: "R18", en: "R18" },
] as const

/** R18 のプロフィールのリンクの上限（API と同じ） */
const SENSITIVE_LINKS_LIMIT = 10

const isHttpUrl = (value: string) => /^https?:\/\/\S+$/i.test(value.trim())

const toSensitiveLinksInput = (links: string[]) =>
  links.map((link) => link.trim()).filter((link) => link.length > 0)

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
  const [supportThankYouMessage, setSupportThankYouMessage] = useState("")
  // R18 のプロフィール（R18 のページだけに出す。空の項目は全年齢のプロフィールを出す）
  const [sensitiveHeaderImage, setSensitiveHeaderImage] = useState("")
  const [isSensitiveHeaderCleared, setIsSensitiveHeaderCleared] =
    useState(false)
  const [sensitiveProfileText, setSensitiveProfileText] = useState("")
  const [sensitiveEnProfileText, setSensitiveEnProfileText] = useState("")
  const [sensitiveLinks, setSensitiveLinks] = useState<string[]>([])
  const [sensitiveFanzaCircle, setSensitiveFanzaCircle] = useState("")
  // 着けているヘッダー枠（ヘッダー枠の欄が読み込み・変更のたびに知らせる）
  const [headerFrameSlug, setHeaderFrameSlug] = useState<string | null>(null)
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
      setSensitiveHeaderImage("")
      setIsSensitiveHeaderCleared(false)
      setSensitiveProfileText(userInfo.sensitiveProfile?.biography ?? "")
      setSensitiveEnProfileText(userInfo.sensitiveProfile?.enBiography ?? "")
      setSensitiveLinks(userInfo.sensitiveProfile?.links ?? [])
      setSensitiveFanzaCircle(userInfo.sensitiveProfile?.fanzaCircleId ?? "")
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
    setSupportThankYouMessage(
      avatarFrameSettingsData?.userSetting?.supportThankYouMessage ?? "",
    )
  }, [avatarFrameSettingsData])

  // プロフィールの「R18 のプロフィールを作る」から来たら、読み込んだあとに R18 の欄へ移る
  // （フォームは読み込みまで出ないので、ブラウザの #r18-profile だけでは飛ばない）
  const hasUserInfo = Boolean(userInfo)
  useEffect(() => {
    if (!hasUserInfo || window.location.hash !== "#r18-profile") return
    const timer = window.setTimeout(() => {
      document
        .getElementById("r18-profile")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
    return () => window.clearTimeout(timer)
  }, [hasUserInfo])

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

    const nextSensitiveLinks = toSensitiveLinksInput(sensitiveLinks)
    const invalidLink = nextSensitiveLinks.find((link) => !isHttpUrl(link))
    if (invalidLink !== undefined) {
      toast(
        t(
          `R18 のリンクは https:// から始まる URL で入力してください（${invalidLink}）`,
          `R18 links must be URLs starting with https:// (${invalidLink})`,
        ),
      )
      return
    }

    const headerUrl = headerImage
      ? await uploadPublicImage(headerImage, token?.viewer?.token)
      : null

    const sensitiveHeaderUrl = sensitiveHeaderImage
      ? await uploadPublicImage(sensitiveHeaderImage, token?.viewer?.token)
      : null

    // R18 のプロフィールは変えたものだけ送る（変えていなければ書き込まない）
    const savedSensitiveProfile = userInfo.sensitiveProfile
    const sensitiveInput = {
      ...(sensitiveHeaderUrl
        ? { sensitiveHeaderImageUrl: sensitiveHeaderUrl }
        : isSensitiveHeaderCleared && savedSensitiveProfile?.headerImageUrl
          ? { sensitiveHeaderImageUrl: "" }
          : {}),
      ...(sensitiveProfileText !== (savedSensitiveProfile?.biography ?? "") && {
        sensitiveBiography: sensitiveProfileText,
      }),
      ...(sensitiveEnProfileText !==
        (savedSensitiveProfile?.enBiography ?? "") && {
        sensitiveEnBiography: sensitiveEnProfileText,
      }),
      ...(nextSensitiveLinks.join("\n") !==
        (savedSensitiveProfile?.links ?? []).join("\n") && {
        sensitiveLinks: nextSensitiveLinks,
      }),
      ...(sensitiveFanzaCircle.trim() !==
        (savedSensitiveProfile?.fanzaCircleId ?? "") && {
        sensitiveFanzaCircle: sensitiveFanzaCircle.trim(),
      }),
    }

    try {
      await updateProfile({
        variables: {
          input: {
            ...sensitiveInput,
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
    } catch (error) {
      toast(
        error instanceof Error && error.message.length > 0
          ? error.message
          : t(
              "プロフィールの更新に失敗しました。",
              "Failed to update profile.",
            ),
      )
      return
    }

    await updateUserSetting({
      variables: {
        input: {
          supportThankYouMessage,
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

  const savedSensitiveHeaderImageUrl = isSensitiveHeaderCleared
    ? null
    : (userInfo.sensitiveProfile?.headerImageUrl ?? null)
  const sensitiveHeaderImageSrc =
    sensitiveHeaderImage.length > 0
      ? sensitiveHeaderImage
      : savedSensitiveHeaderImageUrl
  const hasOwnSensitiveHeader = sensitiveHeaderImageSrc !== null

  const currentPassType =
    profileAvatarFrameSettings?.viewer?.currentPass?.type ?? null
  const avatarFrames = profileAvatarFrameSettings?.userAvatarFrames ?? []
  const savedSelectedAvatarFrame =
    profileAvatarFrameSettings?.userSetting?.selectedUserAvatarFrame ?? null
  const selectedAvatarFrame =
    selectedUserAvatarFrameId === null
      ? null
      : (avatarFrames.find((frame) => frame.id === selectedUserAvatarFrameId) ??
        savedSelectedAvatarFrame)

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        {/* ユーザーページのヘッダー（user-home-header）と同じ比率・切り方・枠で見せる */}
        <div className="relative aspect-[5/2] w-full overflow-hidden bg-muted md:aspect-[3/1]">
          {headerImageSrc ? (
            <img
              className="absolute inset-0 size-full object-cover"
              src={headerImageSrc}
              alt={t("ヘッダー画像", "Header Image")}
            />
          ) : (
            // ユーザーページと同じく、ヘッダー画像がなければアイコンの色を広げる
            <img
              className="absolute inset-0 size-full scale-125 object-cover opacity-80 blur-3xl saturate-150"
              src={toResizedImageUrl(withIconUrlFallback(profileImageSrc), 96)}
              alt=""
            />
          )}
          {headerFrameSlug && (
            <GachaHeaderFrameOverlay slug={headerFrameSlug} />
          )}
          <CropImageField
            isHidePreviewImage={false}
            cropWidth={1200}
            cropHeight={400}
            animatedGif={PROFILE_HEADER_ANIMATED_OPTIONS}
            onDeleteImage={() => {
              setHeaderImage("")
            }}
            onCropToBase64={setHeaderImage}
            fileExtension={"webp"}
          >
            <Button
              aria-label={t("ヘッダー画像を変更", "Change header image")}
              className="absolute top-3 right-3 z-10 h-9 gap-1.5 rounded-full bg-background/85 px-3 shadow-sm backdrop-blur-sm hover:bg-background"
              variant={"secondary"}
            >
              <ImageIcon className="size-4" />
              <span className="text-xs">
                {headerImageSrc
                  ? t("ヘッダーを変更", "Change header")
                  : t("ヘッダーを追加", "Add header")}
              </span>
            </Button>
          </CropImageField>
        </div>
        <div className="relative z-10 flex flex-wrap items-end gap-x-4 gap-y-2 px-4 pb-4 md:px-5">
          <div className="-mt-10 md:-mt-12 relative size-24 shrink-0">
            <UserAvatarWithFrame
              alt={t("プロフィール画像", "Profile Image")}
              frame={selectedAvatarFrame}
              isDecorationAnimated
              sizeClassName="size-24"
              src={profileImageSrc}
            />
            <CropImageField
              isHidePreviewImage={false}
              cropWidth={240}
              cropHeight={240}
              animatedGif={PROFILE_ICON_ANIMATED_OPTIONS}
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
                aria-label={t("プロフィール画像を変更", "Change profile image")}
                className="absolute right-0 bottom-0 z-10 size-9 rounded-full border-2 border-card p-0 shadow-sm"
                variant={"secondary"}
              >
                <Pencil className="size-4" />
              </Button>
            </CropImageField>
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <p className="truncate font-bold text-lg leading-tight">
              {userName || t("ニックネーム未設定", "No nickname")}
            </p>
            <p className="truncate text-muted-foreground text-sm">
              @{userInfo.login}
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mb-1 rounded-full"
          >
            <Link
              to={`/users/${userInfo.login}`}
              aria-label={t("プロフィールを見る", "View profile")}
            >
              {/* スマホは名前が切れないよう「見る」だけにする */}
              <span className="sm:hidden">{t("見る", "View")}</span>
              <span className="hidden sm:inline">
                {t("プロフィールを見る", "View profile")}
              </span>
              <ExternalLinkIcon className="ml-1.5 size-3.5" />
            </Link>
          </Button>
        </div>
        <p className="border-t bg-muted/30 px-4 py-2.5 text-muted-foreground text-xs md:px-5">
          {t(
            "プロフィール画像やヘッダー画像にR-18画像は掲載できません。画像は保存すると反映されます。",
            "R-18 images cannot be used for profile or header images. Images apply when you save.",
          )}
        </p>
      </section>

      <nav
        aria-label={t("プロフィールの項目", "Profile sections")}
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
      >
        {PROFILE_SECTIONS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(event) => {
              event.preventDefault()
              document
                .getElementById(item.id)
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }}
            className="shrink-0 rounded-full border bg-card px-3.5 py-1.5 font-medium text-xs shadow-xs transition-colors hover:bg-muted"
          >
            {t(item.ja, item.en)}
          </a>
        ))}
      </nav>

      <div id="profile-frames" className="grid scroll-mt-24 gap-5">
        <SettingsSection
          icon={<SparklesIcon />}
          title={t("アイコン枠", "Avatar Frame")}
          description={t(
            "サブスクの枠はプランの間使えます。コインの枠は一度買えばずっと使えます。選ぶとすぐ反映されます。",
            "Plan frames are available while subscribed. Coin frames are yours to keep once purchased. Changes apply right away.",
          )}
        >
          <AvatarFrameStudio
            appliedFrame={selectedAvatarFrame}
            appliedFrameId={selectedUserAvatarFrameId}
            currentPassType={currentPassType}
            frames={avatarFrames}
            iconUrl={profileImageSrc}
            ownedFrameIds={
              profileAvatarFrameSettings?.viewerOwnedUserAvatarFrameIds ?? []
            }
            userName={userName}
            onApplied={setSelectedUserAvatarFrameId}
          />
        </SettingsSection>

        <SettingsSection
          icon={<FrameIcon />}
          title={t("ヘッダー枠", "Header Frame")}
          description={t(
            "ヘッダー画像のふちを飾ります。R18 のページのヘッダーにも重なります。選ぶとすぐ反映されます。",
            "Decorates the edge of your header, including on your R18 page. Changes apply right away.",
          )}
        >
          <HeaderFrameSetting
            headerImageSrc={headerImageSrc}
            onSelectedChange={setHeaderFrameSlug}
          />
        </SettingsSection>
      </div>

      <SettingsSection
        id="profile-basic"
        icon={<UserRoundIcon />}
        title={t("基本情報", "Basic Info")}
      >
        <div className="space-y-5">
          <SettingsField
            htmlFor="nickname"
            label={t("ニックネーム", "Nickname")}
            count={{ value: userName.length, max: 32 }}
          >
            <input
              type="text"
              id="nickname"
              className={inputClassName}
              maxLength={32}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </SettingsField>
          <SettingsField
            htmlFor="profile"
            label={t("プロフィール", "Profile")}
            count={{ value: profile.length, max: 320 }}
          >
            <AutoResizeTextarea
              id="profile"
              className={textareaClassName}
              maxLength={320}
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
            />
          </SettingsField>
          <SettingsField
            htmlFor="enProfile"
            label={t("英語プロフィール", "English Profile")}
            count={{ value: enProfile.length, max: 640 }}
            hint={t(
              "英語で見ている人に出します。空なら日本語のプロフィールを出します。",
              "Shown to people browsing in English. If empty, your Japanese profile is shown.",
            )}
          >
            <AutoResizeTextarea
              id="enProfile"
              className={textareaClassName}
              maxLength={640}
              value={enProfile}
              onChange={(e) => setEnProfile(e.target.value)}
            />
          </SettingsField>
          <SettingsField
            htmlFor="supportThankYouMessage"
            label={t("推されたときの感謝コメント", "Support thank-you message")}
            count={{ value: supportThankYouMessage.length, max: 120 }}
            hint={t(
              "推しの完了画面と、推し付きコメントを送ったあとに表示します。",
              "Shown after someone supports you, including support comments.",
            )}
          >
            <AutoResizeTextarea
              id="supportThankYouMessage"
              className={textareaClassName}
              maxLength={120}
              placeholder={t(
                "未設定時はデフォルトの感謝コメントが表示されます。",
                "If left empty, the default thank-you message will be shown.",
              )}
              value={supportThankYouMessage}
              onChange={(e) => setSupportThankYouMessage(e.target.value)}
            />
          </SettingsField>
        </div>
      </SettingsSection>

      <SettingsSection
        id="profile-links"
        icon={<LinkIcon />}
        title={t("リンク・連絡先", "Links & Contact")}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="website" className="font-medium text-sm">
              {t("Webサイト", "Website")}
            </label>
            <input
              type="url"
              id="website"
              className={inputClassName}
              maxLength={1000}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="mail" className="font-medium text-sm">
              {t(
                "公開する連絡先メール（任意）",
                "Public contact email (optional)",
              )}
            </label>
            <input
              type="email"
              id="mail"
              className={inputClassName}
              maxLength={320}
              value={mail}
              onChange={(e) => setMail(e.target.value)}
            />
            {/* ログイン用のメールアドレスとは別。ここを変えてもログインには影響しない（ログイン方法はアカウント設定） */}
            <p className="text-muted-foreground text-xs leading-relaxed">
              {t(
                "プロフィールに公開され、誰でも見られます。ログイン用のメールアドレスとは別なので、変更・削除してもログインには影響しません。",
                "Shown publicly on your profile. This is separate from your login email, so changing or removing it doesn't affect how you log in.",
              )}{" "}
              <Link
                to="/settings/account"
                className="whitespace-nowrap text-foreground underline underline-offset-2"
              >
                {t(
                  "ログイン用のメールアドレスはこちら",
                  "Manage your login email",
                )}
              </Link>
            </p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="twitter" className="font-medium text-sm">
              {t("X(旧Twitter)", "X (formerly Twitter)")}
            </label>
            <input
              type="text"
              id="twitter"
              className={inputClassName}
              maxLength={255}
              placeholder={"@"}
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="instagram" className="font-medium text-sm">
              {"Instagram"}
            </label>
            <input
              type="text"
              id="instagram"
              className={inputClassName}
              maxLength={255}
              placeholder={"@"}
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="github" className="font-medium text-sm">
              {"GitHub"}
            </label>
            <input
              type="text"
              id="github"
              className={inputClassName}
              maxLength={255}
              placeholder={"@"}
              value={github}
              onChange={(e) => setGithub(e.target.value)}
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        id="profile-pickups"
        icon={<StarIcon />}
        title={t("ピックアップ作品", "Pickups")}
        description={t(
          "プロフィールの上の方に出す作品です。それぞれ 3 つまで選べます。",
          "Works shown near the top of your profile. Up to 3 each.",
        )}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="font-medium text-sm">{t("全年齢", "All ages")}</p>
            <Suspense fallback={<AppLoadingPage />}>
              <SelectCreatedWorksDialog
                selectedWorks={selectedPickupWorks}
                setSelectedWorks={setSelectedPickupWorks}
                limit={3}
              >
                <div className="border-2 border-transparent p-1">
                  <Button
                    aria-label={t("作品を選ぶ", "Choose works")}
                    className="size-16"
                    size={"icon"}
                    variant={"secondary"}
                  >
                    <PlusIcon />
                  </Button>
                </div>
              </SelectCreatedWorksDialog>
            </Suspense>
          </div>
          <div className="space-y-1.5">
            <p className="font-medium text-sm">
              {t("センシティブ", "Sensitive")}
            </p>
            <Suspense fallback={<AppLoadingPage />}>
              <SelectCreatedSensitiveWorksDialog
                selectedWorks={selectedPickupSensitiveWorks}
                setSelectedWorks={setSelectedPickupSensitiveWorks}
                limit={3}
              >
                <div className="border-2 border-transparent p-1">
                  <Button
                    aria-label={t("作品を選ぶ", "Choose works")}
                    className="size-16"
                    size={"icon"}
                    variant={"secondary"}
                  >
                    <PlusIcon />
                  </Button>
                </div>
              </SelectCreatedSensitiveWorksDialog>
            </Suspense>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        id="r18-profile"
        icon={<ShieldAlertIcon />}
        title={t("R18 のプロフィール", "R18 profile")}
        description={t(
          "R18 のページ（年齢確認のあと）だけに出します。全年齢のページには出ません。空の項目は全年齢のプロフィールがそのまま出ます。アイコンと名前は共通です。",
          "Shown only on your R18 page (after age confirmation), never on the all-ages page. Empty fields fall back to your all-ages profile. Your icon and name are shared.",
        )}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="font-medium text-sm">
              {t("R18 用のヘッダー画像", "R18 header image")}
            </p>
            <div className="relative aspect-[5/2] w-full overflow-hidden rounded-xl bg-muted md:aspect-[3/1] md:rounded-3xl">
              {hasOwnSensitiveHeader ? (
                <img
                  className="absolute inset-0 size-full object-cover"
                  src={sensitiveHeaderImageSrc ?? undefined}
                  alt={t("R18 用のヘッダー画像", "R18 header image")}
                />
              ) : headerImageSrc ? (
                <>
                  <img
                    className="absolute inset-0 size-full object-cover opacity-40"
                    src={headerImageSrc}
                    alt=""
                  />
                  <p className="absolute inset-x-0 bottom-2 text-center font-medium text-xs">
                    {t(
                      "全年齢と同じヘッダーを出します",
                      "Uses your all-ages header",
                    )}
                  </p>
                </>
              ) : (
                <div className="absolute inset-0 bg-muted" />
              )}
              <CropImageField
                isHidePreviewImage={false}
                cropWidth={1200}
                cropHeight={400}
                animatedGif={PROFILE_HEADER_ANIMATED_OPTIONS}
                onDeleteImage={() => {
                  setSensitiveHeaderImage("")
                }}
                onCropToBase64={(base64: string) => {
                  setSensitiveHeaderImage(base64)
                  setIsSensitiveHeaderCleared(false)
                }}
                fileExtension={"webp"}
              >
                <Button
                  aria-label={t(
                    "R18 用のヘッダー画像を変更",
                    "Change R18 header image",
                  )}
                  className="absolute top-2 right-2 size-10 rounded-full p-0"
                  variant={"secondary"}
                >
                  <Pencil className="size-4" />
                </Button>
              </CropImageField>
            </div>
            {hasOwnSensitiveHeader && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground text-xs"
                onClick={() => {
                  setSensitiveHeaderImage("")
                  setIsSensitiveHeaderCleared(true)
                }}
              >
                {t("全年齢と同じヘッダーに戻す", "Use all-ages header")}
              </Button>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="sensitiveProfile" className="font-medium text-sm">
              {t("R18 用のプロフィール", "R18 profile text")}
            </label>
            <AutoResizeTextarea
              id="sensitiveProfile"
              className={textareaClassName}
              maxLength={320}
              placeholder={t(
                "空のときは全年齢のプロフィールを出します。",
                "If empty, your all-ages profile is shown.",
              )}
              value={sensitiveProfileText}
              onChange={(e) => setSensitiveProfileText(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="sensitiveEnProfile" className="font-medium text-sm">
              {t("R18 用の英語プロフィール", "R18 English profile text")}
            </label>
            <AutoResizeTextarea
              id="sensitiveEnProfile"
              className={textareaClassName}
              maxLength={640}
              value={sensitiveEnProfileText}
              onChange={(e) => setSensitiveEnProfileText(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <p className="font-medium text-sm">
              {t("R18 用のリンク", "R18 links")}
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {t(
                "FANZA・Fantia・FANBOX・DLsite・Ci-en などの URL を 10 件まで。よく使われるサイトはサービス名で表示します。",
                "Up to 10 URLs such as FANZA, Fantia, FANBOX, DLsite or Ci-en. Popular sites are shown by name.",
              )}
            </p>
            <div className="space-y-2">
              {sensitiveLinks.map((link, index) => (
                <div
                  // 並べ替えはしないので位置で区別する
                  // biome-ignore lint/suspicious/noArrayIndexKey: 入力欄の位置
                  key={index}
                  className="flex items-center gap-2"
                >
                  <input
                    type="url"
                    inputMode="url"
                    aria-label={t(
                      `R18 用のリンク ${index + 1}`,
                      `R18 link ${index + 1}`,
                    )}
                    className={inputClassName}
                    maxLength={500}
                    placeholder="https://"
                    value={link}
                    onChange={(e) =>
                      setSensitiveLinks((links) =>
                        links.map((item, i) =>
                          i === index ? e.target.value : item,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-11 shrink-0"
                    aria-label={t("このリンクを消す", "Remove this link")}
                    onClick={() =>
                      setSensitiveLinks((links) =>
                        links.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              ))}
              {sensitiveLinks.length < SENSITIVE_LINKS_LIMIT && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="gap-1"
                  onClick={() => setSensitiveLinks((links) => [...links, ""])}
                >
                  <PlusIcon className="size-4" />
                  {t("リンクを追加", "Add link")}
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="sensitiveFanzaCircle"
              className="font-medium text-sm"
            >
              {t("FANZA の販売作品", "Works on FANZA")}
            </label>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {t(
                "FANZA 同人のサークルのページ（作品一覧）の URL を入れると、R18 のプロフィールに販売中の作品をサムネイル付きで並べます。",
                "Enter the URL of your FANZA doujin circle page to show your works for sale on your R18 profile.",
              )}
            </p>
            <input
              id="sensitiveFanzaCircle"
              type="text"
              inputMode="url"
              className={inputClassName}
              maxLength={500}
              placeholder="https://www.dmm.co.jp/dc/doujin/-/list/=/article=maker/id=..."
              value={sensitiveFanzaCircle}
              onChange={(e) => setSensitiveFanzaCircle(e.target.value)}
            />
          </div>
        </div>
      </SettingsSection>

      <Link
        className="block py-2 text-center text-muted-foreground text-sm hover:underline"
        to="/settings/account/login"
      >
        {t("ログイン情報を変更する", "Change Login Information")}
      </Link>

      <SettingsSaveBar isSaving={isUpdating} onSave={() => void onSubmit()} />
    </div>
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
      sensitiveProfile {
        headerImageUrl
        biography
        enBiography
        links
        fanzaCircleId
      }
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
      supportThankYouMessage
      selectedUserAvatarFrame {
        id
        name
        description
        slug
        requiredPassType
        priceCoins
        isPremiumCoinsOnly
        frameType
        backgroundStyle
        overlayImageUrl
        borderPadding
      }
    }
    viewerOwnedUserAvatarFrameIds
    userAvatarFrames {
      id
      slug
      name
      description
      requiredPassType
      priceCoins
      isPremiumCoinsOnly
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
      supportThankYouMessage
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
