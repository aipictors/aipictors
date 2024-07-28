export type Props = {
  taskId: string
  token: string
  imageUrl: string
  userNanoid: string | null
  configSeed: number
  configSteps: number
  configSampler: string
  configScale: number
  configSizeType: string
  configModel: string | null
  configVae: string | null
  configClipSkip: number
  maskBase64: string
  onClose(): void
}
