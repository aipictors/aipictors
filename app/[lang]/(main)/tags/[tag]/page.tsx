import { TagWorkSection } from "@/[lang]/(main)/tags/_components/tag-work-section"
import { AppPage } from "@/_components/app/app-page"
import { worksQuery } from "@/_graphql/queries/work/works"
import { createClient } from "@/_lib/client"
import type { Metadata } from "next"

type Props = {
  params: {
    tag: string
  }
}

const TagPage = async (props: Props) => {
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

  return (
    <AppPage>
      <TagWorkSection
        title={decodeURIComponent(props.params.tag)}
        works={worksResp.data.works!}
      />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default TagPage
