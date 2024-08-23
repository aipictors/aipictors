import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Pencil, Loader2Icon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { CropImageField } from "~/components/crop-image-field"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { uploadPublicImage } from "~/utils/upload-public-image"

export function SettingProfileForm() {
  const authContext = useContext(AuthContext)

  if (authContext.isLoading || authContext.isNotLoggedIn) {
    return null
  }

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

  const { data: token, refetch: tokenRefetch } = useQuery(viewerTokenQuery)

  const [createProfile, { loading: isUpdating }] = useMutation(
    createUserProfileMutation,
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

    await createProfile({
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
        },
      },
    })

    toast("プロフィールを更新しました。")
  }

  return (
    <>
      <div className="space-y-4">
        <div className="justify-between">
          <div className="relative">
            <div className="h-40 w-full bg-gray-700" />
            <div className="absolute bottom-[-24px] left-2 h-32 w-32">
              <div className="h-32 w-32 rounded-full border-2 bg-gray-700" />
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
            プロフィール画像やヘッダー画像にR-18画像は掲載できません。
          </p>
        </div>

        <div className="flex flex-col justify-between space-y-2">
          <label
            htmlFor="nickname"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {"ニックネーム"}
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
            {"プロフィール"}
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
            {"英語プロフィール"}
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
            {"Webサイト"}
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
            {"X(旧Twitter)"}
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
            {"メールアドレス"}
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
          className="ml-auto block w-24"
        >
          {isUpdating ? (
            <Loader2Icon className="m-auto h-4 w-4 animate-spin" />
          ) : (
            <p>{"作成する"}</p>
          )}
        </Button>
      </div>
    </>
  )
}

const viewerTokenQuery = graphql(
  `query ViewerToken {
    viewer {
      id
      token
    }
  }`,
)

const createUserProfileMutation = graphql(
  `mutation CreateUserProfile($input: CreateUserProfileInput!) {
    createUserProfile(input: $input) {
      id
      name
    }
  }`,
)
