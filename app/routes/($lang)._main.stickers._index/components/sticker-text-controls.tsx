import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import {
  StickerFieldGroup,
  type StickerPanelLayout,
} from "~/routes/($lang)._main.stickers._index/components/sticker-field-group"
import type { StickerEditor } from "~/routes/($lang)._main.stickers._index/hooks/use-sticker-editor"
import {
  clampFontWeight,
  computeTextLayerBox,
  fontFamilies,
  getFontWeightsForFamily,
  normalizeFontWeightForFamily,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-text-layout"

type Props = {
  editor: StickerEditor
  layout: StickerPanelLayout
}

/**
 * 文字の追加と、選択中の文字レイヤーの設定
 */
export function StickerTextControls(props: Props) {
  const {
    activeLayer,
    addTextLayer,
    newTextFontFamily,
    newTextFontWeight,
    newTextVertical,
    setNewTextFontFamily,
    setNewTextFontWeight,
    setNewTextVertical,
    setTextInput,
    textInput,
    updateLayer,
  } = props.editor

  const isTabs = props.layout === "tabs"

  const newTextSettings = (
    <div className={isTabs ? "grid gap-3 sm:grid-cols-2" : "grid gap-3"}>
      <div className="space-y-1">
        <Label className="text-xs">追加時フォント</Label>
        <select
          className="w-full rounded-md border bg-background px-2 py-2 text-sm"
          value={newTextFontFamily}
          onChange={(event) =>
            (() => {
              const nextFamily = event.target.value
              setNewTextFontFamily(nextFamily)
              setNewTextFontWeight((prev) =>
                normalizeFontWeightForFamily({
                  fontFamily: nextFamily,
                  fontWeight: prev,
                }),
              )
            })()
          }
        >
          {fontFamilies.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">
          追加時太さ（{newTextFontWeight}）
        </Label>
        <input
          type="range"
          min={100}
          max={900}
          step={100}
          value={newTextFontWeight}
          disabled={
            getFontWeightsForFamily(newTextFontFamily).length <= 1
          }
          onChange={(event) => {
            const next = clampFontWeight(
              Number(event.currentTarget.value),
            )
            setNewTextFontWeight(
              normalizeFontWeightForFamily({
                fontFamily: newTextFontFamily,
                fontWeight: next,
              }),
            )
          }}
          className="w-full"
        />
        {getFontWeightsForFamily(newTextFontFamily).length <= 1 && (
          <p className="text-muted-foreground text-xs">
            このフォントは太さ変更に対応していません
          </p>
        )}
      </div>
      <div
        className={
          isTabs ? "flex items-center gap-2 pt-6" : "flex items-center gap-2"
        }
      >
        <Switch
          checked={newTextVertical}
          onCheckedChange={setNewTextVertical}
        />
        <Label className="text-xs">追加時は縦書き</Label>
      </div>
    </div>
  )

  const textArea = (
    <Textarea
      value={textInput}
      onChange={(event) => setTextInput(event.target.value)}
      placeholder="テキストを入力"
      rows={3}
    />
  )

  return (
    <>
      {isTabs ? (
        <>
          {newTextSettings}
          <div className="flex flex-col gap-2 sm:flex-row">
            {textArea}
            <Button onClick={addTextLayer} className="shrink-0">
              追加
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          {newTextSettings}
          {textArea}
          <Button onClick={addTextLayer}>追加</Button>
        </div>
      )}

      {activeLayer?.type === "text" ? (
        <div className="space-y-3">
          <StickerFieldGroup layout={props.layout}>
            <div className="space-y-1">
              <Label className="text-xs">文字サイズ</Label>
              <Input
                type="number"
                value={activeLayer.fontSize}
                onChange={(event) =>
                  (() => {
                    const nextFontSize = Number(event.target.value)
                    if (activeLayer.vertical) {
                      const box = computeTextLayerBox({
                        text: activeLayer.text,
                        fontSize: nextFontSize,
                        vertical: true,
                      })
                      updateLayer(activeLayer.id, {
                        fontSize: nextFontSize,
                        width: box.width,
                        height: box.height,
                      })
                      return
                    }
                    updateLayer(activeLayer.id, {
                      fontSize: nextFontSize,
                    })
                  })()
                }
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">フォント</Label>
              <select
                className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                value={activeLayer.fontFamily}
                onChange={(event) =>
                  (() => {
                    const nextFamily = event.target.value
                    updateLayer(activeLayer.id, {
                      fontFamily: nextFamily,
                      fontWeight: normalizeFontWeightForFamily({
                        fontFamily: nextFamily,
                        fontWeight: activeLayer.fontWeight,
                      }),
                    })
                  })()
                }
              >
                {fontFamilies.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
          </StickerFieldGroup>

          <div className="space-y-1">
            <Label className="text-xs">
              太さ（{activeLayer.fontWeight}）
            </Label>
            <input
              type="range"
              min={100}
              max={900}
              step={100}
              value={activeLayer.fontWeight}
              disabled={
                getFontWeightsForFamily(activeLayer.fontFamily).length <=
                1
              }
              onChange={(event) => {
                const next = clampFontWeight(
                  Number(event.currentTarget.value),
                )
                updateLayer(activeLayer.id, {
                  fontWeight: normalizeFontWeightForFamily({
                    fontFamily: activeLayer.fontFamily,
                    fontWeight: next,
                  }),
                })
              }}
              className="w-full"
            />
            {getFontWeightsForFamily(activeLayer.fontFamily).length <=
              1 && (
              <p className="text-muted-foreground text-xs">
                このフォントは太さ変更に対応していません
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">文字色</Label>
              <Input
                type="color"
                value={activeLayer.color}
                onChange={(event) =>
                  updateLayer(activeLayer.id, {
                    color: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">縁取り色</Label>
              <Input
                type="color"
                value={activeLayer.strokeColor}
                onChange={(event) =>
                  updateLayer(activeLayer.id, {
                    strokeColor: event.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">縁取り幅</Label>
              <Input
                type="number"
                value={activeLayer.strokeWidth}
                onChange={(event) =>
                  updateLayer(activeLayer.id, {
                    strokeWidth: Number(event.target.value),
                  })
                }
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={activeLayer.vertical}
                onCheckedChange={(value) =>
                  (() => {
                    const box = computeTextLayerBox({
                      text: activeLayer.text,
                      fontSize: activeLayer.fontSize,
                      vertical: value,
                    })
                    updateLayer(activeLayer.id, {
                      vertical: value,
                      width: box.width,
                      height: box.height,
                    })
                  })()
                }
              />
              <Label className="text-xs">縦書き</Label>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">
          テキストレイヤーを選択すると編集できます
        </p>
      )}
    </>
  )
}
