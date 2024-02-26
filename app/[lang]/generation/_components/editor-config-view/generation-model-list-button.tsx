"use client"

import { ImageModelsList } from "@/app/[lang]/generation/_components/editor-config-view/generation-image-model-list"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { ImageModelsQuery } from "@/graphql/__generated__/graphql"
import { updateRatingImageGenerationModelMutation } from "@/graphql/mutations/update-rating-image-generation-model"
import { useMutation } from "@apollo/client"
import { useBoolean } from "usehooks-ts"

type Props = {
  models: ImageModelsQuery["imageModels"]
  selectedModelId: string | null
  favoritedModelIds: number[]
  onSelect(id: string, type: string, prompt: string): void
}

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
          {"すべてのモデル"}
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
        <DialogHeader>
          <DialogTitle>{"モデルを選択"}</DialogTitle>
          <DialogDescription>
            {"使用するモデルを選択してください"}
          </DialogDescription>
        </DialogHeader>
        <div className="items-top flex space-x-2">
          <Checkbox
            onCheckedChange={(value: boolean) => {
              context.changeUseRecommendedPrompt(value)
              console.log(context.config.isUseRecommendedPrompt)
            }}
            checked={context.config.isUseRecommendedPrompt}
            id="use-recommended-prompt"
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="use-recommended-prompt"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              モデルの推奨プロンプトを設定する
            </label>
          </div>
        </div>

        <ImageModelsList
          models={props.models}
          favoritedModelIds={props.favoritedModelIds}
          selectedModelId={props.selectedModelId}
          onSelect={onSelectModel}
          onChangeFavoritedModel={onChangeRatingModel}
        />
      </DialogContent>
    </Dialog>
  )
}
