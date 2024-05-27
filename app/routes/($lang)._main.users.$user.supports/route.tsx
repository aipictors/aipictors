import { ParamsError } from "@/_errors/params-error"
import { userQuery } from "@/_graphql/queries/user/user"
import { createClient } from "@/_lib/client"
import { UserSupport } from "@/routes/($lang)._main.users.$user.supports/_components/user-support"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const userResp = await client.query({
    query: userQuery,
    variables: {
      userId: props.params.user,
    },
  })

  if (userResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  return json({
    user: userResp.data.user,
  })
}

export default function UserSupports() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <UserSupport
      user={data.user}
      userIconImageURL={data.user.iconImage?.downloadURL ?? null}
      userName={data.user.name}
    />
  )
}
