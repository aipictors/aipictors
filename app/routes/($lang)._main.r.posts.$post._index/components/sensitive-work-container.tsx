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
import { NO_VIEW_CONTEXT, useCountWorkView } from "~/hooks/use-count-work-view"
import { useMutation, useQuery } from "@apollo/client/index"
import { WorkAuthorWorksSection } from "~/routes/($lang)._main.posts.$post._index/components/work-related-list"
import { WorkAlbumCard } from "~/routes/($lang)._main.posts.$post._index/components/work-album-card"
import { WorkLazySection } from "~/routes/($lang)._main.posts.$post._index/components/work-lazy-section"
import { FollowSuggestions } from "~/components/user/follow-suggestions"
import { ChevronRightIcon } from "lucide-react"
import { WorkNextAndPrevious } from "~/routes/($lang)._main.posts.$post._index/components/work-next-and-previous"
import { WorkCommentList } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import {
  HomeAwardWorksSection,
  homeAwardWorksQuery,
} from "~/routes/($lang)._main._index/components/home-award-works"
import { useTranslation } from "~/hooks/use-translation"
import { useNavigate, Link } from "~/lib/app/locale-router"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { DlsiteAffiliateCard } from "~/components/sensitive/dlsite-affiliate-card"
import { SensitiveWorkTagsWorks } from "~/routes/($lang)._main.r.posts.$post._index/components/sensitive-work-tags-works"
import { workCommentsQuery } from "~/routes/($lang)._main.posts.$post._index/route"
import { HomeNewCommentsSection } from "~/routes/($lang)._main._index/components/home-new-comments"
import { useLayoutVariant } from "~/hooks/use-layout-variant"
import { getJstDate } from "~/utils/jst-date"
import { mergeWorkViewerState } from "~/routes/($lang)._main.posts.$post._index/utils/merge-work-viewer-state"

/** 作者の他の作品に出す年齢種別（作品ページと一緒に読む分と同じ） */
const AUTHOR_WORKS_RATINGS: ("G" | "R15" | "R18" | "R18G")[] = ["R18", "R18G"]

type Props = {
  post: string
  work: FragmentOf<typeof workArticleFragment> | null
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

  // 全体を取り直すのは、ローダーで取れない作品と自分の作品（非公開のプロンプトなど）だけ
  const needsFullWork = props.work === null || isWorkOwner

  useCountWorkView({ workId: props.post, isWorkOwner })

  const { data } = useQuery(sensitiveWorkQuery, {
    skip: !needsFullWork || (props.work === null && authContext.isLoading),
    // 閲覧数はここでは数えない（useCountWorkView で 1 回だけ）
    context: NO_VIEW_CONTEXT,
    variables: {
      id: props.post,
    },
  })

  // 他の人の作品で閲覧者によって変わるのはここだけ
  const { data: viewerStateRet } = useQuery(sensitiveWorkViewerStateQuery, {
    skip: needsFullWork || authContext.isLoading || authContext.isNotLoggedIn,
    // 閲覧数はここでは数えない（useCountWorkView で 1 回だけ）
    context: NO_VIEW_CONTEXT,
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

  const workBase =
    data?.work ?? mergeWorkViewerState(props.work, viewerStateRet?.work)
  const likedUsers =
    likedUsersData?.work?.likedUsers ?? workBase?.likedUsers ?? []
  const work = workBase ? { ...workBase, likedUsers } : workBase

  // 右の列（広告・新着コメント・受賞作品）は PC でしか出ないので、スマホでは取得しない
  const { showDesktop } = useLayoutVariant()

  // コメントはブラウザで取る（全年齢の作品ページと同じ。ページの描画では取らない）。
  // ログイン状態が分かる前に取ると未ログインとして返り、ミュート・ブロックした人のコメントがそのまま出る
  const { data: workCommentsRet, loading: isFetchingComments } = useQuery(
    workCommentsQuery,
    {
      skip: authContext.isLoading,
      fetchPolicy: "network-only",
      ssr: false,
      variables: {
        workId: props.post,
      },
    },
  )
  const isLoadingComments = isFetchingComments || authContext.isLoading

  const comments = workCommentsRet?.work?.comments ?? []

  const { data: newCommentsData } = useQuery(sensitiveNewCommentsQuery, {
    skip: !showDesktop,
    fetchPolicy: "cache-first",
    ssr: false,
  })

  const now = getJstDate(new Date())
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const { data: awardWorksData } = useQuery(homeAwardWorksQuery, {
    skip: !showDesktop,
    fetchPolicy: "cache-first",
    ssr: false,
    variables: {
      offset: 0,
      limit: 4,
      where: {
        isSensitive: true,
        year: yesterday.getFullYear(),
        month: yesterday.getMonth() + 1,
        day: yesterday.getDate(),
      },
    },
  })

  const newComments = newCommentsData?.newComments ?? []
  const awardWorks = awardWorksData?.workAwards ?? []

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

  // 未ログインの人にはプランがないので問い合わせない
  const { data: pass } = useQuery(viewerCurrentPassQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  // 広告は PC の右の列にしか出ないので、スマホでは取得しない
  const { data: advertisements } = useQuery(randomCustomerAdvertisementQuery, {
    skip: !showDesktop,
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
                      workId={workForArticle.id}
                      workTagNames={workForArticle.tagNames}
                      showSupportRewardNote={false}
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
                  ratings={AUTHOR_WORKS_RATINGS}
                />
              </div>
            )}
            {workForArticle.album && (
              <WorkAlbumCard album={workForArticle.album} />
            )}
            {!isSubscriptionUser && (
              <div className="md:hidden">
                <DlsiteAffiliateCard tags={tags} source="r_post_mobile" />
              </div>
            )}
            {workForArticle.isCommentsEditable && (
              <div className="border-t pt-6">
                <WorkCommentList
                  workTagNames={workForArticle.tagNames}
                  workId={workForArticle.id}
                  comments={comments}
                  isLoadingComments={isLoadingComments}
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
                workId={workForArticle.id}
                workTagNames={workForArticle.tagNames}
                showSupportRewardNote={false}
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
                {!isSubscriptionUser && (
                  <DlsiteAffiliateCard tags={tags} source="r_post_side" />
                )}
                {newComments.length > 0 ? (
                  <HomeNewCommentsSection comments={newComments} isSensitive />
                ) : (
                  // 届くまで場所を取っておく（下の告知が押し下げられないように）
                  showDesktop &&
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

const sensitiveWorkQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      ...WorkArticle
    }
  }`,
  [sensitiveWorkArticleFragment],
)

const sensitiveWorkViewerStateQuery = graphql(
  `query SensitiveWorkViewerState($id: ID!) {
    work(id: $id) {
      id
      isLiked
      likesCount
      isBookmarked
      isMyRecommended
      user {
        id
        isFollower
        isFollowee
        isMuted
        isBlocked
      }
    }
  }`,
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
        avatarFrame {
          id
          frameType
          backgroundStyle
          overlayImageUrl
          borderPadding
        }
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

const SideMenuAdvertisementsFragment = graphql(
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

const sensitiveNewCommentsQuery = graphql(
  `query NewComments {
    newComments: newComments(
      offset: 0,
      limit: 8,
      where: {
        isSensitive: true,
        isTextOnly: true,
        ratings: [R18, R18G],
      }
    ) {
      ...HomeNewComments
    }
  }`,
  [HomeNewCommentsFragment],
)
