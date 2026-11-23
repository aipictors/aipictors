import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData, useParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { UserRequestPlansSection } from "~/components/requests/user-request-plans-section"
import { config } from "~/config"
import { ParamsError } from "~/errors/params-error"
import { useTranslation } from "~/hooks/use-translation"
import { loaderClient } from "~/lib/loader-client"
import {
  HomeNovelsWorkListItemFragment,
  HomeNovelsWorksSection,
} from "~/routes/($lang)._main._index/components/home-novels-works-section"
import { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"
import {
  UserPickupContents,
  UserSensitivePickupFragment,
} from "~/routes/($lang)._main.users.$user._index/components/user-pickup-contents"
import { UserSupportRankingSection } from "~/routes/($lang)._main.users.$user._index/components/user-support-ranking-section"
import {
  UserWorksGrid,
  UserWorksSection,
} from "~/routes/($lang)._main.users.$user._index/components/user-works-gallery"
import {
  UserFanzaItemFragment,
  UserFanzaItemsSection,
} from "~/routes/($lang).r.users.$user._index/components/user-fanza-items-section"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const userIdResp = await loaderClient.query({
    query: userIdQuery,
    variables: {
      userId: decodeURIComponent(props.params.user),
    },
  })

  if (userIdResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

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

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

/**
 * R18 のユーザーページのポートフォリオ
 * 全年齢のページ（($lang)._main.users.$user._index）と同じ並び・同じ部品で、出すのは R18・R18G の作品だけ
 */
export default function UserLayout() {
  const params = useParams<"user">()

  const t = useTranslation()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  if (data === null || !data.user) {
    return null
  }

  // 作品はサーバーで取得したものを使う（以前は表示後にブラウザで 3 種類とも取り直していた）
  const works = data.works
  const novelWorks = data.novelWorks
  const columnWorks = data.columnWorks
  const videoWorks = data.videoWorks

  const basePath = `/r/users/${encodeURIComponent(params.user)}`

  // ピックアップ・最新と同じ絵が続かないようにする
  const shownWorkIds = new Set(
    [
      ...(data.user.featuredSensitiveWorks ?? []),
      ...(data.user.works ?? []),
    ].map((work) => work.id),
  )
  const popularWorks = works.filter((work) => !shownWorkIds.has(work.id))
  const fanzaItems = data.user.sensitiveProfile?.fanzaItems ?? []
  const hasContents =
    shownWorkIds.size > 0 ||
    works.length > 0 ||
    novelWorks.length > 0 ||
    columnWorks.length > 0 ||
    videoWorks.length > 0 ||
    fanzaItems.length > 0

  return (
    <div className="flex w-full flex-col justify-center pb-10">
      <div className="w-full space-y-10">
        <UserRequestPlansSection userId={data.user.id} />
        <UserPickupContents
          userPickupWorks={data.user.featuredSensitiveWorks ?? []}
          userNewWorks={data.user.works ?? []}
          userId={data.user.id}
          worksLink={`${basePath}/posts`}
          isSensitive
        />
        <UserFanzaItemsSection items={fanzaItems} />
        {popularWorks.length > 0 && (
          <UserWorksSection
            title={t("人気の作品", "Popular")}
            link={`${basePath}/posts`}
          >
            <UserWorksGrid works={popularWorks} />
          </UserWorksSection>
        )}
        {novelWorks.length !== 0 && (
          <HomeNovelsWorksSection
            title={t("小説", "Novels")}
            works={novelWorks}
            isCropped={false}
          />
        )}
        {columnWorks.length !== 0 && (
          <HomeNovelsWorksSection
            title={t("コラム", "Columns")}
            works={columnWorks}
            isCropped={false}
          />
        )}
        {videoWorks.length !== 0 && (
          <UserWorksSection
            title={t("動画", "Videos")}
            link={`${basePath}/videos`}
          >
            <UserWorksGrid works={videoWorks} />
          </UserWorksSection>
        )}
        {!hasContents && (
          <p className="py-12 text-center text-muted-foreground text-sm">
            {t("まだ R18 の作品がありません", "No R18 works yet")}
          </p>
        )}
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
  `query CombinedSensitiveUserAndWorks(
    $userId: ID!,
    $offset: Int!,
    $limit: Int!,
    $portfolioWhere: WorksWhereInput!,
    $novelWhere: WorksWhereInput!,
    $columnWhere: WorksWhereInput!,
    $videoWhere: WorksWhereInput!
  ) {
    user(id: $userId) {
      id
      ...UserSensitivePickup
      sensitiveProfile {
        fanzaItems {
          ...UserFanzaItem
        }
      }
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
      ...HomeWork
    }
  }`,
  [
    HomeWorkFragment,
    HomeNovelsWorkListItemFragment,
    UserSensitivePickupFragment,
    UserFanzaItemFragment,
  ],
)
