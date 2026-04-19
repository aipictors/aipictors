export type UserAvatarFramePassType =
  | "LITE"
  | "STANDARD"
  | "PREMIUM"
  | "TWO_DAYS"
  | null
  | undefined

export type UserAvatarFramePresentation = {
  frameType?: string | null
  backgroundStyle?: string | null
  borderPadding?: number | null
  overlayImageUrl?: string | null
}

const passRankMap: Record<string, number> = {
  LITE: 1,
  STANDARD: 2,
  PREMIUM: 3,
}

export const getUserAvatarFramePassRank = (
  passType: UserAvatarFramePassType,
) => {
  if (passType === null || passType === undefined) {
    return 0
  }

  return passRankMap[passType] ?? 0
}

export const canUseUserAvatarFrame = (
  currentPassType: UserAvatarFramePassType,
  requiredPassType: UserAvatarFramePassType,
) => {
  return getUserAvatarFramePassRank(currentPassType) >=
    getUserAvatarFramePassRank(requiredPassType)
}

export const toUserAvatarFramePassLabel = (
  passType: UserAvatarFramePassType,
) => {
  if (passType === "PREMIUM") {
    return "PREMIUM"
  }

  if (passType === "STANDARD") {
    return "STANDARD"
  }

  if (passType === "LITE") {
    return "LITE"
  }

  return "FREE"
}