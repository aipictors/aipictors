import {} from "@/_components/ui/tooltip"
import { AuthContext } from "@/_contexts/auth-context"
import { worksQuery } from "@/_graphql/queries/work/works"
import { HomeWorkDummies } from "@/routes/($lang)._main._index/_components/home-work-dummies"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"
import { useSuspenseQuery } from "@apollo/client/index"
import { useContext } from "react"

export const HomeWorksWithLoggedIn = () => {
  const appContext = useContext(AuthContext)

  if (appContext.isLoading) {
    return (
      <>
        <HomeWorkDummies />
        <HomeWorkDummies />
      </>
    )
  }

  if (appContext.isNotLoggedIn) {
    return null
  }

  // おすすめ作品
  const { data: suggestedWorkResp } = useSuspenseQuery(worksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: 80,
      where: {
        ratings: ["G"],
      },
    },
  })

  // 推薦作品
  const { data: recommendedWorksResp } = useSuspenseQuery(worksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: 80,
      where: {
        isRecommended: true,
        ratings: ["G"],
      },
    },
  })

  const suggestedWorks = [...(suggestedWorkResp?.works || [])]
    .sort(() => 0.5 - Math.random())
    .slice(0, 16)

  const recommendedWorks = [...(recommendedWorksResp?.works || [])]
    .sort(() => 0.5 - Math.random())
    .slice(0, 16)

  const sections = [
    // ランダムに24作品
    { title: "おすすめ", works: suggestedWorks, tooltip: "" },
    {
      title: "ユーザからの推薦",
      works: recommendedWorks,
      tooltip: "",
    },
  ]

  return (
    <>
      {sections.map((section) => (
        <HomeWorkSection
          key={section.title}
          title={section.title}
          tooltip={section.tooltip ? section.tooltip : undefined}
          works={section.works ?? null}
        />
      ))}
    </>
  )
}
