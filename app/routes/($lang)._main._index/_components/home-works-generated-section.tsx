import {} from "@/_components/ui/tooltip"
import { AuthContext } from "@/_contexts/auth-context"
import { worksQuery } from "@/_graphql/queries/work/works"
import { config } from "@/config"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"
import { useSuspenseQuery } from "@apollo/client/index"
import { useContext } from "react"
import { useMediaQuery } from "usehooks-ts"

/**
 * 生成された作品セクション
 */
export const HomeWorksGeneratedSection = () => {
  const appContext = useContext(AuthContext)

  const worksResult = useSuspenseQuery(worksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: 40,
      where: {
        orderBy: "LIKES_COUNT",
        sort: "DESC",
        // 直近1か月の作品
        afterCreatedAt: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toDateString(),
        ratings: ["G"],
        isFeatured: true,
      },
    },
  })

  const works = worksResult.data?.works

  const suggestedWorks = [...(works || [])]

  const shuffledWorks = suggestedWorks
    .sort(() => 0.5 - Math.random())
    .slice(0, 16)

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <>
      <HomeWorkSection
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        title={"作品を選んで無料生成"}
        works={shuffledWorks}
        link="https://www.aipictors.com/search/?promptstatus=2&order=favorite"
        isCropped={!isDesktop}
      />
    </>
  )
}
