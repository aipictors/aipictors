import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import {
  StickerFieldGroup,
  StickerRangeField,
  type StickerPanelLayout,
} from "~/routes/($lang)._main.stickers._index/components/sticker-field-group"
import type { StickerEditor } from "~/routes/($lang)._main.stickers._index/hooks/use-sticker-editor"
import { pickColorWithEyeDropper } from "~/routes/($lang)._main.stickers._index/utils/sticker-image"

type Props = {
  editor: StickerEditor
  layout: StickerPanelLayout
}

/**
 * 選択中の画像レイヤーの変形と色透過
 */
export function StickerImageControls(props: Props) {
  const {
    activeLayer,
    applyColorRemovalToAllImageLayers,
    applyColorRemovalToLayer,
    clearColorRemovalForLayer,
    colorRemovalAllBusy,
    colorRemovalBusy,
    colorRemovalError,
    commitLayerPatch,
    scheduleColorRemoval,
    setColorRemovalError,
    updateLayer,
  } = props.editor

  return (
    <>
      {colorRemovalError && (
        <p className="text-destructive text-xs">{colorRemovalError}</p>
      )}
      {activeLayer?.type === "image" ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                commitLayerPatch(activeLayer.id, {
                  flipX: !activeLayer.flipX,
                })
              }
            >
              左右反転
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                commitLayerPatch(activeLayer.id, {
                  flipY: !activeLayer.flipY,
                })
              }
            >
              上下反転
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                commitLayerPatch(activeLayer.id, {
                  rotate: 0,
                  scale: 1,
                  scaleX: 1,
                  scaleY: 1,
                  skewX: 0,
                  skewY: 0,
                  flipX: false,
                  flipY: false,
                })
              }
            >
              変形リセット
            </Button>
          </div>

          <StickerFieldGroup layout={props.layout}>
            <StickerRangeField
              label="横伸縮"
              min={0.2}
              max={3}
              step={0.01}
              value={activeLayer.scaleX ?? 1}
              onChange={(value) =>
                updateLayer(activeLayer.id, { scaleX: value })
              }
            />
            <StickerRangeField
              label="縦伸縮"
              min={0.2}
              max={3}
              step={0.01}
              value={activeLayer.scaleY ?? 1}
              onChange={(value) =>
                updateLayer(activeLayer.id, { scaleY: value })
              }
            />
          </StickerFieldGroup>

          <StickerFieldGroup layout={props.layout}>
            <StickerRangeField
              label="歪み（X）"
              min={-45}
              max={45}
              step={1}
              value={activeLayer.skewX ?? 0}
              onChange={(value) =>
                updateLayer(activeLayer.id, { skewX: value })
              }
            />
            <StickerRangeField
              label="歪み（Y）"
              min={-45}
              max={45}
              step={1}
              value={activeLayer.skewY ?? 0}
              onChange={(value) =>
                updateLayer(activeLayer.id, { skewY: value })
              }
            />
          </StickerFieldGroup>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={activeLayer.removeColorBackground ?? false}
                onCheckedChange={(value) => {
                  if (!value) {
                    clearColorRemovalForLayer(activeLayer.id)
                    return
                  }
                  void applyColorRemovalToLayer(activeLayer.id)
                }}
                disabled={
                  colorRemovalAllBusy ||
                  colorRemovalBusy[activeLayer.id] === true
                }
              />
              <Label className="text-xs">指定色を透過</Label>
            </div>
            <span className="text-muted-foreground text-xs">
              許容範囲: {activeLayer.colorThreshold ?? 40}
            </span>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">透過する色</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={activeLayer.colorKey ?? "#ffffff"}
                onChange={(event) =>
                  updateLayer(activeLayer.id, {
                    colorKey: event.target.value,
                  })
                }
                className="h-9 w-14 p-1"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  const picked = await pickColorWithEyeDropper()
                  if (!picked) {
                    setColorRemovalError(
                      "スポイトが使えません（未対応ブラウザの可能性があります）",
                    )
                    return
                  }
                  updateLayer(activeLayer.id, { colorKey: picked })
                  if (activeLayer.removeColorBackground) {
                    scheduleColorRemoval(activeLayer.id)
                  }
                }}
                disabled={
                  colorRemovalAllBusy ||
                  colorRemovalBusy[activeLayer.id] === true
                }
              >
                スポイト
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">許容範囲</Label>
            <div className="flex items-center gap-2">
              <Input
                type="range"
                min={0}
                max={160}
                value={activeLayer.colorThreshold ?? 40}
                onChange={(event) => {
                  updateLayer(activeLayer.id, {
                    colorThreshold: Number(event.target.value),
                  })
                  if (activeLayer.removeColorBackground) {
                    scheduleColorRemoval(activeLayer.id)
                  }
                }}
              />
              <Input
                type="number"
                min={0}
                max={160}
                value={activeLayer.colorThreshold ?? 40}
                onChange={(event) => {
                  updateLayer(activeLayer.id, {
                    colorThreshold: Number(event.target.value),
                  })
                  if (activeLayer.removeColorBackground) {
                    scheduleColorRemoval(activeLayer.id)
                  }
                }}
                className="w-20"
              />
            </div>
            <p className="text-muted-foreground text-xs">
              透明にする色との近さ（色の差）の許容範囲です。0は完全一致のみ、上げるほど近い色も透明になります。
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                void applyColorRemovalToLayer(activeLayer.id)
              }
              disabled={
                colorRemovalAllBusy ||
                colorRemovalBusy[activeLayer.id] === true
              }
            >
              {colorRemovalBusy[activeLayer.id] ? "処理中…" : "適用/更新"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                void applyColorRemovalToAllImageLayers({
                  colorKey: activeLayer.colorKey ?? "#ffffff",
                  threshold: Math.max(
                    0,
                    Math.min(160, activeLayer.colorThreshold ?? 40),
                  ),
                })
              }
              disabled={colorRemovalAllBusy}
            >
              {colorRemovalAllBusy
                ? "全体に適用中…"
                : "全画像レイヤーに適用"}
            </Button>
          </div>

          <p className="text-muted-foreground text-xs">
            アップロード画像はOK。外部画像はCORSの都合で失敗する場合があります。
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">
          画像レイヤーを選択すると色透過を使えます
        </p>
      )}
    </>
  )
}
