import { useMutation, useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { ChevronRightIcon } from "lucide-react"
import { useContext, useMemo } from "react"
import { Link } from "react-router-dom"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { FollowSuggestions } from "~/components/user/follow-suggestions"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import {
  HomeAwardWorksSection,
  homeAwardWorksQuery,
} from "~/routes/($lang)._main._index/components/home-award-works"
import { HomeNewCommentsSection } from "~/routes/($lang)._main._index/components/home-new-comments"
import {
  userSettingFragment,
  WorkArticle,
  workArticleFragment,
} from "~/routes/($lang)._main.posts.$post._index/components/work-article"
import { WorkAlbumCard } from "~/routes/($lang)._main.posts.$post._index/components/work-album-card"
import { WorkCommentList } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { WorkLazySection } from "~/routes/($lang)._main.posts.$post._index/components/work-lazy-section"
import { WorkNextAndPrevious } from "~/routes/($lang)._main.posts.$post._index/components/work-next-and-previous"
import { WorkAuthorWorksSection } from "~/routes/($lang)._main.posts.$post._index/components/work-related-list"
import { WorkTagsWorks } from "~/routes/($lang)._main.posts.$post._index/components/work-tags-works"
import { WorkUser } from "~/routes/($lang)._main.posts.$post._index/components/work-user"
import {
  newCommentsQuery,
  workCommentsQuery,
} from "~/routes/($lang)._main.posts.$post._index/route"
import { getJstDate } from "~/utils/jst-date"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

/** 作者の他の作品に出す年齢種別（作品ページと一緒に読む分と同じ） */
const AUTHOR_WORKS_RATINGS: ("G" | "R15" | "R18" | "R18G")[] = ["G", "R15"]

type Props = {
  post: string
  work: FragmentOf<typeof workArticleFragment> | null
}

/**
 * 作品詳細情報
 */
export function WorkContainer(props: Props) {
  const authContext = useContext(AuthContext)

  const isWorkOwner =
    !authContext.isLoading &&
    authContext.userId !== null &&
    authContext.userId !== undefined &&
    props.work?.user !== null &&
    authContext.userId === props.work?.user.id

  const { data: workRet } = useQuery(workQuery, {
    skip:
      props.work?.user !== null &&
      authContext.userId !== props.work?.user.id &&
      authContext.isLoading,
    variables: {
      id: props.post,
    },
  })

  // SSRではlikedUsersが空で返るため、作品オーナーの場合はネットワークから再取得する
  const { data: likedUsersData } = useQuery(workLikedUsersQuery, {
    skip: !isWorkOwner,
    fetchPolicy: "network-only",
    variables: {
      id: props.post,
    },
  })

  const { data: userSetting } = useQuery(userSettingQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const workBase = workRet?.work ?? props.work
  const likedUsers =
    likedUsersData?.work?.likedUsers ?? workBase?.likedUsers ?? []
  const work = workBase ? { ...workBase, likedUsers } : workBase

  const { data: workCommentsRet, loading: isLoadingComments } = useQuery(
    workCommentsQuery,
    {
      fetchPolicy: "network-only",
      ssr: false,
      variables: {
        workId: props.post,
      },
    },
  )

  const comments = workCommentsRet?.work?.comments ?? []

  const { data: newCommentsData } = useQuery(newCommentsQuery, {
    fetchPolicy: "cache-first",
    ssr: false,
  })

  const now = getJstDate(new Date())
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const { data: awardWorksData } = useQuery(homeAwardWorksQuery, {
    fetchPolicy: "cache-first",
    ssr: false,
    variables: {
      offset: 0,
      limit: 4,
      where: {
        isSensitive: false,
        year: yesterday.getFullYear(),
        month: yesterday.getMonth() + 1,
        day: yesterday.getDate(),
      },
    },
  })

  const newComments = newCommentsData?.newComments ?? []
  const awardWorks = awardWorksData?.workAwards ?? []

  const tags = work?.tagNames ?? []

  // 描画のたびに選び直すと「おすすめ」一覧の取得がやり直しになり、一覧が消えて出直す（ページが大きくずれる）ので、
  // 作品ごとに 1 回だけ選ぶ
  const tagsKey = tags.join("\n")
  // biome-ignore lint/correctness/useExhaustiveDependencies: tagsKey で中身の変化を見ている
  const randomTag = useMemo(
    () =>
      tags.length > 0
        ? tags[Math.floor(Math.random() * tags.length)]
        : "女の子",
    [work?.id, tagsKey],
  )

  const { data: pass } = useQuery(viewerCurrentPassQuery, {})

  const { data: advertisements } = useQuery(randomCustomerAdvertisementQuery, {
    variables: {
      where: {
        isSensitive: false,
        page: "work",
      },
    },
  })

  const [updateClickedCountCustomerAdvertisement] = useMutation(
    updateClickedCountCustomerAdvertisementMutation,
  )

  const onClickAdvertisement = async () => {
    if (advertisements?.randomCustomerAdvertisement) {
      // Update advertisement click count
      await updateClickedCountCustomerAdvertisement({
        variables: {
          id: advertisements.randomCustomerAdvertisement.id,
        },
      })
    }
  }

  const passData = pass?.viewer?.currentPass

  const isSubscriptionUser =
    passData?.type === "LITE" ||
    passData?.type === "STANDARD" ||
    passData?.type === "PREMIUM"

  const t = useTranslation()

  if (work === null || work.isDeleted === true) {
    return null
  }

  return (
    <div
      className="space-y-4 overflow-hidden"
      style={{
        margin: "auto",
      }}
    >
      <div className="flex w-full justify-center overflow-hidden">
        <div className="flex w-full flex-col items-center overflow-hidden">
          <div className="mx-auto w-full space-y-4">
            <WorkArticle
              work={work}
              userSetting={userSetting?.userSetting ?? undefined}
              isAlbumHidden
              authorSlot={
                work.user ? (
                  <div className="md:hidden">
                    <WorkUser
                      userId={work.user.id}
                      userLogin={work.user.login}
                      userName={work.user.name}
                      userIsOfficial={work.user.isOfficial}
                      userIsModerator={work.user.isModerator}
                      userIconImageURL={withIconUrlFallback(work.user.iconUrl)}
                      avatarFrame={work.user.avatarFrame}
                      userFollowersCount={work.user.followersCount}
                      userBiography={work.user.biography ?? ""}
                      userEnBiography={work.user.enBiography ?? null}
                      userWorksCount={work.user.worksCount}
                    />
                  </div>
                ) : undefined
              }
            />
            {/* AI 評価（WorkArticle の中）→ 作者の他の作品（横スクロール）→ アルバム → コメントの順 */}
            {work.user && (
              <div className="border-t pt-6">
                <WorkAuthorWorksSection
                  user={work.user}
                  currentWorkId={work.id}
                  ratings={AUTHOR_WORKS_RATINGS}
                />
              </div>
            )}
            {work.album && <WorkAlbumCard album={work.album} />}
            {work.isCommentsEditable && (
              <div className="border-t pt-6">
                <WorkCommentList
                  workId={work.id}
                  comments={comments}
                  isLoadingComments={isLoadingComments}
                  workOwnerId={work.user?.id}
                  workOwnerIconImageURL={work.user?.iconUrl}
                  workOwnerName={work.user?.name}
                  isWorkOwnerBlocked={work.user?.isBlocked ?? false}
                />
              </div>
            )}
            {work.user && authContext.isLoggedIn && (
              <WorkLazySection>
                <FollowSuggestions
                  userId={work.user.id}
                  userName={work.user.name}
                  title={t("おすすめのクリエイター", "Suggested creators")}
                />
              </WorkLazySection>
            )}
          </div>
        </div>
        <div className="mt-2 hidden w-full flex-col items-start space-y-4 pl-4 md:mt-0 md:flex md:max-w-80">
          {work.user && (
            <div className="w-full">
              <WorkUser
                userId={work.user.id}
                userName={work.user.name}
                userIsOfficial={work.user.isOfficial}
                userIsModerator={work.user.isModerator}
                userLogin={work.user.login}
                userIconImageURL={withIconUrlFallback(work.user.iconUrl)}
                avatarFrame={work.user.avatarFrame}
                userFollowersCount={work.user.followersCount}
                userBiography={work.user.biography ?? ""}
                userEnBiography={work.user.enBiography ?? null}
                userWorksCount={work.user.worksCount}
              />
            </div>
          )}
          <div className="invisible flex w-full flex-col space-y-4 md:visible">
            <WorkNextAndPrevious work={work} />
            <div className="flex w-full flex-col space-y-4">
              <div className="relative grid gap-4">
                {!isSubscriptionUser &&
                  advertisements &&
                  advertisements.randomCustomerAdvertisement && (
                    <div className="relative border">
                      <Link
                        onClick={onClickAdvertisement}
                        target="_blank"
                        to={advertisements.randomCustomerAdvertisement.url}
                      >
                        <img
                          src={
                            advertisements.randomCustomerAdvertisement.imageUrl
                          }
                          alt="Advertisement"
                        />
                      </Link>
                      <div className="absolute top-0 right-0">
                        <CrossPlatformTooltip
                          text={t(
                            "提携広告です、広告主様を募集中です。メールまたはDMにてご連絡ください。",
                            "This is a partnered advertisement. We are accepting new advertisers. Please contact us via email or DM.",
                          )}
                        />
                      </div>
                    </div>
                  )}
                {newComments.length > 0 ? (
                  <HomeNewCommentsSection comments={newComments} />
                ) : (
                  // 届くまで場所を取っておく（下の告知が押し下げられないように）
                  newCommentsData === undefined && (
                    <div className="min-h-[560px]" />
                  )
                )}
                {!isSubscriptionUser && (
                  <Link to="/generation">
                    <img
                      src="https://assets.aipictors.com/Aipictors_01_640.webp"
                      alt="Aipictors Logo"
                      className="aspect-square h-auto w-full"
                      width={640}
                      height={640}
                      loading="lazy"
                      decoding="async"
                    />
                  </Link>
                )}
                {awardWorks.length > 0 && (
                  <HomeAwardWorksSection works={awardWorks} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="m-auto border-t pt-6">
        {randomTag && (
          // タグはブラウザで選ぶので、見出しごと画面に近づいてから出す
          <WorkLazySection minHeightClassName="min-h-[100vh]">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="truncate font-bold text-base">
                  {t(`#${randomTag} のおすすめ`, `More #${randomTag}`)}
                </h2>
                <Link
                  to={`/tags/${encodeURIComponent(randomTag)}`}
                  className="flex shrink-0 items-center text-muted-foreground text-sm hover:text-foreground"
                >
                  {t("すべて見る", "See all")}
                  <ChevronRightIcon className="size-4" />
                </Link>
              </div>
              <WorkTagsWorks tagName={randomTag} rating={work.rating ?? "G"} />
            </div>
          </WorkLazySection>
        )}
      </section>
      {/* <div className="flex w-full flex-col space-y-4 md:hidden">
        <AppSideMenu />
      </div> */}
    </div>
  )
}

const workQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      ...WorkArticle
    }
  }`,
  [workArticleFragment],
)

const workLikedUsersQuery = graphql(
  `query WorkLikedUsers($id: ID!) {
    work(id: $id) {
      id
      likedUsers(offset: 0, limit: 120) {
        id
        name
        iconUrl
        login
      }
    }
  }`,
)

const userSettingQuery = graphql(
  `query UserSetting {
    userSetting {
      ...UserSetting
    }
  }`,
  [userSettingFragment],
)

const updateClickedCountCustomerAdvertisementMutation = graphql(
  `mutation UpdateClickedCountCustomerAdvertisement($id: ID!) {
    updateClickedCountCustomerAdvertisement(id: $id) {
      id
    }
  }`,
)

const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      id
      currentPass {
        id
        type
      }
    }
  }`,
)

export const SideMenuAdvertisementsFragment = graphql(
  `fragment SideMenuAdvertisementsFields on CustomerAdvertisementNode @_unmask {
      id
      imageUrl
      url
      displayProbability
      clickCount
      impressionCount
      isSensitive
      createdAt
      page
      startAt
      endAt
      isActive
  }`,
)

const randomCustomerAdvertisementQuery = graphql(
  `query RandomCustomerAdvertisement($where: RandomCustomerAdvertisementWhereInput!) {
    randomCustomerAdvertisement(where: $where) {
      ...SideMenuAdvertisementsFields
    }
  }`,
  [SideMenuAdvertisementsFragment],
)
