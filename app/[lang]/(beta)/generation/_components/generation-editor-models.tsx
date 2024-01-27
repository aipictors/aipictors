"use client"

import { ConfigModel } from "@/app/[lang]/(beta)/generation/_components/config-model"
import { GenerationEditorCard } from "@/app/[lang]/(beta)/generation/_components/generation-editor-card"
import { ModelsDialog } from "@/app/[lang]/(beta)/generation/_components/models-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Config } from "@/config"
import type { ImageModelsQuery } from "@/graphql/__generated__/graphql"
import { produce } from "immer"
import { useState } from "react"
import { useBoolean } from "usehooks-ts"

type Props = {
  models: ImageModelsQuery["imageModels"]
  currentModelId: string
  onSelectModelId(id: string): void
}

export const GenerationEditorModels = (props: Props) => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  /**
   * 表示されるモデルのID
   */
  const [currentModelIds, setCurrentModelIds] = useState(() => {
    if (Config.defaultImageModelIds.includes(props.currentModelId)) {
      return Config.defaultImageModelIds
    }
    return [props.currentModelId, ...Config.defaultImageModelIds]
  })

  const currentModels = currentModelIds.map((modelId) => {
    return props.models.find((model) => {
      return model.id === modelId
    })
  })

  /**
   * モデルを追加する
   * 選択中のモデルが3個未満の場合は末尾に追加する
   * 3個以上の場合は選択中のモデルを置換する
   * @param modelId
   */
  const onSelectModelId = (modelId: string) => {
    props.onSelectModelId(modelId)

    const draftIds = produce(currentModelIds, (draft) => {
      if (!draft.includes(modelId)) {
        if (draft.length < 3) {
          draft.push(modelId)
        }
        if (3 <= draft.length) {
          const currentModelIndex = draft.findIndex((id) => {
            return id === props.currentModelId
          })
          draft[currentModelIndex] = modelId
        }
      }
    })
    setCurrentModelIds(draftIds)
  }

  return (
    <>
      <GenerationEditorCard
        title={"モデル"}
        tooltip={"イラスト生成に使用するモデルです。絵柄などが変わります。"}
      >
        <ScrollArea>
          <div className="flex px-2 pb-2 justify-between items-start flex-col gap-y-2">
            {currentModels.map((model) => (
              <ConfigModel
                key={model?.id}
                imageURL={model?.thumbnailImageURL ?? ""}
                name={model?.displayName ?? ""}
                isSelected={model?.id === props.currentModelId}
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
        selectedModelId={props.currentModelId}
        onSelect={onSelectModelId}
      />
    </>
  )
}
