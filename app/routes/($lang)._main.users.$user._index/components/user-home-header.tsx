import { Lumiflex } from "uvcanvas"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"
import { graphql, type FragmentOf } from "gql.tada"
import type React from "react"

type Props = {
  user: FragmentOf<typeof UserHomeHeaderFragment>
  userIconView: React.ReactNode
}

export function UserHomeHeader(props: Props) {
  return (
    <div className="relative">
      {props.user.headerImageUrl ? (
        <div className="relative min-h-[168px] md:min-h-[320px]">
          {props.user.headerImageUrl ? (
            <>
              <div
                className="absolute top-0 left-0 z-10 z-standard flex h-full min-h-[168px] w-full items-center justify-center md:min-h-[320px]"
                style={{
                  background: "center top / contain no-repeat",
                  backgroundImage: `url(${props.user.headerImageUrl})`,
                  maxHeight: "240px",
                }}
              />
              <div className="absolute right-0 bottom-0 left-0 z-10 box-border flex h-24 flex-col justify-end bg-gradient-to-t from-black to-transparent p-4 pb-7 opacity-0 md:opacity-50" />
            </>
          ) : (
            <>
              <div
                className="absolute top-0 left-0 z-10 z-standard flex h-16 min-h-[168px] w-full items-center justify-center opacity-50 md:min-h-[320px]"
                style={{
                  background: "center top / contain no-repeat",
                  maxHeight: "240px",
                }}
              >
                <Lumiflex />
              </div>
              <div className="absolute right-0 bottom-0 left-0 z-10 box-border flex h-24 flex-col justify-end bg-gradient-to-t from-black to-transparent p-4 pb-7 opacity-0 md:opacity-50" />
            </>
          )}
          <div className="relative m-auto">
            <div className="absolute top-0 left-0 max-h-full min-h-[168px] w-full max-w-full overflow-hidden md:min-h-[320px]">
              <img
                className="block h-full max-h-full min-h-[168px] w-full max-w-full scale-125 object-cover object-center blur-[64px] transition-opacity duration-500 md:min-h-[320px]"
                src={props.user.headerImageUrl}
                alt=""
              />
            </div>
            <div className="absolute bottom-0 left-8 z-30">
              {props.userIconView}
              {/* <UserProfileNameIcon user={props.user} /> */}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="relative min-h-[168px] overflow-hidden md:min-h-[320px]">
            <div className="relative m-auto">
              <img
                className="absolute top-0 left-0 h-full max-h-full min-h-[320px] w-full max-w-full object-cover object-center blur-[120px] transition-opacity duration-500 md:block md:blur-[120px]"
                src={ExchangeIconUrl(props.user.iconUrl)}
                alt=""
              />
            </div>
            <div className="absolute right-0 bottom-0 left-0 z-10 box-border flex h-24 flex-col justify-end bg-gradient-to-t from-black to-transparent p-4 pb-7 opacity-0 md:opacity-50" />
          </div>
          <div className="absolute top-0 left-8 z-20">
            {props.userIconView}
            {/* <UserProfileNameIcon user={props.user} /> */}
          </div>
        </>
      )}
    </div>
  )
}

export const UserHomeHeaderFragment = graphql(
  `fragment UserHomeHeader on UserNode @_unmask {
    headerImageUrl
    iconUrl
  }`,
)
