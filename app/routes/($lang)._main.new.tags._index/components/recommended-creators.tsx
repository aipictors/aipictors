import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { CheckIcon, PlusIcon, UserRoundIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Skeleton } from "~/components/ui/skeleton"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { toResizedImageUrl } from "~/utils/resized-image-url"

const MAX_CREATORS = 8

type Creator = {
  id: string
  name: string
  iconUrl: string | null
  followersCount: number
  thumbnails: string[]
}

type Props = {
  /** 選んだタグ（このタグで最近人気の人を出す。空ならサイトのおすすめ） */
  tagNames: string[]
  selectedIds: string[]
  /** 自分と、もうフォローしている人は出さない */
  excludeIds: string[]
  onToggle: (userId: string) => void
  onSelectAll: (userIds: string[]) => void
}

/** 30 日前の日付（YYYY-MM-DD）。休止中の人ばかりにならないよう最近の作品から選ぶ */
function toRecentDate() {
  const date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  return date.toISOString().slice(0, 10)
}

/**
 * おすすめのクリエイター。押すとフォローする人に入る（登録はまとめて最後に）
 */
export function RecommendedCreators(props: Props) {
  const t = useTranslation()

  // タグを押すたびに読み直さないよう、少し待ってから反映する
  const tagKey = props.tagNames.join("\n")
  const [debouncedTags, setDebouncedTags] = useState<string[]>([])
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedTags(tagKey.length === 0 ? [] : tagKey.split("\n")),
      600,
    )
    return () => clearTimeout(timer)
  }, [tagKey])

  const [since] = useState(toRecentDate)

  const isByTags = debouncedTags.length > 0

  const { data: tagData, loading: isTagLoading } = useQuery(
    creatorsByTagsQuery,
    {
      skip: !isByTags,
      fetchPolicy: "cache-first",
      variables: { tagNames: debouncedTags, since },
    },
  )

  const { data: popularData, loading: isPopularLoading } = useQuery(
    popularCreatorsQuery,
    { fetchPolicy: "cache-first" },
  )

  const toCreator = (user: {
    id: string
    name: string
    login: string
    iconUrl: string | null
    followersCount: number
    isFollowee: boolean
    works: { smallThumbnailImageURL: string }[]
  }): Creator | null => {
    if (user.login === "admin" || user.isFollowee) return null
    if (user.works.length === 0) return null
    return {
      id: user.id,
      name: user.name,
      iconUrl: user.iconUrl,
      followersCount: user.followersCount,
      thumbnails: user.works.map((work) => work.smallThumbnailImageURL),
    }
  }

  const fromTags = (tagData?.works ?? []).map((work) =>
    work.user ? toCreator(work.user) : null,
  )
  const fromPopular = (popularData?.recommendedUsers ?? []).map(toCreator)

  // タグで見つけた人を先に、足りなければおすすめで埋める
  const creators: Creator[] = []
  for (const creator of isByTags
    ? [...fromTags, ...fromPopular]
    : fromPopular) {
    if (creator === null) continue
    if (props.excludeIds.includes(creator.id)) continue
    if (creators.some((value) => value.id === creator.id)) continue
    creators.push(creator)
    if (creators.length >= MAX_CREATORS) break
  }

  const isLoading =
    creators.length === 0 && (isPopularLoading || (isByTags && isTagLoading))

  if (!isLoading && creators.length === 0) return null

  const unselectedIds = creators
    .map((creator) => creator.id)
    .filter((id) => !props.selectedIds.includes(id))

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-bold text-lg">
            {t("おすすめのクリエイター", "Creators you might like")}
          </h2>
          <p className="text-muted-foreground text-xs">
            {isByTags
              ? t(
                  "選んだタグで最近人気の人たち",
                  "Popular lately in the tags you picked",
                )
              : t(
                  "フォローすると新しい作品がホームに届きます",
                  "Follow to see their new works on Home",
                )}
          </p>
        </div>
        {unselectedIds.length > 0 && (
          <button
            type="button"
            onClick={() => props.onSelectAll(unselectedIds)}
            className="shrink-0 rounded-full bg-teal-50 px-3 py-1.5 font-semibold text-teal-700 text-xs transition-colors hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-200"
          >
            {t("まとめてフォロー", "Follow all")}
          </button>
        )}
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 読み込み中の枠
              <li key={index}>
                <Skeleton className="h-[136px] w-full rounded-2xl" />
              </li>
            ))
          : creators.map((creator, index) => {
              const isSelected = props.selectedIds.includes(creator.id)
              return (
                <li
                  key={creator.id}
                  className="motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:fill-mode-both motion-safe:animate-in motion-safe:duration-300"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => props.onToggle(creator.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "w-full overflow-hidden rounded-2xl border-2 bg-card text-left transition-all",
                      isSelected
                        ? "border-teal-500 shadow-md shadow-teal-500/15"
                        : "border-border hover:border-teal-300",
                    )}
                  >
                    <div className="grid h-16 grid-cols-3 gap-px bg-muted">
                      {[0, 1, 2].map((thumbIndex) =>
                        creator.thumbnails[thumbIndex] ? (
                          <img
                            key={thumbIndex}
                            src={toResizedImageUrl(
                              creator.thumbnails[thumbIndex],
                              240,
                            )}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="h-16 w-full object-cover object-top"
                          />
                        ) : (
                          <div key={thumbIndex} className="bg-muted" />
                        ),
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2.5">
                      {creator.iconUrl ? (
                        <img
                          src={creator.iconUrl}
                          alt=""
                          loading="lazy"
                          className="-mt-7 size-11 shrink-0 rounded-full border-2 border-card bg-muted object-cover"
                        />
                      ) : (
                        <span className="-mt-7 flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-card bg-muted text-muted-foreground">
                          <UserRoundIcon className="size-5" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-sm">
                          {creator.name}
                        </span>
                        <span className="block text-muted-foreground text-xs tabular-nums">
                          {t(
                            `フォロワー ${creator.followersCount}`,
                            `${creator.followersCount} followers`,
                          )}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "flex h-8 shrink-0 items-center gap-1 rounded-full px-3 font-bold text-xs transition-all",
                          isSelected
                            ? "bg-teal-500 text-white motion-safe:animate-[aip-support-pop_0.35s_ease-out_both]"
                            : "bg-foreground text-background",
                        )}
                      >
                        {isSelected ? (
                          <>
                            <CheckIcon className="size-3.5" />
                            {t("フォロー中", "Following")}
                          </>
                        ) : (
                          <>
                            <PlusIcon className="size-3.5" />
                            {t("フォロー", "Follow")}
                          </>
                        )}
                      </span>
                    </div>
                  </button>
                </li>
              )
            })}
      </ul>
    </section>
  )
}

const creatorsByTagsQuery = graphql(
  `query OnboardingCreatorsByTags($tagNames: [String!]!, $since: String!) {
    works(
      limit: 12
      offset: 0
      where: {
        tagNames: $tagNames
        ratings: [G]
        orderBy: LIKES_COUNT
        sort: DESC
        isOneWorkPerUser: true
        createdAtAfter: $since
      }
    ) {
      id
      user {
        id
        login
        name
        iconUrl
        followersCount
        isFollowee
        works(limit: 3, offset: 0, where: { ratings: [G] }) {
          id
          smallThumbnailImageURL
        }
      }
    }
  }`,
)

const popularCreatorsQuery = graphql(
  `query OnboardingPopularCreators {
    recommendedUsers(limit: 16, offset: 0) {
      id
      login
      name
      iconUrl
      followersCount
      isFollowee
      works(limit: 3, offset: 0, where: { ratings: [G] }) {
        id
        smallThumbnailImageURL
      }
    }
  }`,
)
