// 太さは fontFamilies の weights で選べるものだけ読む
import "@fontsource/m-plus-rounded-1c/400.css"
import "@fontsource/m-plus-rounded-1c/700.css"
import "@fontsource/m-plus-rounded-1c/900.css"
import "@fontsource/noto-sans-jp/400.css"
import "@fontsource/noto-sans-jp/700.css"
import "@fontsource/noto-sans-jp/900.css"
import "@fontsource/noto-serif-jp/400.css"
import "@fontsource/noto-serif-jp/700.css"
import "@fontsource/noto-serif-jp/900.css"
import "@fontsource/yomogi/400.css"
import { Plus } from "lucide-react"
import { Button } from "~/components/ui/button"
import { AddStickerDialog } from "~/routes/($lang)._main.posts.$post._index/components/add-sticker-dialog"
import { StickerAssetPanel } from "~/routes/($lang)._main.stickers._index/components/sticker-asset-panel"
import { StickerCanvasStage } from "~/routes/($lang)._main.stickers._index/components/sticker-canvas-stage"
import { StickerEffectsControls } from "~/routes/($lang)._main.stickers._index/components/sticker-effects-controls"
import { StickerImageControls } from "~/routes/($lang)._main.stickers._index/components/sticker-image-controls"
import { StickerLayerList } from "~/routes/($lang)._main.stickers._index/components/sticker-layer-list"
import { StickerMobilePanel } from "~/routes/($lang)._main.stickers._index/components/sticker-mobile-panel"
import { StickerTextControls } from "~/routes/($lang)._main.stickers._index/components/sticker-text-controls"
import { StickerToolbar } from "~/routes/($lang)._main.stickers._index/components/sticker-toolbar"
import { useStickerEditor } from "~/routes/($lang)._main.stickers._index/hooks/use-sticker-editor"

export function StickerCreator (props: { onClose?: () => void }) {
  const editor = useStickerEditor(props)
  const {
    handlePanelResizePointerDown,
    isOpen,
    isRegisterDialogOpen,
    leftPanelWidth,
    registerImageBase64,
    rightPanelWidth,
    setIsOpen,
    setIsRegisterDialogOpen,
    setRegisterImageBase64,
  } = editor

  if (!isOpen) {
    return (
      <section className="rounded-xl border bg-background p-4">
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            className="w-full justify-between"
            onClick={() => setIsOpen(true)}
          >
            スタンプを作成する
            <Plus className="h-5 w-5" />
          </Button>
          <p className="text-muted-foreground text-xs">
            素材を追加してドラッグ・回転・拡大縮小ができます。
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4 rounded-xl border bg-background p-4 shadow-sm">
      <AddStickerDialog
        open={isRegisterDialogOpen}
        onOpenChange={(open) => {
          setIsRegisterDialogOpen(open)
          if (!open) {
            setRegisterImageBase64("")
          }
        }}
        defaultImageBase64={registerImageBase64}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="font-bold text-lg">スタンプ作成ツール</h2>
          <p className="text-muted-foreground text-sm">
            素材を追加してドラッグ・回転・拡大縮小ができます。
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => (props.onClose ? props.onClose() : setIsOpen(false))}>
          閉じる
        </Button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <aside
          className="hidden flex-col gap-3 rounded-xl border bg-background p-4 lg:flex"
          style={{ width: `${leftPanelWidth}px` }}
        >
          <StickerAssetPanel
            editor={editor}
            categoryClassName="space-y-1"
            gridClassName="grid max-h-[640px] grid-cols-2 gap-2 overflow-auto pr-1"
          />
        </aside>

        <div
          // biome-ignore lint/nursery/useSortedClasses: keep order for readability
          className="hidden h-[calc(100vh-220px)] w-2 shrink-0 cursor-col-resize select-none touch-none rounded bg-border/70 hover:bg-border lg:block"
          onPointerDown={(event) => handlePanelResizePointerDown(event, "left")}
        />

        <div className="min-w-0 space-y-4 lg:flex-1">
          <StickerToolbar editor={editor} />

          <StickerCanvasStage editor={editor} />

          <StickerMobilePanel editor={editor} />
        </div>

        <div
          // biome-ignore lint/nursery/useSortedClasses: keep order for readability
          className="hidden h-[calc(100vh-220px)] w-2 shrink-0 cursor-col-resize select-none touch-none rounded bg-border/70 hover:bg-border lg:block"
          onPointerDown={(event) =>
            handlePanelResizePointerDown(event, "right")
          }
        />

        <aside
          className="hidden flex-col gap-4 rounded-xl border bg-background p-4 lg:flex"
          style={{ width: `${rightPanelWidth}px` }}
        >
          <div className="space-y-3">
            <StickerLayerList editor={editor} showDuplicateButton={true} />
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">エフェクト</h3>
            <StickerEffectsControls editor={editor} />
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">テキスト</h3>
            <StickerTextControls editor={editor} layout="sidebar" />
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">画像</h3>
            <StickerImageControls editor={editor} layout="sidebar" />
          </div>
        </aside>
      </div>
    </section>
  )
}
