import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import { UserSupport } from "~/routes/($lang)._main.users.$user.supports/components/user-support"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config } from "~/config"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const userResp = await loaderClient.query({
    query: userQuery,
    variables: {
      userId: props.params.user,
    },
  })

  if (userResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  return {
    user: userResp.data.user,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function UserSupports() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <UserSupport
      userIconImageURL={data.user.iconUrl ?? null}
      userName={data.user.name}
    />
  )
}

const userQuery = graphql(
  `query User(
    $userId: ID!,
  ) {
    user(id: $userId) {
      id
      name
      iconUrl
    }
  }`,
)
