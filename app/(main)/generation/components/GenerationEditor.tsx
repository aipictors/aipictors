"use client"
import { Grid, GridItem } from "@chakra-ui/react"
import type {
  ImageModelsQuery,
  PromptCategoryQuery,
} from "__generated__/apollo"
import { GenerationEditorHistory } from "app/(main)/generation/components/GenerationEditorHistory"
import { GenerationEditorLoraModels } from "app/(main)/generation/components/GenerationEditorLoraModels"
import { GenerationEditorModels } from "app/(main)/generation/components/GenerationEditorModels"
import { GenerationEditorNegative } from "app/(main)/generation/components/GenerationEditorNegative"
import { GenerationEditorPrompt } from "app/(main)/generation/components/GenerationEditorPrompt"

type Props = {
  imageModelsQuery: ImageModelsQuery
  promptCategoryQuery: PromptCategoryQuery
}

export const GenerationEditor: React.FC<Props> = () => {
  const area = {
    models: "models",
    editorPrompt: "editor-prompt",
    histories: "histories",
    loraModels: "lora-models",
    editorNegativePrompt: "editor-negative-prompt",
  }

  const templateAreas = [
    [area.models, area.editorPrompt, area.histories].join(" "),
    [area.loraModels, area.editorNegativePrompt, area.histories].join(" "),
  ]
    .map((row) => `"${row}"`)
    .join("\n")

  return (
    <Grid
      as={"main"}
      templateAreas={templateAreas}
      gridTemplateRows={"1fr 1fr"}
      gridTemplateColumns={"1fr 1fr 1fr"}
      w={"100%"}
      gap={2}
      h={"calc(100svh - 64px)"}
      px={4}
      pb={4}
    >
      <GridItem area={area.models}>
        <GenerationEditorModels />
      </GridItem>
      <GridItem area={area.loraModels}>
        <GenerationEditorLoraModels />
      </GridItem>
      <GridItem area={area.editorPrompt}>
        <GenerationEditorPrompt />
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
