import { TagReferencedWorkSection } from "@/[lang]/generation/tags/[tag]/_components/tag-referenced-work-section"
import { ParamsError } from "@/_errors/params-error"
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
    works: worksResp.data.works,
    tag: props.params.tag,
  }
}

export default function GenerationTag() {
  const params = useParams()

  if (params.tag === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <TagReferencedWorkSection
      works={data.works}
      title={decodeURIComponent(params.tag)}
    />
  )
}
