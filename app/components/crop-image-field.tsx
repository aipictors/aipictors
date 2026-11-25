import { ArrowUpFromLineIcon, XIcon } from "lucide-react"
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import { toast } from "sonner"
import { ImageCropperModal } from "~/components/modal-image-cropper"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { useTranslation } from "~/hooks/use-translation"
import {
  type AnimatedGifOptions,
  isAnimatedImageFile,
  toAnimatedWebpDataUrl,
} from "~/utils/animated-gif-to-webp"
import {
  FILE_DROP_ZONE_ATTRIBUTE,
  pickFirstImageFile,
} from "~/utils/file-drop-zone"

type Props = {
  isHidePreviewImage: boolean
  cropWidth: number
  cropHeight: number
  defaultCroppedImage?: string
  fileExtension?: string
  onDeleteImage: () => void
  onCrop?: (croppedImage: string) => void
  onCropToBase64?: (croppedImage: string) => void
  /**
   * 指定すると、アニメーション画像（GIF・APNG・アニメーション WebP）は切り抜きの画面を出さずに
   * アニメーションのまま受け取る（スタンプ・プロフィール用。crop があれば中央を自動で切り抜く）。
   * canvas で切り抜くと 1 コマ目だけの静止画になってしまう
   */
  animatedGif?: AnimatedGifOptions
  /**
   * アニメーション画像を使えないとき（アイコン・ヘッダーのアニメーションは有料プランの特典）。
   * アニメーション画像を選ぶと案内を出し、静止画として切り抜きの画面を開く
   */
  animatedLocked?: {
    message: string
    actionLabel: string
    onAction: () => void
  }
  /**
   * children を渡したときに、その要素へ画像のドラッグ＆ドロップも受け付ける。
   * ドラッグ中は data-drag-over="true" が付く
   */
  isChildrenDropZone?: boolean
  children?: React.ReactNode
}

/**
 * 指定した画像ファイルの切り抜き開始領域
 */
