import { useBreakpointValue } from "@chakra-ui/react"

export const useImageGenerationAreas = () => {
  const area = {
    models: "models",
    editorPrompt: "editor-prompt",
    histories: "histories",
    loraModels: "lora-models",
    editorNegativePrompt: "editor-negative-prompt",
  }

  return useBreakpointValue({
    base: [
      [area.models],
      [area.loraModels],
      [area.editorPrompt],
      [area.editorNegativePrompt],
      [area.histories],
    ],
    md: [
      [area.models, area.editorPrompt],
      [area.loraModels, area.editorNegativePrompt],
      [area.histories, area.histories],
    ],
    xl: [
      [area.models, area.editorPrompt, area.histories],
      [area.loraModels, area.editorNegativePrompt, area.histories],
    ],
  })
}
