import type { EventUserLink } from "@/[lang]/events/_types/event-user-link"
import type { EventUserType } from "@/[lang]/events/_types/event-user-type"

export type EventUser = {
  name: string
  types: EventUserType[]
  message: string | null
  aipictorsId: string | null
  twitterId: string | null
  iconImageURL: string
  siteURL: string | null
  siteTitle: string | null
  links: EventUserLink[]
}
