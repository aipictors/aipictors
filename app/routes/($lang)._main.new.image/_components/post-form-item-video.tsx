import { cn } from "@/_lib/cn"
import { VideoItem } from "@/routes/($lang)._main.new.image/_components/video-item"
import { useState } from "react"
import { useDropzone } from "react-dropzone-esm"
import { toast } from "sonner"

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
export const PostFormItemVideo = (props: Props) => {
  // ファイルの最大サイズ(バイト単位)
  const maxSize = 32 * 1024 * 1024

  // ドラッグ中して画像一覧にホバー中かどうか
  const [isHovered, setIsHovered] = useState(false)

  /**
   * 作品サムネイルを更新する
   * @param webpDataURL
   */
  const updateThumbnail = (webpDataURL: string | null = null) => {
    // 先頭の要素を並び替えした場合はサムネイルを0番目の画像が存在したらその画像に設定する
    if (props.setThumbnailBase64) {
      props.setThumbnailBase64(webpDataURL ? webpDataURL : "")
    }
    // 先頭の要素を並び替えした場合はサムネイルを0番目の画像が存在したらその画像に設定する
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
      // biome-ignore lint/complexity/noForEach: <explanation>
      acceptedFiles.forEach(async (file) => {
        // 動画が選択された場合は画像一覧をリセットして、動画をセットする
        if (file.type === "video/mp4") {
          // サイズと再生時間のチェック
          if (file.size > 32 * 1024 * 1024) {
            toast("動画のサイズは32MB以下にしてください")
            return
          }
          const video = document.createElement("video")

          video.src = URL.createObjectURL(file)
          video.onloadedmetadata = () => {
            if (video.duration > 12) {
              toast("動画は12秒以下にしてください")
              return
            }

            // 動画をセット
            props.onVideoChange(file)

            // 動画のサムネイルを生成するためのCanvasを作成
            const canvas = document.createElement("canvas")
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext("2d")

            // タイムラインで指定できるライブラリを使ってサムネイルを取得
            const time = video.duration / 2
            video.currentTime = time
            video.onseeked = () => {
              ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
              const thumbnailUrl = canvas.toDataURL() // サムネイルをDataURL形式で取得

              updateThumbnail(thumbnailUrl)
            }
          }
        }
      })
      // ここで input の id が image_inputの要素に file をセットする
      const inputElement = document.getElementById(
        "video_input",
      ) as HTMLInputElement
      if (inputElement) {
        const fileList: File[] = []
        // biome-ignore lint/complexity/noForEach: <explanation>
        acceptedFiles.forEach((file) => {
          fileList.push(file)
        })
        const newFileList = new DataTransfer()
        // biome-ignore lint/complexity/noForEach: <explanation>
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
        )}
      >
        {(props.isEnabledSelectVideo === undefined ||
          props.isEnabledSelectVideo) && (
          <>
            <input id="video_input" {...getInputProps()} />
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
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
              <p className="font-bold">動画を選択</p>
            </div>
            <div className="m-4 flex flex-col text-white">
              <p className="text-center text-sm">{"MP4"}</p>
              <p className="text-center text-sm">{"12秒まで"}</p>
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
