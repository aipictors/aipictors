import { ImageGenerationState } from "@/app/[lang]/generation/_machines/models/image-generation-state"

export class ImageGenerationEditorView extends ImageGenerationState {
  /**
   * 生成可能な枚数
   */
  get getLoraModels() {
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
