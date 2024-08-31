import { ResponsivePagination } from "~/components/responsive-pagination"
import { AuthContext } from "~/contexts/auth-context"
import { HomeNovelsWorksSection } from "~/routes/($lang)._main._index/components/home-novels-works-section"
import { HomeVideosWorksSection } from "~/routes/($lang)._main._index/components/home-video-works-section"
import {
  HomeWorkFragment,
  HomeWorkSection,
} from "~/routes/($lang)._main._index/components/home-work-section"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"

type Props = {
  page: number
  setPage(page: number): void
  userId: string
  workType: "NOVEL" | "COLUMN" | "VIDEO" | "WORK"
  isSensitive?: boolean
}

export function UserWorksContents(props: Props) {
  const authContext = useContext(AuthContext)

  const { data: workRes } = useSuspenseQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        userId: props.userId,
        isNowCreatedAt: true,
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        isSensitive: props.isSensitive,
        orderBy: "DATE_CREATED",
        workType: props.workType,
      },
    },
  })

  const worksCountResp = useSuspenseQuery(worksCountQuery, {
    skip: authContext.isLoading,
    variables: {
      where: {
        userId: props.userId,
        isNowCreatedAt: true,
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        isSensitive: props.isSensitive,
        workType: props.workType,
      },
    },
  })

  const works = workRes?.works ?? []

  const maxCount = worksCountResp.data?.worksCount ?? 0

  return (
    <>
      {props.workType === "WORK" && <HomeWorkSection title="" works={works} />}
      {props.workType === "VIDEO" && (
        <HomeVideosWorksSection title="" works={works} />
      )}
      {(props.workType === "NOVEL" || props.workType === "COLUMN") && (
        <HomeNovelsWorksSection isCropped={true} title="" works={works} />
      )}
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <ResponsivePagination
          perPage={32}
          maxCount={maxCount}
          currentPage={props.page}
          onPageChange={(page: number) => {
            props.setPage(page)
          }}
        />
      </div>
    </>
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
      ...HomeWork
    }
  }`,
  [HomeWorkFragment],
)
