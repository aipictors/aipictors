/**
 * LoRAのプロンプトテキストを生成する
 * @param name
 * @param value
 * @returns
 */
export const toLoraPromptText = (name: string, value: number) => {
  const text = [name, value].join(":")
  return `<lora:${text}>`
}
