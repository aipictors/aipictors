import { useState } from "react"
import { useDropzone } from "react-dropzone-esm"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { VideoItem } from "~/routes/($lang)._main.new.image/components/video-item"
import { formatFileSize, MAX_VIDEO_FILE_SIZE_BYTES } from "~/utils/file-size"

type Props = {
  videoFile: File | null
  setThumbnailBase64(thumbnailBase64: string | null): void
  setOgpBase64?(ogpBase64: string | null): void
  setIsThumbnailLandscape?(isThumbnailLandscape: boolean): void
  onVideoChange(videoFile: File | null): void
  isEnabledSelectVideo?: boolean
  previewVideoUrl?: string
}

/**
 * 動画選択
 * @param props
 * @returns
 */
export function PostFormItemVideo(props: Props) {
  const t = useTranslation()

  // ファイルの最大サイズ(バイト単位)
  const maxSize = MAX_VIDEO_FILE_SIZE_BYTES
  const maxSizeLabel = formatFileSize(maxSize)

  // ドラッグ中して画像一覧にホバー中かどうか
  const [isHovered, setIsHovered] = useState(false)

  /**
   * 作品サムネイルを更新する
   * @param webpDataURL
   */
  const updateThumbnail = (webpDataURL: string | null = null) => {
    if (props.setThumbnailBase64) {
      props.setThumbnailBase64(webpDataURL ? webpDataURL : "")
    }
    if (props.setOgpBase64) {
      props.setOgpBase64("")
    }

    if (props.setIsThumbnailLandscape) {
      if (webpDataURL) {
        const base64 = webpDataURL
        const img = new Image()
        img.src = base64 ?? ""
        img.onload = () => {
          if (props.setIsThumbnailLandscape) {
            props.setIsThumbnailLandscape(img.width > img.height)
          }
        }
      } else {
        props.setIsThumbnailLandscape(false)
      }
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    minSize: 0,
    maxSize: maxSize,
    accept: {
      "video/mp4": [".mp4", ".MP4", ".Mp4"],
    },
    noClick: true,
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach(async (file) => {
        if (file.type === "video/mp4") {
          if (file.size > maxSize) {
            toast(
              t(
                `動画のサイズは${maxSizeLabel}以下にしてください`,
                `Video size should be under ${maxSizeLabel}`,
              ),
            )
            return
          }
          const video = document.createElement("video")

          video.src = URL.createObjectURL(file)
          video.onloadedmetadata = () => {
            console.log("動画メタデータ読み込み完了:", {
              duration: video.duration,
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
            })

            if (video.duration > 12) {
              toast(
                t(
                  "動画は12秒以下にしてください",
                  "Video length should be under 12 seconds",
                ),
              )
              return
            }

            props.onVideoChange(file)

            const canvas = document.createElement("canvas")
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext("2d")

            if (!ctx) {
              console.error("Canvas 2Dコンテキストの取得に失敗しました")
              toast("サムネイルの生成に失敗しました")
              return
            }

            const time = video.duration / 2
            console.log("シークタイム設定:", time)
            video.currentTime = time

            video.onseeked = () => {
              console.log("動画シーク完了、サムネイル生成開始")
              try {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                const thumbnailUrl = canvas.toDataURL() // サムネイルをDataURL形式で取得
                console.log(
                  "サムネイル生成完了:",
                  `${thumbnailUrl.substring(0, 50)}...`,
                )

                updateThumbnail(thumbnailUrl)
              } catch (error) {
                console.error("サムネイル生成エラー:", error)
                toast("サムネイルの生成に失敗しました")
              }
            }

            video.onerror = (error) => {
              console.error("動画シークエラー:", error)
              toast("動画の処理に失敗しました")
            }
          }

          video.onerror = (error) => {
            console.error("動画メタデータ読み込みエラー:", error)
            toast("動画ファイルの読み込みに失敗しました")
          }
        }
      })
      const inputElement = document.getElementById(
        "video_input",
      ) as HTMLInputElement
      if (inputElement) {
        const fileList: File[] = []
        acceptedFiles.forEach((file) => {
          fileList.push(file)
        })
        const newFileList = new DataTransfer()
        fileList.forEach((file) => {
          newFileList.items.add(file)
        })
        inputElement.files = newFileList.files
      }
    },
    onDragEnter: () => {
      setIsHovered(true)
    },
    onDragLeave: () => {
      setIsHovered(false)
    },
    onDropAccepted: () => {
      setIsHovered(false)
    },
  })

  return (
    <>
      <div
        {...getRootProps()}
        className={cn(
          "h-[100%] w-[100%] border-2 border-zinc-800",
          isHovered ? "border-2 border-clear-bright-blue" : "",
          props.videoFile ? "" : "rounded-b",
        )}
      >
        {(props.isEnabledSelectVideo === undefined ||
          props.isEnabledSelectVideo) && (
          <>
            <input id="video_input" {...getInputProps()} />
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: Legacy UI (click-only) */}
            <div
              className="m-auto mt-4 mb-4 flex w-48 cursor-pointer flex-col items-center justify-center rounded bg-clear-bright-blue p-4 text-white"
              onClick={() => {
                const inputElement = document.getElementById(
                  "video_input",
                ) as HTMLInputElement
                if (inputElement) {
                  inputElement.click()
                }
              }}
            >
              <p className="font-bold">{t("動画を選択", "Select Video")}</p>
            </div>
            <div className="m-4 flex flex-col text-white">
              <p className="text-center text-sm">{"MP4"}</p>
              <p className="text-center text-sm">
                {t("12秒まで", "Up to 12 seconds")}
              </p>
            </div>
          </>
        )}
        {props.videoFile && (
          <VideoItem
            videoFile={props.videoFile}
            onDelete={() => {
              props.onVideoChange(null)
              updateThumbnail(null)
            }}
          />
        )}
        {props.previewVideoUrl && (
          <video
            controls
            className="m-auto mt-4 mb-4 w-64"
            src={props.previewVideoUrl}
          >
            <track kind="captions" src="path_to_captions.vtt" label="English" />
          </video>
        )}
      </div>
    </>
  )
}
