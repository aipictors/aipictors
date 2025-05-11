import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql, readFragment } from "gql.tada"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { config } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import {
  UserCard,
  UserCardFragment,
} from "~/routes/($lang)._main.users._index/components/user-card"

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const url = new URL(props.request.url)

  const search = url.searchParams.get("search")
    ? url.searchParams.get("search")
    : ""

  const usersResp = await loaderClient.query({
    query: usersQuery,
    variables: {
      search: search,
    },
  })

  return {
    users: usersResp.data.users,
    search: search,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function UsersPage() {
  const data = useLoaderData<typeof loader>()

  if (data === null) {
    return null
  }

  const users = readFragment(UserCardFragment, data.users)

  return (
    <>
      <p>{"ユーザ一覧"}</p>
      <form method="get" className="flex space-x-2">
        <Input
          type="text"
          name="search"
          placeholder="ユーザ名で検索"
          defaultValue={data.search}
          className="rounded border px-2 py-1"
        />
        <Button type="submit">検索</Button>
      </form>
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 md:justify-start">
        {data.users.map((user) => (
          // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
          <div className="w-full">
            <UserCard user={user} />
          </div>
        ))}
      </div>
    </>
  )
}

export const usersQuery = graphql(
  `query Users($search: String) {
    users(limit: 64, offset: 0, where: { search: $search }) {
      ...Users
    }
  }`,
  [UserCardFragment],
)
