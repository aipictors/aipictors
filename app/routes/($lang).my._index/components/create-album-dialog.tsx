import { PlusIcon } from "lucide-react"
import { Suspense, useContext, useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { getBase64FromImageUrl } from "~/utils/get-base64-from-image-url"
import { CropImageField } from "~/components/crop-image-field"
import { Input } from "~/components/ui/input"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { Button } from "~/components/ui/button"
import {
  type DialogWorkFragment,
  SelectCreatedWorksDialog,
} from "~/routes/($lang).my._index/components/select-created-works-dialog"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { ScrollArea } from "~/components/ui/scroll-area"
import { AuthContext } from "~/contexts/auth-context"
import { useMutation, useQuery } from "@apollo/client/index"
import { createRandomString } from "~/routes/($lang).generation._index/utils/create-random-string"
import { toast } from "sonner"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { type FragmentOf, graphql } from "gql.tada"

type Props = {
  children: React.ReactNode
  refetch: () => void
}

/**
 * シリーズ一覧テーブルの項目
 */
export function CreateAlbumDialog(props: Props) {
  const appContext = useContext(AuthContext)

  const [isOpen, setIsOpen] = useState<boolean>(false)

  const [thumbnailImageBase64, setThumbnailImageBase64] = useState<string>("")

  const [title, setTitle] = useState<string>("")

  const [slug, setSlug] = useState<string>("")

  const [description, setDescription] = useState<string>("")

  const [selectedWorks, setSelectedWorks] = useState<
    FragmentOf<typeof DialogWorkFragment>[]
  >([])

  const [isCreating, setIsCreating] = useState<boolean>(false)

  const [createAlbum] = useMutation(createAlbumMutation)

  const { data: token, refetch: tokenRefetch } = useQuery(viewerTokenQuery)

  const handleSlugChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, "") // Remove non-alphanumeric characters
    setSlug(alphanumericValue)
  }

  /**
   * クロップ完了
   * @param croppedImage クロップした画像
   */
  const onCrop = async (croppedImage: string) => {
    const base64 = await getBase64FromImageUrl(croppedImage)
    setThumbnailImageBase64(base64)
  }

  /**
   * 画像リセット
   */
  const onReset = () => {
    setThumbnailImageBase64("")
  }

  /**
   * シリーズ作成
   */
  const onCreateAlbum = async () => {
    if (appContext.userId === null) {
      toast("ログインしてください")
      return
    }

    const trimmedTitle = title.trim()

    const trimmedSlug = slug.trim()

    // タイトルが未入力の場合
    if (trimmedTitle === "") {
      toast("タイトルを入力してください")
      return
    }

    // リンク名が未入力の場合
    if (trimmedSlug === "") {
      toast("リンク名を入力してください")
      return
    }

    // 作品が未選択の場合
    if (selectedWorks.length === 0) {
      toast("作品を選択してください")
      return
    }

    setIsCreating(true)

    try {
      if (thumbnailImageBase64) {
        // サムネイル画像が存在するならアップロードする
        const _imageFileName = `${createRandomString(32)}.webp`

        const thumbnailUrl = await uploadPublicImage(
          thumbnailImageBase64,
          token?.viewer?.token,
        )

        await createAlbum({
          variables: {
            input: {
              title: trimmedTitle,
              slug: trimmedSlug,
              description: description,
              thumbnailUrl: thumbnailUrl,
              workIds: selectedWorks.map((work) => work.id),
            },
          },
        })
        setIsCreating(false)
        setIsOpen(false)
        toast("シリーズを追加しました")
        props.refetch()
        return
      }

      await createAlbum({
        variables: {
          input: {
            title: trimmedTitle,
            slug: trimmedSlug,
            description: description,
            workIds: selectedWorks.map((work) => work.id),
          },
        },
      })
      setIsCreating(false)
      setIsOpen(false)
      toast("シリーズを追加しました")
      props.refetch()
    } catch (_error) {
      setIsCreating(false)
      setIsOpen(false)
      toast("シリーズ追加に失敗しました")
    }
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(isOpen) => {
          setIsOpen((prev) => (prev !== isOpen ? isOpen : prev))
        }}
      >
        <DialogTrigger asChild>{props.children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>シリーズ作成</DialogTitle>
          </DialogHeader>
          <ScrollArea className="overflow-y-auto">
            <div className="max-h-[80vh] space-y-4 md:max-h-[100%]">
              <div className="space-y-1">
                <div className="flex space-x-2">
                  <p className="font-bold text-sm">カバー</p>
                </div>
                <CropImageField
                  isHidePreviewImage={false}
                  cropWidth={1200}
                  cropHeight={627}
                  onDeleteImage={onReset}
                  onCrop={onCrop}
                  fileExtension={"webp"}
                />
                <p className="text-sm">
                  カバーにはR18部分を含まないようにしてください。
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex space-x-2">
                  <p className="font-bold text-sm">タイトル</p>
                  <p className="text-sm opacity-50">*必須</p>
                </div>
                <Input
                  placeholder="シリーズの名前"
                  value={title}
                  type={"text"}
                  onChange={(event) => {
                    setTitle(event.target.value)
                  }}
                  maxLength={32}
                />
              </div>
              <div className="space-y-1">
                <div className="flex space-x-2">
                  <p className="font-bold text-sm">リンク名(英数字のみ)</p>
                  <p className="text-sm opacity-50">*必須</p>
                </div>
                <Input
                  placeholder="URLに使用されるリンク名(/series/●●)"
                  value={slug}
                  type="text"
                  onChange={handleSlugChange}
                  maxLength={32}
                />
                <p className="text-sm opacity-80">
                  {`https://beta.aipictors.com/${appContext.userId}/series/${slug}`}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex space-x-2">
                  <p className="font-bold text-sm">説明</p>
                  <p className="text-sm opacity-50">*必須</p>
                </div>
                <AutoResizeTextarea
                  placeholder="シリーズの説明"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value)
                  }}
                  maxLength={160}
                />
              </div>
              <div className="space-y-1">
                <div className="flex space-x-2">
                  <p className="font-bold text-sm">作品</p>
                  <p className="text-sm opacity-50">*必須</p>
                </div>
                <Suspense fallback={<AppLoadingPage />}>
                  <SelectCreatedWorksDialog
                    selectedWorks={selectedWorks}
                    setSelectedWorks={setSelectedWorks}
                  >
                    <div className="border-2 border-transparent p-1">
                      <Button
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
            </div>
          </ScrollArea>
          <Button disabled={isCreating} onClick={onCreateAlbum}>
            保存して追加
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => {
              setIsOpen(false)
            }}
          >
            キャンセル
          </Button>
        </DialogContent>
      </Dialog>
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

const createAlbumMutation = graphql(
  `mutation CreateAlbum($input: CreateAlbumInput!) {
    createAlbum(input: $input) {
      id
    }
  }`,
)
