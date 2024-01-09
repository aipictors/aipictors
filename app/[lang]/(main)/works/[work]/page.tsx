import type {
  WorkCommentsQuery,
  WorkCommentsQueryVariables,
  WorkQuery,
  WorkQueryVariables,
} from "@/__generated__/apollo"
import { WorkCommentsDocument, WorkDocument } from "@/__generated__/apollo"
import { WorkArticle } from "@/app/[lang]/(main)/works/[work]/_components/work-article"
import { WorkCommentList } from "@/app/[lang]/(main)/works/[work]/_components/work-comment-list"
import { WorkRelatedWorkList } from "@/app/[lang]/(main)/works/[work]/_components/work-related-work-list"
import { WorkUser } from "@/app/[lang]/(main)/works/[work]/_components/work-user"
import { ArticlePage } from "@/app/_components/page/article-page"
import { createClient } from "@/app/_contexts/client"
import type { Metadata } from "next"

type Props = {
  params: { work: string }
}

const WorkPage = async (props: Props) => {
  const client = createClient()

  const workQuery = await client.query<WorkQuery, WorkQueryVariables>({
    query: WorkDocument,
    variables: {
      id: props.params.work,
    },
  })

  const workCommentsQuery = await client.query<
    WorkCommentsQuery,
    WorkCommentsQueryVariables
  >({
    query: WorkCommentsDocument,
    variables: {
      workId: props.params.work,
    },
  })

  if (workQuery.data.work === null) return null
  if (workCommentsQuery.data.work === null) return null

  return (
    <ArticlePage>
      <div className="flex flex-col lg:flex-row items-start overflow-hidden space-x-4">
        <WorkArticle work={workQuery.data.work} />
        <div className="w-full lg:max-w-xs">
          <WorkUser
            userName={workQuery.data.work.user.name}
            userIconImageURL={workQuery.data.work.user.iconImage?.downloadURL}
            userFollowersCount={workQuery.data.work.user.followersCount}
            userBiography={workQuery.data.work.user.biography}
            userPromptonId={workQuery.data.work.user.promptonUser?.id}
            userWorksCount={workQuery.data.work.user.worksCount}
          />
          {/* <p>{"前後の作品"}</p> */}
        </div>
      </div>
      <WorkCommentList work={workCommentsQuery.data.work} />
      <WorkRelatedWorkList />
    </ArticlePage>
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
