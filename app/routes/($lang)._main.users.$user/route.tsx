import { AppPage } from "@/_components/app/app-page"
import { ConstructionAlert } from "@/_components/header-develop-banner"
import { ParamsError } from "@/_errors/params-error"
import { userQuery } from "@/_graphql/queries/user/user"
import { createClient } from "@/_lib/client"
import { UserHome } from "@/routes/($lang)._main.users.$user/_components/user-home"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useLoaderData, useParams } from "@remix-run/react"
import { Suspense } from "react"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const userResp = await client.query({
    query: userQuery,
    variables: {
      userId: decodeURIComponent(props.params.user),
      worksWhere: {},
      followeesWorksWhere: {},
      followersWorksWhere: {},
      worksOffset: 0,
      worksLimit: 0,
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

  return json({
    user: userResp.data.user,
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
      <AppPage>
        <Suspense>
          <ConstructionAlert
            type="WARNING"
            message="このページは現在開発中です。不具合が起きる可能性があります。"
            fallbackURL={`https://www.aipictors.com/users/${params.user}`}
            date={"2024-07-30"}
          />
          <UserHome user={data.user} userId={params.user} />
        </Suspense>
      </AppPage>
    </>
  )
}
