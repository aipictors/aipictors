import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Pencil, PlusIcon, XIcon } from "lucide-react"
import { Suspense, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { CropImageField } from "~/components/crop-image-field"
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
import { SettingsSection } from "~/routes/($lang).settings/components/settings-section"
import { AvatarFrameStudio } from "~/routes/($lang).settings.profile/components/avatar-frame-studio"
import { uploadPublicImage } from "~/utils/upload-public-image"

/**
 * プロフィール設定フォーム
 */
const inputClassName =
  "h-11 w-full rounded-md border bg-background px-3 text-base md:text-sm"

const textareaClassName =
  "w-full rounded-md border bg-background px-3 py-2 text-base md:text-sm"

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
      <section>
        {/* ユーザーページのヘッダー（user-home-header）と同じ比率・切り方で見せる */}
        <div className="relative aspect-[5/2] w-full overflow-hidden rounded-xl bg-muted md:aspect-[3/1] md:rounded-3xl">
          {headerImageSrc ? (
            <img
              className="absolute inset-0 size-full object-cover"
              src={headerImageSrc}
              alt={t("ヘッダー画像", "Header Image")}
            />
          ) : (
            <div className="absolute inset-0 bg-muted" />
          )}
          <CropImageField
            isHidePreviewImage={false}
            cropWidth={1200}
            cropHeight={400}
            onDeleteImage={() => {
              setHeaderImage("")
            }}
            onCropToBase64={setHeaderImage}
            fileExtension={"webp"}
          >
            <Button
              aria-label={t("ヘッダー画像を変更", "Change header image")}
              className="absolute top-2 right-2 size-10 rounded-full p-0"
              variant={"secondary"}
            >
              <Pencil className="size-4" />
            </Button>
          </CropImageField>
        </div>
        <div className="-mt-12 ml-4 flex items-end gap-3">
          <div className="relative size-24 shrink-0">
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
                className="absolute right-0 bottom-0 z-10 size-9 rounded-full p-0 shadow-sm"
                variant={"secondary"}
              >
                <Pencil className="size-4" />
              </Button>
            </CropImageField>
          </div>
        </div>
        <p className="mt-3 text-muted-foreground text-xs">
          {t(
            "プロフィール画像やヘッダー画像にR-18画像は掲載できません。",
            "R-18 images cannot be used for profile or header images.",
          )}
        </p>
      </section>

      <SettingsSection
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

      <SettingsSection title={t("基本情報", "Basic Info")}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="nickname" className="font-medium text-sm">
              {t("ニックネーム", "Nickname")}
            </label>
            <input
              type="text"
              id="nickname"
              className={inputClassName}
              maxLength={32}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="profile" className="font-medium text-sm">
              {t("プロフィール", "Profile")}
            </label>
            <AutoResizeTextarea
              id="profile"
              className={textareaClassName}
              maxLength={320}
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="enProfile" className="font-medium text-sm">
              {t("英語プロフィール", "English Profile")}
            </label>
            <AutoResizeTextarea
              id="enProfile"
              className={textareaClassName}
              maxLength={640}
              value={enProfile}
              onChange={(e) => setEnProfile(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="supportThankYouMessage"
              className="font-medium text-sm"
            >
              {t("推されたときの感謝コメント", "Support thank-you message")}
            </label>
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
            <p className="text-muted-foreground text-xs leading-5">
              {t(
                "推しの完了画面と、推し付きコメントを送ったあとに表示します。",
                "Shown after someone supports you, including support comments.",
              )}
            </p>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title={t("リンク・連絡先", "Links & Contact")}>
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
