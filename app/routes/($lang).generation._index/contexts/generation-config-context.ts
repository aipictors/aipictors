import { generationConfigMachine } from "~/routes/($lang).generation._index/machines/generation-config-machine"
import { createActorContext } from "@xstate/react"

export const GenerationConfigContext = createActorContext(
  generationConfigMachine,
)
