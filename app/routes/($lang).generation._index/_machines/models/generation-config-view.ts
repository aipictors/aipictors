import { GenerationConfigState } from "@/routes/($lang).generation._index/_machines/models/generation-config-state"

export class GenerationConfig extends GenerationConfigState {
  get loraModelPromptTexts() {
    const promptText = this.promptText
    const regex = /<lora:[^>]+>/g
    const regExpMatchArray = promptText.match(regex)
    if (regExpMatchArray === null) {
      return []
    }
    return Array.from(regExpMatchArray).map((text: unknown) => {
      return (text as string).replace(/<lora:|>/g, "")
    }) as string[]
  }
}
