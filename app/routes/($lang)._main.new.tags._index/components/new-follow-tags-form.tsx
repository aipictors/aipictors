import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { CheckIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { OnboardingHero } from "~/components/onboarding-hero"
import { OnboardingNextButton } from "~/components/onboarding-next-button"
import { OnboardingSteps } from "~/components/onboarding-steps"
import { LoginPage } from "~/components/page/login-page"
import { Input } from "~/components/ui/input"
import { Skeleton } from "~/components/ui/skeleton"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { useNavigate } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { RecommendedCreators } from "~/routes/($lang)._main.new.tags._index/components/recommended-creators"
import { MAX_FOLLOWED_TAGS } from "~/routes/($lang).settings.followed.tags/components/followed-tag-editor"
import { toResizedImageUrl } from "~/utils/resized-image-url"

/** これだけ選ぶとホームの「お気に入りタグ新着」がにぎやかになる目安 */
const GOAL_COUNT = 3

/**
 * 好きなタグを写真のタイルから選ぶ（押すたびに選ぶ・外す。まとめて登録する）
 */
export function NewFollowTagsForm() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const navigate = useNavigate()

  const [selected, setSelected] = useState<string[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [text, setText] = useState("")
  const [search, setSearch] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setSearch(text.trim()), 250)
    return () => clearTimeout(timer)
  }, [text])

  const isLoggedIn = !authContext.isLoading && !authContext.isNotLoggedIn

  const { data: recommendedData, loading: isRecommendedLoading } = useQuery(
    onboardingRecommendedTagsQuery,
    { fetchPolicy: "cache-first" },
  )

  const { data: searchData } = useQuery(onboardingTagSearchQuery, {
    skip: search.length === 0,
    variables: { search },
    fetchPolicy: "cache-first",
  })

  // 前に登録したものは選んだ状態から始める（数の上限にも入れる）
  const { data: followedData } = useQuery(onboardingFollowedTagsQuery, {
    skip: !isLoggedIn,
    variables: { offset: 0, limit: MAX_FOLLOWED_TAGS },
  })
  const followedNames = (followedData?.viewer?.followingTags ?? []).map(
    (tag) => tag.name,
  )

  const [follow] = useMutation(followTagMutation)
  const [followUser] = useMutation(followUserMutation)

  if (authContext.isNotLoggedIn) {
    return <LoginPage />
  }

  const remaining = MAX_FOLLOWED_TAGS - followedNames.length
  const isFull = selected.length >= remaining

  const toggle = (name: string) => {
    if (followedNames.includes(name)) return
    if (selected.includes(name)) {
      setSelected((names) => names.filter((value) => value !== name))
      return
    }
    if (isFull) {
      toast(
        t(
          `登録できるのは ${MAX_FOLLOWED_TAGS} 個までです`,
          `Up to ${MAX_FOLLOWED_TAGS} tags`,
        ),
      )
      return
    }
    setSelected((names) => [...names, name])
  }

  const onSubmit = async () => {
    if (isSaving) return
    if (selected.length === 0 && selectedUserIds.length === 0) {
      navigate("/settings/completed")
      return
    }
    setIsSaving(true)
    let count = 0
    let userCount = 0
    // 1 つ失敗しても残りは登録する
    for (const tagName of selected) {
      try {
        await follow({ variables: { input: { tagName } } })
        count += 1
      } catch {}
    }
    for (const userId of selectedUserIds) {
      try {
        await followUser({ variables: { input: { userId } } })
        userCount += 1
      } catch {}
    }
    setIsSaving(false)
    if (count < selected.length || userCount < selectedUserIds.length) {
      toast(
        t(
          "登録できなかったものがあります。あとからでも追加できます。",
          "Some could not be added. You can add them later.",
        ),
      )
    }
    navigate(`/settings/completed?tags=${count}&follows=${userCount}`)
  }

  // 下のおすすめのクリエイターまで遠くならないよう 18 個（3 列で 6 段）
  const recommended = (recommendedData?.recommendedTags ?? [])
    .filter((tag) => tag.tagName.length <= 20)
    .slice(0, 18)
  const recommendedNames = recommended.map((tag) => tag.tagName)

  const suggestions = (searchData?.tags ?? [])
    .map((tag) => tag.name)
    .filter((name) => name.length <= 20)
    .slice(0, 8)

  // 検索から選んだものはタイルにないので、上に丸いチップで並べる
  const extraSelected = selected.filter(
    (name) => !recommendedNames.includes(name),
  )

  const count = selected.length
  const total = count + selectedUserIds.length
  const line =
    count === 0
      ? t("気になるタグをタップしてね！", "Tap the tags you like!")
      : count < GOAL_COUNT
        ? t(
            `いい感じ！あと ${GOAL_COUNT - count} つ選ぶとホームがもっと楽しくなるよ`,
            `Nice! ${GOAL_COUNT - count} more makes Home even better`,
          )
        : t("センス最高！✨", "Great taste! ✨")

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-3 pt-4 pb-40 md:pt-8">
      <div className="mx-auto max-w-lg space-y-5">
        <OnboardingSteps current={3} />
        <OnboardingHero
          pose={count >= GOAL_COUNT ? "nice" : "wow"}
          line={line}
          title={t("好きなものを教えてね", "Tell us what you love")}
          description={t(
            "選んだタグやクリエイターの新しい作品が、ホームに届きます。",
            "New works from the tags and creators you pick will show up on Home.",
          )}
        />
      </div>

      <div className="space-y-2">
        <div className="relative">
          <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3.5 size-4 text-muted-foreground" />
          <Input
            aria-label={t("タグを探す", "Find a tag")}
            className="h-11 rounded-full pl-10 text-base md:text-sm"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t(
              "ほかのタグを探す（例: 猫耳、風景）",
              "Search other tags (e.g. cat ears, landscape)",
            )}
            maxLength={40}
          />
        </div>
        {text.trim().length > 0 && suggestions.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {suggestions.map((name) => {
              const isSelected =
                selected.includes(name) || followedNames.includes(name)
              return (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => toggle(name)}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-all",
                      isSelected
                        ? "border-teal-500 bg-teal-500 text-white"
                        : "hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40",
                    )}
                  >
                    {isSelected ? (
                      <CheckIcon className="size-3.5" />
                    ) : (
                      <PlusIcon className="size-3.5 text-muted-foreground" />
                    )}
                    {name}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        {extraSelected.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {extraSelected.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => toggle(name)}
                  aria-label={t(`#${name} を外す`, `Remove #${name}`)}
                  className="flex items-center gap-1 rounded-full bg-teal-500 px-3 py-1.5 font-semibold text-sm text-white motion-safe:animate-[aip-support-pop_0.35s_ease-out_both]"
                >
                  #{name}
                  <XIcon className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {isRecommendedLoading && recommended.length === 0
          ? Array.from({ length: 12 }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 読み込み中の枠
              <li key={index}>
                <Skeleton className="aspect-square w-full rounded-2xl" />
              </li>
            ))
          : recommended.map((tag, index) => {
              const isFollowed = followedNames.includes(tag.tagName)
              const isSelected = isFollowed || selected.includes(tag.tagName)
              return (
                <li
                  key={tag.tagName}
                  className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:fill-mode-both"
                  style={{ animationDelay: `${Math.min(index, 16) * 30}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => toggle(tag.tagName)}
                    aria-pressed={isSelected}
                    title={tag.tagName}
                    className={cn(
                      "group relative block aspect-square w-full overflow-hidden rounded-2xl bg-muted ring-offset-2 ring-offset-background transition-all duration-200",
                      isSelected
                        ? "scale-[0.96] ring-4 ring-teal-500"
                        : "hover:-translate-y-0.5 hover:shadow-lg",
                    )}
                  >
                    <img
                      src={toResizedImageUrl(tag.thumbnailUrl, 320)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={cn(
                        "size-full object-cover object-top transition-transform duration-500",
                        !isSelected && "group-hover:scale-110",
                      )}
                    />
                    <span
                      className={cn(
                        "absolute inset-0 transition-colors",
                        isSelected ? "bg-teal-500/25" : "bg-transparent",
                      )}
                    />
                    <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/80 to-transparent px-2 pt-6 pb-1.5 text-center font-bold text-white text-xs">
                      #{tag.tagName}
                    </span>
                    <span
                      className={cn(
                        "absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full transition-all",
                        isSelected
                          ? "bg-teal-500 text-white motion-safe:animate-[aip-support-pop_0.35s_ease-out_both]"
                          : "bg-black/45 text-white backdrop-blur-sm",
                      )}
                    >
                      {isSelected ? (
                        <CheckIcon className="size-3.5" />
                      ) : (
                        <PlusIcon className="size-3.5" />
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
      </ul>

      <RecommendedCreators
        tagNames={selected}
        selectedIds={selectedUserIds}
        excludeIds={
          authContext.userId === null ? [] : [authContext.userId.toString()]
        }
        onToggle={(userId) =>
          setSelectedUserIds((ids) =>
            ids.includes(userId)
              ? ids.filter((id) => id !== userId)
              : [...ids, userId],
          )
        }
        onSelectAll={(userIds) =>
          setSelectedUserIds((ids) => [...ids, ...userIds])
        }
      />

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto max-w-lg space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: GOAL_COUNT }, (_, index) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: 目安の点
                  key={index}
                  className={cn(
                    "h-1.5 w-6 rounded-full transition-colors duration-300",
                    index < count
                      ? "bg-gradient-to-r from-cyan-400 to-orange-400"
                      : "bg-muted",
                  )}
                />
              ))}
            </div>
            <span className="text-muted-foreground text-xs tabular-nums">
              {selectedUserIds.length > 0
                ? t(
                    `タグ ${count} ・ クリエイター ${selectedUserIds.length}`,
                    `${count} tags · ${selectedUserIds.length} creators`,
                  )
                : t(`${count} 個えらんだ`, `${count} selected`)}
            </span>
            <button
              type="button"
              onClick={() => navigate("/settings/completed")}
              className="ml-auto text-muted-foreground text-xs underline-offset-2 hover:underline"
            >
              {t("あとで選ぶ", "Skip for now")}
            </button>
          </div>
          <OnboardingNextButton
            disabled={isSaving || total === 0}
            isLoading={isSaving}
            onClick={onSubmit}
          >
            {total === 0
              ? t("タグやクリエイターを選んでね", "Pick tags or creators")
              : t("これで はじめる", "Let's go")}
          </OnboardingNextButton>
        </div>
      </div>
    </div>
  )
}

const onboardingRecommendedTagsQuery = graphql(
  `query OnboardingRecommendedTags {
    recommendedTags(limit: 24, where: { isSensitive: false }) {
      tagName
      thumbnailUrl
    }
  }`,
)

const onboardingTagSearchQuery = graphql(
  `query OnboardingTagSearch($search: String!) {
    tags(limit: 12, offset: 0, where: { search: $search }) {
      id
      name
    }
  }`,
)

const onboardingFollowedTagsQuery = graphql(
  `query OnboardingFollowedTags($offset: Int!, $limit: Int!) {
    viewer {
      id
      followingTags(offset: $offset, limit: $limit) {
        id
        name
      }
    }
  }`,
)

const followTagMutation = graphql(
  `mutation FollowTag($input: FollowTagInput!) {
    followTag(input: $input)
  }`,
)

const followUserMutation = graphql(
  `mutation OnboardingFollowUser($input: FollowUserInput!) {
    followUser(input: $input) {
      id
      isFollowee
    }
  }`,
)
