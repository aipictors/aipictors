import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { useState } from "react"
import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { Loader2, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { CREATE_CHARACTER_EXPRESSION } from "../queries"

type Character = {
  id: string
  name: string
  nanoid: string
  description?: string | null
  baseImageUrl?: string | null
  thumbnailUrl?: string | null
  isPublic: boolean
  createdAt: number
  expressions: Array<{
    id: string
    expressionName: string
    imageUrl?: string | null
    createdAt: string
  }>
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
  character: Character
  userToken?: string | null
}

const PREDEFINED_EXPRESSIONS = [
  "笑顔",
  "怒り",
  "悲しみ",
  "驚き",
  "恐怖",
  "嫌悪",
  "喜び",
  "ウィンク",
  "照れ",
  "困り顔",
  "泣き顔",
  "眠そう",
  "真面目",
  "微笑み",
  "不機嫌",
  "心配",
  "興奮",
  "リラックス",
  "集中",
]

const IMAGE_SIZE_OPTIONS = [
  { value: "SQUARE_512", label: "512x512 (小)" },
  { value: "SQUARE_768", label: "768x768 (中)" },
  { value: "SQUARE_1024", label: "1024x1024 (大)" },
  { value: "LANDSCAPE", label: "1280x720 (横長)" },
  { value: "PORTRAIT", label: "720x1280 (縦長)" },
] as const

export function AddExpressionDialog({
  isOpen,
  onClose,
  onComplete,
  character,
}: Props) {
  const [expressionName, setExpressionName] = useState("")
  const [size, setSize] = useState<
    "SQUARE_512" | "SQUARE_768" | "SQUARE_1024" | "LANDSCAPE" | "PORTRAIT"
  >("SQUARE_512")

  const [createExpression, { loading }] = useMutation(
    CREATE_CHARACTER_EXPRESSION,
    {
      onCompleted: () => {
        toast.success("表情の生成を開始しました")
        handleClose()
        onComplete?.()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    },
  )

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setExpressionName("")
    setSize("SQUARE_512")
  }

  const handleSubmit = () => {
    if (!expressionName.trim()) {
      toast.error("表情名を入力してください")
      return
    }

    createExpression({
      variables: {
        input: {
          characterId: character.nanoid,
          expressionName: expressionName.trim(),
          size: size,
        },
      },
    } as never)
  }

  // 既存の表情名を取得して重複チェック
  const existingExpressions = character.expressions.map(
    (exp) => exp.expressionName,
  )
  const availableExpressions = PREDEFINED_EXPRESSIONS.filter(
    (expr) => !existingExpressions.includes(expr),
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>「{character.name}」に表情を追加</DialogTitle>
          <DialogDescription>
            新しい表情を生成してキャラクターに追加します
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 表情名入力 */}
          <div className="space-y-2">
            <Label htmlFor="expressionName">表情名</Label>
            <Input
              id="expressionName"
              value={expressionName}
              onChange={(e) => setExpressionName(e.target.value)}
              placeholder="例: 笑顔、怒り、悲しみ"
            />
          </div>

          {/* プリセット表情選択 */}
          <div className="space-y-2">
            <Label>プリセット表情から選択</Label>
            <div className="grid grid-cols-3 gap-2">
              {availableExpressions.slice(0, 12).map((expression) => (
                <Button
                  key={expression}
                  type="button"
                  variant={
                    expressionName === expression ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setExpressionName(expression)}
                  className="text-xs"
                >
                  {expression}
                </Button>
              ))}
            </div>
          </div>

          {/* 画像サイズ選択 */}
          <div className="space-y-2">
            <Label htmlFor="imageSize">画像サイズ</Label>
            <Select
              value={size}
              onValueChange={(value) => setSize(value as typeof size)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMAGE_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* キャンペーン情報 */}
          <Alert className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <Sparkles className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>🎉 キャンペーン中！</strong>{" "}
              サブスクユーザー3枚消費、無料ユーザー4枚消費（通常5枚消費）で表情生成ができます！
            </AlertDescription>
          </Alert>

          {/* コスト表示 */}
          <div className="rounded-md bg-muted p-3">
            <div className="flex items-center justify-between text-sm">
              <span>生成コスト:</span>
              <span className="font-medium text-green-600">
                サブスク: 3枚消費 / 無料: 4枚消費{" "}
                <span className="text-muted-foreground line-through">
                  通常5枚
                </span>
              </span>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              キャンセル
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !expressionName.trim()}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              表情を生成
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
