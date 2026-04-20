export type VideoUploadPassType = "LITE" | "STANDARD" | "PREMIUM" | null | undefined

export const isSubscribedVideoUploader = (
  passType: VideoUploadPassType,
) => {
  return passType === "LITE" || passType === "STANDARD" || passType === "PREMIUM"
}

export const getVideoUploadLimits = (passType: VideoUploadPassType) => {
  const isSubscribed = isSubscribedVideoUploader(passType)

  return {
    isSubscribed,
    maxDurationSeconds: isSubscribed ? 60 : 30,
    dailyTotalDurationSeconds: isSubscribed ? 180 : 60,
  }
}