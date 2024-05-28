import { AppPage } from "@/_components/app/app-page"
import { ParamsError } from "@/_errors/params-error"
import { userQuery } from "@/_graphql/queries/user/user"
import { createClient } from "@/_lib/client"
import UserProfile from "@/routes/($lang)._main.users.$user/_components/user-profile"
import { UserTabs } from "@/routes/($lang)._main.users.$user/_components/user-tabs"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData, useParams } from "@remix-run/react"

export const loader = async (props: LoaderFunctionArgs) => {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const userResp = await client.query({
    query: userQuery,
    variables: {
      userId: decodeURIComponent(props.params.user),
      followeesOffset: 0,
      followeesLimit: 0,
      followeesWorksOffset: 0,
      followeesWorksLimit: 0,
      followersOffset: 0,
      followersLimit: 0,
      followersWorksOffset: 0,
      followersWorksLimit: 0,
    },
  })

  if (userResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  return {
    user: userResp.data.user,
  }
}

export default function UserLayout() {
  const params = useParams<"user">()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <div className="flex w-full flex-col justify-center">
        <UserProfile user={data.user} />
        <main className="px-4 py-6 md:px-6 lg:py-16">
          <UserTabs params={{ user: params.user }} />
        </main>
      </div>
    </AppPage>
  )
}
