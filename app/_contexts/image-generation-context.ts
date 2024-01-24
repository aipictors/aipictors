import { imageGenerationMachine } from "@/app/_machines/image-generation-machine"
import { createActorContext } from "@xstate/react"

export const ImageGenerationContext = createActorContext(imageGenerationMachine)
