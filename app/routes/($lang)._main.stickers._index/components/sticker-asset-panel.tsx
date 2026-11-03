import { Upload } from "lucide-react"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  stickerAssets,
  type StickerAssetCategory,
} from "~/routes/($lang)._main.stickers._index/components/sticker-assets"
import type { StickerEditor } from "~/routes/($lang)._main.stickers._index/hooks/use-sticker-editor"

type Props = {
  editor: StickerEditor
  categoryClassName: string
  gridClassName: string
}

/**
 * 素材の一覧（画像の追加・カテゴリ・素材）
 */
export function StickerAssetPanel(props: Props) {
  const { activeCategory, addImageLayer, onUploadImage, setActiveCategory } =
    props.editor

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">素材一覧</h3>
        <label className="flex items-center gap-2 text-muted-foreground text-xs">
          <Upload className="h-4 w-4" />
          画像追加
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                onUploadImage(file)
                event.currentTarget.value = ""
              }
            }}
          />
        </label>
      </div>

      <div className={props.categoryClassName}>
        <Label className="text-muted-foreground text-xs">カテゴリ</Label>
        <Select
          value={activeCategory}
          onValueChange={(value) =>
            setActiveCategory(value as StickerAssetCategory)
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="カテゴリを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="japanese">Japanese</SelectItem>
            <SelectItem value="hudemoji">Hudemoji</SelectItem>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="effect">Effect</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={props.gridClassName}>
        {stickerAssets[activeCategory].map((url) => (
          <button
            key={url}
            type="button"
            className="rounded-lg border bg-zinc-800/60 p-2 transition-colors hover:border-primary"
            onClick={() => void addImageLayer(url)}
          >
            <img src={url} alt="" className="w-full" />
          </button>
        ))}
      </div>
    </>
  )
}
