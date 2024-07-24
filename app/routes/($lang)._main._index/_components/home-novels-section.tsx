import { AuthContext } from "@/_contexts/auth-context"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { HomeNovelsWorksSection } from "@/routes/($lang)._main._index/_components/home-novels-works-section"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"

type Props = {
  title: string
  isSensitive?: boolean
}

/**
 * 小説作品一覧
 */
export const HomeNovelsSection = (props: Props) => {
  const authContext = useContext(AuthContext)

  const { data: novelWorks } = useQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 64,
      where: {
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        workType: "NOVEL",
      },
    },
  })

  const workList = novelWorks?.works ?? null

  if (workList === null) {
    return null
  }

  // const workResults = workList.map((work) => ({
  //   id: work.id,
  //   src: work.smallThumbnailImageURL,
  //   width: work.smallThumbnailImageWidth,
  //   height: work.smallThumbnailImageHeight,
  //   workId: work.id,
  //   thumbnailImagePosition: work.thumbnailImagePosition,
  //   userId: work.user.id,
  //   userIcon: work.user.iconUrl,
  //   userName: work.user.name,
  //   title: work.title,
  //   isLiked: work.isLiked,
  //   text: work.description,
  //   tags: work.tags.map((tag) => tag.name).slice(0, 2),
  // }))

  // ランダムに24作品を選ぶ
  const works = workList.filter((_, index) => index % 2 === 0)

  return <HomeNovelsWorksSection works={works} title={props.title} />
}

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
