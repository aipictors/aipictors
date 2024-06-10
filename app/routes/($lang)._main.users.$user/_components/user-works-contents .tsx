import { ResponsivePagination } from "@/_components/responsive-pagination"
import { AuthContext } from "@/_contexts/auth-context"
import { worksQuery } from "@/_graphql/queries/work/works"
import { worksCountQuery } from "@/_graphql/queries/work/works-count"
import { HomeNovelsWorksSection } from "@/routes/($lang)._main._index/_components/home-novels-works-section"
import { HomeVideosWorksSection } from "@/routes/($lang)._main._index/_components/home-video-works-section"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"
import { useSuspenseQuery } from "@apollo/client/index"
import { useContext } from "react"

type Props = {
  page: number
  setPage(page: number): void
  userId: string
  workType: "NOVEL" | "COLUMN" | "VIDEO" | "WORK"
}

export const UserWorksContents = (props: Props) => {
  const authContext = useContext(AuthContext)

  const { data: workRes } = useSuspenseQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        userId: props.userId,
        ratings: ["G", "R15", "R18", "R18G"],
        orderBy: "DATE_CREATED",
        workType: props.workType,
      },
    },
  })

  const worksCountResp = useSuspenseQuery(worksCountQuery, {
    skip: authContext.isLoading,
    variables: {
      where: {
        userId: authContext.userId,
        ratings: ["G", "R15", "R18", "R18G"],
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
      <div className="mt-1 mb-1">
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
