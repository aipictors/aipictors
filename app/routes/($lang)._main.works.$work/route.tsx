import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { ParamsError } from "@/_errors/params-error"
import { workQuery } from "@/_graphql/queries/work/work"
import { workCommentsQuery } from "@/_graphql/queries/work/work-comments"
import { createClient } from "@/_lib/client"
import { WorkArticle } from "@/routes/($lang)._main.works.$work/_components/work-article"
import { WorkCommentList } from "@/routes/($lang)._main.works.$work/_components/work-comment-list"
import { WorkNextAndPrevious } from "@/routes/($lang)._main.works.$work/_components/work-next-and-previous"
import { WorkRelatedList } from "@/routes/($lang)._main.works.$work/_components/work-related-list"
import { WorkUser } from "@/routes/($lang)._main.works.$work/_components/work-user"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
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

  return json({
    work: workResp.data.work,
    workComments: workCommentsResp.data.work.comments,
  })
}

export default function Work() {
  const params = useParams()

  if (params.work === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <div className="flex w-full overflow-hidden p-4">
      <div className="flex flex-col items-center justify-center">
        <div className="mx-auto w-full max-w-screen-lg">
          <Suspense fallback={<AppLoadingPage />}>
            <WorkArticle work={data?.work} />
          </Suspense>
          <WorkRelatedList works={data.work.user.works} />
          <WorkCommentList workId={data.work.id} comments={data.workComments} />

          <div className="mt-2 block md:mt-0 lg:hidden">
            <WorkUser
              userId={data.work.user.id}
              userName={data.work.user.name}
              userIconImageURL={data.work.user.iconImage?.downloadURL}
              userFollowersCount={data.work.user.followersCount}
              userBiography={data.work.user.biography}
              userPromptonId={data.work.user.promptonUser?.id}
              userWorksCount={data.work.user.worksCount}
            />
          </div>
        </div>
      </div>
      <div className="mt-2 hidden w-full items-start pl-4 md:mt-0 lg:block lg:max-w-xs">
        <div className="mt-2 md:mt-0">
          <WorkUser
            userId={data.work.user.id}
            userName={data.work.user.name}
            userIconImageURL={data.work.user.iconImage?.downloadURL}
            userFollowersCount={data.work.user.followersCount}
            userBiography={data.work.user.biography}
            userPromptonId={data.work.user.promptonUser?.id}
            userWorksCount={data.work.user.worksCount}
          />
        </div>
        <WorkNextAndPrevious work={data.work} />
      </div>
    </div>
  )
}
