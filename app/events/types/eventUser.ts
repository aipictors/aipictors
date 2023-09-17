import type { EventUserLink } from "app/events/types/eventUserLink"
import type { EventUserType } from "app/events/types/eventUserType"

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
