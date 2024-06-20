import { IconUrl } from "@/_components/icon-url"
import { AuthContext } from "@/_contexts/auth-context"
import type { userQuery } from "@/_graphql/queries/user/user"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import type { SortType } from "@/_types/sort-type"
import { config } from "@/config"
import { UserContents } from "@/routes/($lang)._main.users.$user/_components/user-contents"
import { UserHomeMain } from "@/routes/($lang)._main.users.$user/_components/user-home-main"
import { UserProfileNameIcon } from "@/routes/($lang)._main.users.$user/_components/user-profile-name-icon"
import {} from "@apollo/client/index"
import type { ResultOf } from "gql.tada"
import React, { Suspense } from "react"
import { useContext } from "react"
import { useMediaQuery } from "usehooks-ts"

type UserProfileProps = {
  user: NonNullable<ResultOf<typeof userQuery>["user"]>
  userId: string
}

export const UserHome = (props: UserProfileProps) => {
  const appContext = useContext(AuthContext)

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const [WorkOrderby, setWorkOrderby] =
    React.useState<IntrospectionEnum<"WorkOrderBy">>("DATE_CREATED")

  const [worksOrderDeskAsc, setWorksOrderDeskAsc] =
    React.useState<SortType>("DESC")

  return (
    <div className="flex w-full flex-col justify-center">
      <div className="relative">
        <div className="relative">
          {props.user.headerImageUrl ? (
            <div className="relative min-h-[240px] md:min-h-[320px]">
              <div
                className="absolute top-0 left-0 z-10 z-standard flex h-full min-h-[240px] w-full items-center justify-center md:min-h-[320px]"
                style={{
                  background: "center top / contain no-repeat",
                  backgroundImage: `url(${props.user.headerImageUrl})`,
                  maxHeight: "240px",
                  boxShadow: "0px 0px 20px rgba(0,0,0,0.5)",
                }}
              />
              <div className="relative m-auto w-[1200px]">
                <img
                  className="absolute top-0 left-0 block h-full max-h-full min-h-[320px] w-full max-w-full object-cover object-center blur-[120px] transition-opacity duration-500"
                  src={props.user.headerImageUrl}
                  alt=""
                />
                <div className="absolute bottom-0 left-8 z-20">
                  <UserProfileNameIcon user={props.user} />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative min-h-[240px] md:min-h-[320px]">
              {/* <div
                className="absolute top-0 left-0 z-10 z-standard flex h-full min-h-[240px] w-full items-center justify-center md:min-h-[320px]"
                style={{
                  background: "center top / contain no-repeat",
                  backgroundImage: `url(${props.user.headerImageUrl})`,
                  maxHeight: "240px",
                  boxShadow: "0px 0px 20px rgba(0,0,0,0.5)",
                }}
              /> */}
              <div className="relative m-auto w-[1200px]">
                <img
                  className="absolute top-0 left-0 h-full max-h-full min-h-[320px] w-full max-w-full object-cover object-center blur-[120px] transition-opacity duration-500 md:block md:blur-[120px]"
                  src={IconUrl(props.user.iconUrl)}
                  alt=""
                />
                <div className="absolute bottom-0 left-8 z-20">
                  <UserProfileNameIcon user={props.user} />
                </div>
              </div>
            </div>
          )}

          <div
            className="absolute right-0 bottom-0 left-0 box-border flex h-24 flex-col justify-end bg-gradient-to-t from-black to-transparent p-4 pb-3 opacity-60"
            style={{
              background:
                "linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent 70%)",
            }}
          />
        </div>
        <Suspense>
          <UserHomeMain user={props.user} userId={props.userId} />
        </Suspense>
      </div>
      <Suspense>
        <UserContents user={props.user} />
      </Suspense>
    </div>
  )
}
