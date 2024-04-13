import { TagReferencedWorkSection } from "@/[lang]/generation/tags/[tag]/_components/tag-referenced-work-section"
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
        hasGenerationPrompt: true,
        isFeatured: true,
        hasPrompt: true,
      },
    },
  })
  return {
    worksResp,
    tag: props.params.tag,
  }
}

export default function GenerationTag() {
  const data = useLoaderData<typeof loader>()

  if (data.worksResp === undefined) {
    return null
  }
  const params = useParams()
  console.log(params)
  return (
    <TagReferencedWorkSection
      works={data.worksResp.data.works}
      title={decodeURIComponent(data.tag)}
    />
  )
}
