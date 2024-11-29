export const getDefaultNegativePrompt = (modelType: string) => {
  if (modelType === "SD1") {
    return "EasyNegative"
  }
  if (modelType === "SD2") {
    return "Mayng"
  }
  if (modelType === "SDXL") {
    return "negativeXL_D"
  }
  if (modelType === "FLUX") {
    return "negativeXL_D"
  }
  return "EasyNegative"
}
