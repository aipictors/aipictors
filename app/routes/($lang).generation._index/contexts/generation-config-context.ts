import { createActorContext } from "@xstate/react"
import { generationConfigMachine } from "~/routes/($lang).generation._index/machines/generation-config-machine"

export const GenerationConfigContext = createActorContext(
  generationConfigMachine,
)
