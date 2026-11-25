import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import {
  GlobeIcon,
  ImagePlusIcon,
  Loader2Icon,
  LockIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { CropImageField } from "~/components/crop-image-field"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { StickerPublishFields } from "~/routes/($lang)._main.posts.$post._index/components/sticker-publish-fields"
import { STICKER_ANIMATED_GIF_OPTIONS } from "~/utils/animated-gif-to-webp"
import { deleteUploadedImage } from "~/utils/delete-uploaded-image"
import { getBase64FromImageUrl } from "~/utils/get-base64-from-image-url"
import { uploadPublicImage } from "~/utils/upload-public-image"

type Props = {
  onAddedSicker?: (isPublic: boolean) => void
  defaultImageBase64?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

/**
 * スタンプ追加ダイアログ
 */
export function AddStickerDialog(props: Props) {
  const authContext = useContext(AuthContext)

  const t = useTranslation()

  const [imageBase64, setImageBase64] = useState(props.defaultImageBase64 ?? "")

  const [title, setTitle] = useState("")

  const [tags, setTags] = useState<string[]>([])

  const [internalOpen, setInternalOpen] = useState<boolean>(false)

  const isControlled = props.open !== undefined
  const isOpen = isControlled ? (props.open ?? false) : internalOpen

  const setIsOpen = (next: boolean) => {
    if (isControlled) {
      props.onOpenChange?.(next)
      return
    }
    setInternalOpen(next)
  }

  const [isPublic, setIsPublic] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: token } = useQuery(viewerTokenQuery)

  const [createSticker, { loading: isLoading }] = useMutation(
    createStickerMutation,
  )

  const [createUserSticker, { loading: isCreatingUserSticker }] = useMutation(
    createUserStickerMutation,
  )

  const onCrop = async (croppedImage: string) => {
    const base64 = await getBase64FromImageUrl(croppedImage)
    setImageBase64(base64)
  }

  const resetForm = () => {
    setImageBase64("")
    setTitle("")
    setTags([])
    setIsPublic(false)
  }

  const onClose = () => {
    setIsOpen(false)
    resetForm()
  }

  const onDeleteImage = () => {
    setImageBase64("")
  }

  useEffect(() => {
    if (!isOpen) return
    if (!props.defaultImageBase64) return
    if (imageBase64 !== "") return
    setImageBase64(props.defaultImageBase64)
  }, [imageBase64, isOpen, props.defaultImageBase64])

  const uploadSticker = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await submitSticker()
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitSticker = async () => {
    if (imageBase64 === "") {
      toast(t("画像を選択してください", "Please select an image"))
      return
    }

    if (authContext.isLoading || authContext.isNotLoggedIn) {
      toast(t("ログインしてください", "Please log in"))
      return
    }

    if (isPublic && title.trim() === "") {
      toast(t("タイトルを入力してください", "Please enter a title"))
      return
    }

    const uploadedImageUrl = await uploadPublicImage(
      imageBase64,
      token?.viewer?.token,
    )

    if (uploadedImageUrl === "") {
      toast(t("画像のアップロードに失敗しました", "Failed to upload the image"))
      return
    }

    try {
      const newSticker = await createSticker({
        variables: {
          input: {
            title: isPublic ? title.trim() : null,
            categories: isPublic ? tags : null,
            imageUrl: uploadedImageUrl,
            accessType: isPublic ? "PUBLIC" : "PRIVATE",
          },
        },
      })

      if (!newSticker || !newSticker.data) {
        toast(t("スタンプの作成に失敗しました", "Failed to create the sticker"))
        return
      }

      await createUserSticker({
        variables: {
          input: {
            stickerId: newSticker.data.createSticker.id,
          },
        },
      })

      if (props.onAddedSicker) {
        props.onAddedSicker(isPublic)
      }

      toast(
        isPublic
          ? t("スタンプを公開しました", "Sticker published")
          : t(
              "非公開で作成しました。公開は「設定 > スタンプ」からできます",
              "Created as private. You can publish it from Settings > Stickers",
            ),
      )
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
      await deleteUploadedImage(uploadedImageUrl)
    }
  }

  const missingPublishField = isPublic && title.trim() === ""

  const isBusy = isSubmitting || isLoading || isCreatingUserSticker

  const submitHint =
    imageBase64 === ""
      ? t("画像を選んでください", "Choose an image")
      : missingPublishField
        ? t("公開するにはタイトルを入力してください", "Add a title to publish")
        : null

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (isBusy && !nextOpen) return
        setIsOpen(nextOpen)
        if (!nextOpen) {
          resetForm()
        }
      }}
    >
      {props.children ? (
        <DialogTrigger asChild>{props.children}</DialogTrigger>
      ) : null}
      <DialogContent className="flex w-[calc(100%-1.5rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="space-y-1 border-b px-5 py-4 pr-14 text-left">
          <DialogTitle>{t("スタンプを追加", "Add a sticker")}</DialogTitle>
          <DialogDescription>
            {t(
              "画像を選んで、使う範囲を決めるだけで追加できます",
              "Choose an image and who can use it",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
            <div className="mx-auto w-full max-w-[200px] space-y-2 md:max-w-[260px]">
              <CropImageField
                isHidePreviewImage={imageBase64 === ""}
                defaultCroppedImage={props.defaultImageBase64}
                cropWidth={512}
                cropHeight={512}
                fileExtension={"png"}
                animatedGif={STICKER_ANIMATED_GIF_OPTIONS}
                onDeleteImage={onDeleteImage}
                onCrop={onCrop}
                isChildrenDropZone={true}
              >
                <button
                  type="button"
                  disabled={isBusy}
                  aria-label={
                    imageBase64 === ""
                      ? t("画像を選ぶ", "Choose an image")
                      : t("画像を変更", "Change image")
                  }
                  className={cn(
                    "group relative flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 text-center transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "data-[drag-over=true]:border-primary data-[drag-over=true]:bg-primary/10",
                    imageBase64 === ""
                      ? "border-muted-foreground/30 border-dashed bg-muted/40 hover:border-primary/60 hover:bg-muted/70"
                      : "border-border",
                  )}
                  style={imageBase64 === "" ? undefined : CHECKERBOARD_STYLE}
                >
                  {imageBase64 === "" ? (
                    <>
                      <span className="flex size-14 items-center justify-center rounded-full bg-background shadow-sm">
                        <ImagePlusIcon className="size-6 text-primary" />
                      </span>
                      <span className="font-bold text-sm">
                        {t("画像を選ぶ", "Choose an image")}
                      </span>
                      <span className="hidden text-muted-foreground text-xs sm:block">
                        {t(
                          "またはここにドラッグ＆ドロップ",
                          "or drag and drop here",
                        )}
                      </span>
                    </>
                  ) : (
                    <>
                      <img
                        src={imageBase64}
                        alt={t("スタンプのプレビュー", "Sticker preview")}
                        className="size-full object-contain p-3"
                      />
                      <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/55 py-1.5 text-white text-xs opacity-100 transition-opacity sm:opacity-0 sm:group-focus-visible:opacity-100 sm:group-hover:opacity-100">
                        <RefreshCwIcon className="size-3.5" />
                        {t("画像を変更", "Change image")}
                      </span>
                    </>
                  )}
                </button>
              </CropImageField>
              {imageBase64 === "" ? (
                <p className="text-center text-muted-foreground text-xs leading-relaxed">
                  {t(
                    "PNG・JPG・WebP・アニメーション（GIF / APNG / WebP）",
                    "PNG, JPG, WebP or animated GIF / APNG / WebP",
                  )}
                  <br />
                  {t(
                    "正方形に切り抜きます（アニメーションはそのまま）",
                    "Cropped to a square (animations are kept as is)",
                  )}
                </p>
              ) : (
                <Button
                  type="button"
                  variant={"ghost"}
                  size={"sm"}
                  disabled={isBusy}
                  className="w-full text-muted-foreground"
                  onClick={onDeleteImage}
                >
                  <Trash2Icon className="mr-1.5 size-4" />
                  {t("画像を外す", "Remove image")}
                </Button>
              )}
            </div>

            <div className="min-w-0 space-y-5">
              <div className="space-y-2">
                <p className="font-medium text-sm">
                  {t("使える人", "Who can use it")}
                </p>
                <fieldset
                  aria-label={t("使える人", "Who can use it")}
                  className="grid min-w-0 grid-cols-2 gap-2"
                >
                  <VisibilityOption
                    isSelected={!isPublic}
                    disabled={isBusy}
                    icon={<LockIcon className="size-4" />}
                    title={t("自分だけ", "Only me")}
                    description={t(
                      "自分のコメントで使えます。あとから公開もできます",
                      "Use it in your comments. You can publish it later",
                    )}
                    onSelect={() => setIsPublic(false)}
                  />
                  <VisibilityOption
                    isSelected={isPublic}
                    disabled={isBusy}
                    icon={<GlobeIcon className="size-4" />}
                    title={t("みんなに公開", "Everyone")}
                    description={t(
                      "スタンプ広場に載り、誰でも使えます",
                      "Listed in the sticker square for everyone",
                    )}
                    onSelect={() => setIsPublic(true)}
                  />
                </fieldset>
              </div>
              {isPublic && (
                <StickerPublishFields
                  className="rounded-xl border bg-muted/30 p-4"
                  title={title}
                  tags={tags}
                  onChangeTitle={setTitle}
                  onChangeTags={setTags}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t bg-background px-5 py-3 sm:flex-row sm:items-center">
          {submitHint !== null && (
            <p className="text-center text-muted-foreground text-xs sm:mr-auto sm:text-left">
              {submitHint}
            </p>
          )}
          <div className="flex gap-2 sm:ml-auto">
            <Button
              type="button"
              variant={"ghost"}
              className="flex-1 sm:flex-none"
              disabled={isBusy}
              onClick={onClose}
            >
              {t("キャンセル", "Cancel")}
            </Button>
            <Button
              type="button"
              className="flex-[2] sm:min-w-40 sm:flex-none"
              disabled={isBusy || submitHint !== null}
              onClick={uploadSticker}
            >
              {isBusy ? (
                <>
                  <Loader2Icon className="mr-1.5 size-4 animate-spin" />
                  {t("追加しています", "Adding")}
                </>
              ) : isPublic ? (
                t("公開して追加", "Publish")
              ) : (
                t("追加する", "Add")
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** 透過した部分が分かるように市松模様を敷く */
const CHECKERBOARD_STYLE: React.CSSProperties = {
  backgroundColor: "var(--background, #fff)",
  backgroundImage:
    "linear-gradient(45deg, rgba(127,127,127,0.12) 25%, transparent 25%), linear-gradient(-45deg, rgba(127,127,127,0.12) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(127,127,127,0.12) 75%), linear-gradient(-45deg, transparent 75%, rgba(127,127,127,0.12) 75%)",
  backgroundSize: "20px 20px",
  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
}

function VisibilityOption(props: {
  isSelected: boolean
  disabled?: boolean
  icon: React.ReactNode
  title: string
  description: string
  onSelect(): void
}) {
  return (
    <button
      type="button"
      aria-pressed={props.isSelected}
      disabled={props.disabled}
      onClick={props.onSelect}
      className={cn(
        "flex h-full flex-col gap-1 rounded-xl border-2 p-3 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        props.isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-muted/60",
      )}
    >
      <span className="flex items-center gap-1.5 font-bold text-sm">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full",
            props.isSelected
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {props.icon}
        </span>
        {props.title}
      </span>
      <span className="text-muted-foreground text-xs leading-snug">
        {props.description}
      </span>
    </button>
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

const createStickerMutation = graphql(
  `mutation CreateSticker($input: CreateStickerInput!) {
    createSticker(input: $input) {
      id
    }
  }`,
)

const createUserStickerMutation = graphql(
  `mutation CreateUserSticker($input: CreateUserStickerInput!) {
    createUserSticker(input: $input) {
      id
    }
  }`,
)
