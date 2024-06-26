import { ParamsError } from "@/_errors/params-error"
import { userWorksQuery } from "@/_graphql/queries/user/user-works"
import { createClient } from "@/_lib/client"
import { UserWorkList } from "@/routes/($lang)._main.users.$user/_components/user-work-list"
import { UserWorkListActions } from "@/routes/($lang)._main.users.$user/_components/user-work-list-actions"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"

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
