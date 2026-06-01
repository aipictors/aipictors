import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { CropImageField } from "~/components/crop-image-field"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { ScrollArea } from "~/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { AuthContext } from "~/contexts/auth-context"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { createRandomString } from "~/routes/($lang).generation._index/utils/create-random-string"
import { AlbumWorkLimitUpgradeDialog } from "~/routes/($lang).my._index/components/album-work-limit-upgrade-dialog"
import { SelectCreatedWorksDialogWithIds } from "~/routes/($lang).my._index/components/select-created-works-dialog-with-ids"
import {
  FREE_ALBUM_WORKS_LIMIT,
  getAlbumWorksLimit,
  getAlbumWorksLimitUpgradeTarget,
  LITE_ALBUM_WORKS_LIMIT,
  STANDARD_ALBUM_WORKS_LIMIT,
} from "~/utils/album-work-limit"
import { getBase64FromImageUrl } from "~/utils/get-base64-from-image-url"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { toRatingText } from "~/utils/work/to-rating-text"

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

  const [rating, setRating] = useState<IntrospectionEnum<"AlbumRating">>("G")

  const [selectedWorkIds, setSelectedWorkIds] = useState<string[]>([])

  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)

  const [createAlbum] = useMutation(createAlbumMutation)

  const { data: token, refetch: tokenRefetch } = useQuery(viewerTokenQuery)
  const { data: currentPassData } = useQuery(viewerCurrentPassQuery)
  const currentPassType = currentPassData?.viewer?.currentPass?.type ?? null
  const albumWorksMax = getAlbumWorksLimit(currentPassType)
  const nextUpgrade = getAlbumWorksLimitUpgradeTarget(currentPassType)

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
    if (selectedWorkIds.length === 0) {
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
              workIds: selectedWorkIds,
              rating,
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
            workIds: selectedWorkIds,
            rating,
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
                  {`https://www.aipictors.com/${appContext.userId}/series/${slug}`}
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
                  <p className="font-bold text-sm">レーティング</p>
                </div>
                <Select
                  value={rating as string}
                  onValueChange={(value) => {
                    setRating(value as IntrospectionEnum<"AlbumRating">)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="レーティングを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="G">{toRatingText("G")}</SelectItem>
                    <SelectItem value="R15">{toRatingText("R15")}</SelectItem>
                    <SelectItem value="R18">{toRatingText("R18")}</SelectItem>
                    <SelectItem value="R18G">{toRatingText("R18G")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <div className="flex space-x-2">
                  <p className="font-bold text-sm">作品</p>
                  <p className="text-sm opacity-50">*必須</p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm">シリーズ作品数</p>
                      <p className="mt-1 text-muted-foreground text-xs">
                        {`無料で${FREE_ALBUM_WORKS_LIMIT}作品、ライト以上で${LITE_ALBUM_WORKS_LIMIT}作品、スタンダード以上で${STANDARD_ALBUM_WORKS_LIMIT}作品まで追加できます。`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {selectedWorkIds.length}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        / {albumWorksMax}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-muted-foreground text-xs">
                    選択中タブでドラッグ&ドロップすると、この順番がシリーズの設定順になります。
                  </p>
                  {nextUpgrade && (
                    <button
                      type="button"
                      className="mt-2 font-medium text-primary text-xs underline-offset-4 hover:underline"
                      onClick={() => setIsUpgradeDialogOpen(true)}
                    >
                      {`${nextUpgrade.passType === "LITE" ? "ライト" : "スタンダード"}で${nextUpgrade.limit}作品まで拡張`}
                    </button>
                  )}
                </div>
                <SelectCreatedWorksDialogWithIds
                  currentPassType={currentPassType}
                  limit={albumWorksMax}
                  selectedWorkIds={selectedWorkIds}
                  setSelectedWorkIds={setSelectedWorkIds}
                />
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

      <AlbumWorkLimitUpgradeDialog
        currentPassType={currentPassType}
        open={isUpgradeDialogOpen}
        onOpenChange={setIsUpgradeDialogOpen}
      />
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

const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      id
      currentPass {
        id
        type
      }
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
