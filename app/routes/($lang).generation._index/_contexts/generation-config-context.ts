import { generationConfigMachine } from "@/[lang]/generation/_machines/generation-config-machine"
import { createActorContext } from "@xstate/react"

export const GenerationConfigContext = createActorContext(
  generationConfigMachine,
)
