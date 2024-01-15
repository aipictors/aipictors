import { WorkArticle } from "@/app/[lang]/(main)/works/[work]/_components/work-article"
import { WorkCommentList } from "@/app/[lang]/(main)/works/[work]/_components/work-comment-list"
import { WorkRelatedWorkList } from "@/app/[lang]/(main)/works/[work]/_components/work-related-work-list"
import { createClient } from "@/app/_contexts/client"
import type {
  WorkCommentsQuery,
  WorkCommentsQueryVariables,
  WorkQuery,
  WorkQueryVariables,
} from "@/graphql/__generated__/graphql"
import { workQuery } from "@/graphql/queries/work/work"
import { workCommentsQuery } from "@/graphql/queries/work/work-comments"
import type { Metadata } from "next"

type Props = {
  params: { work: string }
}

const WorkPage = async (props: Props) => {
  const client = createClient()

  const workResp = await client.query<WorkQuery, WorkQueryVariables>({
    query: workQuery,
    variables: {
      id: props.params.work,
    },
  })

  const workCommentsResp = await client.query<
    WorkCommentsQuery,
    WorkCommentsQueryVariables
  >({
    query: workCommentsQuery,
    variables: {
      workId: props.params.work,
    },
  })

  if (workResp.data.work === null) return null
  if (workCommentsResp.data.work === null) return null

  return (
    <div className="px-4 w-full max-w-fit mx-auto">
      <div className="flex flex-col lg:flex-row items-start">
        <WorkArticle work={workResp.data.work} />
        {/* <div className="w-full lg:max-w-xs"> */}
        {/* <WorkUser
            userName={workQuery.data.work.user.name}
            userIconImageURL={workQuery.data.work.user.iconImage?.downloadURL}
            userFollowersCount={workQuery.data.work.user.followersCount}
            userBiography={workQuery.data.work.user.biography}
            userPromptonId={workQuery.data.work.user.promptonUser?.id}
            userWorksCount={workQuery.data.work.user.worksCount}
          /> */}
        {/* <p>{"前後の作品"}</p> */}
        {/* </div> */}
      </div>
      <WorkCommentList work={workCommentsResp.data.work} />
      <WorkRelatedWorkList />
    </div>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const generateStaticParams = () => {
  return []
}

export const revalidate = 60

export default WorkPage
