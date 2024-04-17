import { TagWorkSection } from "@/[lang]/(main)/tags/_components/tag-work-section"
import { AppPage } from "@/_components/app/app-page"
import { ParamsError } from "@/_errors/params-error"
import { worksQuery } from "@/_graphql/queries/work/works"
import { createClient } from "@/_lib/client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"

export async function loader(props: LoaderFunctionArgs) {
  const client = createClient()

  if (props.params.tag === undefined) {
    throw new Response(null, { status: 404 })
  }

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
  }
}

export default function Tag() {
  const params = useParams()

  if (params.tag === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <TagWorkSection
        title={decodeURIComponent(params.tag)}
        works={data.works}
      />
    </AppPage>
  )
}
