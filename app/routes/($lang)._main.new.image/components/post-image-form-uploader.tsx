import FullScreenContainer from "~/components/full-screen-container"
import { useDropzone } from "react-dropzone-esm"
import { ImageIcon, VideoIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import {
  getExtractInfoFromBase64,
  getExtractInfoFromPNG,
  type PNGInfo,
} from "~/utils/get-extract-info-from-png"
import { config } from "~/config"
import { ImageGenerationSelectorDialog } from "~/routes/($lang)._main.new.image/components/image-generation-selector-dialog"
import { PostFormItemThumbnailPositionAdjust } from "~/routes/($lang)._main.new.image/components/post-form-item-thumbnail-position-adjust"
import { PostFormItemOgp } from "~/routes/($lang)._main.new.image/components/post-form-item-ogp"
import { PostFormItemVideo } from "~/routes/($lang)._main.new.image/components/post-form-item-video"
import type { PostImageFormAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-action"
import type { PostImageFormState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-state"
import { type Dispatch, useEffect } from "react"
import { toast } from "sonner"
import { PostFormItemDraggableImages } from "~/routes/($lang)._main.new.image/components/post-form-item-draggable-images"
import { PaintCanvas } from "~/components/paint-canvas"
import { useTranslation } from "~/hooks/use-translation"
import { formatFileSize, MAX_IMAGE_FILE_SIZE_BYTES, MAX_VIDEO_FILE_SIZE_BYTES } from "~/utils/file-size"

type Props = {
  dispatch: Dispatch<PostImageFormAction>
  mediaType: "image" | "video"
  onChangeImageInformation: (imageInformation: PNGInfo) => void
  onChangeMediaType: (mediaType: "image" | "video") => void
  onImageSelectionChange?: (itemsCount: number) => void
  state: PostImageFormState
  onVideoChange?: (videoFile: File | null) => void
  onInputFiles?: (files: FileList) => void
  token?: string | undefined | null
  onContentGenerated?: (data: {
    title?: string
    description?: string
    tags?: string[]
    titleEn?: string
    descriptionEn?: string
    tagsEn?: string[]
  }) => void
}

export function PostImageFormUploader (props: Props) {
  const t = useTranslation()
  const hasActiveSelection = props.mediaType === "video"
    ? props.state.videoFile !== null
    : props.state.items.length > 0
  const maxImageSizeLabel = formatFileSize(MAX_IMAGE_FILE_SIZE_BYTES)
  const maxVideoSizeLabel = formatFileSize(MAX_VIDEO_FILE_SIZE_BYTES)

  const selectedFilesSizeText = () => {
    const totalBytes = props.state.items
      .map((item) => item.content)
      .reduce((acc, imageBase64) => {
        if (!imageBase64) {
          return acc
        }
        const byteLength = new TextEncoder().encode(imageBase64).length
        return acc + byteLength
      }, 0)

    if (totalBytes < 1024 * 1024) {
      return `${(totalBytes / 1024).toFixed(2)} KB`
    }
    return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const selectedImagesCountText = () => {
    const imageCount = props.state.items.filter((item) => item.content).length
    return `${t("イラスト", "Images")}${imageCount}${t("枚", " items")}`
  }

  const onInputPngInfo = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/png"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) {
        return
      }
      const pngInfo = await getExtractInfoFromPNG(file)
      if (pngInfo.src !== null) {
        props.onChangeImageInformation(pngInfo)
        toast(
          t(
            "PNG情報を取得と反映を実行しました、取得できない画像の場合は反映されないことがあります",
            "PNG information has been retrieved",
          ),
        )
        return
      }
      toast(
        t(
          "PNG情報を取得できませんでした",
          "Failed to retrieve PNG information",
        ),
      )
    }
    input.click()
  }

  const applyImageFiles = async (files: File[]) => {
    if (files.length === 0) {
      return
    }

    props.onChangeMediaType("image")

    if (props.state.videoFile) {
      props.onVideoChange?.(null)
    }

    const nextItems = [...props.state.items]

    for (const file of files) {
      if (nextItems.length >= config.post.maxImageCount) {
        toast(
          t(
            `最大${config.post.maxImageCount}までです`,
            `Maximum ${config.post.maxImageCount} items allowed`,
          ),
        )
        break
      }

      if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
        toast(
          t(
            `${maxImageSizeLabel}以内の画像を選択してください`,
            `Please choose an image under ${maxImageSizeLabel}`,
          ),
        )
        continue
      }

      if (nextItems.length === 0 && file.type === "image/png") {
        const pngInfo = await getExtractInfoFromPNG(file)
        props.onChangeImageInformation(pngInfo)
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (typeof event.target?.result === "string") {
            resolve(event.target.result)
            return
          }
          reject(new Error("Failed to read image"))
        }
        reader.onerror = () => reject(new Error("Failed to read image"))
        reader.readAsDataURL(file)
      })

      const webpDataUrl = await new Promise<string>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            reject(new Error("Failed to get canvas context"))
            return
          }
          ctx.drawImage(img, 0, 0)
          resolve(canvas.toDataURL("image/webp"))
        }
        img.onerror = () => reject(new Error("Failed to load image"))
        img.src = dataUrl
      })

      nextItems.push({
        id: Math.floor(Math.random() * 10000),
        content: webpDataUrl,
      })
    }

    props.dispatch({ type: "SET_ITEMS", payload: nextItems })
    props.onImageSelectionChange?.(nextItems.length)

    if (nextItems.length > 0) {
      props.dispatch({ type: "SET_THUMBNAIL_BASE64", payload: nextItems[0].content })
      props.dispatch({ type: "SET_OGP_BASE64", payload: "" })

      const img = new Image()
      img.onload = () => {
        props.dispatch({
          type: "SET_IS_THUMBNAIL_LANDSCAPE",
          payload: img.width > img.height,
        })
      }
      img.src = nextItems[0].content ?? ""
    }

    if (props.onInputFiles) {
      const transfer = new DataTransfer()
      files.forEach((file) => {
        transfer.items.add(file)
      })
      props.onInputFiles(transfer.files)
    }
  }

  const applyVideoFile = async (file: File) => {
    if (file.type !== "video/mp4") {
      toast(t("MP4動画のみ選択できます", "Only MP4 videos are supported"))
      return
    }

    if (file.size > MAX_VIDEO_FILE_SIZE_BYTES) {
      toast(
        t(
          `動画のサイズは${maxVideoSizeLabel}以下にしてください`,
          `Video size should be under ${maxVideoSizeLabel}`,
        ),
      )
      return
    }

    const video = document.createElement("video")
    video.preload = "metadata"
    video.src = URL.createObjectURL(file)

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => {
        if (video.duration > 12) {
          reject(
            new Error(
              t(
                "動画は12秒以下にしてください",
                "Video length should be under 12 seconds",
              ),
            ),
          )
          return
        }

        video.currentTime = video.duration / 2
      }

      video.onseeked = () => {
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error(t("サムネイルの生成に失敗しました", "Failed to generate thumbnail")))
          return
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumbnailUrl = canvas.toDataURL()

        props.dispatch({ type: "SET_ITEMS", payload: [] })
        props.dispatch({ type: "SET_INDEX_LIST", payload: [] })
        props.dispatch({ type: "SET_THUMBNAIL_BASE64", payload: thumbnailUrl })
        props.dispatch({ type: "SET_OGP_BASE64", payload: "" })
        props.dispatch({
          type: "SET_IS_THUMBNAIL_LANDSCAPE",
          payload: video.videoWidth > video.videoHeight,
        })

        props.onVideoChange?.(file)
        props.onChangeMediaType("video")
        resolve()
      }

      video.onerror = () => {
        reject(new Error(t("動画ファイルの読み込みに失敗しました", "Failed to load video file")))
      }
    }).finally(() => {
      URL.revokeObjectURL(video.src)
    })
  }

  const handleMixedFiles = async (files: File[]) => {
    const videoFiles = files.filter((file) => file.type.startsWith("video/"))
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    if (videoFiles.length > 0) {
      if (imageFiles.length > 0 || videoFiles.length > 1) {
        toast(
          t(
            "動画を優先して選択しました。画像は解除されます",
            "Video was selected with priority. Images were cleared.",
          ),
        )
      }

      try {
        await applyVideoFile(videoFiles[0])
      } catch (error) {
        if (error instanceof Error) {
          toast(error.message)
        }
      }
      return
    }

    try {
      await applyImageFiles(imageFiles)
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
      "image/bmp": [".bmp"],
      "video/mp4": [".mp4", ".MP4", ".Mp4"],
    },
    multiple: true,
    noClick: true,
    onDrop: (acceptedFiles) => {
      void handleMixedFiles(acceptedFiles)
    },
    disabled: hasActiveSelection,
  })

  const openImagePicker = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/jpeg,image/png,image/gif,image/webp,image/bmp"
    input.multiple = true
    input.onchange = () => {
      const files = Array.from(input.files ?? [])
      void applyImageFiles(files)
    }
    input.click()
  }

  const openVideoPicker = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "video/mp4"
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) {
        return
      }
      void handleMixedFiles([file])
    }
    input.click()
  }

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const activeElement = document.activeElement
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          (activeElement as HTMLElement).isContentEditable)
      ) {
        return
      }

      const clipboardItems = event.clipboardData?.items
      if (!clipboardItems || clipboardItems.length === 0) {
        return
      }

      const imageFiles: File[] = []
      for (const item of clipboardItems) {
        if (!item.type.startsWith("image/")) {
          continue
        }

        const file = item.getAsFile()
        if (file) {
          imageFiles.push(file)
        }
      }

      if (imageFiles.length === 0) {
        return
      }

      event.preventDefault()
      void applyImageFiles(imageFiles)
    }

    document.addEventListener("paste", handlePaste)
    return () => {
      document.removeEventListener("paste", handlePaste)
    }
  }, [applyImageFiles])

  return (
    <div className="space-y-4">
      {!hasActiveSelection && (
        <div
          {...getRootProps()}
          className={cn(
            "rounded-md border-2 border-dashed border-zinc-600 bg-zinc-800 p-8 text-center transition",
            isDragActive && "border-sky-400 bg-zinc-800",
          )}
        >
          <input {...getInputProps()} />
          <div className="space-y-3">
            <p className="font-semibold text-base text-white">
              {t("イラストまたは動画", "Illustration or Video")}
            </p>
            <p className="text-sm text-zinc-300">
              {t(
                `画像は1枚${maxImageSizeLabel}以内で最大${config.post.maxImageCount}枚、動画はMP4で${maxVideoSizeLabel}以内・12秒までです`,
                `Images: up to ${config.post.maxImageCount} files, ${maxImageSizeLabel} each. Video: MP4, up to ${maxVideoSizeLabel}, 12 seconds max.`,
              )}
            </p>
            <p className="text-xs text-zinc-400">
              {t(
                "画像はクリップボードから貼り付け可能です。ドラッグ&ドロップはPC表示のみ対応しています。",
                "Images can also be pasted from the clipboard. Drag and drop is available on desktop only.",
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={openImagePicker}
                className="flex min-w-40 flex-col items-center gap-3 rounded-xl border border-zinc-500 bg-zinc-700 px-5 py-4 text-white transition hover:bg-zinc-600"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
                  <ImageIcon className="size-6" />
                </div>
                <span className="font-medium text-sm">
                  {t("画像を選択", "Select Images")}
                </span>
              </button>
              <button
                type="button"
                onClick={openVideoPicker}
                className="flex min-w-40 flex-col items-center gap-3 rounded-xl border border-zinc-500 bg-zinc-700 px-5 py-4 text-white transition hover:bg-zinc-600"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                  <VideoIcon className="size-6" />
                </div>
                <span className="font-medium text-sm">
                  {t("動画を選択", "Select Video")}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
      {hasActiveSelection && (
        <div className="rounded-md">
          <div
            className={cn(
              "relative items-center rounded-b bg-zinc-800",
              props.state.isHovered && "border-2 border-white border-dashed",
            )}
          >
            {props.mediaType === "image" && props.state.items.length !== 0 && (
              <div className="mb-4 flex items-center justify-between gap-3 p-1 pl-4 dark:bg-blend-darken">
                <div className="flex space-x-4 text-white">
                  <div className="flex">{selectedImagesCountText()}</div>
                  <div className="flex">{selectedFilesSizeText()}</div>
                </div>
                <button
                  type="button"
                  onClick={openVideoPicker}
                  className="mr-2 inline-flex items-center gap-2 rounded-md border border-zinc-500 bg-zinc-700 px-3 py-1.5 text-white text-xs transition hover:bg-zinc-600"
                >
                  <VideoIcon className="size-3.5" />
                  <span>{t("動画を選択", "Select Video")}</span>
                </button>
              </div>
            )}
            {props.mediaType === "video" && props.state.videoFile !== null && (
              <div className="mb-4 flex items-center justify-end gap-3 p-1 pr-4 dark:bg-blend-darken">
                <button
                  type="button"
                  onClick={openImagePicker}
                  className="mr-2 inline-flex items-center gap-2 rounded-md border border-zinc-500 bg-zinc-700 px-3 py-1.5 text-white text-xs transition hover:bg-zinc-600"
                >
                  <ImageIcon className="size-3.5" />
                  <span>{t("画像を選択", "Select Images")}</span>
                </button>
              </div>
            )}
            {props.mediaType === "image" ? (
              <PostFormItemDraggableImages
                indexList={props.state.indexList}
                items={props.state.items ?? []}
                setItems={(items) => {
                  props.dispatch({ type: "SET_ITEMS", payload: items })
                }}
                onChangeItems={(items) => {
                  props.dispatch({ type: "SET_ITEMS", payload: items })
                  props.onImageSelectionChange?.(items.length)
                }}
                maxItemsCount={config.post.maxImageCount}
                setIndexList={(value) => {
                  props.dispatch({ type: "SET_INDEX_LIST", payload: value })
                }}
                onChangePngInfo={(value) => {
                  props.onChangeImageInformation(value)
                }}
                onMosaicButtonClick={(value) => {
                  props.dispatch({
                    type: "SET_EDIT_TARGET_IMAGE_BASE64",
                    payload: value,
                  })
                }}
                setThumbnailBase64={(base64) => {
                  props.dispatch({ type: "SET_THUMBNAIL_BASE64", payload: base64 })
                }}
                setOgpBase64={(base64) => {
                  props.dispatch({ type: "SET_OGP_BASE64", payload: base64 })
                }}
                setIsThumbnailLandscape={(value) => {
                  props.dispatch({
                    type: "SET_IS_THUMBNAIL_LANDSCAPE",
                    payload: value,
                  })
                }}
                onInputFiles={props.onInputFiles}
              />
            ) : (
              <PostFormItemVideo
                videoFile={props.state.videoFile ? (props.state.videoFile as File) : null}
                setThumbnailBase64={(base64) => {
                  props.dispatch({ type: "SET_THUMBNAIL_BASE64", payload: base64 })
                }}
                setOgpBase64={(base64) => {
                  props.dispatch({ type: "SET_OGP_BASE64", payload: base64 })
                }}
                setIsThumbnailLandscape={(value) => {
                  props.dispatch({
                    type: "SET_IS_THUMBNAIL_LANDSCAPE",
                    payload: value,
                  })
                }}
                onVideoChange={(videoFile) => {
                  props.onVideoChange?.(videoFile)
                }}
              />
            )}
          </div>
          {props.state.thumbnailBase64 !== null && (
            <PostFormItemThumbnailPositionAdjust
              isThumbnailLandscape={props.state.isThumbnailLandscape}
              thumbnailBase64={props.state.thumbnailBase64}
              thumbnailPosX={props.state.thumbnailPosX}
              thumbnailPosY={props.state.thumbnailPosY}
              setThumbnailPosX={(posX) => {
                props.dispatch({
                  type: "SET_THUMBNAIL_POS_X",
                  payload: posX,
                })
              }}
              setThumbnailPosY={(posY) => {
                props.dispatch({
                  type: "SET_THUMBNAIL_POS_Y",
                  payload: posY,
                })
              }}
            />
          )}
          {props.state.thumbnailBase64 !== null &&
            props.state.ogpBase64 !== null && (
              <PostFormItemOgp
                imageBase64={props.state.thumbnailBase64}
                setOgpBase64={(base64) => {
                  props.dispatch({ type: "SET_OGP_BASE64", payload: base64 })
                }}
                ogpBase64={props.state.ogpBase64}
              />
            )}
        </div>
      )}
      <div className="flex justify-end">
        {props.mediaType === "image" && (
          <>
            <Button
              variant={"secondary"}
              onClick={onInputPngInfo}
              className="mr-2 block"
            >
              {t("画像から生成情報のみ反映", "Apply Information Only from Image")}
            </Button>
            <Button
              variant={"secondary"}
              className="block"
              onClick={() => {
                props.dispatch({
                  type: "OPEN_IMAGE_GENERATION_DIALOG",
                  payload: true,
                })
              }}
            >
              {t("生成画像", "Generated Images")}
            </Button>
          </>
        )}
      </div>
      {props.mediaType === "image" && (
        <ImageGenerationSelectorDialog
          isOpen={props.state.isOpenImageGenerationDialog}
          setIsOpen={() => {
            props.dispatch({ type: "CLOSE_IMAGE_GENERATION_DIALOG" })
          }}
          onSubmit={async (
            selectedImage: string[],
            selectedIds: string[],
            lastSelectedOriginalImage: string,
          ) => {
            props.dispatch({
              type: "SUBMIT_IMAGE_GENERATION_DIALOG",
              payload: {
                selectedImageGenerationUrls: selectedImage,
                selectedImageGenerationIds: selectedIds,
              },
            })
            if (selectedImage.length === 0) {
              props.dispatch({
                type: "IS_SELECTED_GENERATION_IMAGE",
                payload: false,
              })
              return
            }
            props.dispatch({
              type: "IS_SELECTED_GENERATION_IMAGE",
              payload: true,
            })

            try {
              const pngInfo = await getExtractInfoFromBase64(
                lastSelectedOriginalImage,
              )
              if (pngInfo.src !== null) {
                props.onChangeImageInformation(pngInfo)
                return
              }
            } catch {
              // 生成画像がPNGでない/取得できない場合は無視する
            }
          }}
        />
      )}
      {props.state.editTargetImageBase64 !== null && (
        <FullScreenContainer
          onClose={() => {
            props.dispatch({
              type: "SET_EDIT_TARGET_IMAGE_BASE64",
              payload: null,
            })
          }}
          enabledScroll={props.state.isDrawing}
        >
          <PaintCanvas
            onChangeSetDrawing={(isDrawing: boolean) =>
              props.dispatch({ type: "SET_IS_DRAWING", payload: isDrawing })
            }
            imageUrl={props.state.editTargetImageBase64}
            isMosaicMode={true}
            isShowSubmitButton={true}
            onSubmit={(base64: string) => {
              props.dispatch({
                type: "SET_EDITED_IMAGE",
                payload: { base64 },
              })
            }}
          />
        </FullScreenContainer>
      )}
    </div>
  )
}
