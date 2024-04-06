import { TagReferencedWorkSection } from "@/[lang]/generation/tags/[tag]/_components/tag-referenced-work-section"
import { worksQuery } from "@/_graphql/queries/work/works"
import { createClient } from "@/_lib/client"
import type { Metadata } from "next"
import { useRouter } from "next/router"

type Props = {
  params: { tag: string }
}

const GenerationTagPage = async (props: Props) => {
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

  return (
    <>
      <TagReferencedWorkSection
        works={worksResp.data.works}
        title={decodeURIComponent(props.params.tag)}
      />
    </>
  )
}

export function generateMetadata({ params }: Props) {
  return {
    robots: { index: false },
    title: `${decodeURIComponent(params.tag)}のAIイラスト無料生成`,
  }
}

export default GenerationTagPage
