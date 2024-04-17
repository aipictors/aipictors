import { TagWorkSection } from "@/[lang]/(main)/tags/_components/tag-work-section"
import { AppPage } from "@/_components/app/app-page"
import { worksQuery } from "@/_graphql/queries/work/works"
import { createClient } from "@/_lib/client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.tag === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const worksResp = await client.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 32,
      where: {
        tagNames: [decodeURIComponent(props.params.tag)],
      },
    },
  })
  return {
    works: worksResp.data.works,
    tag: props.params.tag,
  }
}

export default function TagComment() {
  const params = useParams()

  if (params.works === undefined) {
    throw new Error()
  }

  if (params.tag === undefined) {
    throw new Error()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <TagWorkSection title={decodeURIComponent(data.tag)} works={data.works} />
    </AppPage>
  )
}
