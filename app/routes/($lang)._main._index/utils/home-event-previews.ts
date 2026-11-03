import type { HomePreviewEvent } from "~/routes/($lang)._main._index/components/home-event-preview-list"

/** HomeQuery の appEvents の 1 件 */
export type OfficialHomeEventSource = {
  id: string
  slug: string
  title: string
  thumbnailImageUrl: string
  status: string
  startAt: number
  endAt: number
  tag?: string | null
  worksCount?: number | null
}

/** HomeQuery の userEvents の 1 件 */
export type UserHomeEventSource = {
  id: string
  slug: string
  title: string
  thumbnailImageUrl?: string | null
  headerImageUrl?: string | null
  status: string
  startAt: number
  endAt: number
  mainTag: string
  tags?: string[] | null
  rankingEnabled: boolean
  entryCount: number
  participantCount: number
  userIconUrl?: string | null
  userName: string
}

export const normalizeOfficialHomePreviewEvent = (event: OfficialHomeEventSource): HomePreviewEvent => ({
  id: event.id,
  slug: event.slug,
  title: event.title,
  thumbnailImageUrl: event.thumbnailImageUrl,
  status: event.status,
  startAt: event.startAt,
  endAt: event.endAt,
  isOfficial: true,
  rankingEnabled: false,
  entryCount: event.worksCount ?? 0,
  participantCount: 0,
  tags: event.tag ? [event.tag] : [],
  userIconUrl: null,
  userName: "Aipictors",
})

export const normalizeUserHomePreviewEvent = (event: UserHomeEventSource): HomePreviewEvent => ({
  id: event.id,
  slug: event.slug,
  title: event.title,
  thumbnailImageUrl:
    event.thumbnailImageUrl || event.headerImageUrl || "/images/opepnepe.png",
  status: event.status,
  startAt: event.startAt,
  endAt: event.endAt,
  isOfficial: false,
  rankingEnabled: event.rankingEnabled,
  entryCount: event.entryCount,
  participantCount: event.participantCount,
  tags: [event.mainTag, ...(event.tags ?? [])].filter(Boolean),
  userIconUrl: event.userIconUrl ?? null,
  userName: event.userName,
})

export const shuffleArray = <T,>(items: T[]) => {
  const copied = [...items]

  for (let index = copied.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[copied[index], copied[randomIndex]] = [copied[randomIndex], copied[index]]
  }

  return copied
}

export const isHomePreviewTargetStatus = (status: string) => {
  return status === "ONGOING" || status === "UPCOMING"
}

export const buildHomeEventPreviews = (
  officialEvents: OfficialHomeEventSource[],
  userEvents: UserHomeEventSource[],
) => {
  return shuffleArray([
    ...officialEvents
      .filter((event) => isHomePreviewTargetStatus(event.status))
      .map(normalizeOfficialHomePreviewEvent),
    ...userEvents
      .filter((event) => isHomePreviewTargetStatus(event.status))
      .map(normalizeUserHomePreviewEvent),
  ])
}
