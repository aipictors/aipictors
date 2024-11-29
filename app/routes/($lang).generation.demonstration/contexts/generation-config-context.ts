import { generationConfigMachine } from "~/routes/($lang).generation.demonstration/machines/generation-config-machine"
import { createActorContext } from "@xstate/react"

export const GenerationConfigContext = createActorContext(
  generationConfigMachine,
)
