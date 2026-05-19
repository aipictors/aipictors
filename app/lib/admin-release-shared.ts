export const tagOptions = ["メンテナンス", "お知らせ", "アップデート"] as const

export type ReleaseTag = (typeof tagOptions)[number]

export type ActionData = {
  error: string | null
  data: {
    id: string
    releaseUrl: string
    discordDelivered: boolean
    warning: string | null
  } | null
}

export const DEFAULT_TAG: ReleaseTag = "お知らせ"
export const DEFAULT_PLATFORM = "Web"