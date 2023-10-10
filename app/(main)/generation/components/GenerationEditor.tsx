"use client"
import { Grid, GridItem, useBreakpointValue } from "@chakra-ui/react"
import { useState } from "react"
import type {
  ImageLoraModelsQuery,
  ImageModelsQuery,
  PromptCategoryQuery,
} from "__generated__/apollo"

import { GenerationEditorHistory } from "app/(main)/generation/components/GenerationEditorHistory"
import { GenerationEditorLoraModels } from "app/(main)/generation/components/GenerationEditorLoraModels"
import { GenerationEditorModels } from "app/(main)/generation/components/GenerationEditorModels"
import { GenerationEditorNegative } from "app/(main)/generation/components/GenerationEditorNegative"
import { GenerationEditorPrompt } from "app/(main)/generation/components/GenerationEditorPrompt"

type Props = {
  imageModels: ImageModelsQuery["imageModels"]
  promptCategoryQuery: PromptCategoryQuery
  ImageLoraModelsQuery: ImageLoraModelsQuery
}

export const GenerationEditor: React.FC<Props> = (props) => {
  const [selectedImageModelId, onSelectedImageModelId] = useState<
    string | null
  >(null)

  const [selectedImageLoraModelId, onSelectedImageLoraModelId] = useState<
    string | null
  >(null)

  const area = {
    models: "models",
    editorPrompt: "editor-prompt",
    histories: "histories",
    loraModels: "lora-models",
    editorNegativePrompt: "editor-negative-prompt",
  }

  const responsiveAreas = useBreakpointValue({
    base: [
      [area.models],
      [area.loraModels],
      [area.editorPrompt],
      [area.editorNegativePrompt],
      [area.histories],
    ],
    sm: [
      [area.models, area.editorPrompt],
      [area.loraModels, area.editorNegativePrompt],
      [area.histories, area.histories],
    ],
    xl: [
      [area.models, area.editorPrompt, area.histories],
      [area.loraModels, area.editorNegativePrompt, area.histories],
    ],
  })

  const templateAreas = (responsiveAreas ?? [])
    .map((row) => `"${row.join(" ")}"`)
    .join("\n")

  return (
    <Grid
      as={"main"}
      templateAreas={templateAreas}
      gridTemplateRows={{
        base: "1fr 1fr 1fr 1fr 1fr",
        sm: "1fr 1fr 1fr",
        xl: "1fr 1fr",
      }}
      gridTemplateColumns={{
        base: "1fr",
        sm: "1fr 1fr",
        xl: "1fr 1fr 1fr",
      }}
      w={"100%"}
      gap={2}
      h={"calc(100svh - 64px)"}
      px={4}
      pb={4}
      overflowY={"auto"}
    >
      <GridItem area={area.models}>
        <GenerationEditorModels
          imageModels={props.imageModels}
          selectedImageModelId={selectedImageModelId}
          onSelectImageModelId={(id) => {
            onSelectedImageModelId(id)
          }}
        />
      </GridItem>
      <GridItem area={area.loraModels}>
        <GenerationEditorLoraModels
          imageLoraModels={props.ImageLoraModelsQuery.imageLoraModels}
          selectedImageLoraModelId={selectedImageLoraModelId}
          onSelectImageLoraModelId={(id) => {
            onSelectedImageLoraModelId(id)
          }}
        />
      </GridItem>
      <GridItem area={area.editorPrompt}>
        <GenerationEditorPrompt
          promptCategories={props.promptCategoryQuery.promptCategories}
        />
      </GridItem>
      <GridItem area={area.editorNegativePrompt}>
        <GenerationEditorNegative />
      </GridItem>
      <GridItem area={area.histories}>
        <GenerationEditorHistory />
      </GridItem>
    </Grid>
  )
}
