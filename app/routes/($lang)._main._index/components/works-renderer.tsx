import type { FragmentOf } from "gql.tada"
import type { WorkItem, WorkType } from "../types/works"
import {
  type HomeNovelsWorkListItemFragment,
  HomeNovelsWorksSection,
} from "./home-novels-works-section"
import {
  type HomeVideosWorkListItemFragment,
  HomeVideosWorksSection,
} from "./home-video-works-section"
import { type HomeWorkFragment, HomeWorkSection } from "./home-work-section"

interface Props {
  workType: WorkType | null
  works: WorkItem[]
  isCropped?: boolean
  autoPlayVideoPreview?: boolean
  onSelect?: (index: string) => void
}

export function WorksRenderer({
  workType,
  works,
  isCropped,
  autoPlayVideoPreview,
  onSelect,
}: Props) {
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
      autoPlayVideoPreview={autoPlayVideoPreview}
      onSelect={onSelect}
    />
  )
}
