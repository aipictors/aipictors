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

type Props = {
  onAddedSicker?: () => void
  children: React.ReactNode
}

/**
 * スタンプ追加ダイアログ
 */
export const AddStickerDialog = (props: Props) => {
  const authContext = useContext(AuthContext)

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

  /**
   * クロップ完了
   * @param croppedImage クロップした画像
   */
  const onCrop = async (croppedImage: string) => {
    const base64 = await getBase64FromImageUrl(croppedImage)
    setImageBase64(base64)
  }

  /**
   * ダイアログを閉じたときの処理
   */
  const onClose = () => {
    setIsOpen(false)
  }

  /**
   * 画像削除
   */
  const onDeleteImage = () => {
    setImageBase64("")
  }

  const uploadSticker = async () => {
    if (imageBase64 === "") {
      toast("画像を選択してください")
      return
    }

    if (authContext.isLoading || authContext.isNotLoggedIn) {
      toast("ログインしてください")
      return
    }

    if (isPublic && title === "") {
      toast("タイトルを入力してください")
      return
    }

    const imageFileName = `${createRandomString(30)}.webp`

    // 画像をアップロードする処理
    const uploadedImageUrl = await uploadPublicImage(
      imageBase64,
      token?.viewer?.token,
    )

    if (uploadedImageUrl === "") {
      toast("画像のアップロードに失敗しました")
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
        toast("スタンプの作成に失敗しました")
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

      toast("スタンプを追加しました")
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
          <DialogTitle>{"スタンプ追加"}</DialogTitle>
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
              誰でも使えるように公開する
            </label>
          </div>
          {isPublic && (
            <div className="space-y-2">
              <p className="mt-2">タイトル</p>
              <Input
                onChange={(event) => {
                  setTitle(event.target.value)
                }}
                value={title}
                placeholder="タイトル"
              />
              <p>ジャンル</p>
              <RadioGroup
                value={genre}
                onValueChange={(value) => {
                  setGenre(value)
                }}
                className="flex items-center space-x-2"
              >
                <div className="items-center space-x-2">
                  <RadioGroupItem value="CHARACTER" id="person-check" />
                  <label htmlFor="person-check">{"人物"}</label>
                </div>
                <div className="items-center space-x-2">
                  <RadioGroupItem value="ANIMAL" id="animal-check" />
                  <label htmlFor="animal-check">{"動物"}</label>
                </div>
                <div className="items-center space-x-2">
                  <RadioGroupItem value="MACHINE" id="machine-check" />
                  <label htmlFor="machine-check">{"機械"}</label>
                </div>
                <div className="items-center space-x-2">
                  <RadioGroupItem value="BACKGROUND" id="background-check" />
                  <label htmlFor="background-check">{"背景"}</label>
                </div>
                <div className="items-center space-x-2">
                  <RadioGroupItem value="OBJECT" id="object-check" />
                  <label htmlFor="object-check">{"物"}</label>
                </div>
              </RadioGroup>
              <p>タグ</p>
              <RadioGroup
                value={tag.toString()}
                onValueChange={(value) => {
                  setTag(value)
                }}
                className="flex items-center space-x-2"
              >
                <div className="items-center space-x-2">
                  <RadioGroupItem value="楽しい" id="happy-check" />
                  <label htmlFor="happy-check">{"楽しい"}</label>
                </div>
                <div className="items-center space-x-2">
                  <RadioGroupItem value="嬉しい" id="enjoy-check" />
                  <label htmlFor="enjoy-check">{"嬉しい"}</label>
                </div>
                <div className="items-center space-x-2">
                  <RadioGroupItem value="お祝い" id="celebration-check" />
                  <label htmlFor="celebration-check">{"お祝い"}</label>
                </div>
                <div className="items-center space-x-2">
                  <RadioGroupItem value="悲しい" id="sad-check" />
                  <label htmlFor="sad-check">{"悲しい"}</label>
                </div>
                <div className="items-center space-x-2">
                  <RadioGroupItem value="その他" id="other-check" />
                  <label htmlFor="other-check">{"その他"}</label>
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
            {"キャンセル"}
          </Button>
          {isLoading || isCreatingUserSticker ? (
            <Button
              disabled={true}
              className="m-auto w-full"
              onClick={() => {}}
            >
              <Loader2Icon className="h-4 w-4 animate-spin" />
            </Button>
          ) : (
            <Button
              disabled={imageBase64 === ""}
              className="m-auto w-full"
              onClick={uploadSticker}
            >
              {"追加"}
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