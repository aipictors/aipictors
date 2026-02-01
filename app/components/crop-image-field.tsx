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
import { ImageCropperModal } from "~/components/modal-image-cropper"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  isHidePreviewImage: boolean
  cropWidth: number
  cropHeight: number
  defaultCroppedImage?: string
  fileExtension?: string
  onDeleteImage: () => void
  onCrop?: (croppedImage: string) => void
  onCropToBase64?: (croppedImage: string) => void
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

  type TriggerProps = {
    onClick?: (e: React.MouseEvent<HTMLElement>) => void
    onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void
  }

  const triggerNode = props.children ? (
    isValidElement(props.children) ? (
      (() => {
        const child = props.children as React.ReactElement<TriggerProps>
        const originalOnClick = child.props.onClick
        const originalOnKeyDown = child.props.onKeyDown

        return cloneElement(child, {
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
   * ファイル選択後の処理
   */
  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
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
        reader.readAsDataURL(e.target.files[0])
      }
    },
    [],
  )

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
          <Card className="relative">
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
        <div className="relative">
          <div className="rounded-lg border p-4">
            <ArrowUpFromLineIcon className="m-auto size-4 opacity-80" />
            <div className="text-center text-sm opacity-80">
              {t("画像アップロード", "Upload image")}
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
