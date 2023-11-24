export const toLoraPrompt = (name: string, value: number) => {
  const text = [name, value].join(":")
  return `<lora:${text}>`
}
