import { AppPage } from "@/_components/app/app-page"
import { FollowButton } from "@/_components/button/follow-button"
import { Button } from "@/_components/ui/button"
import { ParamsError } from "@/_errors/params-error"
import { userQuery } from "@/_graphql/queries/user/user"
import { createClient } from "@/_lib/client"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import type { SortType } from "@/_types/sort-type"
import { config } from "@/config"
import { UserContents } from "@/routes/($lang)._main.users.$user/_components/user-contents"
import { UserProfileNameIcon } from "@/routes/($lang)._main.users.$user/_components/user-profile-name-icon"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useLoaderData, useParams } from "@remix-run/react"
import React, { useState } from "react"
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

  const [WorkOrderby, setWorkOrderby] =
    React.useState<IntrospectionEnum<"WorkOrderBy">>("DATE_CREATED")

  const [worksOrderDeskAsc, setWorksOrderDeskAsc] =
    React.useState<SortType>("DESC")

  const [activeTab, setActiveTab] = useState("画像") // 初期値を設定

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
                  className="absolute top-0 left-0 hidden h-full max-h-full min-h-[320px] w-full max-w-full object-cover object-center blur-0 transition-opacity duration-500 md:block md:blur-[120px]"
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
                {/* <Button variant={"secondary"}>支援する</Button> */}
                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-400 via-pink-500 to-blue-500 text-white rounded-full shadow-lg focus:outline-none">
                  <span className="bg-white bg-opacity-30 p-2 rounded-full mr-2">
                    {/* You can use any icon library like FontAwesome, Material Icons, etc. */}
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4zm0 2c-2.673 0-8 1.336-8 4v2h16v-2c0-2.664-5.327-4-8-4z" />
                    </svg>
                  </span>
                  <span className="font-bold">支援する</span>
                </button>
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
        </div>
        <UserContents user={data.user} />
      </div>
    </AppPage>
  )
}
