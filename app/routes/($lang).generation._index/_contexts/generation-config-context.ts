import { generationConfigMachine } from "@/routes/($lang).generation._index/_machines/generation-config-machine"
import { createActorContext } from "@xstate/react"

export const GenerationConfigContext = createActorContext(
  generationConfigMachine,
)
