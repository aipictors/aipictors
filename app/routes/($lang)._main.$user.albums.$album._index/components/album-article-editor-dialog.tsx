import { useMutation, useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { CropImageField } from "~/components/crop-image-field"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { AlbumWorkLimitUpgradeDialog } from "~/routes/($lang).my._index/components/album-work-limit-upgrade-dialog"
import { SelectCreatedWorksDialogWithIds } from "~/routes/($lang).my._index/components/select-created-works-dialog-with-ids"
import {
  FREE_ALBUM_WORKS_LIMIT,
  getAlbumWorksLimit,
  getAlbumWorksLimitUpgradeTarget,
  LITE_ALBUM_WORKS_LIMIT,
  STANDARD_ALBUM_WORKS_LIMIT,
} from "~/utils/album-work-limit"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { toRatingText } from "~/utils/work/to-rating-text"

type Props = {
  album: FragmentOf<typeof AlbumArticleEditorDialogFragment>
  thumbnail?: string
  children: React.ReactNode
  userNanoid: string
  onUpdated?: (
    album: FragmentOf<typeof AlbumArticleEditorDialogFragment>,
  ) => void
}

export function AlbumArticleEditorDialog(props: Props) {
  const t = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

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
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)

  const [updateAlbum, { loading: isUpdating }] =
    useMutation(updateAlbumMutation)
  const { data: token } = useQuery(viewerTokenQuery)
  const { data: currentPassData } = useQuery(viewerCurrentPassQuery)
  const currentPassType = currentPassData?.viewer?.currentPass?.type ?? null
  const albumWorksMax = getAlbumWorksLimit(currentPassType)
  const nextUpgrade = getAlbumWorksLimitUpgradeTarget(currentPassType)
  const selectedWorksCount = selectedWorks.length
  const hasCoverImage = Boolean(thumbnailImageBase64 || props.thumbnail)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setSelectedWorks(props.album.workIds.map((work) => work.toString()))
    setTitle(props.album.title)
    setDescription(props.album.description)
    setRating(props.album.rating)
    setThumbnailImageBase64("")
    setIsThumbnailCleared(false)
  }, [isOpen, props.album])

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

    const hasWorkSelectionChanged =
      selectedWorks.length !== props.album.workIds.length ||
      selectedWorks.some(
        (workId, index) => workId !== props.album.workIds[index]?.toString(),
      )

    const result = await updateAlbum({
      variables: {
        input: {
          albumId: props.album.id,
          title: title,
          description: description,
          rating,
          ...(headerImageUrl && { headerImageUrl }),
          ...(hasWorkSelectionChanged && { workIds: selectedWorks }),
        },
      },
    })

    if (result.data?.updateAlbum) {
      props.onUpdated?.(result.data.updateAlbum)
    }

    setIsOpen(false)
    toast(t("シリーズを更新しました", "Album updated successfully"))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="flex max-h-[90svh] w-[calc(100vw-1rem)] max-w-5xl flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 px-4 pt-4 pr-12 sm:px-6 sm:pt-6">
          <DialogTitle>{t("シリーズ更新", "Update Album")}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("基本情報", "Basic details")}</CardTitle>
                  <CardDescription>
                    {t(
                      "シリーズ名、説明、表示レーティングを更新します。",
                      "Update the series title, description, and visible rating.",
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="title"
                      className="font-medium text-sm leading-none"
                    >
                      {t("タイトル", "Title")}
                    </label>
                    <Input
                      id="title"
                      maxLength={32}
                      minLength={1}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <p className="text-muted-foreground text-xs">
                      {t(
                        "作品一覧や共有時に表示されるシリーズ名です。",
                        "This name appears in the work list and when the series is shared.",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="album-rating"
                      className="font-medium text-sm leading-none"
                    >
                      {t("レーティング", "Rating")}
                    </label>
                    <Select
                      value={rating as string}
                      onValueChange={(value) => {
                        setRating(value as IntrospectionEnum<"AlbumRating">)
                      }}
                    >
                      <SelectTrigger id="album-rating">
                        <SelectValue
                          placeholder={t("レーティング", "Rating")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="G">{toRatingText("G")}</SelectItem>
                        <SelectItem value="R15">
                          {toRatingText("R15")}
                        </SelectItem>
                        <SelectItem value="R18">
                          {toRatingText("R18")}
                        </SelectItem>
                        <SelectItem value="R18G">
                          {toRatingText("R18G")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="album-description"
                      className="font-medium text-sm leading-none"
                    >
                      {t("説明", "Description")}
                    </label>
                    <AutoResizeTextarea
                      id="album-description"
                      className="rounded-md border px-3 py-2"
                      maxLength={640}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("作品の並びと選択", "Works and ordering")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "作品の追加・削除と並び順の調整を行います。",
                      "Add or remove works and adjust the order they appear in the series.",
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                    <div>
                      <p className="font-medium text-sm">
                        {t("選択中の作品", "Selected works")}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {t(
                          "ドラッグで順番を変えるとシリーズ表示順として保存されます。",
                          "Drag to reorder works and save that order as the series layout.",
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {selectedWorksCount}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        / {albumWorksMax}
                      </p>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-xs">
                    {t(
                      `無料で${FREE_ALBUM_WORKS_LIMIT}作品、ライト以上で${LITE_ALBUM_WORKS_LIMIT}作品、スタンダード以上で${STANDARD_ALBUM_WORKS_LIMIT}作品まで追加できます。`,
                      `Free users can add ${FREE_ALBUM_WORKS_LIMIT}, Lite or above ${LITE_ALBUM_WORKS_LIMIT}, and Standard or above ${STANDARD_ALBUM_WORKS_LIMIT} works.`,
                    )}
                  </p>

                  {nextUpgrade && (
                    <button
                      type="button"
                      className="w-fit font-medium text-primary text-xs underline-offset-4 hover:underline"
                      onClick={() => setIsUpgradeDialogOpen(true)}
                    >
                      {t(
                        `${nextUpgrade.passType === "LITE" ? "ライト" : "スタンダード"}で${nextUpgrade.limit}作品まで拡張`,
                        `Upgrade to ${nextUpgrade.passType} for up to ${nextUpgrade.limit} works`,
                      )}
                    </button>
                  )}

                  <SelectCreatedWorksDialogWithIds
                    currentAlbumId={props.album.id}
                    currentPassType={currentPassType}
                    limit={albumWorksMax}
                    selectedWorkIds={selectedWorks}
                    setSelectedWorkIds={setSelectedWorks}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("カバー画像", "Cover image")}</CardTitle>
                  <CardDescription>
                    {t(
                      "一覧や共有時に表示されるカバーです。R18 部分は含めないでください。",
                      "This cover is shown in lists and shares. Do not include explicit R18 content.",
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
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
                  <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                    <div className="font-medium">
                      {t("現在の状態", "Current status")}
                    </div>
                    <div className="mt-1 text-muted-foreground text-xs">
                      {isThumbnailCleared
                        ? t(
                            "保存時にカバー画像を削除します。",
                            "The cover image will be removed when you save.",
                          )
                        : hasCoverImage
                          ? t(
                              "カバー画像が設定されています。",
                              "A cover image is set.",
                            )
                          : t(
                              "カバー画像は未設定です。",
                              "No cover image is set.",
                            )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-4 sm:px-6">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              {t("閉じる", "Close")}
            </Button>
            <Button
              disabled={isUpdating}
              className="sm:min-w-40"
              onClick={onSubmit}
            >
              {isUpdating ? (
                <Loader2Icon className="m-auto size-4 animate-spin" />
              ) : (
                t("更新する", "Update")
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      <AlbumWorkLimitUpgradeDialog
        currentPassType={currentPassType}
        open={isUpgradeDialogOpen}
        onOpenChange={setIsUpgradeDialogOpen}
      />
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
      ...AlbumArticleEditorDialog
    }
  }`,
  [AlbumArticleEditorDialogFragment],
)

const viewerTokenQuery = graphql(
  `query ViewerAlbumToken {
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
