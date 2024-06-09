import { AppPage } from "@/_components/app/app-page"
import { FollowButton } from "@/_components/button/follow-button"
import { Button } from "@/_components/ui/button"
import { ParamsError } from "@/_errors/params-error"
import { userQuery } from "@/_graphql/queries/user/user"
import { createClient } from "@/_lib/client"
import { config } from "@/config"
import { UserProfileNameIcon } from "@/routes/($lang)._main.users.$user/_components/user-profile-name-icon"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useLoaderData, useParams } from "@remix-run/react"
import { useMediaQuery } from "usehooks-ts"

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

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  // top center / contain no-repeat
  return (
    <AppPage>
      <div className="flex w-full flex-col justify-center">
        <div className="relative">
          {data.user.headerImageUrl && (
            <div className="relative min-h-[240px] md:min-h-[320px]">
              <div
                className="absolute top-0 left-0 z-10 z-standard flex h-full min-h-[240px] w-full items-center justify-center md:min-h-[320px]"
                style={{
                  background: "center top / contain no-repeat",
                  backgroundImage: `url(${data.user.headerImageUrl})`,
                  maxHeight: "240px",
                  boxShadow: "0px 0px 20px rgba(0,0,0,0.5)",
                }}
              />
              <div className="relative m-auto w-[1200px]">
                <img
                  className="absolute top-0 left-0 hidden h-full max-h-full min-h-[320px] w-full max-w-full object-cover object-center blur-0 transition-opacity duration-500 md:block md:blur-xl"
                  // style={{ inset: "20px" }}
                  src={data.user.headerImageUrl}
                  alt=""
                />
                <div className="absolute bottom-0 left-8 z-20">
                  <UserProfileNameIcon user={data.user} />
                </div>
              </div>
            </div>
          )}
          <div className="absolute h-64 w-full bg-neutral-100 md:h-24 dark:bg-neutral-900" />
          <div className="relative m-auto h-64 w-full bg-neutral-100 md:h-24 md:max-w-[1200px] dark:bg-neutral-900">
            <div className="absolute top-8 right-0 hidden md:block">
              <div className="flex items-center space-x-2">
                <Button>フォローする</Button>
                <Button variant={"secondary"}>支援する</Button>
              </div>
            </div>

            <div className="absolute top-40 left-0 block w-[100%] px-8 md:hidden">
              <FollowButton
                className="mb-2 w-[100%] rounded-full"
                targetUserId={"2"}
                isFollow={false}
              />
              <Button
                className={"block w-[100%] rounded-full"}
                onClick={() => {}}
              >
                <div className="align-center text-black">{"支援する"}</div>
              </Button>
            </div>
          </div>
          {/* <div className="absolute bottom-[-96px] left-0 z-20 w-full">
            <UserProfile user={data.user} />
          </div> */}
        </div>
        <div className="p-4">
          <p className="mt-4 text-left font-bold text-lg">ポートフォリオ</p>
        </div>
        {/* <div className="px-4 py-6 md:px-6 lg:py-16">
          <UserTabs params={{ user: params.user }} />
        </div> */}
      </div>
    </AppPage>
  )
}