export function CropImageField(props: Props): React.ReactNode {
  const t = useTranslation()

  const [image, setImage] = useState<string | undefined>(undefined)
  const [croppedImage, setCroppedImage] = useState<string>(
    props.defaultCroppedImage ?? "",
  )
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const inputId = useId()

  const cropperClassName = "react-easy-crop-container"

  const clearFileInputValue = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      // Allow selecting the same file twice in a row.
      e.currentTarget.value = ""
    },
    [],
  )

  const openFilePicker = useCallback(() => {
    if (!fileInputRef.current) return
    // Allow selecting the same file twice in a row.
    fileInputRef.current.value = ""
    fileInputRef.current.click()
  }, [])

  type TriggerProps = Pick<
    React.HTMLAttributes<HTMLElement>,
    "onClick" | "onKeyDown" | "onDragOver" | "onDragLeave" | "onDrop"
  > & { "data-drag-over"?: boolean }

  /**
   * 画像をドラッグ＆ドロップで受け取る
   */
  const dropZoneProps = {
    [FILE_DROP_ZONE_ATTRIBUTE]: "",
    onDragOver: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = "copy"
      setIsDragOver(true)
    },
    onDragLeave: (e: React.DragEvent<HTMLElement>) => {
      if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
      setIsDragOver(false)
    },
    onDrop: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = pickFirstImageFile(e.dataTransfer.files)
      if (file) void selectFile(file)
    },
  }

  const triggerNode = props.children ? (
    isValidElement(props.children) ? (
      (() => {
        const child = props.children as React.ReactElement<TriggerProps>
        const originalOnClick = child.props.onClick
        const originalOnKeyDown = child.props.onKeyDown

        return cloneElement(child, {
          ...(props.isChildrenDropZone
            ? { ...dropZoneProps, "data-drag-over": isDragOver }
            : {}),
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            originalOnClick?.(e)
            openFilePicker()
          },
          onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
            originalOnKeyDown?.(e)
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              openFilePicker()
            }
          },
        })
      })()
    ) : (
      // Fallback: if children isn't a React element (string etc), use label association.
      <label htmlFor={inputId}>{props.children}</label>
    )
  ) : null

  useEffect(() => {
    if (!props.defaultCroppedImage) return
    setCroppedImage((prev) =>
      prev === "" ? (props.defaultCroppedImage ?? "") : prev,
    )
  }, [props.defaultCroppedImage])

  /**
   * 画像を読み込んで切り抜きを開く
   */
  const openCropper = useCallback((file: File) => {
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      if (reader.result) {
        setImage(reader.result.toString() || "")
        setIsOpen(true)
        // syadcnのダイアログ上でクロップモーダルが表示されるときに、クロップ領域が正常に描画されるために必要な処理
        setTimeout(() => {
          const element = document.querySelector(`.${cropperClassName}`)
          if (element) {
            setTimeout(() => {
              element.classList.remove("mt-1")
            }, 100)
            setTimeout(() => {
              element.classList.add("mt-1")
            }, 200)
          }
        }, 500)
      }
    })
    reader.readAsDataURL(file)
  }, [])

  /**
   * 選んだ画像を受け取る。アニメーション画像は切り抜きの画面を出さずにそのまま使う
   */
  const selectFile = async (file: File) => {
    if (
      props.animatedLocked &&
      (await isAnimatedImageFile(file).catch(() => false))
    ) {
      const locked = props.animatedLocked
      toast(locked.message, {
        duration: 8000,
        action: { label: locked.actionLabel, onClick: locked.onAction },
      })
      openCropper(file)
      return
    }
    if (props.animatedGif) {
      try {
        const animated = await toAnimatedWebpDataUrl(file, props.animatedGif)
        if (animated !== null) {
          onCrop(animated)
          toast(
            props.animatedGif.crop
              ? t(
                  "アニメーション画像は動きを残すため、中央を自動で切り抜いて登録します",
                  "Animated images keep their animation; the center is cropped automatically",
                )
              : t(
                  "アニメーション画像はアニメーションのまま登録します（切り抜きはできません）",
                  "Animated images are added as they are (cropping is not available)",
                ),
          )
          return
        }
      } catch (error) {
        console.error(error)
        toast(
          t(
            "アニメーション画像を読み込めませんでした。小さいサイズの画像でお試しください",
            "Failed to load the animated image. Please try a smaller image",
          ),
        )
        return
      }
    }
    openCropper(file)
  }

  /**
   * ファイル選択後の処理
   */
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await selectFile(e.target.files[0])
    }
  }

  /**
   * クロップしたときの処理
   * @param croppedImage クロップした画像base64
   */
  const onCrop = async (croppedImage: string) => {
    setCroppedImage(croppedImage)
    if (props.onCrop) {
      props.onCrop(croppedImage)
    }
    if (props.onCropToBase64) {
      // croppedImage is already a data URL (base64). Use it directly for instant UI update.
      props.onCropToBase64(croppedImage)
    }
  }

  /**
   * クロップモーダルを閉じたときの処理
   */
  const onClose = () => {
    setIsOpen(false)
  }

  /**
   * 画像削除
   */
  const onDeleteImage = () => {
    setImage("")
    setCroppedImage("")
    props.onDeleteImage()
  }

  if (croppedImage && !props.isHidePreviewImage) {
    return (
      <>
        {props.children ? (
          <>
            {triggerNode}
            <Input
              id={inputId}
              ref={fileInputRef}
              type="file"
              accept=".webp,.png,.jpeg,.jpg,.gif,.svg,.bmp,.ico,.tiff,.tif,.svgz,.apng,.avif,.jfif,.pjpeg,.pjp,.jpgv,.hdp,.jpe,.jpeg2000,.jxr,.wdp,.jng,.jif,.jfi"
              onClick={clearFileInputValue}
              onChange={onFileChange}
              className="sr-only"
            />
          </>
        ) : (
          <Card
            className={`relative ${isDragOver ? "ring-2 ring-primary" : ""}`}
            {...dropZoneProps}
          >
            <img
              className="m-auto max-h-48 max-w-64"
              alt={"croppedImage"}
              src={croppedImage}
            />
            <Input
              id={inputId}
              ref={fileInputRef}
              type="file"
              accept=".webp,.png,.jpeg,.jpg,.gif,.svg,.bmp,.ico,.tiff,.tif,.svgz,.apng,.avif,.jfif,.pjpeg,.pjp,.jpgv,.hdp,.jpe,.jpeg2000,.jxr,.wdp,.jng,.jif,.jfi"
              onClick={clearFileInputValue}
              onChange={onFileChange}
              className="absolute top-0 left-0 h-full w-full cursor-pointer opacity-0"
            />
            <Button
              className="absolute top-2 right-2"
              size={"icon"}
              variant="ghost"
              onClick={onDeleteImage}
            >
              <XIcon className="size-6" />
            </Button>
          </Card>
        )}

        {image && (
          <ImageCropperModal
            src={image}
            isOpen={isOpen}
            cropContainerClassName={cropperClassName}
            cropWidth={props.cropWidth}
            cropHeight={props.cropHeight}
            fileExtension={props.fileExtension}
            onCrop={onCrop}
            onClose={onClose}
          />
        )}
      </>
    )
  }

  return (
    <>
      {props.children ? (
        <>
          {triggerNode}
          <Input
            id={inputId}
            ref={fileInputRef}
            type="file"
            accept=".webp,.png,.jpeg,.jpg,.gif,.svg,.bmp,.ico,.tiff,.tif,.svgz,.apng,.avif,.jfif,.pjpeg,.pjp,.jpgv,.hdp,.jpe,.jpeg2000,.jxr,.wdp,.jng,.jif,.jfi"
            onClick={clearFileInputValue}
            onChange={onFileChange}
            className="sr-only"
          />
        </>
      ) : (
        <div className="relative" {...dropZoneProps}>
          <div
            className={`rounded-lg border p-4 ${isDragOver ? "border-primary bg-primary/10" : ""}`}
          >
            <ArrowUpFromLineIcon className="m-auto size-4 opacity-80" />
            <div className="text-center text-sm opacity-80">
              {t(
                "画像アップロード（ドラッグ＆ドロップもできます）",
                "Upload image (or drag and drop)",
              )}
            </div>
          </div>
          <Input
            id={inputId}
            ref={fileInputRef}
            type="file"
            accept=".webp,.png,.jpeg,.jpg,.gif,.svg,.bmp,.ico,.tiff,.tif,.svgz,.apng,.avif,.jfif,.pjpeg,.pjp,.jpgv,.hdp,.jpe,.jpeg2000,.jxr,.wdp,.jng,.jif,.jfi"
            onClick={clearFileInputValue}
            onChange={onFileChange}
            className="absolute top-0 left-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
      )}

      {image && (
        <ImageCropperModal
          src={image}
          isOpen={isOpen}
          cropContainerClassName={cropperClassName}
          cropWidth={props.cropWidth}
          cropHeight={props.cropHeight}
          fileExtension={props.fileExtension}
          onCrop={onCrop}
          onClose={onClose}
        />
      )}
    </>
  )
}
