export type Props = {
  taskId: string
  token: string
  fileName: string
  userNanoid: string | null
  configSeed: number
  configSteps: number
  configSampler: string
  configScale: number
  configSizeType: string
  configModel: string | null
  configVae: string | null
  configClipSkip: number
  onClose(): void
}
