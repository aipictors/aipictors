import { type SetStateAction, useState, useEffect } from "react"
import { Search, XIcon } from "lucide-react"
import type { AiModel } from "~/routes/($lang)._main.new.image/types/model"
import { useTranslation } from "~/hooks/use-translation"
import { Card, CardContent } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "~/components/ui/select"

type Props = {
  model: string | null
  models: AiModel[]
  setModel: (value: string | null) => void
}

export function PostFormItemModel({ model, models, setModel }: Props) {
  const [searchTerm, setSearchTerm] = useState("")

  const t = useTranslation()

  // 初期レンダリング時にlocalStorageから値を取得
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedModel = localStorage.getItem("selectedModel")
      if (savedModel) {
        setModel(savedModel)
      }
    }
  }, [models.length])

  // モデルが変更されたときにlocalStorageに保存
  useEffect(() => {
    if (typeof window !== "undefined" && model && model !== "1") {
      localStorage.setItem("selectedModel", model)
    }
  }, [model])

  // モデル選択をクリアする関数
  const clearModel = () => {
    setModel(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("selectedModel")
    }
  }

  // モデル名でソートし、検索語でフィルタリング
  const filteredModels = models
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <p className="font-bold text-sm">{t("使用AI", "Used AI")}</p>
          {model && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearModel}
              className="h-6 w-6 p-0"
              title={t("選択をクリア", "Clear selection")}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Input
              type="text"
              placeholder={t("フィルター", "Filter")}
              value={searchTerm}
              onChange={(e: { target: { value: SetStateAction<string> } }) =>
                setSearchTerm(e.target.value)
              }
              className="pl-10"
            />
            <Search
              className="-translate-y-1/2 absolute top-1/2 left-3 transform text-gray-400"
              size={20}
            />
          </div>
          <Select value={model ?? ""} onValueChange={setModel}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={t("AIモデルを選択", "Select AI model")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {filteredModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
