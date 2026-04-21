import { useMutation, useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { CropImageField } from "~/components/crop-image-field"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { SelectCreatedWorksDialogWithIds } from "~/routes/($lang).my._index/components/select-created-works-dialog-with-ids"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { toRatingText } from "~/utils/work/to-rating-text"

type Props = {
  album: FragmentOf<typeof AlbumArticleEditorDialogFragment>
  thumbnail?: string
  children: React.ReactNode
  userNanoid: string
}

export function AlbumArticleEditorDialog(props: Props) {
  const t = useTranslation()

  const [selectedWorks, setSelectedWorks] = useState<string[]>(
    props.album.workIds.map((work) => work.toString()),
  )

  const [title, setTitle] = useState(props.album.title)

  const [description, setDescription] = useState(props.album.description)

  const [rating, setRating] = useState<IntrospectionEnum<"AlbumRating">>(
    props.album.rating,
  )
  const [thumbnailImageBase64, setThumbnailImageBase64] = useState("")
  const [isThumbnailCleared, setIsThumbnailCleared] = useState(false)

  const [updateAlbum, { loading: isUpdating }] =
    useMutation(updateAlbumMutation)
  const { data: token } = useQuery(viewerTokenQuery)

  const onSubmit = async () => {
    if (title.length === 0) {
      toast.error(t("タイトルを入力してください", "Please enter a title"))
      return
    }

    if (description.length === 0) {
      toast.error(t("説明を入力してください", "Please enter a description"))
      return
    }

    if (props.userNanoid === null) {
      toast(
        t("画面更新して再度お試し下さい。", "Please refresh and try again."),
      )
      return null
    }

    const headerImageUrl = isThumbnailCleared
      ? ""
      : thumbnailImageBase64
        ? await uploadPublicImage(thumbnailImageBase64, token?.viewer?.token)
        : undefined

    await updateAlbum({
      variables: {
        input: {
          albumId: props.album.id,
          title: title,
          description: description,
          rating,
          ...(headerImageUrl && { headerImageUrl }),
          ...(selectedWorks && { workIds: selectedWorks }),
        },
      },
    })

    toast(t("シリーズを更新しました", "Album updated successfully"))
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("シリーズ更新", "Update Album")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col justify-between space-y-2">
          <label
            htmlFor="album-cover"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("カバー", "Cover")}
          </label>
          <CropImageField
            isHidePreviewImage={false}
            cropWidth={1200}
            cropHeight={627}
            defaultCroppedImage={props.thumbnail}
            fileExtension={"webp"}
            onDeleteImage={() => {
              setThumbnailImageBase64("")
              setIsThumbnailCleared(true)
            }}
            onCropToBase64={(croppedImage) => {
              setThumbnailImageBase64(croppedImage)
              setIsThumbnailCleared(false)
            }}
          />
        </div>
        <div className="flex flex-col justify-between space-y-2">
          <label
            htmlFor="nickname"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("タイトル", "Title")}
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
            htmlFor="album-rating"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("レーティング", "Rating")}
          </label>
          <Select
            value={rating}
            onValueChange={(value) => {
              setRating(value as IntrospectionEnum<"AlbumRating">)
            }}
          >
            <SelectTrigger id="album-rating">
              <SelectValue placeholder={t("レーティング", "Rating")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="G">{toRatingText("G")}</SelectItem>
              <SelectItem value="R15">{toRatingText("R15")}</SelectItem>
              <SelectItem value="R18">{toRatingText("R18")}</SelectItem>
              <SelectItem value="R18G">{toRatingText("R18G")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col justify-between space-y-2">
          <label
            htmlFor="enProfile"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("説明", "Description")}
          </label>
          <AutoResizeTextarea
            id="enProfile"
            className="rounded-md border px-2 py-1"
            maxLength={640}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <p className="font-medium text-sm ">
          {t("選択中の作品", "Selected works")}（{selectedWorks.length}）
        </p>
        <SelectCreatedWorksDialogWithIds
          selectedWorkIds={selectedWorks}
          setSelectedWorkIds={setSelectedWorks}
        />

        <DialogFooter>
          <Button disabled={isUpdating} className="w-full" onClick={onSubmit}>
            {isUpdating ? (
              <Loader2Icon className="m-auto size-4 animate-spin" />
            ) : (
              t("更新する", "Update")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const AlbumArticleEditorDialogFragment = graphql(
  `fragment AlbumArticleEditorDialog on AlbumNode @_unmask {
    id
    title
    description
    user {
      id
      name
      login
      iconUrl
      nanoid
    }
    createdAt
    isSensitive
    rating
    thumbnailImageURL
    slug
    worksCount
    workIds
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

const viewerTokenQuery = graphql(
  `query ViewerAlbumToken {
    viewer {
      id
      token
    }
  }`,
)
