import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { Link, useLoaderData, useParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { UserModelCard } from "~/components/user-models/user-model-card"
import { config } from "~/config"
import { ParamsError } from "~/errors/params-error"
import { useTranslation } from "~/hooks/use-translation"
import { loaderClient } from "~/lib/loader-client"
import { fetchPublicUserModels } from "~/lib/server/user-models.server"
import { normalizeUserModel } from "~/lib/user-models/client"
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
  UserPickupContents,
  UserPickupFragment,
} from "~/routes/($lang)._main.users.$user._index/components/user-pickup-contents"
import { UserSupportRankingSection } from "~/routes/($lang)._main.users.$user._index/components/user-support-ranking-section"

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

  const userModelsPromise = fetchPublicUserModels(props.context, {
    userId: userIdResp.data.user.id,
    sort: "popular",
    limit: 8,
  })

  const userResp = await loaderClient.query({
    query: combinedUserAndWorksQuery,
    variables: {
      offset: 0,
      limit: 16,
      userId: userIdResp.data.user.id,
      portfolioWhere: {
        userId: userIdResp.data.user.id,
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
      novelWhere: {
        userId: userIdResp.data.user.id,
        workType: "NOVEL",
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
      columnWhere: {
        userId: userIdResp.data.user.id,
        workType: "COLUMN",
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
      videoWhere: {
        userId: userIdResp.data.user.id,
        workType: "VIDEO",
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
    },
  })

  const userModels = await userModelsPromise

  return {
    userModels: userModels.models.map(normalizeUserModel),
    works: userResp.data.works,
    user: userResp.data.user,
    userId: userIdResp.data.user.id,
    novelWorks: userResp.data.novelWorks,
    columnWorks: userResp.data.columnWorks,
    videoWorks: userResp.data.videoWorks,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export default function UserLayout() {
  const params = useParams<"user">()

  const t = useTranslation()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  const isDataReady = data !== null && data.user !== null

  if (!isDataReady) {
    return null
  }

  if (!data.user) {
    return null
  }

  // 作品はサーバーで取得したものを使う（以前は表示後にブラウザで 4 種類とも取り直していた）
  const works = data.works
  const novelWorks = data.novelWorks
  const columnWorks = data.columnWorks
  const videoWorks = data.videoWorks

  return (
    <div className="flex w-full flex-col justify-center pb-10">
      <div className="w-full space-y-8">
        <UserAboutCard user={data.user} />
        <UserPickupContents
          userPickupWorks={data.user.featuredWorks ?? []}
          userNewWorks={data.user.works ?? []}
          userId={data.user.id}
        />
        {data.userModels.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">
                {t("公開しているモデル・LoRA", "Models & LoRAs")}
              </h2>
              <Link
                to={`/users/${encodeURIComponent(params.user)}/models`}
                className="text-muted-foreground text-sm hover:text-foreground"
              >
                {t("すべて見る", "See all")}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {data.userModels.slice(0, 4).map((model) => (
                <UserModelCard key={model.id} model={model} blurSensitive />
              ))}
            </div>
          </section>
        )}
        <div className="space-y-6">
          {works.length !== 0 && (
            <HomeWorkSection
              works={works}
              isCropped={false}
              isShowProfile={true}
              autoPlayVideoPreview={true}
            />
          )}
          {novelWorks.length !== 0 && (
            <HomeNovelsWorksSection works={novelWorks} isCropped={false} />
          )}
          {columnWorks.length !== 0 && (
            <HomeNovelsWorksSection works={columnWorks} isCropped={false} />
          )}
          {videoWorks.length !== 0 && (
            <HomeVideosWorksSection
              works={videoWorks}
              isCropped={false}
              isAutoPlay={true}
            />
          )}
        </div>
        <UserSupportRankingSection
          targetUserId={data.user.id}
          targetUserLogin={decodeURIComponent(params.user)}
        />
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
    UserPickupFragment,
  ],
)
