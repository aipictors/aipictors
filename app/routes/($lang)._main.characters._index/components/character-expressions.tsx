import {
  Download,
  Image,
  Plus,
  ArrowLeft,
  CheckCircle,
  FolderDown,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { useTranslation } from "~/hooks/use-translation"
import { useQuery, useMutation } from "@apollo/client/index"
import {
  CHARACTER_WITH_EXPRESSIONS,
  CREATE_CHARACTER_EXPRESSION,
  VIEWER_CURRENT_PASS,
} from "../queries"
import { useIpAddress } from "~/hooks/use-ip-address"
import JSZip from "jszip"

type Props = {
  characterId: string
  characterName: string
  character: Character
  onBack: () => void
  onCharacterUpdate?: (character: Character) => void
}

type CharacterExpression = {
  id: string
  expressionName: string
  imageUrl?: string | null
  createdAt: string
}

type Character = {
  id: string
  nanoid: string
  name: string
  description?: string | null
  baseImageUrl?: string | null
  thumbnailUrl?: string | null
  isPublic: boolean
  createdAt: string
  expressions: CharacterExpression[]
}

type ImageSize =
  | "SQUARE_512"
  | "SQUARE_768"
  | "SQUARE_1024"
  | "LANDSCAPE"
  | "PORTRAIT"

const imageSizeOptions: { value: ImageSize; label: string }[] = [
  { value: "SQUARE_512", label: "512x512 (小)" },
  { value: "SQUARE_768", label: "768x768 (中)" },
  { value: "SQUARE_1024", label: "1024x1024 (大)" },
  { value: "LANDSCAPE", label: "1280x720 (横長)" },
  { value: "PORTRAIT", label: "720x1280 (縦長)" },
]

export function CharacterExpressions (props: Props) {
  const { character, onBack, onCharacterUpdate } = props
  const t = useTranslation()
  const [isAddExpressionOpen, setIsAddExpressionOpen] = useState(false)
  const [newExpressionName, setNewExpressionName] = useState("")
  const [selectedSize, setSelectedSize] = useState<ImageSize>("SQUARE_512")
  const [isPolling, setIsPolling] = useState(false)
  const [currentExpressions, setCurrentExpressions] = useState(
    character.expressions || [],
  )
  const [newExpressionsFound, setNewExpressionsFound] = useState(0)
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)
  const [isBulkDownloading, setIsBulkDownloading] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // IPアドレス取得
  const { ipInfo } = useIpAddress()

  // 残り生成枚数取得
  const { data: passData } = useQuery(VIEWER_CURRENT_PASS)

  // キャラクター詳細を取得するクエリ（ポーリング用）
  const { refetch: refetchCharacter } = useQuery(CHARACTER_WITH_EXPRESSIONS, {
    variables: { characterId: character.id },
    skip: true, // 初期は実行しない
  })

  // 表情作成ミューテーション
  const [createExpression, { loading: creating }] = useMutation(
    CREATE_CHARACTER_EXPRESSION,
    {
      onCompleted: () => {
        setIsAddExpressionOpen(false)
        setNewExpressionName("")
        // 生成成功後にポーリング開始
        startPolling()
      },
      onError: (error) => {
        console.error("Expression creation failed:", error)
        alert("表情の作成に失敗しました")
      },
    },
  )

  const expressions = currentExpressions

  // ポーリング開始
  const startPolling = () => {
    if (pollingIntervalRef.current) return // 既にポーリング中の場合は何もしない

    setIsPolling(true)
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const result = await refetchCharacter()
        const updatedCharacter = result.data?.character as Character | undefined

        if (updatedCharacter?.expressions) {
          const newExpressionsCount = updatedCharacter.expressions.length
          const currentCount = currentExpressions.length

          // 新しい表情が追加された場合
          if (newExpressionsCount > currentCount) {
            const newCount = newExpressionsCount - currentCount
            setCurrentExpressions(updatedCharacter.expressions)
            setNewExpressionsFound(newCount)
            setShowSuccessBanner(true)
            onCharacterUpdate?.(updatedCharacter)
            stopPolling()

            // 5秒後にバナーを非表示
            setTimeout(() => {
              setShowSuccessBanner(false)
              setNewExpressionsFound(0)
            }, 5000)
          }
        }
      } catch (error) {
        console.error("Polling error:", error)
      }
    }, 2000) // 2秒間隔でポーリング
  }

  // ポーリング停止
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setIsPolling(false)
  }

  // コンポーネントアンマウント時にポーリング停止
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  const handleCreateExpression = async () => {
    if (!newExpressionName.trim()) {
      alert("表情名を入力してください")
      return
    }

    try {
      await (createExpression as any)({
        variables: {
          input: {
            characterId: character.id,
            expressionName: newExpressionName.trim(),
            size: selectedSize,
            ipaddress: ipInfo?.ip || null,
          },
        },
      })
    } catch (error) {
      console.error("Failed to create expression:", error)
    }
  }

  const handleDownloadExpression = async (expression: CharacterExpression) => {
    if (!expression.imageUrl) {
      alert("画像URLが見つかりません")
      return
    }

    try {
      const response = await fetch(expression.imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${character.name}_${expression.expressionName}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      alert(`${expression.expressionName} をダウンロードしました`)
    } catch (error) {
      console.error("Download failed:", error)
      alert("画像のダウンロードに失敗しました")
    }
  }

  const handleBulkDownload = async () => {
    const expressionsWithImages = expressions.filter((expr) => expr.imageUrl)

    if (expressionsWithImages.length === 0) {
      alert("ダウンロードできる画像がありません")
      return
    }

    setIsBulkDownloading(true)

    try {
      const zip = new JSZip()

      // 各表情画像をZIPに追加
      for (const expression of expressionsWithImages) {
        if (expression.imageUrl) {
          try {
            const response = await fetch(expression.imageUrl)
            const blob = await response.blob()
            zip.file(`${expression.expressionName}.png`, blob)
          } catch (error) {
            console.error(
              `Failed to download ${expression.expressionName}:`,
              error,
            )
          }
        }
      }

      // ZIPファイルを生成してダウンロード
      const zipBlob = await zip.generateAsync({ type: "blob" })
      const url = window.URL.createObjectURL(zipBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${character.name}_expressions.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      alert(`${character.name}の表情画像をまとめてダウンロードしました`)
    } catch (error) {
      console.error("Bulk download failed:", error)
      alert("一括ダウンロードに失敗しました")
    } finally {
      setIsBulkDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>{" "}
          <div>
            <h2 className="font-bold text-2xl">{character.name} の表情一覧</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                {expressions.length} 個の表情
              </span>
              {isPolling && (
                <span className="text-blue-600 text-sm">
                  🔄 新しい表情を確認中...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 一括ダウンロードボタン */}
        {expressions.filter((expr) => expr.imageUrl).length > 0 && (
          <Button
            onClick={handleBulkDownload}
            variant="outline"
            disabled={isBulkDownloading}
          >
            <FolderDown className="mr-2 h-4 w-4" />
            {isBulkDownloading ? "ダウンロード中..." : "一括ダウンロード"}
          </Button>
        )}
      </div>

      {/* キャラクター基本情報 */}
      {character.thumbnailUrl && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <img
                src={character.thumbnailUrl}
                alt={character.name}
                className="h-16 w-16 rounded-md object-cover"
              />
              <div>
                <h3 className="font-semibold">{character.name}</h3>
                {character.description && (
                  <p className="text-muted-foreground text-sm">
                    {character.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 成功バナー */}
      {showSuccessBanner && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            🎉 新しい表情が{newExpressionsFound}個生成されました！
          </AlertDescription>
        </Alert>
      )}

      {/* ポーリング状態表示 */}
      {isPolling && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            🔄 新しい表情を確認中...
          </AlertDescription>
        </Alert>
      )}

      {/* 表情一覧グリッド */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {/* 表情追加ボタン */}
        <Dialog
          open={isAddExpressionOpen}
          onOpenChange={setIsAddExpressionOpen}
        >
          <DialogTrigger asChild>
            <Card className="cursor-pointer border-2 border-dashed transition-colors hover:border-primary/50">
              <CardContent className="p-4">
                <div className="flex aspect-square flex-col items-center justify-center rounded-md bg-muted/30">
                  <Plus className="mb-2 h-8 w-8 text-muted-foreground" />
                  <span className="text-center text-muted-foreground text-sm">
                    新しい表情を作成
                  </span>
                  <span className="mt-1 text-center text-muted-foreground text-xs">
                    (サブスク:3枚/無料:4枚消費)
                  </span>
                  {passData?.viewer?.currentPass &&
                    typeof (
                      passData.viewer.currentPass as {
                        remainingImageGenerations?: number
                      }
                    ).remainingImageGenerations === "number" && (
                      <span className="mt-1 text-center font-medium text-primary text-xs">
                        残り
                        {
                          (
                            passData.viewer.currentPass as {
                              remainingImageGenerations: number
                            }
                          ).remainingImageGenerations
                        }
                        枚
                      </span>
                    )}
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しい表情を作成</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="expressionName">表情名</Label>
                <Input
                  id="expressionName"
                  value={newExpressionName}
                  onChange={(e) => setNewExpressionName(e.target.value)}
                  placeholder="例: 笑顔、怒り、悲しみ"
                />
              </div>
              <div>
                <Label htmlFor="imageSize">画像サイズ</Label>
                <select
                  id="imageSize"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value as ImageSize)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {imageSizeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-md bg-blue-50 p-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
                    <span className="font-bold text-blue-600 text-xs">i</span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900 text-sm">
                      {t("コスト情報", "Cost Information")}
                    </p>
                    <p className="text-blue-700 text-xs">
                      {t(
                        "サブスクユーザー3枚消費、無料ユーザー4枚消費（キャンペーン価格、通常5枚消費）",
                        "Subscription users: 3 credits, Free users: 4 credits (Campaign price, normally 5 credits)",
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddExpressionOpen(false)}
                >
                  キャンセル
                </Button>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleCreateExpression}
                    disabled={creating || !newExpressionName.trim()}
                  >
                    {creating ? "作成中..." : "表情を作成"}
                  </Button>
                  {passData?.viewer?.currentPass &&
                    typeof (
                      passData.viewer.currentPass as {
                        remainingImageGenerations?: number
                      }
                    ).remainingImageGenerations === "number" && (
                      <div className="text-center text-muted-foreground text-xs">
                        残り生成可能枚数:{" "}
                        {
                          (
                            passData.viewer.currentPass as {
                              remainingImageGenerations: number
                            }
                          ).remainingImageGenerations
                        }
                        枚
                      </div>
                    )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 既存の表情 */}
        {expressions.map((expression) => (
          <Card key={expression.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="space-y-2">
                {expression.imageUrl ? (
                  <img
                    src={expression.imageUrl}
                    alt={expression.expressionName}
                    className="aspect-square w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center rounded-md bg-muted">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h4 className="truncate font-medium text-sm">
                    {expression.expressionName}
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    {new Date(expression.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {expression.imageUrl && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDownloadExpression(expression)}
                    >
                      <Download className="mr-1 h-3 w-3" />
                      DL
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        expression.imageUrl &&
                        window.open(expression.imageUrl, "_blank")
                      }
                    >
                      <Image className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {expressions.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Image className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground text-sm">
                まだ表情が作成されていません
              </p>
              <p className="text-muted-foreground text-xs">
                「新しい表情を作成」ボタンから始めましょう
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
