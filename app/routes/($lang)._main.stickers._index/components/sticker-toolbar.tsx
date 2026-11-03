import { Download, Loader2, Redo2, Trash2, Undo2, Upload } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { Switch } from "~/components/ui/switch"
import type { StickerEditor } from "~/routes/($lang)._main.stickers._index/hooks/use-sticker-editor"

export function StickerToolbar(props: { editor: StickerEditor }) {
  const {
    activeLayerId,
    backgroundColor,
    backgroundEnabled,
    canRedo,
    canUndo,
    duplicateLayer,
    exportCanvas,
    handleRedo,
    handleUndo,
    isRegisterPreparing,
    layers,
    openRegisterDialog,
    removeLayer,
    setBackgroundColor,
    setBackgroundEnabled,
  } = props.editor

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-muted/20 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <Label className="text-sm">背景</Label>
        <Switch
          checked={backgroundEnabled}
          onCheckedChange={setBackgroundEnabled}
        />
        <Input
          type="color"
          value={backgroundColor}
          onChange={(event) => setBackgroundColor(event.target.value)}
          className="h-9 w-14 p-1"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => exportCanvas("png")}
        >
          <Download className="mr-1 h-4 w-4" />
          保存
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void openRegisterDialog()}
          disabled={isRegisterPreparing || layers.length === 0}
        >
          {isRegisterPreparing ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-1 h-4 w-4" />
          )}
          登録
        </Button>
        <Separator
          orientation="vertical"
          className="hidden h-6 sm:block"
        />
        <Button
          variant="secondary"
          size="icon"
          onClick={handleUndo}
          disabled={!canUndo}
        >
          <span className="sr-only">Undo</span>
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleRedo}
          disabled={!canRedo}
        >
          <span className="sr-only">Redo</span>
          <Redo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (activeLayerId) {
              duplicateLayer(activeLayerId)
            }
          }}
          disabled={!activeLayerId}
        >
          複製
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (activeLayerId) {
              removeLayer(activeLayerId)
            }
          }}
          disabled={!activeLayerId}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          削除
        </Button>
      </div>
    </div>
  )
}
