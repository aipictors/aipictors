import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { ImagePlus, Loader2, X } from "lucide-react"
import { type DragEvent, useRef, useState } from "react"
import { toast } from "sonner"
import { RequestMediaThumb } from "~/components/requests/request-media-thumb"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  REQUEST_VIDEO_TYPES,
  toRequestRawUploadType,
  toRequestUploadPlan,
} from "~/utils/request-upload-plan"
import {
  uploadPublicFile,
  uploadPublicImage,
} from "~/utils/upload-public-image"

const viewerTokenQuery = graphql(
  `query RequestImagePickerViewerToken {
    viewer {
      id
      token
    }
  }`,
)

/** 長辺 maxSide までに縮めて webp にする（納品は大きいまま送れるよう maxSide を大きくする） */
const toWebpDataUrl = (file: File, maxSide: number) =>
  new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("canvas"))
        return
      }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL("image/webp", 0.92))
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("image"))
    }
    image.src = url
  })

/**
 * 画像を選んでその場でアップロードする（URL の配列を持つ）。参考画像・見本・納品・メッセージで使う。
 * ボタンで選ぶほか、画像ファイルを枠にドラッグ＆ドロップしても追加できる。
 * allowMotion（納品）のときは GIF アニメと動画（mp4・webm・mov）を変換せずにそのまま送る
 */
export function RequestImagePicker(props: {
  value: string[]
  onChange: (urls: string[]) => void
  max: number
  maxSide?: number
  label?: string
  allowMotion?: boolean
}) {
  const t = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(0)
  const [dragging, setDragging] = useState(false)
  const { data } = useQuery(viewerTokenQuery)

  const canAdd = props.value.length + uploading < props.max
  const hasFiles = (e: DragEvent) =>
    Array.from(e.dataTransfer.types).includes("Files")

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const room = props.max - props.value.length
    const allowMotion = props.allowMotion ?? false
    const all = Array.from(files)
    if (
      all.some((f) => toRequestUploadPlan(f, allowMotion) === "unsupported")
    ) {
      // これまでは何も言わずに外していて、送れたのか分からなかった
      toast.error(
        allowMotion
          ? t(
              "送れるのは画像・GIFアニメ・動画（mp4 / webm / mov）です",
              "Only images, GIF animations and videos (mp4 / webm / mov) can be sent",
            )
          : t(
              "この欄には画像だけ添付できます（動画は不可）",
              "Only images can be attached here (no videos)",
            ),
      )
    }
    if (all.some((f) => toRequestUploadPlan(f, allowMotion) === "too-large")) {
      toast.error(
        t(
          "GIFアニメ・動画は32MBまでです",
          "GIF animations and videos must be 32MB or smaller",
        ),
      )
    }
    const picked = all
      .filter((f) => {
        const plan = toRequestUploadPlan(f, allowMotion)
        return plan === "convert" || plan === "raw"
      })
      .slice(0, room)
    if (picked.length === 0) return
    setUploading(picked.length)
    const urls: string[] = []
    for (const file of picked) {
      try {
        if (toRequestUploadPlan(file, allowMotion) === "raw") {
          const blob =
            file.type === ""
              ? new Blob([file], { type: toRequestRawUploadType(file) })
              : file
          urls.push(await uploadPublicFile(blob, data?.viewer?.token))
        } else {
          const dataUrl = await toWebpDataUrl(file, props.maxSide ?? 2048)
          urls.push(await uploadPublicImage(dataUrl, data?.viewer?.token))
        }
      } catch {
        toast.error(
          t("画像をアップロードできませんでした", "Could not upload the image"),
        )
      } finally {
        setUploading((n) => n - 1)
      }
    }
    props.onChange([...props.value, ...urls])
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div
      className={cn(
        "-m-1 flex flex-wrap gap-2 rounded-2xl p-1 transition-colors",
        dragging && "bg-primary/10 outline-dashed outline-2 outline-primary",
      )}
      onDragOver={(e) => {
        if (!hasFiles(e)) return
        e.preventDefault()
        e.dataTransfer.dropEffect = canAdd ? "copy" : "none"
        if (canAdd) setDragging(true)
      }}
      onDragLeave={(e) => {
        // 子の要素へ移っただけのときは枠の色を消さない
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
        setDragging(false)
      }}
      onDrop={(e) => {
        if (!hasFiles(e)) return
        e.preventDefault()
        setDragging(false)
        if (canAdd) void onFiles(e.dataTransfer.files)
      }}
    >
      {props.value.map((url) => (
        <div
          key={url}
          className="relative size-20 overflow-hidden rounded-xl bg-muted"
        >
          <RequestMediaThumb url={url} />
          <button
            type="button"
            aria-label={t("外す", "Remove")}
            onClick={() => props.onChange(props.value.filter((u) => u !== url))}
            className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
      {Array.from({ length: Math.max(0, uploading) }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: 読み込み中の枠
          key={`u${i}`}
          className="flex size-20 items-center justify-center rounded-xl bg-muted"
        >
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ))}
      {canAdd && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex size-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
        >
          <ImagePlus className="size-5" />
          <span className="text-[10px]">
            {props.label ?? t("画像", "Images")} {props.value.length}/
            {props.max}
          </span>
          <span className="hidden text-[9px] leading-none md:block">
            {t("ドロップ可", "or drop")}
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={
          props.allowMotion
            ? ["image/*", ...REQUEST_VIDEO_TYPES].join(",")
            : "image/*"
        }
        multiple
        hidden
        onChange={(e) => void onFiles(e.target.files)}
      />
    </div>
  )
}
