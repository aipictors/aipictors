import { AuthContext } from "@/_contexts/auth-context"
import { worksQuery } from "@/_graphql/queries/work/works"
import { worksCountQuery } from "@/_graphql/queries/work/works-count"
import { config } from "@/config"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"
import { useSuspenseQuery } from "@apollo/client/index"
import { useContext } from "react"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  userId: string
  userLogin: string
}

export const UserContentsContainer = (props: Props) => {
  const authContext = useContext(AuthContext)

  const { data: workRes } = useSuspenseQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        userId: props.userId,
        ratings: ["G", "R15", "R18", "R18G"],
      },
    },
  })

  const worksCountResp = useSuspenseQuery(worksCountQuery, {
    skip: authContext.isLoading,
    variables: {
      where: {
        userId: authContext.userId,
        ratings: ["G", "R15", "R18", "R18G"],
      },
    },
  })

  const works = [...(workRes?.works || [])]

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <HomeWorkSection
      works={works}
      title={`作品(${worksCountResp.data?.worksCount})`}
      isCropped={!isDesktop}
      link={`/users${props.userLogin}/works`}
    />
  )
}
