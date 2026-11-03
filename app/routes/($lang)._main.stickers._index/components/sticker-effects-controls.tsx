import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import type { StickerEditor } from "~/routes/($lang)._main.stickers._index/hooks/use-sticker-editor"
import { normalizeLayerEffects } from "~/routes/($lang)._main.stickers._index/utils/sticker-layer-effects"

export function StickerEffectsControls(props: { editor: StickerEditor }) {
  const {
    activeLayer,
    commitLayerEffects,
    commitLayerPatch,
    updateLayerEffects,
  } = props.editor

  return activeLayer ? (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            commitLayerPatch(activeLayer.id, {
              flipX: !(activeLayer.flipX ?? false),
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
              flipY: !(activeLayer.flipY ?? false),
            })
          }
        >
          上下反転
        </Button>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">
          ブラー（{normalizeLayerEffects(activeLayer.effects).blur}
          px）
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="range"
            min={0}
            max={20}
            step={1}
            value={normalizeLayerEffects(activeLayer.effects).blur}
            onChange={(event) =>
              updateLayerEffects(activeLayer.id, {
                blur: Number(event.target.value),
              })
            }
          />
          <Input
            type="number"
            min={0}
            max={20}
            step={1}
            value={normalizeLayerEffects(activeLayer.effects).blur}
            onChange={(event) =>
              updateLayerEffects(activeLayer.id, {
                blur: Number(event.target.value),
              })
            }
            className="w-20"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Switch
            checked={
              normalizeLayerEffects(activeLayer.effects).invert
            }
            onCheckedChange={(value) =>
              commitLayerEffects(activeLayer.id, {
                invert: value,
              })
            }
          />
          <Label className="text-xs">色反転</Label>
        </div>
        <span className="text-muted-foreground text-xs">
          画像/文字にフィルタ適用
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={
                normalizeLayerEffects(activeLayer.effects).sparkle
                  .enabled
              }
              onCheckedChange={(value) =>
                commitLayerEffects(activeLayer.id, {
                  sparkle: {
                    enabled: value,
                    intensity: normalizeLayerEffects(
                      activeLayer.effects,
                    ).sparkle.intensity,
                  },
                })
              }
            />
            <Label className="text-xs">キラキラ</Label>
          </div>
          <span className="text-muted-foreground text-xs">
            強さ:{" "}
            {Math.round(
              normalizeLayerEffects(activeLayer.effects).sparkle
                .intensity * 100,
            )}
          </span>
        </div>

        {normalizeLayerEffects(activeLayer.effects).sparkle
          .enabled && (
          <div className="flex items-center gap-2">
            <Input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={
                normalizeLayerEffects(activeLayer.effects).sparkle
                  .intensity
              }
              onChange={(event) =>
                updateLayerEffects(activeLayer.id, {
                  sparkle: {
                    intensity: Number(event.target.value),
                  },
                })
              }
            />
            <Input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={
                normalizeLayerEffects(activeLayer.effects).sparkle
                  .intensity
              }
              onChange={(event) =>
                updateLayerEffects(activeLayer.id, {
                  sparkle: {
                    intensity: Number(event.target.value),
                  },
                })
              }
              className="w-20"
            />
          </div>
        )}
      </div>
    </div>
  ) : (
    <p className="text-muted-foreground text-xs">
      レイヤーを選択するとエフェクトを使えます
    </p>
  )
}
