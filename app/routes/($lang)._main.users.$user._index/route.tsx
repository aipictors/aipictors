import { ParamsError } from "@/errors/params-error"
import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { createClient } from "@/lib/client"
import { UserWorkList } from "@/routes/($lang)._main.users.$user/components/user-work-list"
import { UserWorkListActions } from "@/routes/($lang)._main.users.$user/components/user-work-list-actions"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const worksResp = await client.query({
    query: userWorksQuery,
    variables: {
      offset: 0,
      limit: 16,
      userId: props.params.user,
    },
  })

  if (worksResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  return json({
    user: worksResp.data.user,
  })
}

export default function UserLayout() {
  const params = useParams<"user">()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <>
      <UserWorkListActions />
      <UserWorkList works={data.user.works ?? []} />
    </>
  )
}

const userWorksQuery = graphql(
  `query UserWorks($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }`,
  [partialWorkFieldsFragment],
)
