import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"

/**
 * バッジは実績に移したので、その人の実績のページへ（以前のリンクのため残す）
 */
export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const userIdResp = await loaderClient.query({
    query: userIdQuery,
    variables: {
      userId: decodeURIComponent(props.params.user),
    },
  })

  if (userIdResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  const prefix = props.params.lang === "en" ? "/en" : ""
  return redirect(
    `${prefix}/achievements?user=${encodeURIComponent(userIdResp.data.user.id)}`,
    { status: 301 },
  )
}

const userIdQuery = graphql(
  `query UserId($userId: ID!) {
    user(id: $userId) {
      id
    }
  }`,
)
