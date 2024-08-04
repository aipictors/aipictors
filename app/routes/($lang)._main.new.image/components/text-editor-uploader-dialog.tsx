import { Card, CardContent } from "~/components/ui/card"
import { useState } from "react"
import { CropImageField } from "~/components/crop-image-field"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { Button } from "~/components/ui/button"
import { toast } from "sonner"
import { Loader2Icon, XIcon } from "lucide-react"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog"

type Props = {
  token: string
  onSelectImage: (url: string) => void
  children: React.ReactNode
}

/**
 * テキスト入力時の画像アップローダー
 */
export const TextEditorUploaderDialog = (props: Props) => {
  const [imageBase64, setImageBase64] = useState<string | null>(null)

  const [isOpen, setIsOpen] = useState(false)

  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])

  const [count, setCount] = useState(0)

  const [isUploading, setIsUploading] = useState(false)

  const onUpload = async () => {
    if (imageBase64 === null || !imageBase64) {
      toast("画像を選択してください")
      return
    }

    if (count >= 20) {
      toast(
        "画像アップロード上限です、下書きで一時投稿ののち、時間を置いて画面更新してください",
      )
      return
    }

    setIsUploading(true)

    const url = await uploadPublicImage(imageBase64, props.token)

    setCount(count + 1)
    setIsUploading(false)

    if (url) {
      setUploadedImageUrls([...uploadedImageUrls, url])
      setImageBase64(null)
    } else {
      toast("画像のアップロードに失敗しました")
    }

    setImageBase64(null)
  }

  const onSelectImage = (url: string) => {
    props.onSelectImage(url)
    setIsOpen(false)
  }

  const onDeleteImage = (url: string) => {
    setUploadedImageUrls(uploadedImageUrls.filter((u) => u !== url))
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
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="font-bold text-sm">{"本文に差し込む画像"}</p>
            <CropImageField
              cropWidth={400}
              cropHeight={320}
              onDeleteImage={() => {
                // 画像削除
                setImageBase64(null)
              }}
              onCrop={setImageBase64}
              isHidePreviewImage={false}
            />
            {imageBase64 && (
              <Button
                className="w-full items-center"
                variant={"secondary"}
                onClick={onUpload}
                disabled={!imageBase64 || isUploading}
              >
                {isUploading ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <p>{"画像をアップロード"}</p>
                )}
              </Button>
            )}
            <ScrollArea className="max-h-80 overflow-auto p-4">
              {uploadedImageUrls.map((url) => (
                <div className="flex items-center space-x-2 border-b" key={url}>
                  <Button
                    variant={"ghost"}
                    onClick={() => {
                      onSelectImage(url)
                    }}
                    className="flex h-18 w-full items-center space-x-2"
                  >
                    <div className="h-16 w-16 overflow-hidden rounded">
                      <img
                        src={url}
                        alt="uploaded"
                        className="m-auto max-w-16"
                      />
                    </div>
                    {/* <p className="text-ellipsis text-sm">{url}</p> */}
                  </Button>
                  <Button
                    onClick={() => {
                      onDeleteImage(url)
                    }}
                    className="h-12 w-12"
                    variant={"destructive"}
                  >
                    <XIcon className="h-8 w-8" />
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
