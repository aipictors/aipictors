"use client"

import { useBreakpointValue } from "@/app/_hooks/use-breakpoint-value"

type Props = {
  config: React.ReactNode
  promptEditor: React.ReactNode
  negativePromptEditor: React.ReactNode
  history: React.ReactNode
}

export const GenerationEditorLayout = (props: Props) => {
  const area = {
    config: "config",
    editorPrompt: "editor-prompt",
    history: "history",
    editorNegativePrompt: "editor-negative-prompt",
  } as const

  const responsiveAreas = useBreakpointValue({
    base: [
      [area.config],
      [area.editorPrompt],
      [area.editorNegativePrompt],
      [area.history],
    ],
    // lg: [
    //   [area.models, area.editorPrompt],
    //   [area.loraModels, area.editorNegativePrompt],
    //   [area.history, area.history],
    // ],
    // lg: [
    //   [
    //     area.config,
    //     area.config,
    //     area.config,
    //     area.editorPrompt,
    //     area.editorPrompt,
    //     area.history,
    //     area.history,
    //   ],
    //   [
    //     area.config,
    //     area.config,
    //     area.config,
    //     area.editorPrompt,
    //     area.editorPrompt,
    //     area.history,
    //     area.history,
    //   ],
    //   [
    //     area.config,
    //     area.config,
    //     area.config,
    //     area.editorPrompt,
    //     area.editorPrompt,
    //     area.history,
    //     area.history,
    //   ],
    //   [
    //     area.config,
    //     area.config,
    //     area.config,
    //     area.editorNegativePrompt,
    //     area.editorNegativePrompt,
    //     area.history,
    //     area.history,
    //   ],
    //   [
    //     area.config,
    //     area.config,
    //     area.config,
    //     area.editorNegativePrompt,
    //     area.editorNegativePrompt,
    //     area.history,
    //     area.history,
    //   ],
    // ],
    lg: [
      [
        area.config,
        area.config,
        area.editorPrompt,
        area.editorPrompt,
        area.history,
        area.history,
        area.history,
      ],
      [
        area.config,
        area.config,
        area.editorPrompt,
        area.editorPrompt,
        area.history,
        area.history,
        area.history,
      ],
      [
        area.config,
        area.config,
        area.editorPrompt,
        area.editorPrompt,
        area.history,
        area.history,
        area.history,
      ],
      [
        area.config,
        area.config,
        area.editorNegativePrompt,
        area.editorNegativePrompt,
        area.history,
        area.history,
        area.history,
      ],
      [
        area.config,
        area.config,
        area.editorNegativePrompt,
        area.editorNegativePrompt,
        area.history,
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
      className="lg:h-main grid grid-cols-1 gap-2 w-full pb-4 lg:grid-rows-5 lg:grid-cols-7 overflow-x-hidden"
      style={{ gridTemplateAreas: templateAreas }}
    >
      <div
        style={{ gridArea: area.config }}
        className="overflow-auto lg:overflow-hidden"
      >
        {props.config}
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
