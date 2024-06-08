import {} from "@/_components/ui/tooltip"
import { AuthContext } from "@/_contexts/auth-context"
import { worksQuery } from "@/_graphql/queries/work/works"
import { HomeWorkDummies } from "@/routes/($lang)._main._index/_components/home-work-dummies"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"
import { useSuspenseQuery } from "@apollo/client/index"
import { useContext } from "react"

/**
 * ユーザからの推薦作品
 */
export const HomeWorksUsersRecommendedSection = () => {
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

  const suggestedWorks = recommendedWorksResp?.works ?? []

  const sections = [
    {
      title: "ユーザからの推薦",
      works: suggestedWorks,
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
