import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { AutoResizeTextarea } from "@/_components/auto-resize-textarea"
import { CropImageField } from "@/_components/crop-image-field"
import { Button } from "@/_components/ui/button"
import { Separator } from "@/_components/ui/separator"
import { AuthContext } from "@/_contexts/auth-context"
import { userQuery } from "@/_graphql/queries/user/user"
import type { worksQuery } from "@/_graphql/queries/work/works"
import { SelectCreatedWorksDialog } from "@/routes/($lang).dashboard._index/_components/select-created-works-dialog"
import { useSuspenseQuery } from "@apollo/client/index"
import type { ResultOf } from "gql.tada"
import { Loader2Icon, Pencil, PlusIcon } from "lucide-react"
import { Suspense, useContext, useState } from "react"
import { useMutation } from "@apollo/client/index"
import { updateUserProfileMutation } from "@/_graphql/mutations/update-user-profile"
import { uploadPublicImage } from "@/_utils/upload-public-image"
import { createRandomString } from "@/routes/($lang).generation._index/_utils/create-random-string"
import { toast } from "sonner"
import { Label } from "@/_components/ui/label"
import { Input } from "@/_components/ui/input"
import { Link } from "@remix-run/react"
/**
 * プロフィール設定フォーム
 */
export const SettingProfileForm = () => {
  const authContext = useContext(AuthContext)

  const { data: user } = useSuspenseQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: authContext.userId?.toString() ?? "",
      worksWhere: {},
      followeesWorksWhere: {},
      followersWorksWhere: {},
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

  const [selectedPickupWorks, setSelectedPickupWorks] = useState<
    ResultOf<typeof worksQuery>["works"]
  >(userInfo?.featuredWorks ?? [])

  const [selectedPickupSensitiveWorks, setSelectedPickupSensitiveWorks] =
    useState<ResultOf<typeof worksQuery>["works"]>(
      userInfo?.featuredSensitiveWorks ?? [],
    )

  const [updateProfile, { loading: isUpdating }] = useMutation(
    updateUserProfileMutation,
  )

  const onSubmit = async () => {
    if (isUpdating || authContext.userId === null) {
      return
    }

    const iconFileName = `${createRandomString(30)}.webp`
    const iconUrl = profileImage
      ? await uploadPublicImage(profileImage, iconFileName, authContext.userId)
      : null

    const headerFileName = `${createRandomString(30)}.webp`
    const headerUrl = headerImage
      ? await uploadPublicImage(headerImage, headerFileName, authContext.userId)
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

    toast("プロフィールを更新しました。")
  }

  return (
    <div className="space-y-4">
      <div className="justify-between">
        <div className="relative">
          {userInfo?.headerImageUrl ? (
            <img
              className="h-auto w-full object-cover"
              src={headerImage ? headerImage : userInfo?.headerImageUrl}
              alt="header"
            />
          ) : (
            <div className="h-40 w-full bg-gray-700" />
          )}
          <div className="absolute bottom-[-24px] left-2 h-32 w-32">
            {userInfo?.iconUrl ? (
              <img
                className="absolute h-32 w-32 rounded-full border-2"
                src={profileImage ? profileImage : userInfo?.iconUrl}
                alt="header"
              />
            ) : (
              <div className="h-32 w-32 rounded-full border-2 bg-gray-700" />
            )}

            <CropImageField
              isHidePreviewImage={false}
              cropWidth={240}
              cropHeight={240}
              onDeleteImage={() => {
                setProfileImage("")
              }}
              onCropToBase64={setProfileImage}
              fileExtension={"webp"}
            >
              <Button
                className="absolute top-0 right-0 h-8 w-8 rounded-full p-0"
                variant={"secondary"}
              >
                <Pencil className="h-4 w-4" />
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
              className="absolute top-1 right-1 h-8 w-8 rounded-full p-0"
              variant={"secondary"}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </CropImageField>
        </div>
        <p className="mt-8">
          {"アイコンやヘッダー画像にR-18画像は掲載できません。"}
        </p>
      </div>

      <div className="flex flex-col justify-between space-y-2">
        <Label htmlFor="nickname">{"ニックネーム"}</Label>
        <Input
          type="text"
          id="nickname"
          maxLength={32}
          minLength={1}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          defaultValue="Aipictors/AIイラスト投稿サイト・AI小説投稿サイト・AI絵"
        />
      </div>
      <div className="flex flex-col justify-between space-y-2">
        <Label htmlFor="profile">{"プロフィール"}</Label>
        <AutoResizeTextarea
          id="profile"
          className="rounded-md border px-2 py-1"
          maxLength={320}
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
        />
      </div>
      <div className="flex flex-col justify-between space-y-2">
        <Label htmlFor="enProfile">{"英語プロフィール"}</Label>
        <AutoResizeTextarea
          id="enProfile"
          className="rounded-md border px-2 py-1"
          maxLength={640}
          value={enProfile}
          onChange={(e) => setEnProfile(e.target.value)}
        />
      </div>

      <div className="flex flex-col justify-between space-y-2">
        <Label htmlFor="website">{"Webサイト"}</Label>
        <Input
          type="url"
          id="website"
          value={website}
          maxLength={1000}
          placeholder="https://example.com"
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <div className="flex flex-col justify-between space-y-2">
        <Label htmlFor="instagram">{"Instagram"}</Label>
        <Input
          type="text"
          id="instagram"
          value={instagram}
          placeholder={"@"}
          maxLength={255}
          onChange={(e) => setInstagram(e.target.value)}
        />
      </div>
      <div className="flex flex-col justify-between space-y-2">
        <Label htmlFor="twitter">{"X(旧Twitter)"}</Label>
        <Input
          type="text"
          id="twitter"
          value={twitter}
          placeholder={"@"}
          maxLength={255}
          onChange={(e) => setTwitter(e.target.value)}
        />
      </div>
      <div className="flex flex-col justify-between space-y-2">
        <Label htmlFor="github">{"Github"}</Label>
        <Input
          type="text"
          id="github"
          value={github}
          placeholder={"ユーザー名"}
          maxLength={255}
          onChange={(e) => setGithub(e.target.value)}
        />
      </div>
      <div className="flex flex-col justify-between space-y-2">
        <Label htmlFor="email">{"メールアドレス"}</Label>
        <Input
          type="email"
          id="email"
          value={mail}
          placeholder={"user@example.com"}
          maxLength={320}
          onChange={(e) => setMail(e.target.value)}
        />
      </div>
      <div className="flex flex-col justify-between space-y-2">
        <Label htmlFor="pickup">{"ピックアップ ※最大3つ"}</Label>
        <Suspense fallback={<AppLoadingPage />}>
          <SelectCreatedWorksDialog
            selectedWorks={selectedPickupWorks}
            setSelectedWorks={setSelectedPickupWorks}
            limit={3}
          >
            <div className="border-2 border-transparent p-1">
              <Button className="h-16 w-16" size={"icon"} variant={"secondary"}>
                <PlusIcon />
              </Button>
            </div>
          </SelectCreatedWorksDialog>
        </Suspense>
      </div>
      <div className="flex flex-col justify-between space-y-2">
        <Label htmlFor="sensitive-pickup">
          {"センシティブピックアップ ※最大3つ"}
        </Label>
        <Suspense fallback={<AppLoadingPage />}>
          <SelectCreatedWorksDialog
            selectedWorks={selectedPickupSensitiveWorks}
            setSelectedWorks={setSelectedPickupSensitiveWorks}
            limit={3}
            isSensitve={true}
          >
            <div className="border-2 border-transparent p-1">
              <Button className="h-16 w-16" size={"icon"} variant={"secondary"}>
                <PlusIcon />
              </Button>
            </div>
          </SelectCreatedWorksDialog>
        </Suspense>
      </div>
      <Separator />
      <Button
        disabled={isUpdating}
        onClick={onSubmit}
        className="ml-auto block w-24"
      >
        {isUpdating ? (
          <Loader2Icon className="m-auto h-4 w-4 animate-spin" />
        ) : (
          <p>{"更新する"}</p>
        )}
      </Button>
      <Separator />
      <Link to="/account/login" className="m-auto block">
        <Button className="m-auto block" variant={"secondary"}>
          ログイン情報を変更する
        </Button>
      </Link>
    </div>
  )
}
