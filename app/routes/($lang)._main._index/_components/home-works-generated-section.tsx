import { config } from "@/config"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"
import type { homeQuery } from "@/routes/($lang)._main._index/_graphql/home-query"
import type { ResultOf } from "gql.tada"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  works: ResultOf<typeof homeQuery>["adWorks"]
}

/**
 * 生成された作品セクション
 */
export const HomeWorksGeneratedSection = (props: Props) => {
  const works = props.works

  const suggestedWorks = [...(works || [])]

  const shuffledWorks = suggestedWorks
    // .sort(() => 0.5 - Math.random())
    .slice(0, 16)

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
