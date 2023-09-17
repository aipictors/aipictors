"use client"
import { Card, Grid, GridItem, Stack, Text, Textarea } from "@chakra-ui/react"
import type {
  ImageModelsQuery,
  PromptCategoryQuery,
} from "__generated__/apollo"

type Props = {
  imageModelsQuery: ImageModelsQuery
  promptCategoryQuery: PromptCategoryQuery
}

export const ImageGenerationEditor: React.FC<Props> = () => {
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
      gap={4}
      h={"calc(100svh - 64px)"}
      pr={4}
      pb={4}
    >
      <GridItem area={area.models}>
        <Card p={4} h={"100%"}>
          <Stack>
            <Text fontWeight={"bold"}>{"モデル"}</Text>
          </Stack>
        </Card>
      </GridItem>
      <GridItem area={area.loraModels}>
        <Card p={4} h={"100%"}>
          <Stack>
            <Text fontWeight={"bold"}>{"LoRA"}</Text>
          </Stack>
        </Card>
      </GridItem>
      <GridItem area={area.editorPrompt}>
        <Card p={4} h={"100%"}>
          <Stack>
            <Text fontWeight={"bold"}>{"プロンプト"}</Text>
            <Textarea placeholder={"プロンプト"} />
          </Stack>
        </Card>
      </GridItem>
      <GridItem area={area.editorNegativePrompt}>
        <Card p={4} h={"100%"}>
          <Stack>
            <Text fontWeight={"bold"}>{"ネガティブ"}</Text>
            <Textarea placeholder={"プロンプト"} />
          </Stack>
        </Card>
      </GridItem>
      <GridItem area={area.histories}>
        <Card p={4} h={"100%"}>
          <Text fontWeight={"bold"}>{"生成履歴"}</Text>
        </Card>
      </GridItem>
    </Grid>
  )
}
