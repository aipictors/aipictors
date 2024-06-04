import { ParamsError } from "@/_errors/params-error"
import { workQuery } from "@/_graphql/queries/work/work"
import { workCommentsQuery } from "@/_graphql/queries/work/work-comments"
import { createClient } from "@/_lib/client"
import { WorkContainer } from "@/routes/($lang)._main.works.$work/_components/work-container"
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
    <Suspense>
      <WorkContainer workId={params.work} comments={data.workComments} />
    </Suspense>
  )
}
