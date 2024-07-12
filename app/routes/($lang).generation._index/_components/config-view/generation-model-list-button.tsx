import { Button } from "@/_components/ui/button"
import { Checkbox } from "@/_components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/_components/ui/dialog"
import { updateRatingImageGenerationModelMutation } from "@/_graphql/mutations/update-rating-image-generation-model"
import { ImageModelsList } from "@/routes/($lang).generation._index/_components/config-view/generation-image-model-list"
import type { imageModelContextFragment } from "@/routes/($lang).generation._index/_contexts/generation-query-context"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { useMutation } from "@apollo/client/index"
import type { FragmentOf } from "gql.tada"
import { useBoolean } from "usehooks-ts"

type Props = {
  models: FragmentOf<typeof imageModelContextFragment>[]
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
export const GenerationModelListButton = (props: Props) => {
  const context = useGenerationContext()

  const { value, setTrue, setFalse } = useBoolean()

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
          className="w-full"
          variant={"secondary"}
          onClick={setTrue}
        >
          {props.label ? props.label : "すべてのモデル"}
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
        <DialogHeader>
          <DialogTitle>{"モデルを選択"}</DialogTitle>
          <DialogDescription className="hidden md:block xl:block">
            {"使用するモデルを選択してください"}
          </DialogDescription>
        </DialogHeader>
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
              モデルの推奨プロンプトを設定する
            </label>
          </div>
        </div>

        <ImageModelsList
          isInitFavorited={props.isInitFavorited}
          models={props.models}
          favoritedModelIds={props.favoritedModelIds}
          selectedModelId={props.selectedModelId}
          onSelect={onSelectModel}
          onChangeFavoritedModel={onChangeRatingModel}
          onSearchClick={props.onSearchClick}
        />
      </DialogContent>
    </Dialog>
  )
}
