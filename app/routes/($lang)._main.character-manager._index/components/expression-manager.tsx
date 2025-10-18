import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Plus, Upload, Edit2, Trash2, Copy } from "lucide-react"
import type { Character, Expression } from "../types/character"

type Props = {
  character: Character
}

export function ExpressionManager(props: Props) {
  // モック表情データ（実際はAPIから取得）
  const [expressions, setExpressions] = useState<Expression[]>([
    {
      id: "1",
      name: "笑顔",
      description: "明るい笑顔の表情",
      imageUrl: undefined,
      promptModifier: "smiling, happy, cheerful",
      tags: ["ポジティブ", "基本"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "困った顔",
      description: "困った時の表情",
      imageUrl: undefined,
      promptModifier: "troubled, worried, confused",
      tags: ["ネガティブ", "感情"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      name: "怒り",
      description: "怒っている表情",
      imageUrl: undefined,
      promptModifier: "angry, furious, mad",
      tags: ["ネガティブ", "強い感情"],
      createdAt: new Date().toISOString(),
    },
  ])

  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newExpression, setNewExpression] = useState({
    name: "",
    description: "",
    promptModifier: "",
    tags: "",
  })

  const handleAddExpression = () => {
    if (!newExpression.name || !newExpression.promptModifier) return

    const expression: Expression = {
      id: Date.now().toString(),
      name: newExpression.name,
      description: newExpression.description,
      imageUrl: undefined,
      promptModifier: newExpression.promptModifier,
      tags: newExpression.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      createdAt: new Date().toISOString(),
    }

    setExpressions([...expressions, expression])
    setNewExpression({
      name: "",
      description: "",
      promptModifier: "",
      tags: "",
    })
    setIsAddingNew(false)
  }

  const handleDeleteExpression = (expressionId: string) => {
    setExpressions(expressions.filter((exp) => exp.id !== expressionId))
  }

  const handleCopyPrompt = (promptModifier: string) => {
    navigator.clipboard.writeText(
      `${props.character.promptText}, ${promptModifier}`,
    )
    // TODO: トースト通知を表示
    console.log("プロンプトをコピーしました")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">表情差分管理</h3>
          <p className="text-muted-foreground text-sm">
            {props.character.name}の表情バリエーションを管理します
          </p>
        </div>
        <Button onClick={() => setIsAddingNew(true)} disabled={isAddingNew}>
          <Plus className="mr-2 h-4 w-4" />
          表情追加
        </Button>
      </div>

      {/* 新しい表情追加フォーム */}
      {isAddingNew && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">新しい表情を追加</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="expression-name">表情名</Label>
              {/** biome-ignore lint/nursery/useUniqueElementIds: <explanation> */}
              <Input
                id="expression-name"
                value={newExpression.name}
                onChange={(e) =>
                  setNewExpression({ ...newExpression, name: e.target.value })
                }
                placeholder="例: 笑顔、困った顔、怒り"
              />
            </div>
            <div>
              <Label htmlFor="expression-description">説明</Label>
              {/** biome-ignore lint/nursery/useUniqueElementIds: <explanation> */}
              <Input
                id="expression-description"
                value={newExpression.description}
                onChange={(e) =>
                  setNewExpression({
                    ...newExpression,
                    description: e.target.value,
                  })
                }
                placeholder="表情の詳細説明"
              />
            </div>
            <div>
              <Label htmlFor="expression-prompt">プロンプト修飾子</Label>
              {/** biome-ignore lint/nursery/useUniqueElementIds: <explanation> */}
              <Input
                id="expression-prompt"
                value={newExpression.promptModifier}
                onChange={(e) =>
                  setNewExpression({
                    ...newExpression,
                    promptModifier: e.target.value,
                  })
                }
                placeholder="例: smiling, happy, cheerful"
              />
            </div>
            <div>
              <Label htmlFor="expression-tags">タグ（カンマ区切り）</Label>
              {/** biome-ignore lint/nursery/useUniqueElementIds: <explanation> */}
              <Input
                id="expression-tags"
                value={newExpression.tags}
                onChange={(e) =>
                  setNewExpression({ ...newExpression, tags: e.target.value })
                }
                placeholder="例: ポジティブ, 基本, 感情"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddExpression}
                disabled={!newExpression.name || !newExpression.promptModifier}
              >
                追加
              </Button>
              <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 表情一覧 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {expressions.map((expression) => (
          <Card key={expression.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{expression.name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Upload className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteExpression(expression.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">
                {expression.description}
              </p>

              <div>
                <Label className="text-xs">プロンプト修飾子</Label>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted p-2 font-mono text-xs">
                    {expression.promptModifier}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyPrompt(expression.promptModifier)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {expression.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleCopyPrompt(expression.promptModifier)}
                >
                  <Copy className="mr-1 h-3 w-3" />
                  コピー
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  生成テスト
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {expressions.length === 0 && !isAddingNew && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              まだ表情差分が登録されていません
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setIsAddingNew(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              最初の表情を追加
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
