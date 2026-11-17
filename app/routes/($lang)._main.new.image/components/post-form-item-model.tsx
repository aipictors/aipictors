import { type SetStateAction, useState, useEffect } from "react"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2Icon, PlusIcon, Search, XIcon } from "lucide-react"
import { toast } from "sonner"
import type { AiModel } from "~/routes/($lang)._main.new.image/types/model"
import {
  canAddAiModel,
  filterAiModels,
} from "~/routes/($lang)._main.new.image/utils/filter-ai-models"
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

  // その場で足したモデル（次に画面を開いたときは API の一覧に入っている）
  const [addedModels, setAddedModels] = useState<AiModel[]>([])

  const [createAiModel, { loading: isCreating }] = useMutation(
    CreateAiModelMutation,
  )

  const t = useTranslation()

  const allModels = [
    ...models,
    ...addedModels.filter(
      (added) => !models.some((model) => model.id === added.id),
    ),
  ]

  const newModelName = searchTerm.trim().replace(/\s+/g, " ")

  const isAddable = canAddAiModel(allModels, newModelName)

  const toErrorMessage = (error: unknown) => {
    const reason = toCreateErrorReason(error)
    if (reason === "EMPTY") {
      return t("モデル名を入力してください", "Please enter a model name")
    }
    if (reason === "TOO_LONG") {
      return t(
        "モデル名は50文字までです",
        "Model names can be up to 50 characters",
      )
    }
    if (reason === "INVALID_CHARACTERS") {
      return t(
        "モデル名に改行や使えない文字が入っています",
        "The model name contains line breaks or unsupported characters",
      )
    }
    if (reason === "URL") {
      return t(
        "モデル名に URL は入れられません",
        "Model names cannot contain URLs",
      )
    }
    if (reason === "HIDDEN") {
      return t(
        "この名前のモデルは追加できません",
        "A model with this name cannot be added",
      )
    }
    if (reason === "LIMIT") {
      return t(
        "モデルを追加できるのは1日5件までです",
        "You can add up to 5 models per day",
      )
    }
    if (reason === "UNAUTHENTICATED") {
      return t(
        "モデルを追加するにはログインしてください",
        "Please log in to add a model",
      )
    }
    return t("モデルを追加できませんでした", "Could not add the model")
  }

  // 一覧にない名前のモデルを足して、この作品に設定する（同じ名前のモデルがあればそれが選ばれる）
  const addModel = async () => {
    if (!isAddable || isCreating) return
    try {
      const result = await createAiModel({
        variables: { input: { name: newModelName } },
      })
      const created = result.data?.createAiModel
      if (!created?.workModelId) {
        throw new Error("no model")
      }
      const added = { id: created.workModelId, name: created.name }
      setAddedModels((prev) =>
        prev.some((model) => model.id === added.id) ? prev : [...prev, added],
      )
      setModel(added.id)
      setSearchTerm("")
      toast.success(
        t(`「${added.name}」を選びました`, `Selected "${added.name}"`),
      )
    } catch (error) {
      toast.error(toErrorMessage(error))
    }
  }

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
  const filteredModels = filterAiModels(allModels, searchTerm)

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
        {isAddable && (
          <div className="space-y-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addModel}
              disabled={isCreating}
              className="h-auto min-h-8 w-full justify-start whitespace-normal break-all text-left"
            >
              {isCreating ? (
                <Loader2Icon className="mr-1 h-4 w-4 shrink-0 animate-spin" />
              ) : (
                <PlusIcon className="mr-1 h-4 w-4 shrink-0" />
              )}
              {t(`「${newModelName}」を追加`, `Add "${newModelName}"`)}
            </Button>
            <p className="text-muted-foreground text-xs">
              {t(
                "一覧にないモデルは名前を入れて追加できます。追加したモデルはみんなの一覧にも出ます。",
                "If your model is not listed, type its name to add it. Added models appear in everyone's list.",
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const CreateAiModelMutation = graphql(
  `mutation CreateAiModel($input: CreateAiModelInput!) {
    createAiModel(input: $input) {
      id
      name
      workModelId
    }
  }`,
)

/** API がモデルを足せなかった理由（extensions.reason。未ログインは UNAUTHENTICATED） */
const toCreateErrorReason = (error: unknown): string | null => {
  if (typeof error !== "object" || error === null) return null
  const graphQLErrors = (error as { graphQLErrors?: unknown }).graphQLErrors
  if (!Array.isArray(graphQLErrors)) return null
  for (const graphQLError of graphQLErrors) {
    const extensions =
      typeof graphQLError === "object" && graphQLError !== null
        ? (graphQLError as { extensions?: Record<string, unknown> }).extensions
        : undefined
    if (typeof extensions?.reason === "string") return extensions.reason
    if (extensions?.code === "UNAUTHENTICATED") return "UNAUTHENTICATED"
  }
  return null
}
