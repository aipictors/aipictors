import { GenerationConfigState } from "@/app/[lang]/generation/_machines/models/generation-config-state"

export class GenerationConfig extends GenerationConfigState {
  get loraModelPromptTexts() {
    const promptText = this.promptText
    const regex = /<lora:[^>]+>/g
    const regExpMatchArray = promptText.match(regex)
    if (regExpMatchArray === null) {
      return []
    }
    return Array.from(regExpMatchArray).map((text) => {
      return text.replace(/<lora:|>/g, "")
    })
  }
}
