import { useState, useRef, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Slider } from "~/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { XIcon, RotateCcwIcon } from "lucide-react"
import {
  getFilterDisplayName,
  applyImageFilter,
} from "~/utils/image-filter-utils"

type FilterType =
  // レンズフィルター
  | "warming_85"
  | "warming_lba"
  | "warming_81"
  | "cooling_80"
  | "cooling_lbb"
  | "cooling_82"
  // カラーフィルター
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "cyan"
  | "blue"
  | "violet"
  | "magenta"
  | "sepia"
  | "deep_red"
  | "deep_blue"
  | "deep_emerald"
  | "deep_yellow"
  // 環境フィルター
  | "underwater"
  // レンズ補正
  | "wide_angle_correction"
  | "camera_raw"
  | "lens_correction"
  | "distortion"
  | "vanishing_point"
  | "three_d"
  // 画質調整
  | "sharpen"
  | "noise"
  | "pixelate"
  | "video"
  // ぼかし
  | "blur"
  | "blur_gallery"
  // 表現手法
  | "artistic"
  | "sketch"
  | "transform"

type Props = {
  isOpen: boolean
  onClose: () => void
  onApplyFilter: (filterType: FilterType, intensity: number) => void
  onResetFilters: () => void
  currentFilters: { type: FilterType; intensity: number }[]
  originalImageData?: ImageData | null
  canvasWidth?: number
  canvasHeight?: number
}

/**
 * 画像フィルターパネルコンポーネント
 */
