import {
  ArrowDownAZIcon,
  ArrowLeftRightIcon,
  CheckIcon,
  LayoutGrid,
  LayoutPanelTop,
  PencilLineIcon,
  PlusIcon,
  Repeat2Icon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"
import { type ChangeEvent, useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone-esm"
import { toast } from "sonner"
import {
  isSortedByFileName,
  sortByFileName,
} from "~/components/drag/sort-by-file-name"
import type { TSortableItem } from "~/components/drag/sortable-item"
import {
  commitSortableOrder,
  SortableItems,
} from "~/components/drag/sortable-items"
import { Button } from "~/components/ui/button"
import { Slider } from "~/components/ui/slider"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  toAnimatedWebpDataUrl,
  WORK_ANIMATED_GIF_OPTIONS,
} from "~/utils/animated-gif-to-webp"
import { formatFileSize, MAX_IMAGE_FILE_SIZE_BYTES } from "~/utils/file-size"
import {
  getExtractInfoFromPNG,
  type PNGInfo,
} from "~/utils/get-extract-info-from-png"
import { notifyRejectedFiles } from "~/utils/notify-rejected-files"
import { toPostImageDataUrl } from "~/utils/to-post-image-data-url"

type Props = {
  indexList: number[]
  items: TSortableItem[]
  isOnlyMove?: boolean
  maxItemsCount?: number
  setItems(items: TSortableItem[]): void
  setIndexList(value: number[]): void
  setThumbnailBase64(thumbnailBase64: string | null): void
  setOgpBase64?(ogpBase64: string | null): void
  setIsThumbnailLandscape?(isThumbnailLandscape: boolean): void
  onChangePngInfo?(pngInfo: PNGInfo): void
  onMosaicButtonClick?(content: string): void
  onChangeItems(items: TSortableItem[]): void
  onChangeIndexList?(indexList: number[]): void
  onInputFiles?: (files: FileList) => void
  submitText?: string
  /** 空のときの枠をテーマの色で出す（暗い背景の上に置かないとき） */
  isThemedEmptyState?: boolean
  /** 画像の下に出す小さな表示（自動モザイクの状態） */
  renderItemFooter?: (item: TSortableItem) => React.ReactNode
}

/** 画像一覧の 1 枚の大きさ（px）。生成履歴と同じく端末に覚えておく */
export const POST_IMAGE_ITEM_SIZES = [60, 76, 112, 150] as const

const ITEM_SIZE_KEY = "post-image-item-size"

/** サムネを「元の比率」（切り抜かずに全体）で見るか。端末に覚えておく */
const ORIGINAL_RATIO_KEY = "post-image-original-ratio"

/** スマートフォンは 1 行に 4 枚並ぶ大きさ、PC は今まで通りの大きさから始める */
const toDefaultItemSizeIndex = () =>
  typeof window !== "undefined" && window.innerWidth < 768 ? 1 : 2

/**
 * ドラッグ可能な複数画像選択
 * @param props
 * @returns
 */
export function PostFormItemDraggableImages(props: Props) {
  const t = useTranslation()
  // 先頭の画像
  const [nowHeadImageBase64, setNowHeadImageBase64] = useState("")

  // ファイルの最大サイズ(バイト単位)
  const maxSize = MAX_IMAGE_FILE_SIZE_BYTES
  const maxSizeLabel = formatFileSize(maxSize)

  // ドラッグ中して画像一覧にホバー中かどうか
  const [isHovered, setIsHovered] = useState(false)

  // 一覧の 1 枚の大きさ（サーバーの描画では既定の大きさ。開いたら端末に覚えた大きさにする）
  const [itemSizeIndex, setItemSizeIndex] = useState(2)
  useEffect(() => {
    const stored = Number(localStorage.getItem(ITEM_SIZE_KEY))
    setItemSizeIndex(
      localStorage.getItem(ITEM_SIZE_KEY) !== null &&
        Number.isInteger(stored) &&
        POST_IMAGE_ITEM_SIZES[stored] !== undefined
        ? stored
        : toDefaultItemSizeIndex(),
    )
  }, [])
  const changeItemSize = (index: number) => {
    const next = Math.min(POST_IMAGE_ITEM_SIZES.length - 1, Math.max(0, index))
    setItemSizeIndex(next)
    localStorage.setItem(ITEM_SIZE_KEY, String(next))
  }
  const itemSize = POST_IMAGE_ITEM_SIZES[itemSizeIndex]

  // サムネの見せ方（正方形に切り抜く／元の比率で全体を見せる）
  const [isOriginalRatio, setIsOriginalRatio] = useState(false)
  useEffect(() => {
    setIsOriginalRatio(localStorage.getItem(ORIGINAL_RATIO_KEY) === "1")
  }, [])
  const changeOriginalRatio = (value: boolean) => {
    setIsOriginalRatio(value)
    localStorage.setItem(ORIGINAL_RATIO_KEY, value ? "1" : "0")
  }
  const ratioButtonClassName = (isActive: boolean) =>
    cn(
      "flex h-8 items-center gap-1 rounded-full px-2.5 font-medium text-xs transition-colors",
      isActive
        ? "bg-background text-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground",
    )

  // 並べ替えモード（触ってすぐ動かせる・◀ ▶ で 1 つずつ動かせる）
  const [isReorderMode, setIsReorderMode] = useState(false)
  useEffect(() => {
    if (props.items.length < 2) setIsReorderMode(false)
  }, [props.items.length])

  /** GIF アニメーションはアニメーションのまま WebP に、それ以外は静止画の WebP にする */
  const toItemDataUrl = async (file: File) =>
    (await toAnimatedWebpDataUrl(file, WORK_ANIMATED_GIF_OPTIONS)) ??
    (await toPostImageDataUrl(file)).dataUrl

  const nextFrame = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

  /**
   * 選択中の画像一覧が変更されたときはサムネイルを更新する
   */
  useEffect(() => {
    if (props.items.length) {
      if (
        props.items[0].content &&
        props.items[0].content !== nowHeadImageBase64
      ) {
        updateThumbnail()
        setNowHeadImageBase64(props.items[0].content)
      }
    } else {
      updateThumbnail()
      setNowHeadImageBase64("")
    }
    if (props.items.length === 0) {
      if (props.setOgpBase64) {
        props.setOgpBase64(null)
      }
      if (props.setIsThumbnailLandscape) {
        props.setIsThumbnailLandscape(false)
      }
      if (props.setThumbnailBase64) {
        props.setThumbnailBase64(null)
      }
    }
  }, [props.items])

  /**
   * クリップボードから画像貼り付けできるようにする
   * 選んだときと同じ変換（toItemDataUrl）を使う。前は元の解像度のまま canvas.toDataURL で
   * 書き出していて、画面が止まり iPhone の Safari では巨大な PNG になっていた。
   * 登録は 1 回だけなので、最新の props は handlePasteRef から読む（古い一覧に足さないように）
   */
  const handlePaste = async (event: ClipboardEvent) => {
    const activeElement = document.activeElement
    if (
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA")
    ) {
      return
    }

    if (props.isOnlyMove) return

    const items = event.clipboardData?.items
    if (!items) return

    const files: File[] = []
    for (const item of items) {
      if (!item.type.startsWith("image")) continue
      const file = item.getAsFile()
      if (file) files.push(file)
    }

    for (const file of files) {
      if (file.size > maxSize) {
        toast(
          t(
            `${maxSizeLabel}以内の画像を貼り付けてください`,
            `Please paste an image under ${maxSizeLabel}`,
          ),
        )
        continue
      }
      if (props.maxItemsCount && props.maxItemsCount < props.items.length + 1) {
        toast(
          t(
            `最大${props.maxItemsCount}までです`,
            `Maximum ${props.maxItemsCount} items allowed`,
          ),
        )
        break
      }
      try {
        const webpDataUrl = await toItemDataUrl(file)
        props.items.push({
          id: props.items.length,
          content: webpDataUrl,
        })
        props.onChangeItems([...props.items])
        updateThumbnail()
        toast("画像をクリップボードから貼り付けました")
        await nextFrame()
      } catch (error) {
        console.error(error)
        toast(
          t(
            "一部の画像の読み込みに失敗しました。別の画像でお試しください",
            "Failed to load one of the images. Please try a different file.",
          ),
        )
      }
    }
  }

  const handlePasteRef = useRef(handlePaste)
  handlePasteRef.current = handlePaste

  useEffect(() => {
    const listener = (event: ClipboardEvent) => {
      void handlePasteRef.current(event)
    }
    document.addEventListener("paste", listener)
    return () => {
      document.removeEventListener("paste", listener)
    }
  }, [])

  const landscapeCheckedRef = useRef({ content: "", isLandscape: false })

  /**
   * 作品サムネイルを更新する
   * @param webpDataURL
   */
  const updateThumbnail = (webpDataURL: string | null = null) => {
    if (props.setThumbnailBase64) {
      if (
        !webpDataURL &&
        props.items &&
        props.items.length > 0 &&
        props.items[0].content
      ) {
        props.setThumbnailBase64(props.items[0].content)
      } else {
        props.setThumbnailBase64(webpDataURL ? webpDataURL : "")
      }
    }
    if (props.setOgpBase64) {
      props.setOgpBase64("")
    }

    if (props.setIsThumbnailLandscape) {
      if ((props.items && props.items.length > 0) || webpDataURL) {
        const base64 = webpDataURL ? webpDataURL : props.items[0].content
        // 画像を足すたびに先頭の画像（元の解像度）をデコードし直さないよう、同じ画像なら前の結果を使う
        if (base64 && base64 === landscapeCheckedRef.current.content) {
          props.setIsThumbnailLandscape(landscapeCheckedRef.current.isLandscape)
          return
        }
        const img = new Image()
        img.src = base64 ?? ""
        img.onload = () => {
          landscapeCheckedRef.current = {
            content: base64 ?? "",
            isLandscape: img.width > img.height,
          }
          if (props.setIsThumbnailLandscape) {
            props.setIsThumbnailLandscape(img.width > img.height)
          }
        }
      } else {
        props.setIsThumbnailLandscape(false)
      }
    }
  }

  const handleAcceptedFiles = async (acceptedFiles: File[]) => {
    if (props.isOnlyMove) {
      return
    }

    if (props.maxItemsCount && props.maxItemsCount < acceptedFiles.length) {
      toast(
        t(
          `最大${props.maxItemsCount}までです`,
          `Maximum ${props.maxItemsCount} items allowed`,
        ),
      )
      return
    }

    for (const file of acceptedFiles) {
      if (props.maxItemsCount && props.maxItemsCount < props.items.length + 1) {
        toast(
          t(
            `最大${props.maxItemsCount}までです`,
            `Maximum ${props.maxItemsCount} items allowed`,
          ),
        )
        break
      }

      if (file.size > maxSize) {
        toast(
          t(
            `${maxSizeLabel}以内の画像を選択してください`,
            `Please choose an image under ${maxSizeLabel}`,
          ),
        )
        continue
      }

      if (props.items.length === 0 && file.type === "image/png") {
        const pngInfo = await getExtractInfoFromPNG(file)
        if (props.onChangePngInfo) {
          props.onChangePngInfo(pngInfo)
        }
      }

      try {
        const webpDataUrl = await toItemDataUrl(file)
        props.items.push({
          id: props.items.length,
          content: webpDataUrl,
          fileName: file.name,
        })
        props.onChangeItems([...props.items])
        updateThumbnail()
        await nextFrame()
      } catch (error) {
        console.error(error)
        toast(
          t(
            "一部の画像の読み込みに失敗しました。別の画像でお試しください",
            "Failed to load one of the images. Please try a different file.",
          ),
        )
      }
    }

    const inputElement = document.getElementById(
      "images_input",
    ) as HTMLInputElement
    if (inputElement) {
      const newFileList = new DataTransfer()
      acceptedFiles.forEach((file) => {
        newFileList.items.add(file)
      })

      inputElement.files = newFileList.files

      if (props.onInputFiles) {
        props.onInputFiles(inputElement.files)
      }
    }
  }

  const replaceInputRef = useRef<HTMLInputElement>(null)
  const replaceTargetIdRef = useRef<number | null>(null)

  /** 1 枚だけ入れ替える。順番と他の画像はそのまま */
  const handleReplaceFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    const targetId = replaceTargetIdRef.current
    // 同じファイルをもう一度選べるように空にする
    event.target.value = ""
    if (!file || targetId === null) {
      return
    }

    if (file.size > maxSize) {
      toast(
        t(
          `${maxSizeLabel}以内の画像を選択してください`,
          `Please choose an image under ${maxSizeLabel}`,
        ),
      )
      return
    }

    try {
      const webpDataUrl = await toItemDataUrl(file)
      props.onChangeItems(
        props.items.map((item) =>
          item.id === targetId
            ? { ...item, content: webpDataUrl, fileName: file.name }
            : item,
        ),
      )
      toast(t("画像を差し替えました", "Image replaced"))
    } catch (error) {
      console.error(error)
      toast(
        t(
          "画像の読み込みに失敗しました。別の画像でお試しください",
          "Failed to load the image. Please try a different file.",
        ),
      )
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    minSize: 0,
    maxSize: maxSize,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
      "image/bmp": [".bmp"],
    },
    noClick: true,
    onDropRejected: (fileRejections) => {
      notifyRejectedFiles(fileRejections, t, maxSize)
    },
    onDrop: (acceptedFiles) => {
      void handleAcceptedFiles(acceptedFiles)
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
    disabled: props.isOnlyMove,
  })

  const hasFileNames = props.items.filter((item) => item.fileName).length >= 2

  return (
    <>
      <div
        {...getRootProps()}
        className={cn(
          "h-[100%] w-[100%] border-2",
          props.isThemedEmptyState && props.items.length === 0
            ? "rounded-2xl border-dashed bg-muted/40"
            : "border-zinc-800",
          isHovered ? "border-2 border-clear-bright-blue" : "",
          props.items.length ? "" : "rounded-b",
        )}
      >
        {!props.isOnlyMove && <input id="images_input" {...getInputProps()} />}
        {!props.isOnlyMove && (
          <input
            ref={replaceInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
            onChange={(event) => {
              void handleReplaceFile(event)
            }}
          />
        )}
        {props.items.length === 0 && !props.isOnlyMove && (
          <button
            type="button"
            className="m-auto mt-4 mb-4 flex w-48 cursor-pointer flex-col items-center justify-center rounded bg-clear-bright-blue p-4 text-white"
            onClick={() => {
              const inputElement = document.getElementById(
                "images_input",
              ) as HTMLInputElement
              if (inputElement) {
                inputElement.click()
              }
            }}
          >
            {props.submitText ? (
              <p className="font-bold">{props.submitText}</p>
            ) : (
              <p className="font-bold">{t("画像を追加", "Add Image")}</p>
            )}
          </button>
        )}
        {props.items.length !== 0 && (
          <div className="flex flex-wrap items-center gap-2 px-2 pt-2">
            {props.items.length >= 2 && (
              <Button
                type="button"
                variant={isReorderMode ? "default" : "secondary"}
                size="sm"
                className="h-9"
                aria-pressed={isReorderMode}
                onClick={() => setIsReorderMode((value) => !value)}
              >
                {isReorderMode ? (
                  <CheckIcon className="mr-1.5 size-4" />
                ) : (
                  <ArrowLeftRightIcon className="mr-1.5 size-4" />
                )}
                {isReorderMode
                  ? t("並べ替えを終える", "Done")
                  : t("並べ替え", "Reorder")}
              </Button>
            )}
            {hasFileNames && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-9"
                disabled={isSortedByFileName(props.items)}
                onClick={() => {
                  const sorted = sortByFileName(props.items)
                  props.setItems(sorted)
                  props.setIndexList(sorted.map((item) => item.id))
                }}
              >
                <ArrowDownAZIcon className="mr-1.5 size-4" />
                {isSortedByFileName(props.items)
                  ? t("ファイル名順です", "Sorted by file name")
                  : t("ファイル名順に並べる", "Sort by file name")}
              </Button>
            )}
            {isReorderMode && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-9"
                onClick={() => {
                  commitSortableOrder(
                    [...props.items].reverse(),
                    props.setIndexList,
                    props.setItems,
                  )
                }}
              >
                <Repeat2Icon className="mr-1.5 size-4" />
                {t("逆の順にする", "Reverse")}
              </Button>
            )}
            <div className="ml-auto flex flex-wrap items-center justify-end gap-1">
              <fieldset className="relative mr-1 inline-flex rounded-full border bg-muted/40 p-0.5">
                <legend className="sr-only">
                  {t("サムネイルの見せ方", "Thumbnail view")}
                </legend>
                <button
                  type="button"
                  aria-pressed={!isOriginalRatio}
                  title={t("正方形に切り抜いて表示", "Square thumbnails")}
                  onClick={() => changeOriginalRatio(false)}
                  className={ratioButtonClassName(!isOriginalRatio)}
                >
                  <LayoutGrid className="size-3.5" />
                  {t("正方形", "Square")}
                </button>
                <button
                  type="button"
                  aria-pressed={isOriginalRatio}
                  title={t(
                    "切り抜かずに画像全体を表示",
                    "Show the whole image",
                  )}
                  onClick={() => changeOriginalRatio(true)}
                  className={ratioButtonClassName(isOriginalRatio)}
                >
                  <LayoutPanelTop className="size-3.5" />
                  {t("元の比率", "Original")}
                </button>
              </fieldset>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9"
                onClick={() => changeItemSize(itemSizeIndex - 1)}
                disabled={itemSizeIndex === 0}
                aria-label={t("小さく表示", "Smaller")}
              >
                <ZoomOutIcon className="size-5" />
              </Button>
              <Slider
                className="w-16 sm:w-24"
                min={0}
                max={POST_IMAGE_ITEM_SIZES.length - 1}
                step={1}
                value={[itemSizeIndex]}
                onValueChange={(value) => changeItemSize(value[0])}
                aria-label={t("画像の大きさ", "Thumbnail size")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9"
                onClick={() => changeItemSize(itemSizeIndex + 1)}
                disabled={itemSizeIndex === POST_IMAGE_ITEM_SIZES.length - 1}
                aria-label={t("大きく表示", "Larger")}
              >
                <ZoomInIcon className="size-5" />
              </Button>
            </div>
            <p className="w-full text-muted-foreground text-xs">
              {isReorderMode
                ? t(
                    "画像を指やマウスでそのまま動かすか、◀ ▶ で1つずつ動かせます。スクロールは画像の外で",
                    "Drag an image, or use ◀ ▶ to move it one step. Scroll outside the images",
                  )
                : t(
                    "並べ替えは「並べ替え」を押すか、画像を長押し（PCはドラッグ）",
                    "To reorder, tap Reorder or long-press an image (drag on PC)",
                  )}
            </p>
          </div>
        )}
        <SortableItems
          items={props.items}
          itemSize={itemSize}
          isOriginalRatio={isOriginalRatio}
          isReorderMode={isReorderMode}
          isDeletable={!props.isOnlyMove}
          isFileNameEditable={true}
          onReplace={
            props.isOnlyMove
              ? undefined
              : (id) => {
                  replaceTargetIdRef.current = id
                  replaceInputRef.current?.click()
                }
          }
          setItems={props.setItems}
          setIndexList={props.setIndexList}
          renderItemFooter={props.renderItemFooter}
          optionalButton={<PencilLineIcon className="size-4" />}
          optionalButtonLabel={t("モザイク・描き込みで直す", "Mosaic / draw")}
          onClickOptionButton={(index) => {
            const content = props.items[index]?.content
            if (props.onMosaicButtonClick && content) {
              props.onMosaicButtonClick(content)
            }
          }}
          dummyEnableDragItem={
            props.items.length !== 0 &&
            props.items.length !== props.maxItemsCount &&
            !props.isOnlyMove && (
              <button
                type="button"
                onClick={() => {
                  const inputElement = document.getElementById(
                    "images_input",
                  ) as HTMLInputElement
                  if (inputElement) {
                    inputElement.click()
                  }
                }}
                className="flex size-full cursor-pointer items-center justify-center rounded-xl border-2 border-white/25 border-dashed bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label={t("画像を追加", "Add images")}
              >
                <PlusIcon className={itemSize >= 112 ? "size-10" : "size-6"} />
              </button>
            )
          }
        />
        {!props.items.length && (
          <div
            className={cn(
              "m-4 flex flex-col rounded-b",
              props.isThemedEmptyState ? "text-muted-foreground" : "text-white",
            )}
          >
            <p className="text-center text-sm">{"JPEG、PNG、GIF、WEBP、BMP"}</p>
            <p className="text-center text-sm">
              {t(
                `1枚${maxSizeLabel}以内、最大200枚`,
                `Up to ${maxSizeLabel} per image, max 200 images`,
              )}
            </p>
            <p className="text-center text-sm">
              {"クリップボードから貼り付けも可能"}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
