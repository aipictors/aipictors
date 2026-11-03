import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { META } from "~/config"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"
import { NewCommentsPageContent } from "~/routes/($lang)._main.comments.new._index/components/new-comments-page-content"

export const meta: MetaFunction = (props) => {
  return createSensitiveMeta(META.SENSITIVE_NEW_COMMENTS, undefined, props.params.lang)
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

export default function NewCommentsPage () {
  const data = useLoaderData<typeof loader>()

  if (!data) {
    return null
  }

  return (
    <NewCommentsPageContent
      initialComments={data.newComments as never[]}
      isSensitive
    />
  )
}

const newCommentsPageQuery = graphql(
  `query NewCommentsPage {
    newComments: newComments(
      offset: 0,
      limit: 24,
      where: {
        isSensitive: true,
        ratings: [R18, R18G]
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
        likesCount
        isLiked
      }
      createdAt
    }
  }`,
)
