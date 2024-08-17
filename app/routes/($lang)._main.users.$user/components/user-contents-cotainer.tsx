import { AuthContext } from "~/contexts/auth-context"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { HomeNovelsWorksSection } from "~/routes/($lang)._main._index/components/home-novels-works-section"
import { HomeVideosWorksSection } from "~/routes/($lang)._main._index/components/home-video-works-section"
import { HomeWorkSection } from "~/routes/($lang)._main._index/components/home-work-section"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"

type Props = {
  userId: string
  userLogin: string
  isSensitive?: boolean
}

export function UserContentsContainer(props: Props) {
  const authContext = useContext(AuthContext)

  // 人気画像作品
  const { data: workRes } = useSuspenseQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        userId: props.userId,
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isSensitive: props.isSensitive,
      },
    },
  })

  const worksCountResp = useSuspenseQuery(worksCountQuery, {
    skip: authContext.isLoading,
    variables: {
      where: {
        userId: authContext.userId,
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        isSensitive: props.isSensitive,
      },
    },
  })

  // 人気小説作品
  const { data: novelWorkRes } = useSuspenseQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        userId: props.userId,
        workType: "NOVEL",
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isSensitive: props.isSensitive,
      },
    },
  })

  const novelWorksCountResp = useSuspenseQuery(worksCountQuery, {
    skip: authContext.isLoading,
    variables: {
      where: {
        workType: "NOVEL",
        userId: authContext.userId,
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        isSensitive: props.isSensitive,
      },
    },
  })

  // 人気コラム作品
  const { data: columnWorkRes } = useSuspenseQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        userId: props.userId,
        workType: "COLUMN",
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isSensitive: props.isSensitive,
      },
    },
  })

  const columnWorksCountResp = useSuspenseQuery(worksCountQuery, {
    skip: authContext.isLoading,
    variables: {
      where: {
        workType: "COLUMN",
        userId: authContext.userId,
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        isSensitive: props.isSensitive,
      },
    },
  })

  // 人気動画作品
  const { data: videoWorkRes } = useSuspenseQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        userId: props.userId,
        workType: "VIDEO",
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isSensitive: props.isSensitive,
      },
    },
  })

  const videoWorksCountResp = useSuspenseQuery(worksCountQuery, {
    skip: authContext.isLoading,
    variables: {
      where: {
        workType: "VIDEO",
        userId: authContext.userId,
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        isSensitive: props.isSensitive,
      },
    },
  })

  const works = [...(workRes?.works || [])]

  const novelWorks = [...(novelWorkRes?.works || [])]

  const columnWorks = [...(columnWorkRes?.works || [])]

  const videoWorks = [...(videoWorkRes?.works || [])]

  return (
    <div className="space-y-4">
      {worksCountResp.data?.worksCount !== 0 && (
        <HomeWorkSection works={works} title={"人気作品"} isCropped={false} />
      )}
      {novelWorksCountResp.data?.worksCount !== 0 && (
        <HomeNovelsWorksSection
          works={novelWorks}
          title={"人気小説"}
          isCropped={false}
        />
      )}
      {columnWorksCountResp.data?.worksCount !== 0 && (
        <HomeNovelsWorksSection
          works={columnWorks}
          title={"人気コラム"}
          isCropped={false}
        />
      )}

      {videoWorksCountResp.data?.worksCount !== 0 && (
        <HomeVideosWorksSection
          works={videoWorks}
          title={"人気動画"}
          isCropped={false}
        />
      )}
    </div>
  )
}

const worksCountQuery = graphql(
  `query WorksCount($where: WorksWhereInput) {
    worksCount(where: $where)
  }`,
)

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
