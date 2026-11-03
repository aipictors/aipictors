import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  Unlock,
} from "lucide-react"
import { Button } from "~/components/ui/button"
import type { StickerEditor } from "~/routes/($lang)._main.stickers._index/hooks/use-sticker-editor"

type Props = {
  editor: StickerEditor
  /**
   * レイヤーごとの複製ボタン（PC の列だけ）
   */
  showDuplicateButton: boolean
}

export function StickerLayerList(props: Props) {
  const {
    activeLayerId,
    commitLayerPatch,
    duplicateLayer,
    layers,
    moveLayer,
    removeLayer,
    setActiveLayerId,
  } = props.editor

  return (
    <>
      <h3 className="font-semibold text-sm">レイヤー</h3>
      <p className="text-muted-foreground text-xs">
        上にあるほど前面に表示されます
      </p>
      <div className="space-y-2">
        {[...layers].reverse().map((layer, index) => {
          const actualIndex = layers.length - 1 - index
          return (
            <div
              key={layer.id}
              className={
                "flex items-center justify-between gap-2 rounded-lg border px-2 py-1 " +
                (layer.id === activeLayerId
                  ? "border-primary"
                  : "border-transparent")
              }
            >
              <div className="flex flex-1 items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 overflow-hidden"
                  onClick={() => setActiveLayerId(layer.id)}
                >
                  <span className="sr-only">Select layer</span>
                  {layer.type === "image" ? (
                    <img
                      src={
                        layer.removeColorBackground
                          ? (layer.transparentSrc ?? layer.src)
                          : layer.src
                      }
                      alt=""
                      className="h-9 w-9 rounded object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div
                      // biome-ignore lint/nursery/useSortedClasses: keep order for readability
                      className="grid h-9 w-9 place-items-center rounded bg-muted text-[10px] font-semibold"
                    >
                      T
                    </div>
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(event) => {
                    event.stopPropagation()
                    commitLayerPatch(layer.id, {
                      visible: !layer.visible,
                    })
                  }}
                >
                  {layer.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(event) => {
                    event.stopPropagation()
                    commitLayerPatch(layer.id, {
                      locked: !layer.locked,
                    })
                  }}
                >
                  {layer.locked ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Unlock className="h-4 w-4" />
                  )}
                </Button>
                {layer.type === "text" && (
                  <span className="truncate text-xs">{layer.text}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {props.showDuplicateButton && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(event) => {
                      event.stopPropagation()
                      duplicateLayer(layer.id)
                    }}
                  >
                    <span className="sr-only">Duplicate layer</span>
                    <span className="text-xs">⧉</span>
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(event) => {
                    event.stopPropagation()
                    moveLayer(layer.id, "down")
                  }}
                  disabled={actualIndex === layers.length - 1}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(event) => {
                    event.stopPropagation()
                    moveLayer(layer.id, "up")
                  }}
                  disabled={actualIndex === 0}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(event) => {
                    event.stopPropagation()
                    removeLayer(layer.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
        {layers.length === 0 && (
          <p className="text-muted-foreground text-xs">
            まだレイヤーがありません
          </p>
        )}
      </div>
    </>
  )
}
