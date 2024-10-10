import { AuthContext } from "~/contexts/auth-context"
import {
  HomeNovelsWorkListItemFragment,
  HomeNovelsWorksSection,
} from "~/routes/($lang)._main._index/components/home-novels-works-section"
import {
  HomeVideosWorkListItemFragment,
  HomeVideosWorksSection,
} from "~/routes/($lang)._main._index/components/home-video-works-section"
import {
  HomeWorkFragment,
  HomeWorkSection,
} from "~/routes/($lang)._main._index/components/home-work-section"
import { useQuery } from "@apollo/client/index"
import { graphql, type FragmentOf } from "gql.tada"
import { useContext } from "react"

type Props = {
  userId: string
  userLogin: string
  works: FragmentOf<typeof HomeWorkFragment>[]
  novelWorks: FragmentOf<typeof HomeNovelsWorkListItemFragment>[]
  columnWorks: FragmentOf<typeof HomeWorkFragment>[]
  videoWorks: FragmentOf<typeof HomeVideosWorkListItemFragment>[]
}

export function UserPortfolio(props: Props) {
  const authContext = useContext(AuthContext)

  // 人気画像作品
  const { data: workRes } = useQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        userId: props.userId,
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
    },
  })

  // 人気小説作品
  const { data: novelWorkRes } = useQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        userId: props.userId,
        workType: "NOVEL",
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
    },
  })

  // 人気コラム作品
  const { data: columnWorkRes } = useQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        userId: props.userId,
        workType: "COLUMN",
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
    },
  })

  // 人気動画作品
  const { data: videoWorkRes } = useQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        userId: props.userId,
        workType: "VIDEO",
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
    },
  })

  const works = workRes?.works ?? props.works

  const novelWorks = novelWorkRes?.works || props.novelWorks

  const columnWorks = columnWorkRes?.works || props.columnWorks

  const videoWorks = videoWorkRes?.works || props.videoWorks

  return (
    <div className="space-y-4">
      {works.length !== 0 && (
        <HomeWorkSection works={works} title={"人気作品"} isCropped={false} />
      )}
      {novelWorks.length !== 0 && (
        <HomeNovelsWorksSection
          works={novelWorks}
          title={"人気小説"}
          isCropped={false}
        />
      )}
      {columnWorks.length !== 0 && (
        <HomeNovelsWorksSection
          works={columnWorks}
          title={"人気コラム"}
          isCropped={false}
        />
      )}

      {videoWorks.length !== 0 && (
        <HomeVideosWorksSection
          works={videoWorks}
          title={"人気動画"}
          isCropped={false}
        />
      )}
    </div>
  )
}

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomeWork,
      ...HomeNovelsWorkListItem
      ...HomeVideosWorkListItem
    }
  }`,
  [
    HomeWorkFragment,
    HomeNovelsWorkListItemFragment,
    HomeVideosWorkListItemFragment,
  ],
)
