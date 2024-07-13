import { AuthContext } from "@/_contexts/auth-context"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { config } from "@/config"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useMemo } from "react"
import { useMediaQuery } from "usehooks-ts"

/**
 * 生成された作品セクション
 */
export const HomeWorksGeneratedSection = () => {
  const appContext = useContext(AuthContext)

  const createdAtAfter = useMemo(() => {
    return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toDateString()
  }, [])

  const randomIndex = useMemo(() => {
    return 0.5 - Math.random()
  }, [])

  const worksResult = useQuery(worksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: 40,
      where: {
        orderBy: "LIKES_COUNT",
        sort: "DESC",
        // 直近1か月の作品
        createdAtAfter: createdAtAfter,
        ratings: ["G"],
        isFeatured: true,
      },
    },
  })

  const works = worksResult.data?.works

  const shuffledWorks = useMemo(() => {
    const suggestedWorks = [...(works || [])]
    return suggestedWorks.sort(() => randomIndex).slice(0, 16)
  }, [works, randomIndex])

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <>
      <HomeWorkSection
        title={"作品を選んで無料生成"}
        works={shuffledWorks}
        link="https://www.aipictors.com/search/?promptstatus=2&order=favorite"
        isCropped={!isDesktop}
      />
    </>
  )
}

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
