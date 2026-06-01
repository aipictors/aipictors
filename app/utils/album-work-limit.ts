import type { IntrospectionEnum } from "~/lib/introspection-enum"

export type AlbumWorkLimitPassType =
  | IntrospectionEnum<"PassType">
  | "TWO_DAYS"
  | null
  | undefined

export const FREE_ALBUM_WORKS_LIMIT = 48
export const LITE_ALBUM_WORKS_LIMIT = 96
export const STANDARD_ALBUM_WORKS_LIMIT = 120

export function getAlbumWorksLimit(passType: AlbumWorkLimitPassType) {
  if (passType === "STANDARD" || passType === "PREMIUM") {
    return STANDARD_ALBUM_WORKS_LIMIT
  }

  if (passType === "LITE" || passType === "TWO_DAYS") {
    return LITE_ALBUM_WORKS_LIMIT
  }

  return FREE_ALBUM_WORKS_LIMIT
}

export function getAlbumWorksLimitUpgradeTarget(
  passType: AlbumWorkLimitPassType,
) {
  if (passType === "STANDARD" || passType === "PREMIUM") {
    return null
  }

  if (passType === "LITE" || passType === "TWO_DAYS") {
    return {
      passType: "STANDARD" as const,
      limit: STANDARD_ALBUM_WORKS_LIMIT,
    }
  }

  return {
    passType: "LITE" as const,
    limit: LITE_ALBUM_WORKS_LIMIT,
  }
}
