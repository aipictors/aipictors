"use client"

import { Grid, GridItem, useBreakpointValue } from "@chakra-ui/react"

type Props = {
  models: React.ReactNode
  loraModels: React.ReactNode
  promptEditor: React.ReactNode
  negativePromptEditor: React.ReactNode
  histories: React.ReactNode
}

export const GenerationEditorLayout = (props: Props) => {
  const area = {
    models: "models",
    editorPrompt: "editor-prompt",
    histories: "histories",
    loraModels: "lora-models",
    editorNegativePrompt: "editor-negative-prompt",
  } as const

  const responsiveAreas = useBreakpointValue({
    base: [
      [area.models],
      [area.loraModels],
      [area.editorPrompt],
      [area.editorNegativePrompt],
      [area.histories],
    ],
    lg: [
      [area.models, area.editorPrompt],
      [area.loraModels, area.editorNegativePrompt],
      [area.histories, area.histories],
    ],
    xl: [
      [
        area.models,
        area.models,
        area.editorPrompt,
        area.editorPrompt,
        area.editorPrompt,
        area.histories,
        area.histories,
      ],
      [
        area.loraModels,
        area.loraModels,
        area.editorNegativePrompt,
        area.editorNegativePrompt,
        area.editorNegativePrompt,
        area.histories,
        area.histories,
      ],
    ],
  })

  if (responsiveAreas === undefined) {
    return null
  }

  const templateAreas = responsiveAreas
    .map((row) => `"${row.join(" ")}"`)
    .join("\n")

  return (
    <Grid
      as={"main"}
      templateAreas={templateAreas}
      gridTemplateRows={{
        base: "auto auto auto auto auto",
        lg: "1fr 1fr 1fr",
        xl: "1fr 1fr",
      }}
      gridTemplateColumns={{
        base: "1fr",
        lg: "1fr 1fr",
        xl: "1fr 1fr 1fr 1fr 1fr 1fr 1fr",
      }}
      w={"100%"}
      gap={2}
      h={{ base: "auto", lg: "calc(100svh - 72px)" }}
      px={4}
      pb={4}
      overflowY={"auto"}
    >
      <GridItem area={area.models} overflow={{ base: "auto", lg: "hidden" }}>
        {props.models}
      </GridItem>
      <GridItem
        area={area.loraModels}
        overflow={{ base: "auto", lg: "hidden" }}
      >
        {props.loraModels}
      </GridItem>
      <GridItem
        area={area.editorPrompt}
        overflow={{ base: "auto", lg: "hidden" }}
      >
        {props.promptEditor}
      </GridItem>
      <GridItem
        area={area.editorNegativePrompt}
        overflow={{ base: "auto", lg: "hidden" }}
      >
        {props.negativePromptEditor}
      </GridItem>
      <GridItem area={area.histories} overflow={{ base: "auto", lg: "hidden" }}>
        {props.histories}
      </GridItem>
    </Grid>
  )
}
