import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Edit2, Save, X, Upload } from "lucide-react"
import type { Character } from "../types/character"

type Props = {
  character: Character
}

export function CharacterDetail (props: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingData, setEditingData] = useState({
    name: props.character.name,
    description: props.character.description ?? "",
    promptText: props.character.promptText ?? "",
  })

  const handleSave = () => {
    // TODO: GraphQLミューテーションでキャラクター情報を更新
    console.log("保存:", editingData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditingData({
      name: props.character.name,
      description: props.character.description ?? "",
      promptText: props.character.promptText ?? "",
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* キャラクター画像 */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={props.character.imageUrl}
            alt={props.character.name}
          />
          <AvatarFallback className="text-2xl">
            {props.character.name.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          画像を変更
        </Button>
      </div>

      {/* 基本情報 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">基本情報</h3>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              編集
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                キャンセル
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                保存
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="name">キャラクター名</Label>
            {isEditing ? (
              // biome-ignore lint/nursery/useUniqueElementIds: <explanation>
              <Input
                id="name"
                value={editingData.name}
                onChange={(e) =>
                  setEditingData({ ...editingData, name: e.target.value })
                }
              />
            ) : (
              <p className="p-2 text-sm">{props.character.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">説明</Label>
            {isEditing ? (
              // biome-ignore lint/nursery/useUniqueElementIds: <explanation>
              <Textarea
                id="description"
                value={editingData.description}
                onChange={(e) =>
                  setEditingData({
                    ...editingData,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            ) : (
              <p className="p-2 text-muted-foreground text-sm">
                {props.character.description || "説明がありません"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="promptText">プロンプトテキスト</Label>
            {isEditing ? (
              // biome-ignore lint/nursery/useUniqueElementIds: <explanation>
              <Textarea
                id="promptText"
                value={editingData.promptText}
                onChange={(e) =>
                  setEditingData({ ...editingData, promptText: e.target.value })
                }
                rows={4}
                placeholder="キャラクターの特徴やスタイルを記述..."
              />
            ) : (
              <p className="rounded bg-muted p-2 font-mono text-sm">
                {props.character.promptText || "プロンプトが設定されていません"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
