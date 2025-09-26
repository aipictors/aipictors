import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

import { Badge } from "~/components/ui/badge"
import { useTranslation } from "~/hooks/use-translation"
import { CropImageField } from "~/components/crop-image-field"
import { useMutation } from "@apollo/client/index"
import { useState, useCallback } from "react"
import { CREATE_EXPRESSIONS_FROM_IMAGE } from "../queries"
import { toast } from "sonner"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { X, Upload, Sparkles } from "lucide-react"

type Props = {
  userToken?: string | null
  userId?: string | null
}

type ExpressionSize = "SQUARE_512" | "SQUARE_768" | "SQUARE_1024"

const EXPRESSION_OPTIONS = [
  "笑顔",
  "怒り",
  "悲しみ",
  "驚き",
  "困った",
  "照れ",
  "ウィンク",
  "泣き顔",
  "きょとん",
  "ムッとした",
  "はにかみ",
  "真剣",
  "眠そう",
  "興奮",
  "不安",
  "喜び",
  "恥ずかしい",
  "得意げ",
  "焦り",
  "安らぎ",
]

export function CharacterGenerationForm(props: Props) {
  const t = useTranslation()
  console.log("CharacterGenerationForm props:", props)
  console.log("CharacterGenerationForm userToken:", props.userToken)
  console.log("CharacterGenerationForm userId:", props.userId)
  const [baseImage, setBaseImage] = useState<string | null>(null)
  const [selectedExpressions, setSelectedExpressions] = useState<string[]>([])
  const [customExpression, setCustomExpression] = useState("")
  const [size, setSize] = useState<ExpressionSize>("SQUARE_512")
  const [backgroundColor, setBackgroundColor] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const [createExpressions] = useMutation(CREATE_EXPRESSIONS_FROM_IMAGE)

  const handleImageCrop = useCallback((croppedImage: string) => {
    setBaseImage(croppedImage)
  }, [])

  const handleDeleteImage = useCallback(() => {
    setBaseImage(null)
  }, [])

  const handleExpressionToggle = useCallback((expression: string) => {
    setSelectedExpressions((prev) =>
      prev.includes(expression)
        ? prev.filter((e) => e !== expression)
        : [...prev, expression],
    )
  }, [])

  const handleAddCustomExpression = useCallback(() => {
    if (
      customExpression.trim() &&
      !selectedExpressions.includes(customExpression.trim())
    ) {
      setSelectedExpressions((prev) => [...prev, customExpression.trim()])
      setCustomExpression("")
    }
  }, [customExpression, selectedExpressions])

  const handleRemoveExpression = useCallback((expression: string) => {
    setSelectedExpressions((prev) => prev.filter((e) => e !== expression))
  }, [])

  const calculateCost = useCallback(() => {
    const expressionCost = 1
    return selectedExpressions.length * expressionCost
  }, [selectedExpressions])

  const handleGenerate = useCallback(async () => {
    console.log("Generate button clicked - userToken:", props.userToken)

    if (!baseImage) {
      toast.error(
        t("ベース画像をアップロードしてください", "Please upload a base image"),
      )
      return
    }

    if (selectedExpressions.length === 0) {
      toast.error(
        t(
          "少なくとも1つの表情を選択してください",
          "Please select at least one expression",
        ),
      )
      return
    }

    if (!props.userToken) {
      console.error("userToken is not available:", props.userToken)
      toast.error(t("認証が必要です", "Authentication required"))
      return
    }

    setIsGenerating(true)

    try {
      // 画像をアップロード
      const imageUrl = await uploadPublicImage(baseImage, props.userToken)

      if (!imageUrl) {
        throw new Error("Failed to upload image")
      }

      const result = await createExpressions({
        variables: {
          input: {
            baseImageUrl: imageUrl,
            expressions: selectedExpressions,
            size: size,
            backgroundColor: backgroundColor,
          },
        },
      } as Parameters<typeof createExpressions>[0])

      if (result.data?.createExpressionsFromImage) {
        toast.success(
          t("表情生成を開始しました！", "Expression generation started!"),
        )

        // フォームをリセット
        setBaseImage(null)
        setSelectedExpressions([])
        setCustomExpression("")
        setBackgroundColor(null)
      }
    } catch (error) {
      console.error("Generation error:", error)
      toast.error(t("生成に失敗しました", "Generation failed"))
    } finally {
      setIsGenerating(false)
    }
  }, [
    baseImage,
    selectedExpressions,
    size,
    backgroundColor,
    props.userToken,
    createExpressions,
    t,
  ])

  const totalCost = calculateCost()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          {t(
            "新しいキャラクター表情生成",
            "New Character Expression Generation",
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ベース画像アップロード */}
        <div className="space-y-3">
          <Label>
            {t("ベース画像", "Base Image")}
            <span className="ml-1 text-red-500">*</span>
          </Label>
          <CropImageField
            cropWidth={512}
            cropHeight={512}
            onCrop={handleImageCrop}
            onDeleteImage={handleDeleteImage}
            isHidePreviewImage={!baseImage}
          />
          {baseImage && (
            <p className="text-muted-foreground text-sm">
              {t("画像がアップロードされました", "Image uploaded successfully")}
            </p>
          )}
        </div>

        {/* 表情選択 */}
        <div className="space-y-3">
          <Label>
            {t("生成したい表情", "Expressions to Generate")}
            <span className="ml-1 text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-4 gap-2 md:grid-cols-6 lg:grid-cols-8">
            {EXPRESSION_OPTIONS.map((expression) => (
              <Button
                key={expression}
                variant={
                  selectedExpressions.includes(expression)
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => handleExpressionToggle(expression)}
                className="h-auto py-2 text-xs"
              >
                {expression}
              </Button>
            ))}
          </div>

          {/* カスタム表情入力 */}
          <div className="flex gap-2">
            <Input
              placeholder={t("カスタム表情を入力", "Enter custom expression")}
              value={customExpression}
              onChange={(e) => setCustomExpression(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleAddCustomExpression()
              }
            />
            <Button onClick={handleAddCustomExpression} size="sm">
              {t("追加", "Add")}
            </Button>
          </div>

          {/* 選択された表情 */}
          {selectedExpressions.length > 0 && (
            <div className="space-y-2">
              <Label className="font-medium text-sm">
                {t("選択済み表情", "Selected Expressions")} (
                {selectedExpressions.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {selectedExpressions.map((expression) => (
                  <Badge key={expression} variant="secondary" className="gap-1">
                    {expression}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveExpression(expression)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* サイズ選択 */}
        <div className="space-y-3">
          <Label>{t("生成サイズ", "Generation Size")}</Label>
          <Select
            value={size}
            onValueChange={(value: ExpressionSize) => setSize(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SQUARE_512">512×512</SelectItem>
              <SelectItem value="SQUARE_768">768×768</SelectItem>
              <SelectItem value="SQUARE_1024">1024×1024</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 背景色設定 */}
        <div className="space-y-3">
          <Label>
            {t("背景色 (オプション)", "Background Color (Optional)")}
          </Label>
          <Input
            type="color"
            value={backgroundColor || "#ffffff"}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="h-10 w-20"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBackgroundColor(null)}
          >
            {t("透明", "Transparent")}
          </Button>
        </div>

        {/* コスト表示 */}
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {t("生成コスト", "Generation Cost")}:
            </span>
            <span className="font-bold text-lg">
              {totalCost} {t("枚", "points")}
            </span>
          </div>
          <p className="mt-1 text-muted-foreground text-sm">
            {t("表情あたり", "per expression")}: 1枚 ×{" "}
            {selectedExpressions.length}
          </p>
        </div>

        {/* 生成ボタン */}
        <Button
          onClick={handleGenerate}
          disabled={
            isGenerating || !baseImage || selectedExpressions.length === 0
          }
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              {t("生成中...", "Generating...")}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {t("表情を生成する", "Generate Expressions")} ({totalCost}{" "}
              {t("枚", "points")})
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
