import { AuthContext } from "@/_contexts/auth-context"
import { worksQuery } from "@/_graphql/queries/work/works"
import { config } from "@/config"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"
import { useQuery } from "@apollo/client/index"
import { useContext } from "react"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  isSensitive?: boolean
}

/**
 * ユーザからの推薦作品
 */
export const HomeWorksUsersRecommendedSection = (props: Props) => {
  const appContext = useContext(AuthContext)

  // 推薦作品
  const { data: recommendedWorksResp } = useQuery(worksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: 80,
      where: {
        isRecommended: true,
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G"],
      },
    },
  })

  const suggestedWorks = recommendedWorksResp?.works ?? []

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <>
      <HomeWorkSection
        title={"ユーザからの推薦"}
        works={suggestedWorks}
        isCropped={!isDesktop}
      />
    </>
  )
}
