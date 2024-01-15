"use client"

import type { ImageModelsQuery } from "@/graphql/__generated__/graphql"
import { ConfigModel } from "@/app/[lang]/(beta)/generation/_components/config-model"
import { GenerationEditorCard } from "@/app/[lang]/(beta)/generation/_components/generation-editor-card"
import { ModelsDialog } from "@/app/[lang]/(beta)/generation/_components/models-dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Config } from "@/config"
import { useState } from "react"
import { useBoolean } from "usehooks-ts"

type Props = {
  models: ImageModelsQuery["imageModels"]
  selectedModelId: string
  onSelectModelId(id: string): void
}

export const GenerationEditorModels = (props: Props) => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  /**
   * 表示されるモデルのID
   */
  const [currentModelIds, setCurrentModelIds] = useState(() => {
    if (Config.defaultImageModelIds.includes(props.selectedModelId)) {
      return Config.defaultImageModelIds
    }
    return [props.selectedModelId, ...Config.defaultImageModelIds]
  })

  const currentModels = currentModelIds.map((modelId) => {
    return props.models.find((model) => {
      return model.id === modelId
    })
  })

  const onSelectModelId = (modelId: string) => {
    props.onSelectModelId(modelId)
    const draftIds = [...currentModelIds]
    const index = draftIds.indexOf(modelId)
    if (index !== -1) return
    draftIds.unshift(modelId)
    if (6 < draftIds.length) {
      draftIds.pop()
    }
    setCurrentModelIds(draftIds)
  }

  return (
    <>
      <GenerationEditorCard
        title={"モデル"}
        tooltip={"イラスト生成に使用するモデルです。絵柄などが変わります。"}
        action={
          <Button size={"sm"} onClick={onOpen}>
            {"モデルを変更する"}
          </Button>
        }
      >
        <ScrollArea>
          <div className="flex px-2 pb-2 justify-between items-start flex-col gap-y-2">
            {currentModels.map((model) => (
              <ConfigModel
                key={model?.id}
                imageURL={model?.thumbnailImageURL ?? ""}
                name={model?.displayName ?? ""}
                isSelected={model?.id === props.selectedModelId}
                onClick={() => {
                  onSelectModelId(model!.id)
                }}
              />
            ))}
          </div>
        </ScrollArea>
      </GenerationEditorCard>
      <ModelsDialog
        isOpen={isOpen}
        onClose={onClose}
        models={props.models}
        selectedModelId={props.selectedModelId}
        onSelect={onSelectModelId}
      />
    </>
  )
}
