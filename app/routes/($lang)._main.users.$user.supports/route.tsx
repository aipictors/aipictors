import { UserSupport } from "@/[lang]/(main)/users/[user]/supports/_components/user-support"
import { userQuery } from "@/_graphql/queries/user/user"
import { createClient } from "@/_lib/client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

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

  const metadata: Metadata = {
    robots: { index: false },
    title: "-",
  }

  const revalidate = 60

  if (userResp.data.user === null) {
    return notFound
  }
  return {
    user: userResp.data.user,
  }
}

export default function UserSupports() {
  const params = useParams()

  if (params.user === undefined) {
    throw new Error()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <>
      <UserSupport
        user={data.user}
        userIconImageURL={data.user.iconImage?.downloadURL ?? null}
        userName={data.user.name}
      />
    </>
  )
}
