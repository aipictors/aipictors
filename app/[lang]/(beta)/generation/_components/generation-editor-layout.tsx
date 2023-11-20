"use client"

import { useBreakpointValue } from "@/app/_hooks/use-breakpoint-value"

type Props = {
  models: React.ReactNode
  loraModels: React.ReactNode
  promptEditor: React.ReactNode
  negativePromptEditor: React.ReactNode
  history: React.ReactNode
}

export const GenerationEditorLayout = (props: Props) => {
  const area = {
    models: "models",
    editorPrompt: "editor-prompt",
    history: "history",
    loraModels: "lora-models",
    editorNegativePrompt: "editor-negative-prompt",
  } as const

  const responsiveAreas = useBreakpointValue({
    base: [
      [area.models],
      [area.loraModels],
      [area.editorPrompt],
      [area.editorNegativePrompt],
      [area.history],
    ],
    lg: [
      [area.models, area.editorPrompt],
      [area.loraModels, area.editorNegativePrompt],
      [area.history, area.history],
    ],
    xl: [
      [
        area.models,
        area.models,
        area.editorPrompt,
        area.editorPrompt,
        area.editorPrompt,
        area.history,
        area.history,
      ],
      [
        area.loraModels,
        area.loraModels,
        area.editorNegativePrompt,
        area.editorNegativePrompt,
        area.editorNegativePrompt,
        area.history,
        area.history,
      ],
    ],
  })

  if (responsiveAreas === null) {
    return null
  }

  const templateAreas = responsiveAreas
    .map((row) => `"${row.join(" ")}"`)
    .join("\n")

  return (
    <main
      className="lg:h-main grid grid-cols-1 gap-2 w-full px-4 pb-4 lg:grid-rows-3 xl:grid-rows-2 lg:grid-cols-2 xl:grid-cols-7"
      style={{ gridTemplateAreas: templateAreas }}
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
        style={{ gridArea: area.history }}
        className="overflow-auto lg:overflow-hidden"
      >
        {props.history}
      </div>
    </main>
  )
}
