import { ImagePlusIcon, Loader2Icon, XIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  pickTextEditorImageFiles,
  TEXT_EDITOR_IMAGE_UPLOAD_LIMIT,
} from "~/utils/text-editor-images"
import { uploadPublicImage } from "~/utils/upload-public-image"

type Props = {
  token: string
  onSelectImage: (url: string) => void
  /** アップロードした画像を順番にまとめて入れる */
  onSelectImages: (urls: string[]) => void
  children: React.ReactNode
}

/**
 * テキスト入力時の画像アップローダー
 */
export function TextEditorUploaderDialog(props: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])

  const [count, setCount] = useState(0)

  const [isUploading, setIsUploading] = useState(false)

  const [progress, setProgress] = useState<{
    done: number
    total: number
  } | null>(null)

  const [isDragging, setIsDragging] = useState(false)

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

        const resizedBase64 = canvas.toDataURL("image/jpeg", 0.9)
        resolve(resizedBase64)
      }

      img.onerror = () =>
        reject(t("画像読み込みに失敗しました", "Failed to load image"))
    })
  }

  /** 選んだ・ドロップした画像を 1 枚ずつ縮めて上げる */
  const uploadFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? [])
    if (files.length === 0) {
      toast(t("画像を選択してください", "Please select an image"))
      return
    }

    const { picked, skipped } = pickTextEditorImageFiles(
      files,
      TEXT_EDITOR_IMAGE_UPLOAD_LIMIT - count,
    )
    if (skipped > 0) {
      toast(
        t(
          "画像アップロード上限です、下書きで一時投稿ののち、時間を置いて画面更新してください",
          "You have reached the image upload limit. Please save as a draft and refresh the page after some time.",
        ),
      )
    }
    if (picked.length === 0) {
      return
    }

    setIsUploading(true)
    const urls: string[] = []
    for (const [index, file] of picked.entries()) {
      setProgress({ done: index, total: picked.length })
      // 挿絵はクリックで原寸表示できるので、大きめ（長辺 1600px）で保存する
      // ブラウザが読めない形式（HEIC など）だと失敗するので、何も起きないままにせず知らせる
      const resizedImage = await resizeImage(file, 1600).catch(() => null)
      if (!resizedImage) {
        toast(
          t(
            `画像のリサイズに失敗しました（${file.name}）`,
            `Failed to resize the image (${file.name})`,
          ),
        )
        continue
      }
      const url = await uploadPublicImage(resizedImage, props.token)
      if (url) {
        urls.push(url)
        setUploadedImageUrls((prev) => [...prev, url])
        setCount((prev) => prev + 1)
      } else {
        toast(
          t(
            `画像のアップロードに失敗しました（${file.name}）`,
            `Failed to upload the image (${file.name})`,
          ),
        )
      }
    }
    setProgress(null)
    setIsUploading(false)
  }

  const onSelectImage = (url: string) => {
    props.onSelectImage(url)
    setIsOpen(false)
  }

  const onSelectAllImages = () => {
    props.onSelectImages(uploadedImageUrls)
    setUploadedImageUrls([])
    setIsOpen(false)
  }

  const onDeleteImage = (url: string) => {
    setUploadedImageUrls(uploadedImageUrls.filter((u) => u !== url))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="z-[110] min-h-[40vw] min-w-[88vw] pl-2">
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="font-bold text-sm">
              {t("本文に差し込む画像", "Image to insert in text")}
            </p>
            {/* 何枚かまとめて選べて、画像をここに落としても上げられる */}
            <label
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed p-6 text-center text-sm",
                isDragging ? "border-primary bg-primary/10" : "border-input",
                isUploading && "pointer-events-none opacity-60",
              )}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault()
                setIsDragging(false)
                uploadFiles(event.dataTransfer.files)
              }}
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Loader2Icon className="size-4 animate-spin" />
                  {progress &&
                    t(
                      `アップロード中（${progress.done + 1}/${progress.total}）`,
                      `Uploading (${progress.done + 1}/${progress.total})`,
                    )}
                </span>
              ) : (
                <>
                  <ImagePlusIcon className="size-6 text-muted-foreground" />
                  <span className="font-medium">
                    {t(
                      "画像をここにドラッグ＆ドロップ、または押して選ぶ",
                      "Drag & drop images here, or click to choose",
                    )}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {t(
                      `何枚かまとめて選べます（1回の編集で${TEXT_EDITOR_IMAGE_UPLOAD_LIMIT}枚まで）`,
                      `You can choose several at once (up to ${TEXT_EDITOR_IMAGE_UPLOAD_LIMIT} per edit)`,
                    )}
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                disabled={isUploading}
                onChange={(event) => {
                  uploadFiles(event.target.files)
                  event.target.value = ""
                }}
              />
            </label>
            <p className="text-muted-foreground text-xs">
              {t(
                "下に出た画像を押すと、カーソルの位置に入ります。「まとめて本文に入れる」で上げた順に全部入ります",
                "Click an uploaded image to insert it at the cursor, or insert all of them in order",
              )}
            </p>
            {uploadedImageUrls.length > 1 && (
              <Button
                type="button"
                className="w-full"
                onClick={onSelectAllImages}
                disabled={isUploading}
              >
                {t(
                  `まとめて本文に入れる（${uploadedImageUrls.length}枚）`,
                  `Insert all (${uploadedImageUrls.length})`,
                )}
              </Button>
            )}
            <ScrollArea className="max-h-80 overflow-auto p-4">
              {uploadedImageUrls.map((url) => (
                <div className="flex items-center space-x-2 border-b" key={url}>
                  <Button
                    type="button"
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
                    type="button"
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
