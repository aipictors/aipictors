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
import { useContext, useState } from "react"
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
  children: React.ReactNode
}

/**
 * スタンプ追加ダイアログ
 */
export function AddStickerDialog(props: Props) {
  const authContext = useContext(AuthContext)

  const t = useTranslation()

  const [imageBase64, setImageBase64] = useState("")

  const [title, setTitle] = useState("")

  const [genre, setGenre] = useState("CHARACTER")

  const [tag, setTag] = useState("")

  const [isOpen, setIsOpen] = useState<boolean>(false)

  const [isPublic, setIsPublic] = useState(false)

  const { data: token, refetch: tokenRefetch } = useQuery(viewerTokenQuery)

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
  }

  const onDeleteImage = () => {
    setImageBase64("")
  }

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
      onOpenChange={(isOpen) => {
        setIsOpen((prev) => (prev !== isOpen ? isOpen : prev))
      }}
    >
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="min-h-[40vw] min-w-[88vw] pl-2">
        <DialogHeader>
          <DialogTitle>{t("スタンプ追加", "Add Sticker")}</DialogTitle>
        </DialogHeader>
        <CropImageField
          isHidePreviewImage={imageBase64 === ""}
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
              id="public-sticker"
            />
            <label
              htmlFor="public-sticker"
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
                  <label htmlFor="person-check">
                    {t("人物", "Character")}
                    <RadioGroupItem value="CHARACTER" id="person-check" />
                  </label>
                </div>
                <div className="items-center space-x-2">
                  <label htmlFor="animal-check">
                    {t("動物", "Animal")}
                    <RadioGroupItem value="ANIMAL" id="animal-check" />
                  </label>
                </div>
                <div className="items-center space-x-2">
                  <label htmlFor="machine-check">
                    {t("機械", "Machine")}
                    <RadioGroupItem value="MACHINE" id="machine-check" />
                  </label>
                </div>
                <div className="items-center space-x-2">
                  <label htmlFor="background-check">
                    {t("背景", "Background")}
                    <RadioGroupItem value="BACKGROUND" id="background-check" />
                  </label>
                </div>
                <div className="items-center space-x-2">
                  <label htmlFor="object-check">
                    {t("物", "Object")}
                    <RadioGroupItem value="OBJECT" id="object-check" />
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
                  <label htmlFor="happy-check">
                    {t("楽しい", "Fun")}
                    <RadioGroupItem value="楽しい" id="happy-check" />
                  </label>
                </div>
                <div className="items-center space-x-2">
                  <label htmlFor="enjoy-check">
                    {t("嬉しい", "Happy")}
                    <RadioGroupItem value="嬉しい" id="enjoy-check" />
                  </label>
                </div>
                <div className="items-center space-x-2">
                  <label htmlFor="celebration-check">
                    {t("お祝い", "Celebration")}
                    <RadioGroupItem value="お祝い" id="celebration-check" />
                  </label>
                </div>
                <div className="items-center space-x-2">
                  <label htmlFor="sad-check">
                    {t("悲しい", "Sad")}
                    <RadioGroupItem value="悲しい" id="sad-check" />
                  </label>
                </div>
                <div className="items-center space-x-2">
                  <label htmlFor="other-check">
                    {t("その他", "Other")}
                    <RadioGroupItem value="その他" id="other-check" />
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
