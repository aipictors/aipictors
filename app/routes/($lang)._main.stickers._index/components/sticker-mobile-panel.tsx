import { Download, Loader2, Upload } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { StickerAssetPanel } from "~/routes/($lang)._main.stickers._index/components/sticker-asset-panel"
import { StickerEffectsControls } from "~/routes/($lang)._main.stickers._index/components/sticker-effects-controls"
import { StickerImageControls } from "~/routes/($lang)._main.stickers._index/components/sticker-image-controls"
import { StickerLayerList } from "~/routes/($lang)._main.stickers._index/components/sticker-layer-list"
import { StickerTextControls } from "~/routes/($lang)._main.stickers._index/components/sticker-text-controls"
import type { StickerEditor } from "~/routes/($lang)._main.stickers._index/hooks/use-sticker-editor"

/**
 * スマホで出すタブ（素材・レイヤー・文字・出力）
 */
export function StickerMobilePanel(props: { editor: StickerEditor }) {
  const {
    backgroundColor,
    backgroundEnabled,
    exportCanvas,
    isRegisterPreparing,
    layers,
    mobilePanel,
    openRegisterDialog,
    setBackgroundColor,
    setBackgroundEnabled,
    setMobilePanel,
  } = props.editor

  return (
    <div className="rounded-xl border bg-background p-4 lg:hidden">
      <Tabs
        value={mobilePanel}
        onValueChange={(v) => setMobilePanel(v as typeof mobilePanel)}
      >
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="assets">素材</TabsTrigger>
          <TabsTrigger value="layers">レイヤー</TabsTrigger>
          <TabsTrigger value="text">文字</TabsTrigger>
          <TabsTrigger value="export">出力</TabsTrigger>
        </TabsList>
        <TabsContent value="assets" className="mt-4">
          <StickerAssetPanel
            editor={props.editor}
            categoryClassName="mt-3 space-y-1"
            gridClassName="mt-3 grid max-h-[50vh] grid-cols-3 gap-2 overflow-auto pr-1"
          />
        </TabsContent>

        <TabsContent value="layers" className="mt-4">
          <div className="space-y-3">
            <StickerLayerList editor={props.editor} showDuplicateButton={false} />

            <div className="mt-4 space-y-3 rounded-lg border bg-background p-3">
              <h4 className="font-semibold text-sm">画像</h4>
              <StickerImageControls editor={props.editor} layout="tabs" />
            </div>

            <div className="mt-4 space-y-3 rounded-lg border bg-background p-3">
              <h4 className="font-semibold text-sm">エフェクト</h4>
              <StickerEffectsControls editor={props.editor} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="text" className="mt-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">テキスト</h3>
            <StickerTextControls editor={props.editor} layout="tabs" />
          </div>
        </TabsContent>

        <TabsContent value="export" className="mt-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">出力</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Label className="text-sm">背景</Label>
              <Switch
                checked={backgroundEnabled}
                onCheckedChange={setBackgroundEnabled}
              />
              <Input
                type="color"
                value={backgroundColor}
                onChange={(event) =>
                  setBackgroundColor(event.target.value)
                }
                className="h-9 w-14 p-1"
              />
            </div>
            <div className="flex flex-wrap gap-2">
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
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
