import { CropImageField } from "~/components/crop-image-field"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { getBase64FromImageUrl } from "~/utils/get-base64-from-image-url"
import { useContext, useEffect, useId, useState } from "react"
import { Button } from "~/components/ui/button"
import { toast } from "sonner"
import { createRandomString } from "~/routes/($lang).generation._index/utils/create-random-string"
import { AuthContext } from "~/contexts/auth-context"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { useMutation, useQuery } from "@apollo/client/index"
import { Loader2Icon } from "lucide-react"
import { uploadPublicImage } from "~/utils/upload-public-image"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { deleteUploadedImage } from "~/utils/delete-uploaded-image"
import { graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  onAddedSicker?: () => void
  defaultImageBase64?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

/**
 * スタンプ追加ダイアログ
 */
export function AddStickerDialog (props: Props) {
  const authContext = useContext(AuthContext)

  const t = useTranslation()

  const [imageBase64, setImageBase64] = useState(props.defaultImageBase64 ?? "")

  const [title, setTitle] = useState("")

  const [genre, setGenre] = useState("CHARACTER")

  const [tag, setTag] = useState("")

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

  const id = useId()
  const publicStickerId = `${id}-public-sticker`
  const personId = `${id}-person-check`
  const animalId = `${id}-animal-check`
  const machineId = `${id}-machine-check`
  const backgroundId = `${id}-background-check`
  const objectId = `${id}-object-check`
  const happyId = `${id}-happy-check`
  const enjoyId = `${id}-enjoy-check`
  const celebrationId = `${id}-celebration-check`
  const sadId = `${id}-sad-check`
  const otherId = `${id}-other-check`

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

  const onClose = () => {
    setIsOpen(false)
    setImageBase64("")
    setTitle("")
    setGenre("CHARACTER")
    setTag("")
    setIsPublic(false)
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
    if (imageBase64 === "") {
      toast(t("画像を選択してください", "Please select an image"))
      return
    }

    if (authContext.isLoading || authContext.isNotLoggedIn) {
      toast(t("ログインしてください", "Please log in"))
      return
    }

    if (isPublic && title === "") {
      toast(t("タイトルを入力してください", "Please enter a title"))
      return
    }

    const _imageFileName = `${createRandomString(30)}.webp`

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
            title: isPublic ? title : null,
            genre: isPublic
              ? (genre as IntrospectionEnum<"StickerGenre">)
              : null,
            categories: isPublic ? [tag] : null,
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
        props.onAddedSicker()
      }

      toast(t("スタンプを追加しました", "Sticker added successfully"))
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
      await deleteUploadedImage(uploadedImageUrl)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        setIsOpen(nextOpen)
        if (!nextOpen) {
          setImageBase64("")
          setTitle("")
          setGenre("CHARACTER")
          setTag("")
          setIsPublic(false)
        }
      }}
    >
      {props.children ? (
        <DialogTrigger asChild>{props.children}</DialogTrigger>
      ) : null}
      <DialogContent className="min-h-[40vw] min-w-[88vw] pl-2">
        <DialogHeader>
          <DialogTitle>{t("スタンプ追加", "Add Sticker")}</DialogTitle>
        </DialogHeader>
        <CropImageField
          isHidePreviewImage={imageBase64 === ""}
          defaultCroppedImage={props.defaultImageBase64}
          cropWidth={240}
          cropHeight={240}
          fileExtension={"webp"}
          onDeleteImage={onDeleteImage}
          onCrop={onCrop}
        />
        <div className="items-center space-x-2">
          <div className="items-center">
            <Checkbox
              checked={isPublic}
              onCheckedChange={() => {
                setIsPublic((prev) => !prev)
              }}
              id={publicStickerId}
            />
            <label
              htmlFor={publicStickerId}
              className="ml-2 font-medium text-sm"
            >
              {t(
                "誰でも使えるように公開する",
                "Make public for everyone to use",
              )}
            </label>
          </div>
          {isPublic && (
            <div className="space-y-2">
              <p className="mt-2">{t("タイトル", "Title")}</p>
              <Input
                onChange={(event) => {
                  setTitle(event.target.value)
                }}
                value={title}
                placeholder={t("タイトル", "Title")}
              />
              <p>{t("ジャンル", "Genre")}</p>
              <RadioGroup
                value={genre}
                onValueChange={(value) => {
                  setGenre(value)
                }}
                className="flex items-center space-x-2"
              >
                <div className="items-center space-x-2">
                  <label htmlFor={personId}>
                    {t("人物", "Character")}
                    <RadioGroupItem value="CHARACTER" id={personId} />
                  </label>
                </div>
                <div className="items-center space-x-2">
                  <label htmlFor={animalId}>
                    {t("動物", "Animal")}
                    <RadioGroupItem value="ANIMAL" id={animalId} />
                  </label>
                </div>
                <div className="items-center space-x-2">
                  <label htmlFor={machineId}>
                    {t("機械", "Machine")}
                    <RadioGroupItem value="MACHINE" id={machineId} />
                  </label>
                </div>
                <div className="items-center space-x-2">
                  <label htmlFor={backgroundId}>
                    {t("背景", "Background")}
                    <RadioGroupItem value="BACKGROUND" id={backgroundId} />
                  </label>
                </div>
                <div className="items-center space-x-2">
                  <label htmlFor={objectId}>
                    {t("物", "Object")}
                    <RadioGroupItem value="OBJECT" id={objectId} />
                  </label>
                </div>
              </RadioGroup>
              <p>{t("タグ", "Tag")}</p>
              <RadioGroup
                value={tag.toString()}
                onValueChange={(value) => {
                  setTag(value)
                }}
                className="flex items-center space-x-2"
              >
                <div className="items-center space-x-2">
                  <label htmlFor={happyId}>
                    {t("楽しい", "Fun")}
                    <RadioGroupItem value="楽しい" id={happyId} />
                  </label>
                </div>
                <div className="items-center space-x-2">
                  <label htmlFor={enjoyId}>
                    {t("嬉しい", "Happy")}
                    <RadioGroupItem value="嬉しい" id={enjoyId} />
                  </label>
                </div>
                <div className="items-center space-x-2">
                  <label htmlFor={celebrationId}>
                    {t("お祝い", "Celebration")}
                    <RadioGroupItem value="お祝い" id={celebrationId} />
                  </label>
                </div>
                <div className="items-center space-x-2">
                  <label htmlFor={sadId}>
                    {t("悲しい", "Sad")}
                    <RadioGroupItem value="悲しい" id={sadId} />
                  </label>
                </div>
                <div className="items-center space-x-2">
                  <label htmlFor={otherId}>
                    {t("その他", "Other")}
                    <RadioGroupItem value="その他" id={otherId} />
                  </label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant={"secondary"}
            className="m-auto w-full"
            onClick={onClose}
          >
            {t("キャンセル", "Cancel")}
          </Button>
          {isLoading || isCreatingUserSticker ? (
            <Button
              disabled={true}
              className="m-auto w-full"
              onClick={() => {}}
            >
              <Loader2Icon className="size-4 animate-spin" />
            </Button>
          ) : (
            <Button
              disabled={imageBase64 === ""}
              className="m-auto w-full"
              onClick={uploadSticker}
            >
              {t("追加", "Add")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
