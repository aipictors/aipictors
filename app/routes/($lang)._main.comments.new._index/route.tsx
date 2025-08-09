import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"
import { createMeta } from "~/utils/create-meta"
import { NewCommentsPageContent } from "~/routes/($lang)._main.comments.new._index/components/new-comments-page-content"

export const meta: MetaFunction = () => {
  return createMeta(META)
}

const META = {
  title: "新規コメント一覧",
  description: "新規投稿されたコメントを確認できます",
  keywords: ["新規", "コメント", "最新", "作品"],
}

export async function loader(_props: LoaderFunctionArgs) {
  const data = await loaderClient.query({
    query: newCommentsPageQuery,
    variables: {},
  })

  return json({
    newComments: data.data?.newComments || [],
  })
}

export default function NewCommentsPage() {
  const data = useLoaderData<typeof loader>()

  if (!data) {
    return null
  }

  return <NewCommentsPageContent initialComments={data.newComments} />
}

const newCommentsPageQuery = graphql(
  `query NewCommentsPage {
    newComments: newComments(
      offset: 0,
      limit: 24,
      where: {
        isSensitive: false,
        ratings: [G, R15]
      }
    ) {
      user {
        id
        name
        login
        iconUrl
      }
      sticker {
        id
        imageUrl
        title
      }
      work {
        id
        smallThumbnailImageURL
        smallThumbnailImageHeight
        smallThumbnailImageWidth
        thumbnailImagePosition
      }
      comment {
        id
        text
      }
      createdAt
    }
  }`,
)
