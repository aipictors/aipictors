import {} from "@/_components/ui/tooltip"
import { AuthContext } from "@/_contexts/auth-context"
import { worksQuery } from "@/_graphql/queries/work/works"
import { HomeWorkDummies } from "@/routes/($lang)._main._index/_components/home-work-dummies"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"
import { useSuspenseQuery } from "@apollo/client/index"
import { useContext } from "react"

export const HomeWorks = () => {
  const appContext = useContext(AuthContext)

  if (appContext.isLoading) {
    return (
      <>
        <HomeWorkDummies />
        <HomeWorkDummies />
      </>
    )
  }

  // おすすめ作品
  const { data: suggestedWorkResp } = useSuspenseQuery(worksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: 16,
      where: {},
    },
  })

  // 推薦作品
  const { data: recommendedWorksResp } = useSuspenseQuery(worksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        isRecommended: true,
      },
    },
  })

  const sections = [
    // {
    //   title: "無料生成できる作品",
    //   tooltip: "無料画像生成で参考にできる作品です。",
    //   works: data.generationWorkResp,
    // },
    { title: "おすすめ", works: suggestedWorkResp?.works, tooltip: "" },
    {
      title: "ユーザからの推薦",
      works: recommendedWorksResp?.works,
      tooltip: "",
    },
    // { title: "コレクション", works: data.suggestedWorkResp },
    // { title: "人気タグ", works: data.suggestedWorkResp },
    // { title: "ショート動画", works: data.suggestedWorkResp },
    // { title: "小説", works: data.suggestedWorkResp },
    // { title: "コラム", works: data.suggestedWorkResp },
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
