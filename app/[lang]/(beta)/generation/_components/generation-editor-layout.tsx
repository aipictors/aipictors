"use client"

import { useBreakpointValue } from "@/app/_hooks/use-breakpoint-value"

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
    <main
      className="grid grid-cols-1 gap-2 w-full h-auto px-4 pb-4 overflow-y-auto lg:grid-rows-3 xl:grid-rows-2 lg:grid-cols-2 xl:grid-cols-7 "
      style={{
        gridTemplateAreas: templateAreas,
      }}
    >
      <div
        style={{ gridArea: area.models }}
        className="overflow-auto lg:overflow-hidden"
      >
        {props.models}
      </div>
      <div
        style={{ gridArea: area.loraModels }}
        className="overflow-auto lg:overflow-hidden"
      >
        {props.loraModels}
      </div>
      <div
        style={{ gridArea: area.editorPrompt }}
        className="overflow-auto lg:overflow-hidden"
      >
        {props.promptEditor}
      </div>
      <div
        style={{ gridArea: area.editorNegativePrompt }}
        className="overflow-auto lg:overflow-hidden"
      >
        {props.negativePromptEditor}
      </div>
      <div
        style={{ gridArea: area.histories }}
        className="overflow-auto lg:overflow-hidden"
      >
        {props.histories}
      </div>
    </main>
  )
}
