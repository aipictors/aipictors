import { WorkArticle } from "@/app/[lang]/(main)/works/[work]/_components/work-article"
import { WorkCommentList } from "@/app/[lang]/(main)/works/[work]/_components/work-comment-list"
import WorkRelatedList from "@/app/[lang]/(main)/works/[work]/_components/work-related-list"
import WorkPageLoading from "@/app/[lang]/(main)/works/[work]/loading"
import { workQuery } from "@/graphql/queries/work/work"
import { workCommentsQuery } from "@/graphql/queries/work/work-comments"
import { createClient } from "@/lib/client"
import type { Metadata, ResolvingMetadata } from "next"
import { Suspense } from "react"

export const revalidate = 10

type Props = {
  params: { work: string }
}

const WorkPage = async (props: Props) => {
  const client = createClient()

  const workResp = await client.query({
    query: workQuery,
    variables: {
      id: props.params.work,
    },
  })

  const workCommentsResp = await client.query({
    query: workCommentsQuery,
    variables: {
      workId: props.params.work,
    },
  })

  if (workResp.data.work === null) return null
  if (workCommentsResp.data.work === null) return null

  /**
   * @todo WorkCardのせいでコンポーネントの位置関係が壊れるので一度コメントアウト
   */

  return (
    <div className="w-full p-4">
      <div className="flex flex-col items-center justify-center">
        <div className="mx-auto w-full max-w-screen-lg">
          <Suspense fallback={<WorkPageLoading />}>
            <WorkArticle work={workResp.data.work} />
          </Suspense>
          <WorkRelatedList works={workResp.data.work.user.works} />
          <WorkCommentList work={workCommentsResp.data.work} />
        </div>
      </div>
      {/* <div className="w-full lg:max-w-xs pl-4 invisible lg:visible items-start">
        <WorkUser
          userName={workResp.data.work.user.name}
          userIconImageURL={workResp.data.work.user.iconImage?.downloadURL}
          userFollowersCount={workResp.data.work.user.followersCount}
          userBiography={workResp.data.work.user.biography}
          userPromptonId={workResp.data.work.user.promptonUser?.id}
          userWorksCount={workResp.data.work.user.worksCount}
        />
        <WorkNextAndPrevious work={workResp.data.work} />
      </div> */}
    </div>
  )
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const client = createClient()

  const workResp = await client.query({
    query: workQuery,
    variables: {
      id: props.params.work,
    },
  })

  if (workResp.data.work === null) return {}

  return {
    robots: { index: false },
    title: workResp.data.work.title,
    description: workResp.data.work.description,
    openGraph: {
      type: "website",
      images: [
        {
          url: workResp.data.work.largeThumbnailImageURL,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
    },
  }
}

export const generateStaticParams = () => {
  return []
}

export default WorkPage
