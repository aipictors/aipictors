import { AutoResizeTextarea } from "@/_components/auto-resize-textarea"
import { CropImageField } from "@/_components/crop-image-field"
import { Button } from "@/_components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/_components/ui/dialog"
import { AuthContext } from "@/_contexts/auth-context"
import { workUserFieldsFragment } from "@/_graphql/fragments/work-user-fields"
import { uploadPublicImage } from "@/_utils/upload-public-image"
import { SelectCreatedWorksDialogWithIds } from "@/routes/($lang).dashboard._index/_components/select-created-works-dialog-with-ids"
import { useMutation, useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { Loader2Icon, Pencil, PlusIcon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"

type Props = {
  album: FragmentOf<typeof albumArticleFragment>
  thumbnail?: string
  children: React.ReactNode
  userNanoid: string
}

export const AlbumArticleEditorDialog = (props: Props) => {
  const authContext = useContext(AuthContext)

  const workIds = props.album.workIds.map((work) => work.toString())

  const [selectedWorks, setSelectedWorks] = useState<string[]>(workIds)

  const [headerImageUrl, setHeaderImageUrl] = useState(props.thumbnail ?? "")

  const [title, setTitle] = useState(props.album.title)

  const [description, setDescription] = useState(props.album.description)

  const [updateAlbum, { loading: isUpdating }] =
    useMutation(updateAlbumMutation)

  const { data: token, refetch: tokenRefetch } = useQuery(viewerTokenQuery, {
    skip: authContext.isLoading,
  })

  const onSubmit = async () => {
    if (title.length === 0) {
      toast.error("タイトルを入力してください")
      return
    }

    if (description.length === 0) {
      toast.error("説明を入力してください")
      return
    }

    if (props.userNanoid === null) {
      toast("画面更新して再度お試し下さい。")
      return null
    }

    const imageUrl = headerImageUrl.startsWith("https://")
      ? null
      : await uploadPublicImage(headerImageUrl, token?.viewer?.token)

    await updateAlbum({
      variables: {
        input: {
          albumId: props.album.id,
          title: title,
          description: description,
          ...(imageUrl && { headerImageUrl: imageUrl }),
          ...(workIds && { workIds: workIds }),
        },
      },
    })

    toast("シリーズを更新しました")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"シリーズ更新"}</DialogTitle>
        </DialogHeader>
        <>
          <div className="relative">
            <div className="m-auto h-40 w-72 overflow-hidden rounded-md">
              <img
                src={headerImageUrl}
                alt={props.album.title}
                className="h-full w-full rounded-md object-cover object-center"
              />
            </div>
            <p className="font-bold text-sm">
              ※ センシティブなカバー画像は設定しないようにお願い致します。
            </p>
            <CropImageField
              isHidePreviewImage={false}
              cropWidth={455}
              cropHeight={237}
              onDeleteImage={() => {
                setHeaderImageUrl("")
              }}
              onCropToBase64={setHeaderImageUrl}
              fileExtension={"webp"}
            >
              <Button
                className="absolute right-1 bottom-1 h-12 w-12 rounded-full p-0"
                variant={"secondary"}
              >
                <Pencil className="h-8 w-8" />
              </Button>
            </CropImageField>
          </div>
          <div className="flex flex-col justify-between space-y-2">
            <label
              htmlFor="nickname"
              className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {"タイトル"}
            </label>
            <input
              type="text"
              id="title"
              maxLength={32}
              minLength={1}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-md border px-2 py-1"
              defaultValue="Aipictors/AIイラスト投稿サイト・AI小説投稿サイト・AI絵"
            />
          </div>
          <div className="flex flex-col justify-between space-y-2">
            <label
              htmlFor="enProfile"
              className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {"説明"}
            </label>
            <AutoResizeTextarea
              id="enProfile"
              className="rounded-md border px-2 py-1"
              maxLength={640}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <SelectCreatedWorksDialogWithIds
            selectedWorkIds={selectedWorks}
            setSelectedWorkIds={setSelectedWorks}
          >
            <div className="border-2 border-transparent p-1">
              <Button className="h-16 w-16" size={"icon"} variant={"secondary"}>
                <PlusIcon />
              </Button>
            </div>
          </SelectCreatedWorksDialogWithIds>
        </>
        <DialogFooter>
          <Button disabled={isUpdating} className="w-full" onClick={onSubmit}>
            {isUpdating ? (
              <Loader2Icon className="m-auto h-4 w-4 animate-spin" />
            ) : (
              "更新する"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const albumArticleFragment = graphql(
  `fragment AlbumArticle on AlbumNode @_unmask {
    id
    title
    description
    user {
      ...WorkUserFields
      isFollowee
      isFollowee
      isMuted
      nanoid
    }
    createdAt
    isSensitive
    thumbnailImageURL
    slug
    worksCount
    workIds
  }`,
  [workUserFieldsFragment],
)

const viewerTokenQuery = graphql(
  `query ViewerToken {
    viewer {
      id
      token
    }
  }`,
)

const updateAlbumMutation = graphql(
  `mutation UpdateAlbum($input: UpdateAlbumInput!) {
    updateAlbum(input: $input) {
      id
      title
    }
  }`,
)
