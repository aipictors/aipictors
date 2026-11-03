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

const getUserAvatarFramePassRank = (
  passType: UserAvatarFramePassType,
) => {
  if (passType === null || passType === undefined) {
    return 0
  }

  return passRankMap[passType] ?? 0
}

const canUseUserAvatarFrame = (
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

/** アイコンの外にはみ出す装飾（画像を重ねる） */
const USER_AVATAR_DECORATION_FRAME_TYPE = "DECORATION"

export const isUserAvatarDecoration = (
  frame: UserAvatarFramePresentation | null | undefined,
) => {
  return frame?.frameType === USER_AVATAR_DECORATION_FRAME_TYPE
}

/** 止まった絵（deco/x.webp）の URL から動く絵（deco/x.anim.webp）の URL を作る */
export const toUserAvatarDecorationAnimatedUrl = (url: string) => {
  return url.replace(/\.webp(?=$|\?)/, ".anim.webp")
}

export const USER_AVATAR_FRAME_CATEGORIES = [
  { key: "all", ja: "すべて", en: "All" },
  { key: "nature", ja: "自然", en: "Nature" },
  { key: "cute", ja: "かわいい", en: "Cute" },
  { key: "fantasy", ja: "ファンタジー", en: "Fantasy" },
  { key: "element", ja: "炎・氷・宇宙", en: "Elements" },
  { key: "cyber", ja: "サイバー", en: "Cyber" },
  { key: "wa", ja: "和", en: "Japanese" },
  { key: "creator", ja: "クリエイター", en: "Creator" },
  { key: "basic", ja: "シンプル", en: "Simple" },
] as const

export type UserAvatarFrameCategory =
  (typeof USER_AVATAR_FRAME_CATEGORIES)[number]["key"]

const DECORATION_SLUG_PATTERN = /^deco-([a-z]+)-/

/** 装飾の slug は deco-<分類>-<名前>。それ以外の枠はシンプルに入れる */
export const toUserAvatarFrameCategory = (
  slug: string,
): UserAvatarFrameCategory => {
  const key = slug.match(DECORATION_SLUG_PATTERN)?.[1]
  return (
    USER_AVATAR_FRAME_CATEGORIES.find((category) => category.key === key)
      ?.key ?? "basic"
  )
}

type UserAvatarFrameAccess = "AVAILABLE" | "NEEDS_PLAN" | "NEEDS_COINS"

type UserAvatarFrameAccessContext = {
  currentPassType: UserAvatarFramePassType
  ownedFrameIds: string[]
}

type UserAvatarFrameSaleInfo = {
  id: string
  requiredPassType: string
  priceCoins?: number | null
}

/**
 * コインの枠（priceCoins あり）は買った人だけ、サブスクの枠はそのプラン以上の間だけ使える
 */
export const toUserAvatarFrameAccess = (
  frame: UserAvatarFrameSaleInfo,
  context: UserAvatarFrameAccessContext,
): UserAvatarFrameAccess => {
  if (typeof frame.priceCoins === "number") {
    return context.ownedFrameIds.includes(frame.id)
      ? "AVAILABLE"
      : "NEEDS_COINS"
  }
  return canUseUserAvatarFrame(
    context.currentPassType,
    frame.requiredPassType as UserAvatarFramePassType,
  )
    ? "AVAILABLE"
    : "NEEDS_PLAN"
}

export type UserAvatarFrameKindFilter =
  | "ALL"
  | "SUBSCRIPTION"
  | "COIN"
  | "OWNED"

export const filterUserAvatarFrames = <
  T extends UserAvatarFrameSaleInfo & { slug: string },
>(
  frames: T[],
  filter: UserAvatarFrameAccessContext & {
    kind: UserAvatarFrameKindFilter
    category: UserAvatarFrameCategory
  },
) => {
  return frames.filter((frame) => {
    if (
      filter.category !== "all" &&
      toUserAvatarFrameCategory(frame.slug) !== filter.category
    ) {
      return false
    }
    const isCoinFrame = typeof frame.priceCoins === "number"
    if (filter.kind === "SUBSCRIPTION") return !isCoinFrame
    if (filter.kind === "COIN") return isCoinFrame
    if (filter.kind === "OWNED") {
      return toUserAvatarFrameAccess(frame, filter) === "AVAILABLE"
    }
    return true
  })
}
