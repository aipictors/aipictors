type SensitiveProfileLike =
  | {
      headerImageUrl?: string | null
      biography?: string | null
      links?: string[] | null
    }
  | null
  | undefined

/**
 * R18 用のプロフィールに出すもの（ヘッダー・紹介・リンク）が 1 つでもあるか
 * 全部消したあとも行は残ることがあるので、null かどうかだけでは決めない
 */
export const toHasSensitiveProfile = (profile: SensitiveProfileLike) => {
  if (!profile) return false
  return Boolean(
    profile.headerImageUrl ||
      profile.biography?.trim() ||
      (profile.links?.length ?? 0) > 0,
  )
}
