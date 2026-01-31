import bytes from "bytes"

export const MAX_IMAGE_FILE_SIZE_BYTES: number = 32 * 1024 * 1024
export const MAX_VIDEO_FILE_SIZE_BYTES: number = 32 * 1024 * 1024

export const formatFileSize = (sizeInBytes: number): string => {
  return bytes.format(sizeInBytes, { unitSeparator: "", decimalPlaces: 0 })
}
