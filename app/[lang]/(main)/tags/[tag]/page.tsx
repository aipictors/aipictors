import { TagWorkSection } from "@/app/[lang]/(main)/tags/_components/tag-work-section"
import { AppPage } from "@/components/app/app-page"
import { worksQuery } from "@/graphql/queries/work/works"
import { createClient } from "@/lib/client"
import { Metadata } from "next"

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

export const revalidate = 60

export default TagPage
