import {
  WorkArticle,
  userSettingFragment,
  workArticleFragment,
  sensitiveWorkArticleFragment,
} from "~/routes/($lang)._main.posts.$post._index/components/work-article"
import { WorkUser } from "~/routes/($lang)._main.posts.$post._index/components/work-user"
import { useContext, useMemo } from "react"
import { graphql, type FragmentOf } from "gql.tada"
import { AuthContext } from "~/contexts/auth-context"
import { useMutation, useQuery } from "@apollo/client/index"
import { WorkAuthorWorksSection } from "~/routes/($lang)._main.posts.$post._index/components/work-related-list"
import { WorkAlbumCard } from "~/routes/($lang)._main.posts.$post._index/components/work-album-card"
import { WorkLazySection } from "~/routes/($lang)._main.posts.$post._index/components/work-lazy-section"
import { FollowSuggestions } from "~/components/user/follow-suggestions"
import { ChevronRightIcon } from "lucide-react"
import { WorkNextAndPrevious } from "~/routes/($lang)._main.posts.$post._index/components/work-next-and-previous"
import {
  type CommentListItemFragment,
  WorkCommentList,
} from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import type { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import {
  HomeAwardWorksSection,
  type HomeAwardWorksFragment,
} from "~/routes/($lang)._main._index/components/home-award-works"
import type { HomeWorkAwardFragment } from "~/routes/($lang)._main._index/components/home-award-work-section"
import { useTranslation } from "~/hooks/use-translation"
import { useNavigate, Link } from "react-router-dom"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { SensitiveWorkTagsWorks } from "~/routes/($lang)._main.r.posts.$post._index/components/sensitive-work-tags-works"
import { workCommentsQuery } from "~/routes/($lang)._main.posts.$post._index/route"
import { HomeNewCommentsSection } from "~/routes/($lang)._main._index/components/home-new-comments"

type Props = {
  post: string
  work: FragmentOf<typeof workArticleFragment> | null
  comments: FragmentOf<typeof CommentListItemFragment>[]
  newComments: FragmentOf<typeof HomeNewCommentsFragment>[]
  awardWorks: FragmentOf<
    typeof HomeAwardWorksFragment | typeof HomeWorkAwardFragment
  >[]
}

/**
 * 作品詳細情報
 */
export function SensitiveWorkContainer(props: Props) {
  const authContext = useContext(AuthContext)

  const isWorkOwner =
    !authContext.isLoading &&
    authContext.userId !== null &&
    authContext.userId !== undefined &&
    props.work?.user !== null &&
    authContext.userId === props.work?.user?.id

  const { data, refetch } = useQuery(sensitiveWorkQuery, {
    skip: authContext.userId !== props.work?.user?.id && authContext.isLoading,
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

  const workBase = data?.work ?? props.work
  const likedUsers =
    likedUsersData?.work?.likedUsers ?? workBase?.likedUsers ?? []
  const work = workBase ? { ...workBase, likedUsers } : workBase

  const { data: workCommentsRet } = useQuery(workCommentsQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      workId: props.post,
    },
  })

  const comments = workCommentsRet?.work?.comments ?? props.comments

  const { data: userSetting } = useQuery(userSensitiveSettingQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const tags = work?.tagNames ?? []

  // 描画のたびに選び直すと「おすすめ」一覧の取得がやり直しになり、ページが大きくずれるので作品ごとに 1 回だけ選ぶ
  const tagsKey = tags.join("\n")
  // biome-ignore lint/correctness/useExhaustiveDependencies: tagsKey で中身の変化を見ている
  const randomTag = useMemo(
    () =>
      tags.length > 0 ? tags[Math.floor(Math.random() * tags.length)] : null,
    [work?.id, tagsKey],
  )

  const _navigate = useNavigate()

  const { data: pass } = useQuery(viewerCurrentPassQuery, {})

  const { data: advertisements } = useQuery(randomCustomerAdvertisementQuery, {
    variables: {
      where: {
        isSensitive: true,
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

  const albumCandidate = (work as any).album
  const albumForArticle =
    albumCandidate &&
    typeof albumCandidate === "object" &&
    "id" in albumCandidate &&
    "title" in albumCandidate &&
    "description" in albumCandidate
      ? albumCandidate
      : null

  const workForArticle = {
    ...work,
    album: albumForArticle,
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
              work={workForArticle}
              userSetting={userSetting?.userSetting ?? undefined}
              isSensitive
              isAlbumHidden
              authorSlot={
                workForArticle.user ? (
                  <div className="md:hidden">
                    <WorkUser
                      userId={workForArticle.user.id}
                      userLogin={workForArticle.user.login}
                      userName={workForArticle.user.name}
                      userIsOfficial={workForArticle.user.isOfficial}
                      userIsModerator={workForArticle.user.isModerator}
                      userIconImageURL={withIconUrlFallback(
                        workForArticle.user.iconUrl,
                      )}
                      avatarFrame={workForArticle.user.avatarFrame}
                      userFollowersCount={workForArticle.user.followersCount}
                      userBiography={workForArticle.user.biography ?? ""}
                      userEnBiography={workForArticle.user.enBiography ?? null}
                      userWorksCount={workForArticle.user.worksCount}
                    />
                  </div>
                ) : undefined
              }
            />
            {workForArticle.user && (
              <div className="border-t pt-6">
                <WorkAuthorWorksSection
                  user={workForArticle.user}
                  currentWorkId={workForArticle.id}
                />
              </div>
            )}
            {workForArticle.album && (
              <WorkAlbumCard album={workForArticle.album} />
            )}
            {workForArticle.isCommentsEditable && (
              <div className="border-t pt-6">
                <WorkCommentList
                  workId={workForArticle.id}
                  comments={comments}
                  workOwnerId={workForArticle.user?.id}
                  workOwnerIconImageURL={workForArticle.user?.iconUrl}
                  workOwnerName={workForArticle.user?.name}
                  isWorkOwnerBlocked={workForArticle.user?.isBlocked ?? false}
                />
              </div>
            )}
            {workForArticle.user && authContext.isLoggedIn && (
              <WorkLazySection>
                <FollowSuggestions
                  userId={workForArticle.user.id}
                  userName={workForArticle.user.name}
                  title={t("おすすめのクリエイター", "Suggested creators")}
                />
              </WorkLazySection>
            )}
          </div>
        </div>
        <div className="mt-2 hidden w-full flex-col items-start space-y-4 pl-4 md:mt-0 md:flex md:max-w-80">
          {workForArticle.user !== null && (
            <div className="w-full">
              <WorkUser
                userId={workForArticle.user.id}
                userName={workForArticle.user.name}
                userIsOfficial={workForArticle.user.isOfficial}
                userIsModerator={workForArticle.user.isModerator}
                userLogin={workForArticle.user.login}
                userIconImageURL={withIconUrlFallback(
                  workForArticle.user.iconUrl,
                )}
                avatarFrame={workForArticle.user.avatarFrame}
                userFollowersCount={workForArticle.user.followersCount}
                userBiography={workForArticle.user.biography ?? ""}
                userEnBiography={workForArticle.user.enBiography ?? null}
                userWorksCount={workForArticle.user.worksCount}
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
                {props.newComments && props.newComments.length > 0 && (
                  <HomeNewCommentsSection
                    comments={props.newComments}
                    isSensitive
                  />
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
                {props.awardWorks && (
                  <HomeAwardWorksSection works={props.awardWorks} />
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
                  to={`/r/tags/${encodeURIComponent(randomTag)}`}
                  className="flex shrink-0 items-center text-muted-foreground text-sm hover:text-foreground"
                >
                  {t("すべて見る", "See all")}
                  <ChevronRightIcon className="size-4" />
                </Link>
              </div>
              <SensitiveWorkTagsWorks
                tagName={randomTag}
                rating={work.rating ?? "R18"}
              />
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

const _workQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      ...WorkArticle
    }
  }`,
  [workArticleFragment],
)

const sensitiveWorkQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      ...WorkArticle
    }
  }`,
  [sensitiveWorkArticleFragment],
)

const workLikedUsersQuery = graphql(
  `query SensitiveWorkLikedUsers($id: ID!) {
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

const userSensitiveSettingQuery = graphql(
  `query UserSetting {
    userSetting {
      ...UserSetting
    }
  }`,
  [userSettingFragment],
)
