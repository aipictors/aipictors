"use client"

import {
  Button,
  Card,
  HStack,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react"
import type { ImageLoraModelsQuery } from "__generated__/apollo"
import { LoraModelsModal } from "app/[lang]/(main)/generation/components/LoraModelsModal"
import { LoraModelsSetting } from "app/[lang]/(main)/generation/components/LoraModelsSetting"
import { SelectedLoraModel } from "app/[lang]/(main)/generation/components/SelectedLoraModel"

type Props = {
  /**
   * 全てのモデル
   */
  models: ImageLoraModelsQuery["imageLoraModels"]
  /**
   * 選択されたモデルのIDの配列
   */
  selectedModels: { id: string; value: number }[]
  onSelectModelId(id: string): void
  onChangeValue(id: string, value: number): void
}

export const GenerationEditorLoraModels: React.FC<Props> = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const selectedModeIds = props.selectedModels.map((model) => model.id)

  /**
   * 選択されたLoRAモデル
   */
  const selectedModels = props.models.filter((model) => {
    return selectedModeIds.includes(model.id)
  })

  return (
    <>
      <Card p={4} h={"100%"}>
        <Stack>
          <HStack>
            <Text fontWeight={"bold"}>{"加工（LoRA）"}</Text>
            <Tooltip
              label="イラストの絵柄を調整することができます。"
              fontSize="md"
            >
              <Button size={"xs"} borderRadius={"full"}>
                {"?"}
              </Button>
            </Tooltip>
          </HStack>
          {selectedModels.map((model) => (
            <SelectedLoraModel
              key={model.id}
              imageURL={model.thumbnailImageURL ?? ""}
              name={model.name}
              description={model.description!}
              value={props.selectedModels.find((m) => m.id === model.id)!.value}
              setValue={(value) => {
                props.onChangeValue(model.id, value)
              }}
            />
          ))}
          <Button borderRadius={"full"} onClick={onOpen}>
            {"もっとLoRAを表示する"}
          </Button>
          <LoraModelsSetting />
        </Stack>
      </Card>
      <LoraModelsModal
        isOpen={isOpen}
        onClose={onClose}
        models={props.models}
        selectedModelIds={selectedModeIds}
        onSelect={props.onSelectModelId}
      />
    </>
  )
}
