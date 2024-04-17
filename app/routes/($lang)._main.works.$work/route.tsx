import { WorkArticle } from "@/[lang]/(main)/works/[work]/_components/work-article"
import { WorkCommentList } from "@/[lang]/(main)/works/[work]/_components/work-comment-list"
import { WorkRelatedList } from "@/[lang]/(main)/works/[work]/_components/work-related-list"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { ParamsError } from "@/_errors/params-error"
import { workQuery } from "@/_graphql/queries/work/work"
import { workCommentsQuery } from "@/_graphql/queries/work/work-comments"
import { createClient } from "@/_lib/client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { Suspense } from "react"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.work === undefined) {
    throw new Response(null, { status: 404 })
  }

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

  if (workResp.data.work === null) {
    throw new Response(null, { status: 404 })
  }

  if (workCommentsResp.data.work === null) {
    throw new Response(null, { status: 404 })
  }

  return {
    work: workResp.data.work,
    workComments: workCommentsResp.data.work.comments,
  }
}

export default function Work() {
  const params = useParams()

  if (params.work === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <div className="w-full p-4">
      <div className="flex flex-col items-center justify-center">
        <div className="mx-auto w-full max-w-screen-lg">
          <Suspense fallback={<AppLoadingPage />}>
            <WorkArticle work={data?.work} />
          </Suspense>
          <WorkRelatedList works={data.work.user.works} />
          <WorkCommentList comments={data.workComments} />
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
