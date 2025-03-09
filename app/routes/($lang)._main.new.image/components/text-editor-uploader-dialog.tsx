import { Card, CardContent } from "~/components/ui/card"
import { useState } from "react"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { Button } from "~/components/ui/button"
import { toast } from "sonner"
import { Loader2Icon, XIcon } from "lucide-react"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  token: string
  onSelectImage: (url: string) => void
  children: React.ReactNode
}

/**
 * テキスト入力時の画像アップローダー
 */
export function TextEditorUploaderDialog(props: Props) {
  const [imageBase64, setImageBase64] = useState<string | null>(null)

  const [isOpen, setIsOpen] = useState(false)

  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])

  const [count, setCount] = useState(0)

  const [isUploading, setIsUploading] = useState(false)

  const t = useTranslation()

  const resizeImage = (file: File, maxSize: number): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = (e) => {
        if (!e.target?.result)
          return reject(t("画像読み込みに失敗しました", "Failed to load image"))
        img.src = e.target.result as string
      }

      reader.onerror = () =>
        reject(t("画像読み込みに失敗しました", "Failed to load image"))
      reader.readAsDataURL(file)

      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx)
          return reject(t("画像読み込みに失敗しました", "Failed to load image"))

        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        const resizedBase64 = canvas.toDataURL("image/jpeg")
        resolve(resizedBase64)
      }

      img.onerror = () =>
        reject(t("画像読み込みに失敗しました", "Failed to load image"))
    })
  }

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) {
      toast(t("画像を選択してください", "Please select an image"))
      return
    }

    const resizedImage = await resizeImage(file, 400)
    if (resizedImage) {
      setImageBase64(resizedImage)
    } else {
      toast(t("画像のリサイズに失敗しました", "Failed to resize the image"))
    }
  }

  const onUpload = async () => {
    if (!imageBase64) {
      toast(t("画像を選択してください", "Please select an image"))
      return
    }

    if (count >= 20) {
      toast(
        t(
          "画像アップロード上限です、下書きで一時投稿ののち、時間を置いて画面更新してください",
          "You have reached the image upload limit. Please save as a draft and refresh the page after some time.",
        ),
      )
      return
    }

    setIsUploading(true)

    const url = await uploadPublicImage(imageBase64, props.token)

    setIsUploading(false)

    if (url) {
      setUploadedImageUrls([...uploadedImageUrls, url])
      setImageBase64(null)
      setCount(count + 1)
    } else {
      toast(t("画像のアップロードに失敗しました", "Failed to upload the image"))
    }
  }

  const onSelectImage = (url: string) => {
    props.onSelectImage(url)
    setIsOpen(false)
  }

  const onDeleteImage = (url: string) => {
    setUploadedImageUrls(uploadedImageUrls.filter((u) => u !== url))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="min-h-[40vw] min-w-[88vw] pl-2">
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="font-bold text-sm">
              {t("本文に差し込む画像", "Image to insert in text")}
            </p>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <Button
              className="w-full items-center"
              variant={"secondary"}
              onClick={onUpload}
              disabled={!imageBase64 || isUploading}
            >
              {isUploading ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <p>{t("画像をアップロード", "Upload Image")}</p>
              )}
            </Button>
            <ScrollArea className="max-h-80 overflow-auto p-4">
              {uploadedImageUrls.map((url) => (
                <div className="flex items-center space-x-2 border-b" key={url}>
                  <Button
                    variant={"ghost"}
                    onClick={() => onSelectImage(url)}
                    className="flex h-18 w-full items-center space-x-2"
                  >
                    <div className="size-16 overflow-hidden rounded">
                      <img
                        src={url}
                        alt={t("アップロードされた画像", "uploaded")}
                        className="m-auto max-w-16"
                      />
                    </div>
                  </Button>
                  <Button
                    onClick={() => onDeleteImage(url)}
                    className="size-12"
                    variant={"destructive"}
                  >
                    <XIcon className="size-8" />
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
