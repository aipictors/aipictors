import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { FragmentOf } from "gql.tada"
import type { HomeWorkFragment } from "../components/home-work-section"
import type { HomeNovelsWorkListItemFragment } from "../components/home-novels-works-section"
import type { HomeVideosWorkListItemFragment } from "../components/home-video-works-section"

export type WorkType = IntrospectionEnum<"WorkType">
export type WorkOrderBy = IntrospectionEnum<"WorkOrderBy">
export type ImageStyle = IntrospectionEnum<"ImageStyle">

export interface WorksWhereInput {
  ratings?: string[]
  workType?: WorkType
  hasPrompt?: boolean
  isPromptPublic?: boolean
  orderBy?: WorkOrderBy
  style?: ImageStyle
  isNowCreatedAt?: boolean
  createdAtAfter?: string
  beforeCreatedAt?: string
  isOneWorkPerUser?: boolean
  search?: string
  prompt?: string
  hasEmbedding?: boolean
  isAnimationWork?: boolean
  isPublicFanbox?: boolean
}

export type WorkItem = {
  id: string
  [key: string]: string | number | boolean | null | undefined | object
} & FragmentOf<
  | typeof HomeWorkFragment
  | typeof HomeNovelsWorkListItemFragment
  | typeof HomeVideosWorkListItemFragment
>
