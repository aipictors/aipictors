type DroppedImageFilesPayload = {
  files: File[]
  createdAt: number
}

let payload: DroppedImageFilesPayload | null = null

export function stashDroppedImageFiles(files: File[]): void {
  payload = { files, createdAt: Date.now() }
}

export function consumeDroppedImageFiles(options?: {
  maxAgeMs?: number
}): File[] {
  const maxAgeMs = options?.maxAgeMs ?? 5 * 60 * 1000

  const currentPayload = payload
  payload = null

  if (!currentPayload) return []
  if (Date.now() - currentPayload.createdAt > maxAgeMs) return []

  return currentPayload.files
}
