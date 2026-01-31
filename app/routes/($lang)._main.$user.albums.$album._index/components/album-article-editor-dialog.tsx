import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog"
import { SelectCreatedWorksDialogWithIds } from "~/routes/($lang).my._index/components/select-created-works-dialog-with-ids"
import { useMutation } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  album: FragmentOf<typeof AlbumArticleEditorDialogFragment>
  thumbnail?: string
  children: React.ReactNode
  userNanoid: string
}

export function AlbumArticleEditorDialog (props: Props) {
  const t = useTranslation()

  const [selectedWorks, setSelectedWorks] = useState<string[]>(
    props.album.workIds.map((work) => work.toString()),
  )

  const [title, setTitle] = useState(props.album.title)

  const [description, setDescription] = useState(props.album.description)

  const [updateAlbum, { loading: isUpdating }] =
    useMutation(updateAlbumMutation)

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

    await updateAlbum({
      variables: {
        input: {
          albumId: props.album.id,
          title: title,
          description: description,
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
