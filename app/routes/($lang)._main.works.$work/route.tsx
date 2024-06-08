import { ParamsError } from "@/_errors/params-error"
import { workQuery } from "@/_graphql/queries/work/work"
import { workCommentsQuery } from "@/_graphql/queries/work/work-comments"
import { worksQuery } from "@/_graphql/queries/work/works"
import { createClient } from "@/_lib/client"
import { toRatingText } from "@/_utils/work/to-rating-text"
import { WorkContainer } from "@/routes/($lang)._main.works.$work/_components/work-container"
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

  // 作品と同じ年齢種別で新着順の作品一覧を取得
  const rating = workResp.data.work.rating

  const ratingText = rating ? toRatingText(rating) : "G"

  // 関連するタグの作品を取得
  const tags = workResp.data.work.tagNames

  // ランダムにタグをひとつ
  const randomTag = tags[Math.floor(Math.random() * tags.length)]

  const { data: tagWorksResp } = await client.query({
    query: worksQuery,
    variables: {
      limit: 40,
      offset: 0,
      where: {
        ratings: [ratingText],
        tagNames: [randomTag],
        orderBy: "LIKES_COUNT",
        sort: "DESC",
      },
    },
  })

  const { data: worksResp } = await client.query({
    query: worksQuery,
    variables: {
      limit: 40,
      offset: 0,
      where: {
        ratings: [ratingText],
        orderBy: "DATE_CREATED",
        sort: "DESC",
      },
    },
  })

  return json({
    work: workResp.data.work,
    tagWorksResp: tagWorksResp.works,
    newWorks: worksResp.works,
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
    <Suspense>
      <WorkContainer
        work={data.work}
        tagWorksResp={data.tagWorksResp}
        newWorks={data.newWorks}
        comments={data.workComments}
      />
    </Suspense>
  )
}
