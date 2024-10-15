import { useQuery } from "@apollo/client/index"
import { useLoaderData, useParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { useContext } from "react"
import type { LoaderFunctionArgs } from "react-router-dom"
import { AuthContext } from "~/contexts/auth-context"
import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import {
  HomeNovelsWorkListItemFragment,
  HomeNovelsWorksSection,
} from "~/routes/($lang)._main._index/components/home-novels-works-section"
import {
  HomeVideosWorkListItemFragment,
  HomeVideosWorksSection,
} from "~/routes/($lang)._main._index/components/home-video-works-section"
import {
  HomeWorkFragment,
  HomeWorkSection,
} from "~/routes/($lang)._main._index/components/home-work-section"
import {
  UserAboutCard,
  UserAboutCardFragment,
} from "~/routes/($lang)._main.users.$user._index/components/user-about-card"
import {
  UserSensitivePickupContents,
  UserSensitivePickupFragment,
} from "~/routes/($lang).r.users.$user._index/components/user-sensitive-pickup-contents"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const userIdResp = await loaderClient.query({
    query: userIdQuery,
    variables: {
      userId: decodeURIComponent(props.params.user),
    },
  })

  if (userIdResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  console.log({
    userId: decodeURIComponent(props.params.user),
    offset: 0,
    limit: 16,
    portfolioWhere: {
      userId: userIdResp.data.user.id,
      ratings: ["R18", "R18G"],
      orderBy: "LIKES_COUNT",
      isNowCreatedAt: true,
    },
    novelWhere: {
      userId: userIdResp.data.user.id,
      workType: "NOVEL",
      ratings: ["R18", "R18G"],
      orderBy: "LIKES_COUNT",
      isNowCreatedAt: true,
    },
    columnWhere: {
      userId: userIdResp.data.user.id,
      workType: "COLUMN",
      ratings: ["R18", "R18G"],
      orderBy: "LIKES_COUNT",
      isNowCreatedAt: true,
    },
    videoWhere: {
      userId: userIdResp.data.user.id,
      workType: "VIDEO",
      ratings: ["R18", "R18G"],
      orderBy: "LIKES_COUNT",
      isNowCreatedAt: true,
    },
  })

  const userResp = await loaderClient.query({
    query: combinedUserAndWorksQuery,
    variables: {
      offset: 0,
      limit: 16,
      userId: userIdResp.data.user.id,
      portfolioWhere: {
        userId: userIdResp.data.user.id,
        ratings: ["R18", "R18G"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
      novelWhere: {
        userId: userIdResp.data.user.id,
        workType: "NOVEL",
        ratings: ["R18", "R18G"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
      columnWhere: {
        userId: userIdResp.data.user.id,
        workType: "COLUMN",
        ratings: ["R18", "R18G"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
      videoWhere: {
        userId: userIdResp.data.user.id,
        workType: "VIDEO",
        ratings: ["R18", "R18G"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
    },
  })

  return {
    works: userResp.data.works,
    user: userResp.data.user,
    userId: userIdResp.data.user.id,
    novelWorks: userResp.data.novelWorks,
    columnWorks: userResp.data.columnWorks,
    videoWorks: userResp.data.videoWorks,
  }
}

export default function UserLayout() {
  const params = useParams<"user">()

  const authContext = useContext(AuthContext)

  if (params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  if (data === null || data.user === null) {
    return null
  }

  // 人気画像作品
  const { data: workRes } = useQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        userId: data.userId,
        ratings: ["R18", "R18G"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
    },
  })

  // 人気小説作品
  const { data: novelWorkRes } = useQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        userId: data.userId,
        workType: "NOVEL",
        ratings: ["R18", "R18G"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
    },
  })

  // 人気コラム作品
  const { data: columnWorkRes } = useQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        userId: data.userId,
        workType: "COLUMN",
        ratings: ["R18", "R18G"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
    },
  })

  // 人気動画作品
  const { data: videoWorkRes } = useQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        userId: data.userId,
        workType: "VIDEO",
        ratings: ["R18", "R18G"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
    },
  })

  const works = workRes?.works ?? data.works

  const novelWorks = novelWorkRes?.works || data.novelWorks

  const columnWorks = columnWorkRes?.works || data.columnWorks

  const videoWorks = videoWorkRes?.works || data.videoWorks

  return (
    <div className="flex w-full flex-col justify-center">
      <div className="flex flex-col space-y-4">
        <div className="flex min-h-96 flex-col gap-y-4">
          <UserAboutCard user={data.user} />
          <UserSensitivePickupContents
            userPickupWorks={data.user.featuredSensitiveWorks ?? []}
            userId={data.user.id}
          />
          <div className="space-y-4">
            {works.length !== 0 && (
              <HomeWorkSection works={works} isCropped={false} />
            )}
            {novelWorks.length !== 0 && (
              <HomeNovelsWorksSection works={novelWorks} isCropped={false} />
            )}
            {columnWorks.length !== 0 && (
              <HomeNovelsWorksSection works={columnWorks} isCropped={false} />
            )}
            {videoWorks.length !== 0 && (
              <HomeVideosWorksSection works={videoWorks} isCropped={false} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const userIdQuery = graphql(
  `query UserId($userId: ID!) {
    user(id: $userId) {
      id
    }
  }`,
)

const combinedUserAndWorksQuery = graphql(
  `query CombinedUserAndWorks(
    $userId: ID!,
    $offset: Int!,
    $limit: Int!,
    $portfolioWhere: WorksWhereInput!,
    $novelWhere: WorksWhereInput!,
    $columnWhere: WorksWhereInput!,
    $videoWhere: WorksWhereInput!
  ) {
    user(id: $userId) {
      ...UserAboutCard
      ...UserPickup
    }
    works(offset: $offset, limit: $limit, where: $portfolioWhere) {
      ...HomeWork
    }
    novelWorks: works(offset: $offset, limit: $limit, where: $novelWhere) {
      ...HomeNovelsWorkListItem
    }
    columnWorks: works(offset: $offset, limit: $limit, where: $columnWhere) {
      ...HomeWork
    }
    videoWorks: works(offset: $offset, limit: $limit, where: $videoWhere) {
      ...HomeVideosWorkListItem
    }
  }`,
  [
    HomeWorkFragment,
    HomeNovelsWorkListItemFragment,
    HomeVideosWorkListItemFragment,
    UserAboutCardFragment,
    UserSensitivePickupFragment,
  ],
)

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomeWork,
      ...HomeNovelsWorkListItem
      ...HomeVideosWorkListItem
    }
  }`,
  [
    HomeWorkFragment,
    HomeNovelsWorkListItemFragment,
    HomeVideosWorkListItemFragment,
  ],
)
