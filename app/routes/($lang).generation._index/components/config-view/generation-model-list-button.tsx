import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { ImageModelsList } from "~/routes/($lang).generation._index/components/config-view/generation-image-model-list"
import { UserModelPickerPanel } from "~/routes/($lang).generation._index/components/config-view/user-model-picker-panel"
import { useUserModelSelection } from "~/routes/($lang).generation._index/hooks/use-user-model-selection"
import type { ImageModelContextFragment } from "~/routes/($lang).generation._index/contexts/generation-query-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useMutation } from "@apollo/client/index"
import { graphql, type FragmentOf } from "gql.tada"
import { useBoolean } from "usehooks-ts"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  models: FragmentOf<typeof ImageModelContextFragment>[]
  selectedModelId: string | null
  favoritedModelIds: number[]
  isInitFavorited: boolean
  label?: string
  onSelect(id: string, type: string, prompt: string): void
  onSearchClick(id: string, name: string): void
}

/**
 * モデル一覧を表示するボタン
 */
export function GenerationModelListButton (props: Props) {
  const context = useGenerationContext()
  const { value, setTrue, setFalse } = useBoolean()
  const t = useTranslation()
  const userModelSelection = useUserModelSelection()

  const onSelectModel = (id: string, type: string, prompt: string) => {
    props.onSelect(id, type, prompt)
    setFalse()
  }

  const [changeRatingModel, { loading: isLoading }] = useMutation(
    updateRatingImageGenerationModelMutation,
  )

  const onChangeRatingModel = async (id: number, rating: number) => {
    const result = await changeRatingModel({
      variables: {
        input: {
          modelId: id.toString(),
          rating,
        },
      },
    })
    if (
      result.data?.updateRatingImageGenerationModel
        .favoritedImageGenerationModelIds
    ) {
      context.updateFavoriteModelIds(
        result.data?.updateRatingImageGenerationModel
          .favoritedImageGenerationModelIds,
      )
    }
  }

  // Check if any model has isNew: true
  const hasNewModels = props.models.some((model) => model.isNew)

  return (
    <Dialog
      open={value}
      onOpenChange={(isOpen) => {
        if (isOpen) return
        setFalse()
      }}
    >
      <DialogTrigger asChild>
        <Button
          size={"sm"}
          className="flex w-full items-center gap-2"
          variant={"secondary"}
          onClick={setTrue}
          aria-label={
            hasNewModels
              ? t(
                  "すべてのモデル（新作モデルあり）",
                  "All models (new models available)",
                )
              : t("すべてのモデル", "All models")
          }
        >
          {props.label ? props.label : t("すべてのモデル", "All models")}
          {hasNewModels && (
            <span className="rounded-full bg-blue-500 px-2 py-0.5 font-bold text-white text-xs">
              {"New"}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-(--breakpoint-md) lg:max-w-(--breakpoint-lg) xl:max-w-(--breakpoint-xl)">
        <DialogHeader>
          <DialogTitle>{t("モデルを選択", "Select a model")}</DialogTitle>
          <DialogDescription className="hidden md:block xl:block">
            {t(
              "使用するモデルを選択してください",
              "Please select the model to use",
            )}
          </DialogDescription>
        </DialogHeader>
        <Tabs
          defaultValue={userModelSelection.checkpoint ? "community" : "official"}
          className="min-w-0"
        >
          <TabsList className="mb-3 w-full sm:w-auto">
            <TabsTrigger value="official" className="flex-1 px-4 sm:flex-none">
              {t("公式モデル", "Official")}
            </TabsTrigger>
            <TabsTrigger value="community" className="flex-1 px-4 sm:flex-none">
              {t("みんなのモデル", "Community")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="official" className="space-y-3">
            <div className="items-top flex space-x-2">
              <Checkbox
                onCheckedChange={(value: boolean) => {
                  context.changeUseRecommendedPrompt(value)
                }}
                checked={context.config.isUseRecommendedPrompt}
                id="use-recommended-prompt"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="use-recommended-prompt"
                  className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t(
                    "モデルの推奨プロンプトを設定する",
                    "Set the recommended prompt for the model",
                  )}
                </label>
              </div>
            </div>
            <ImageModelsList
              isInitFavorited={props.isInitFavorited}
              models={props.models}
              favoritedModelIds={props.favoritedModelIds}
              selectedModelId={
                userModelSelection.checkpoint ? null : props.selectedModelId
              }
              onSelect={onSelectModel}
              onChangeFavoritedModel={onChangeRatingModel}
              onSearchClick={props.onSearchClick}
            />
          </TabsContent>
          <TabsContent value="community">
            <UserModelPickerPanel
              kind="CHECKPOINT"
              selectedIds={
                userModelSelection.checkpoint
                  ? [userModelSelection.checkpoint.id]
                  : []
              }
              onSelect={(model) => {
                userModelSelection.selectCheckpoint(model)
                setFalse()
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

const updateRatingImageGenerationModelMutation = graphql(
  `mutation UpdateRatingImageGenerationModel($input: UpdateRatingImageGenerationModelInput!) {
    updateRatingImageGenerationModel(input: $input) {
      id
      userId
      favoritedImageGenerationModelIds
      preferenceRating
      featurePromptonRequest
      isNotifyComment
    }
  }`,
)
