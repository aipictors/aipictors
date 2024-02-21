import { imageGenerationMachine } from "@/app/[lang]/generation/_machines/image-generation-machine"
import { createActorContext } from "@xstate/react"

export const GenerationEditorContext = createActorContext(
  imageGenerationMachine,
)