export function ImageFilterPanel (props: Props): React.ReactNode {
  const [selectedFilter, setSelectedFilter] = useState<FilterType | null>(null)
  const [filterIntensity, setFilterIntensity] = useState<number>(100)
  const [previewFilter, setPreviewFilter] = useState<FilterType | null>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  // プレビューキャンバスを更新
  useEffect(() => {
    if (!props.originalImageData || !previewCanvasRef.current) return

    const canvas = previewCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 200
    canvas.height = 200

    // 元画像を描画
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    tempCanvas.width = props.originalImageData.width
    tempCanvas.height = props.originalImageData.height
    tempCtx.putImageData(props.originalImageData, 0, 0)

    // アスペクト比を保持してプレビューサイズに調整
    const aspectRatio = tempCanvas.width / tempCanvas.height
    let drawWidth = 200
    let drawHeight = 200
    let offsetX = 0
    let offsetY = 0

    if (aspectRatio > 1) {
      drawHeight = 200 / aspectRatio
      offsetY = (200 - drawHeight) / 2
    } else {
      drawWidth = 200 * aspectRatio
      offsetX = (200 - drawWidth) / 2
    }

    ctx.clearRect(0, 0, 200, 200)
    ctx.drawImage(tempCanvas, offsetX, offsetY, drawWidth, drawHeight)

    // プレビューフィルターまたは選択中フィルターを適用
    const filterToApply = previewFilter || selectedFilter
    if (filterToApply) {
      applyImageFilter(canvas, filterToApply, filterIntensity)
    }
  }, [props.originalImageData, previewFilter, selectedFilter, filterIntensity])

  // フィルターカテゴリーの定義
  const filterCategories = {
    lens: {
      title: "レンズフィルター",
      filters: [
        {
          type: "warming_85" as const,
          name: "Warming Filter (85)",
          color: "#FFB366",
        },
        {
          type: "warming_lba" as const,
          name: "Warming Filter (LBA)",
          color: "#FFCC99",
        },
        {
          type: "warming_81" as const,
          name: "Warming Filter (81)",
          color: "#FFD4AA",
        },
        {
          type: "cooling_80" as const,
          name: "Cooling Filter (80)",
          color: "#99CCFF",
        },
        {
          type: "cooling_lbb" as const,
          name: "Cooling Filter (LBB)",
          color: "#ADD8E6",
        },
        {
          type: "cooling_82" as const,
          name: "Cooling Filter (82)",
          color: "#87CEEB",
        },
      ],
    },
    color: {
      title: "カラーフィルター",
      filters: [
        { type: "red" as const, name: "Red", color: "#FF4444" },
        { type: "orange" as const, name: "Orange", color: "#FF8844" },
        { type: "yellow" as const, name: "Yellow", color: "#FFDD44" },
        { type: "green" as const, name: "Green", color: "#44DD44" },
        { type: "cyan" as const, name: "Cyan", color: "#44DDDD" },
        { type: "blue" as const, name: "Blue", color: "#4444DD" },
        { type: "violet" as const, name: "Violet", color: "#8844DD" },
        { type: "magenta" as const, name: "Magenta", color: "#DD44DD" },
        { type: "sepia" as const, name: "Sepia", color: "#8B4513" },
        { type: "deep_red" as const, name: "Deep Red", color: "#8B0000" },
        { type: "deep_blue" as const, name: "Deep Blue", color: "#00008B" },
        {
          type: "deep_emerald" as const,
          name: "Deep Emerald",
          color: "#006400",
        },
        { type: "deep_yellow" as const, name: "Deep Yellow", color: "#B8860B" },
        { type: "underwater" as const, name: "Underwater", color: "#008080" },
      ],
    },
    other: {
      title: "その他",
      filters: [
        {
          type: "wide_angle_correction" as const,
          name: "広角補正",
          color: "#666666",
        },
        {
          type: "camera_raw" as const,
          name: "Camera Raw フィルター",
          color: "#888888",
        },
        {
          type: "lens_correction" as const,
          name: "レンズ補正",
          color: "#AAAAAA",
        },
        { type: "distortion" as const, name: "ゆがみ", color: "#999999" },
        {
          type: "vanishing_point" as const,
          name: "Vanishing Point",
          color: "#777777",
        },
        { type: "three_d" as const, name: "3D", color: "#555555" },
        { type: "sharpen" as const, name: "シャープ", color: "#DDDDDD" },
        { type: "noise" as const, name: "ノイズ", color: "#CCCCCC" },
        { type: "pixelate" as const, name: "ピクセレート", color: "#BBBBBB" },
        { type: "video" as const, name: "ビデオ", color: "#AAAAAA" },
        { type: "blur" as const, name: "ぼかし", color: "#E0E0E0" },
        {
          type: "blur_gallery" as const,
          name: "ぼかしギャラリー",
          color: "#D0D0D0",
        },
        { type: "artistic" as const, name: "表現手法", color: "#FF6B6B" },
        { type: "sketch" as const, name: "描画", color: "#4ECDC4" },
        { type: "transform" as const, name: "変形", color: "#45B7D1" },
      ],
    },
  }

  const handleFilterSelect = (filterType: FilterType) => {
    setSelectedFilter(filterType)
    setFilterIntensity(100)
    setPreviewFilter(null)
  }

  const handleFilterPreview = (filterType: FilterType) => {
    setPreviewFilter(filterType)
  }

  const handleFilterPreviewEnd = () => {
    setPreviewFilter(null)
  }

  const handleApplyFilter = () => {
    if (selectedFilter) {
      props.onApplyFilter(selectedFilter, filterIntensity)
      setSelectedFilter(null)
    }
  }

  if (!props.isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="max-h-[90vh] w-full max-w-4xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>画像フィルター</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={props.onResetFilters}
              className="gap-2"
            >
              <RotateCcwIcon className="h-4 w-4" />
              リセット
            </Button>
            <Button variant="ghost" size="sm" onClick={props.onClose}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex h-[600px]">
            {/* フィルター選択エリア */}
            <div className="w-1/2 overflow-y-auto border-r">
              <Tabs defaultValue="lens" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="lens">レンズ</TabsTrigger>
                  <TabsTrigger value="color">カラー</TabsTrigger>
                  <TabsTrigger value="other">その他</TabsTrigger>
                </TabsList>

                <TabsContent value="lens" className="space-y-6 p-4">
                  <div>
                    <h3 className="mb-3 font-semibold">
                      {filterCategories.lens.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {filterCategories.lens.filters.map((filter) => (
                        <Button
                          key={filter.type}
                          variant={
                            selectedFilter === filter.type
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handleFilterSelect(filter.type)}
                          onMouseEnter={() => handleFilterPreview(filter.type)}
                          onMouseLeave={handleFilterPreviewEnd}
                          className="justify-start gap-2"
                        >
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: filter.color }}
                          />
                          {filter.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="color" className="space-y-6 p-4">
                  <div>
                    <h3 className="mb-3 font-semibold">
                      {filterCategories.color.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {filterCategories.color.filters.map((filter) => (
                        <Button
                          key={filter.type}
                          variant={
                            selectedFilter === filter.type
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handleFilterSelect(filter.type)}
                          onMouseEnter={() => handleFilterPreview(filter.type)}
                          onMouseLeave={handleFilterPreviewEnd}
                          className="justify-start gap-2"
                        >
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: filter.color }}
                          />
                          {filter.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="other" className="space-y-6 p-4">
                  <div>
                    <h3 className="mb-3 font-semibold">
                      {filterCategories.other.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {filterCategories.other.filters.map((filter) => (
                        <Button
                          key={filter.type}
                          variant={
                            selectedFilter === filter.type
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handleFilterSelect(filter.type)}
                          onMouseEnter={() => handleFilterPreview(filter.type)}
                          onMouseLeave={handleFilterPreviewEnd}
                          className="justify-start gap-2"
                        >
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: filter.color }}
                          />
                          {filter.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* 設定・適用エリア */}
            <div className="w-1/2 space-y-4 p-4">
              {/* 適用済みフィルター */}
              <div>
                <h3 className="mb-3 font-semibold">適用済みフィルター</h3>
                <div className="max-h-32 space-y-2 overflow-y-auto">
                  {props.currentFilters.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      フィルターが適用されていません
                    </p>
                  ) : (
                    props.currentFilters.map((filter, index) => (
                      <div
                        key={`${filter.type}-${index}`}
                        className="flex items-center justify-between rounded-lg bg-muted p-2"
                      >
                        <span className="text-sm">
                          {getFilterDisplayName(filter.type)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{filter.intensity}%</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              console.log("Remove filter:", index)
                            }}
                          >
                            <XIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* フィルター設定 */}
              {selectedFilter && (
                <div className="space-y-4">
                  <h3 className="font-semibold">フィルター設定</h3>
                  <div>
                    <p className="mb-2 text-muted-foreground text-sm">
                      選択中: {getFilterDisplayName(selectedFilter)}
                    </p>
                  </div>

                  <div>
                    <div className="mb-2 font-medium text-sm">
                      強度: {filterIntensity}%
                    </div>
                    <Slider
                      value={[filterIntensity]}
                      onValueChange={(value) => setFilterIntensity(value[0])}
                      min={0}
                      max={200}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <Button onClick={handleApplyFilter} className="w-full">
                    フィルターを適用
                  </Button>
                </div>
              )}

              {/* プレビューエリア */}
              <div className="flex-1">
                <h3 className="mb-3 font-semibold">プレビュー</h3>
                <div className="flex h-48 items-center justify-center rounded-lg border bg-muted/30">
                  {props.originalImageData ? (
                    <canvas
                      ref={previewCanvasRef}
                      width={200}
                      height={200}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      画像データがありません
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
