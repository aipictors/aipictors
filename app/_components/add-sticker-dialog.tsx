import CropImageField from "@/_components/crop-image-field"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/_components/ui/dialog"
import getBase64FromImageUrl from "@/_utils/get-base64-from-image-url"
import { useContext, useState } from "react"
import { Button } from "@/_components/ui/button"
import { toast } from "sonner"
import { uploadPublicImage } from "@/_utils/upload-public-image"
import { createRandomString } from "@/routes/($lang).generation._index/_utils/create-random-string"
import { AuthContext } from "@/_contexts/auth-context"
import { Checkbox } from "@/_components/ui/checkbox"
import { Input } from "@/_components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/_components/ui/radio-group"

type Props = {
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

  const [tag, setTag] = useState(1)

  const [isOpen, setIsOpen] = useState<boolean>(false)

  const [isPublic, setIsPublic] = useState(false)

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
      imageFileName,
      authContext.userId,
    )

    console.log(uploadedImageUrl)
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
              <Input placeholder="タイトル" />
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
                  setTag(Number(value))
                }}
                className="flex items-center space-x-2"
              >
                <div className="items-center space-x-2">
                  <RadioGroupItem value="1" id="happy-check" />
                  <label htmlFor="happy-check">{"楽しい"}</label>
                </div>
                <div className="items-center space-x-2">
                  <RadioGroupItem value="2" id="enjoy-check" />
                  <label htmlFor="enjoy-check">{"嬉しい"}</label>
                </div>
                <div className="items-center space-x-2">
                  <RadioGroupItem value="3" id="celebration-check" />
                  <label htmlFor="celebration-check">{"お祝い"}</label>
                </div>
                <div className="items-center space-x-2">
                  <RadioGroupItem value="4" id="sad-check" />
                  <label htmlFor="sad-check">{"悲しい"}</label>
                </div>
                <div className="items-center space-x-2">
                  <RadioGroupItem value="5" id="other-check" />
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
          <Button
            disabled={imageBase64 === ""}
            className="m-auto w-full"
            onClick={uploadSticker}
          >
            {"追加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
