import { ConstructionAlert } from "~/components/construction-alert"
import { IconUrl } from "~/components/icon-url"
import { ParamsError } from "~/errors/params-error"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { createClient } from "~/lib/client"
import {
  UserContents,
  userProfileFragment,
} from "~/routes/($lang)._main.users.$user/components/user-contents"
import {
  UserHomeMain,
  userHomeMainFragment,
} from "~/routes/($lang)._main.users.$user/components/user-home-main"
import {
  userProfileIconFragment,
  UserProfileNameIcon,
} from "~/routes/($lang)._main.users.$user/components/user-profile-name-icon"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useLoaderData, useParams } from "@remix-run/react"
import { graphql } from "gql.tada"
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
      bookmarksOffset: 0,
      bookmarksLimit: 0,
      bookmarksWhere: {},
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
      <Suspense>
        <ConstructionAlert
          type="WARNING"
          message="このページは現在開発中です。不具合が起きる可能性があります。"
          fallbackURL={`https://www.aipictors.com/users/${params.user}`}
          deadline={"2024-07-30"}
        />
        <div className="flex w-full flex-col justify-center">
          <div className="relative">
            <div className="relative">
              {data.user.headerImageUrl ? (
                <div className="relative min-h-[240px] md:min-h-[320px]">
                  <div
                    className="absolute top-0 left-0 z-10 z-standard flex h-full min-h-[240px] w-full items-center justify-center md:min-h-[320px]"
                    style={{
                      background: "center top / contain no-repeat",
                      backgroundImage: `url(${data.user.headerImageUrl})`,
                      maxHeight: "240px",
                    }}
                  />
                  <div className="relative m-auto">
                    <img
                      className="absolute top-0 left-0 block h-full max-h-full min-h-[240px] w-full max-w-full object-cover object-center blur-[120px] transition-opacity duration-500"
                      src={data.user.headerImageUrl}
                      alt=""
                    />
                    <div className="absolute bottom-0 left-8 z-30">
                      <UserProfileNameIcon user={data.user} />
                    </div>
                  </div>
                  {/* <div className="absolute right-0 bottom-0 left-0 z-20 h-[25%] bg-gradient-to-t from-[rgba(0,0,0,0.30)] to-transparent p-4 pb-3">
                    &nbsp;
                  </div> */}
                </div>
              ) : (
                <div className="relative min-h-[240px] md:min-h-[320px]">
                  {/* <div
                className="absolute top-0 left-0 z-10 z-standard flex h-full min-h-[240px] w-full items-center justify-center md:min-h-[320px]"
                style={{
                  background: "center top / contain no-repeat",
                  backgroundImage: `url(${data.user.headerImageUrl})`,
                  maxHeight: "240px",
                  boxShadow: "0px 0px 20px rgba(0,0,0,0.5)",
                }}
              /> */}
                  <div className="relative m-auto">
                    <img
                      className="absolute top-0 left-0 h-full max-h-full min-h-[320px] w-full max-w-full object-cover object-center blur-[120px] transition-opacity duration-500 md:block md:blur-[120px]"
                      src={IconUrl(data.user.iconUrl)}
                      alt=""
                    />
                    <div className="absolute bottom-0 left-8 z-20">
                      <UserProfileNameIcon user={data.user} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Suspense>
              <UserHomeMain user={data.user} userId={data.user.id} />
            </Suspense>
          </div>
          <Suspense>
            <UserContents user={data.user} />
          </Suspense>
        </div>
      </Suspense>
    </>
  )
}

const userQuery = graphql(
  `query User(
    $userId: ID!,
    $worksOffset: Int!,
    $worksLimit: Int!,
    $worksWhere: UserWorksWhereInput,
    $followeesOffset: Int!,
    $followeesLimit: Int!,
    $followeesWorksOffset: Int!,
    $followeesWorksLimit: Int!,
    $followeesWorksWhere: UserWorksWhereInput,
    $followersOffset: Int!,
    $followersLimit: Int!,
    $followersWorksOffset: Int!,
    $followersWorksLimit: Int!
    $followersWorksWhere: UserWorksWhereInput,
    $bookmarksOffset: Int!,
    $bookmarksLimit: Int!,
    $bookmarksWhere: UserWorksWhereInput,
  ) {
    user(id: $userId) {
      ...UserHomeMain
      ...UserProfile
      ...UserProfileIcon
      works(offset: $worksOffset, limit: $worksLimit, where: $worksWhere) {
        ...PartialWorkFields
      }
      followees(offset: $followeesOffset, limit: $followeesLimit) {
        id
        name
        iconUrl
        headerImageUrl
        biography
        isFollower
        isFollowee
        enBiography
        works(offset: $followeesWorksOffset, limit: $followeesWorksLimit, where: $followeesWorksWhere) {
          ...PartialWorkFields
        }
      }
      followers(offset: $followersOffset, limit: $followersLimit) {
        id
        name
        iconUrl
        headerImageUrl
        biography
        isFollower
        isFollowee
        enBiography
        works(offset: $followersWorksOffset, limit: $followersWorksLimit, where: $followersWorksWhere) {
          ...PartialWorkFields
        }
      }
      bookmarkWorks(offset: $bookmarksOffset, limit: $bookmarksLimit, where: $bookmarksWhere) {
        ...PartialWorkFields
      }
      featuredSensitiveWorks {
        ...PartialWorkFields
      }
      featuredWorks {
        ...PartialWorkFields
      }
    }
  }`,
  [
    userHomeMainFragment,
    userProfileFragment,
    userProfileIconFragment,
    partialWorkFieldsFragment,
  ],
)
