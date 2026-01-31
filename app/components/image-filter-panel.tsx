import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Slider } from "./ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Badge } from "./ui/badge"
import { X, RotateCcw } from "lucide-react"
import type { FilterType } from "~/utils/image-filter-utils"
import {
  applyImageFilter,
  getFilterDisplayName,
} from "~/utils/image-filter-utils"

type Props = {
  isOpen: boolean
  onClose: () => void
  onApply: (filterType: FilterType, intensity: number) => void
  onReset: () => void
  originalImageData: ImageData | null
  appliedFilters: Array<{ type: FilterType; intensity: number }>
  canvasSize: { width: number; height: number }
}

/**
 * 画像フィルターパネルコンポーネント
 * 様々なフィルターを選択・プレビュー・適用できる
 */
export function ImageFilterPanel (props: Props): React.ReactNode {
  const {
    isOpen,
    onClose,
    onApply,
    onReset,
    originalImageData,
    appliedFilters,
    canvasSize,
  } = props

  const [selectedFilter, setSelectedFilter] = useState<FilterType | null>(null)
  const [intensity, setIntensity] = useState(100)
  const [hoveredFilter, setHoveredFilter] = useState<FilterType | null>(null)
  const [activeTab, setActiveTab] = useState("lens")

  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  // フィルターカテゴリー定義
  const filterCategories = {
    lens: {
      title: "レンズフィルター",
      filters: [
        "warming_85",
        "warming_lba",
        "warming_81",
        "cooling_80",
        "cooling_lbb",
      ] as FilterType[],
    },
    color: {
      title: "カラーフィルター",
      filters: [
        "red",
        "orange",
        "yellow",
        "green",
        "cyan",
        "blue",
        "violet",
        "magenta",
        "sepia",
        "deep_red",
        "deep_blue",
        "deep_emerald",
        "deep_yellow",
        "underwater",
      ] as FilterType[],
    },
    other: {
      title: "その他",
      filters: [
        "sharpen",
        "noise",
        "pixelate",
        "blur",
        "artistic",
        "sketch",
      ] as FilterType[],
    },
  }

  // プレビューを更新
  const updatePreview = (filterType: FilterType | null) => {
    if (!previewCanvasRef.current || !originalImageData) return

    const previewCanvas = previewCanvasRef.current
    const ctx = previewCanvas.getContext("2d")
    if (!ctx) return

    // 元の画像データをコピー
    const tempImageData = new ImageData(
      new Uint8ClampedArray(originalImageData.data),
      originalImageData.width,
      originalImageData.height,
    )

    ctx.putImageData(tempImageData, 0, 0)

    // フィルターを適用
    if (filterType) {
      applyImageFilter(previewCanvas, filterType, intensity)
    }
  }

  // フィルター選択時の処理
  const handleFilterSelect = (filterType: FilterType) => {
    setSelectedFilter(filterType)
    updatePreview(filterType)
  }

  // フィルターホバー時の処理
  const handleFilterHover = (filterType: FilterType | null) => {
    setHoveredFilter(filterType)
    if (filterType && !selectedFilter) {
      updatePreview(filterType)
    }
  }

  // 強度変更時の処理
  const handleIntensityChange = (value: number[]) => {
    const newIntensity = value[0]
    setIntensity(newIntensity)
    if (selectedFilter) {
      updatePreview(selectedFilter)
    }
  }

  // フィルター適用
  const handleApply = () => {
    if (selectedFilter) {
      onApply(selectedFilter, intensity)
      setSelectedFilter(null)
      updatePreview(null)
    }
  }

  // プレビューキャンバスの初期化
  useEffect(() => {
    if (previewCanvasRef.current && originalImageData) {
      const previewCanvas = previewCanvasRef.current
      previewCanvas.width = canvasSize.width
      previewCanvas.height = canvasSize.height

      const ctx = previewCanvas.getContext("2d")
      if (ctx) {
        ctx.putImageData(originalImageData, 0, 0)
      }
    }
  }, [originalImageData, canvasSize])

  // フィルター選択解除時にプレビューをリセット
  useEffect(() => {
    if (!selectedFilter && !hoveredFilter) {
      updatePreview(null)
    }
  }, [selectedFilter, hoveredFilter])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="h-4/5 max-h-screen w-4/5 max-w-4xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>高度な画像フィルター</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="h-full overflow-auto">
          <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2">
            {/* フィルター選択パネル */}
            <div className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="lens">レンズ</TabsTrigger>
                  <TabsTrigger value="color">カラー</TabsTrigger>
                </TabsList>

                {Object.entries(filterCategories).map(([key, category]) => (
                  <TabsContent key={key} value={key} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {category.filters.map((filterType) => (
                        <Button
                          key={filterType}
                          variant={
                            selectedFilter === filterType
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className="h-auto px-3 py-2 text-xs"
                          onClick={() => handleFilterSelect(filterType)}
                          onMouseEnter={() => handleFilterHover(filterType)}
                          onMouseLeave={() => handleFilterHover(null)}
                        >
                          {getFilterDisplayName(filterType)}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {/* 強度調整 */}
              {selectedFilter && (
                <div className="space-y-2">
                  <div className="font-medium text-sm">強度: {intensity}%</div>
                  <Slider
                    value={[intensity]}
                    onValueChange={handleIntensityChange}
                    max={200}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}

              {/* 適用済みフィルター一覧 */}
              {appliedFilters.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">適用済みフィルター</h4>
                  <div className="flex flex-wrap gap-1">
                    {appliedFilters.map((filter) => (
                      <Badge
                        key={`${filter.type}-${filter.intensity}`}
                        variant="secondary"
                        className="text-xs"
                      >
                        {getFilterDisplayName(filter.type)} ({filter.intensity}
                        %)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex gap-2">
                {selectedFilter && (
                  <Button onClick={handleApply} className="flex-1">
                    フィルターを適用
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={onReset}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  すべてリセット
                </Button>
              </div>
            </div>

            {/* プレビューパネル */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">プレビュー</h3>
              <div className="relative overflow-hidden rounded-lg border bg-gray-100">
                <canvas
                  ref={previewCanvasRef}
                  className="max-h-96 max-w-full object-contain"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                  }}
                />
              </div>

              {(selectedFilter || hoveredFilter) && (
                <div className="text-gray-600 text-sm">
                  プレビュー中:{" "}
                  {getFilterDisplayName(
                    selectedFilter || (hoveredFilter as FilterType),
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
