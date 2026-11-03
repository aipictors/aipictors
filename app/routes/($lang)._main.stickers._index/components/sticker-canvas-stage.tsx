import { MoveDiagonal2, RotateCcw, X } from "lucide-react"
import { LayerSparkleOverlay } from "~/routes/($lang)._main.stickers._index/components/sticker-layer-sparkle-overlay"
import type { StickerEditor } from "~/routes/($lang)._main.stickers._index/hooks/use-sticker-editor"
import {
  buildCssFilter,
  normalizeLayerEffects,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-layer-effects"
import { normalizeVerticalPreviewText } from "~/routes/($lang)._main.stickers._index/utils/sticker-text-layout"

export function StickerCanvasStage(props: { editor: StickerEditor }) {
  const {
    activeLayerId,
    backgroundColor,
    backgroundEnabled,
    canvasId,
    canvasRef,
    canvasScale,
    getImageLayerSrc,
    handlePointerDown,
    layers,
    removeLayer,
    setActiveLayerId,
    toCanvasPx,
  } = props.editor

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border bg-background p-4">
      <div
        id={canvasId}
        ref={canvasRef}
        className="relative aspect-square w-full max-w-[768px] overflow-hidden rounded-lg border"
        style={{
          backgroundColor: backgroundEnabled
            ? backgroundColor
            : "transparent",
          backgroundImage: backgroundEnabled
            ? "none"
            : "linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.05) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.05) 75%)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
        }}
        onPointerDown={() => setActiveLayerId(null)}
      >
        {layers
          .filter((layer) => layer.visible)
          .map((layer) => {
            const strokeWidthPx =
              layer.type === "text" ? layer.strokeWidth * canvasScale : 0
            const normalizedEffects = normalizeLayerEffects(layer.effects)
            const cssFilter = buildCssFilter(layer.effects)
            return (
              <div
                key={layer.id}
                // biome-ignore lint/nursery/useSortedClasses: keep order for readability
                className="absolute left-0 top-0 select-none touch-none"
                style={{
                  transform: `translate(${toCanvasPx(layer.x)}px, ${toCanvasPx(layer.y)}px)`,
                  transformOrigin: "top left",
                }}
              >
                <div
                  className={
                    "relative" +
                    (layer.id === activeLayerId
                      ? " outline-2 outline-primary outline-offset-2"
                      : "")
                  }
                  style={{
                    transform: `translate(-50%, -50%) rotate(${layer.rotate}deg) skew(${layer.skewX ?? 0}deg, ${layer.skewY ?? 0}deg) scale(${(layer.scaleX ?? 1) * layer.scale * (layer.flipX ? -1 : 1)}, ${(layer.scaleY ?? 1) * layer.scale * (layer.flipY ? -1 : 1)})`,
                    transformOrigin: "center",
                  }}
                  onPointerDown={(event) => {
                    setActiveLayerId(layer.id)
                    handlePointerDown(event, layer, "move")
                  }}
                >
                  <div className="relative">
                    {layer.type === "image" ? (
                      <img
                        src={getImageLayerSrc(layer)}
                        alt={layer.name}
                        className="block"
                        style={{
                          width: `${toCanvasPx(layer.width)}px`,
                          height: `${toCanvasPx(layer.height)}px`,
                          filter: cssFilter,
                        }}
                        draggable={false}
                      />
                    ) : (
                      <div
                        style={{
                          width: `${toCanvasPx(layer.width)}px`,
                          height: `${toCanvasPx(layer.height)}px`,
                          fontSize: `${toCanvasPx(layer.fontSize)}px`,
                          fontFamily: layer.fontFamily,
                          fontWeight: layer.fontWeight,
                          color: layer.color,
                          writingMode: layer.vertical
                            ? "vertical-rl"
                            : "horizontal-tb",
                          textOrientation: layer.vertical
                            ? ("upright" as const)
                            : undefined,
                          whiteSpace: layer.vertical
                            ? ("nowrap" as const)
                            : ("pre-wrap" as const),
                          WebkitTextStrokeWidth:
                            layer.strokeWidth > 0
                              ? `${strokeWidthPx}px`
                              : undefined,
                          WebkitTextStrokeColor:
                            layer.strokeWidth > 0
                              ? layer.strokeColor
                              : undefined,
                          paintOrder:
                            layer.strokeWidth > 0
                              ? ("stroke fill" as const)
                              : undefined,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          lineHeight: "1.1",
                          padding: "2px",
                          filter: cssFilter,
                        }}
                      >
                        {layer.vertical
                          ? normalizeVerticalPreviewText(layer.text)
                          : layer.text}
                      </div>
                    )}
                    {normalizedEffects.sparkle.enabled && (
                      <LayerSparkleOverlay
                        layerId={layer.id}
                        intensity={normalizedEffects.sparkle.intensity}
                      />
                    )}
                  </div>
                  {layer.id === activeLayerId && !layer.locked && (
                    <>
                      <button
                        type="button"
                        // biome-ignore lint/nursery/useSortedClasses: keep order for readability
                        className="absolute left-1 top-1 grid h-6 w-6 place-items-center rounded-full border bg-background shadow"
                        onPointerDown={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          removeLayer(layer.id)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        // biome-ignore lint/nursery/useSortedClasses: keep order for readability
                        className="absolute right-1 top-1 h-6 w-6 rounded-full border bg-background shadow"
                        onPointerDown={(event) =>
                          handlePointerDown(event, layer, "rotate")
                        }
                      >
                        <RotateCcw className="mx-auto h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        // biome-ignore lint/nursery/useSortedClasses: keep order for readability
                        className="absolute bottom-1 right-1 h-6 w-6 rounded-full border bg-background shadow"
                        onPointerDown={(event) =>
                          handlePointerDown(event, layer, "scale")
                        }
                      >
                        <MoveDiagonal2 className="mx-auto h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
      </div>

      <p className="text-muted-foreground text-xs">
        レイヤーをドラッグで移動。右上で回転、右下で拡大縮小。
      </p>
    </div>
  )
}
