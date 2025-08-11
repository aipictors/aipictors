import type { FragmentOf } from "gql.tada"
import type { WorkType, WorkItem } from "../types/works"
import { HomeWorkSection, type HomeWorkFragment } from "./home-work-section"
import {
  HomeNovelsWorksSection,
  type HomeNovelsWorkListItemFragment,
} from "./home-novels-works-section"
import {
  HomeVideosWorksSection,
  type HomeVideosWorkListItemFragment,
} from "./home-video-works-section"

interface Props {
  workType: WorkType | null
  works: WorkItem[]
  isCropped?: boolean
  onSelect?: (index: string) => void
}

export function WorksRenderer({ workType, works, isCropped, onSelect }: Props) {
  if (workType === "NOVEL" || workType === "COLUMN") {
    return (
      <HomeNovelsWorksSection
        title=""
        onSelect={onSelect}
        works={works as FragmentOf<typeof HomeNovelsWorkListItemFragment>[]}
      />
    )
  }

  if (workType === "VIDEO") {
    return (
      <HomeVideosWorksSection
        title=""
        onSelect={onSelect}
        works={works as FragmentOf<typeof HomeVideosWorkListItemFragment>[]}
        isAutoPlay
      />
    )
  }

  return (
    <HomeWorkSection
      title=""
      works={works as FragmentOf<typeof HomeWorkFragment>[]}
      isCropped={isCropped}
      isShowProfile
      onSelect={onSelect}
    />
  )
}
