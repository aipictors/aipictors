import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { CheckIcon, Loader2Icon, PlusIcon, SearchIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { toResizedImageUrl } from "~/utils/resized-image-url"

export const MAX_FOLLOWED_TAGS = 20

type Props = {
  followedNames: string[]
  onAdded: (tagName: string) => void | Promise<void>
  autoFocus?: boolean
}

/**
 * お気に入りタグを探して追加する（入力すると候補、空なら人気のタグを写真付きで出す）
 */
export function FollowedTagEditor(props: Props) {
  const t = useTranslation()
  const [text, setText] = useState("")
  const [search, setSearch] = useState("")
  /** この画面で足したおすすめは、消さずにチェックを付けて残す */
  const [addedNames, setAddedNames] = useState<string[]>([])

  useEffect(() => {
    const timer = setTimeout(() => setSearch(text.trim()), 250)
    return () => clearTimeout(timer)
  }, [text])

  const { data: searchData } = useQuery(tagSearchQuery, {
    skip: search.length === 0,
    variables: { search },
    fetchPolicy: "cache-first",
  })

  const { data: recommendedData } = useQuery(recommendedFollowTagsQuery, {
    fetchPolicy: "cache-first",
  })

  const [follow, { loading }] = useMutation(followTagMutation)

  const isFull = props.followedNames.length >= MAX_FOLLOWED_TAGS

  const add = async (tagName: string) => {
    const name = tagName.trim()
    if (name.length === 0 || loading) return
    if (props.followedNames.includes(name)) {
      toast(t("登録済みのタグです", "Already added"))
      return
    }
    try {
      await follow({ variables: { input: { tagName: name } } })
      setText("")
      setSearch("")
      setAddedNames((names) => [...names, name])
      await props.onAdded(name)
      toast(t(`#${name} を追加しました`, `Added #${name}`))
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : t("追加できませんでした", "Failed"),
      )
    }
  }

  const suggestions = (searchData?.tags ?? [])
    .map((tag) => tag.name)
    // 作品のタイトルのような長いタグは候補に出さない
    .filter((name) => name.length <= 20)
    .filter((name) => !props.followedNames.includes(name))
    .slice(0, 6)

  const recommended = (recommendedData?.recommendedTags ?? [])
    .filter(
      (tag) =>
        !props.followedNames.includes(tag.tagName) ||
        addedNames.includes(tag.tagName),
    )
    .slice(0, 12)

  return (
    <div className="space-y-3">
      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          add(text)
        }}
      >
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3.5 size-4 text-muted-foreground" />
          <Input
            aria-label={t("タグを探す", "Find a tag")}
            className="h-11 rounded-full pl-10"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={
              isFull
                ? t(
                    `登録できるのは ${MAX_FOLLOWED_TAGS} 個までです`,
                    `Up to ${MAX_FOLLOWED_TAGS} tags`,
                  )
                : t("好きなタグを探す", "Find a tag you like")
            }
            maxLength={40}
            disabled={isFull}
            // biome-ignore lint/a11y/noAutofocus: 追加のダイアログを開いたらすぐ入力できるように
            autoFocus={props.autoFocus}
          />
        </div>
        <Button
          type="submit"
          className="h-11 shrink-0 gap-1 rounded-full"
          disabled={isFull || loading || text.trim().length === 0}
        >
          {loading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <PlusIcon className="size-4" />
          )}
          {t("追加", "Add")}
        </Button>
      </form>

      {text.trim().length > 0 && suggestions.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {suggestions.map((name) => (
            <li key={name}>
              <button
                type="button"
                disabled={isFull || loading}
                onClick={() => add(name)}
                className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                <PlusIcon className="size-3.5 text-muted-foreground" />
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {text.trim().length === 0 && recommended.length > 0 && (
        <div className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs">
            {t(
              "人気のタグ・押すだけで追加できます",
              "Popular tags · tap to add",
            )}
          </p>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {recommended.map((tag) => {
              const isAdded = props.followedNames.includes(tag.tagName)
              return (
                <li key={tag.tagName}>
                  <button
                    type="button"
                    disabled={loading || isAdded || isFull}
                    onClick={() => add(tag.tagName)}
                    aria-pressed={isAdded}
                    className={cn(
                      "group relative block aspect-square w-full overflow-hidden rounded-2xl bg-muted ring-offset-2 ring-offset-background transition-all duration-200 disabled:cursor-default",
                      isAdded
                        ? "scale-[0.96] ring-4 ring-teal-500"
                        : "enabled:hover:-translate-y-0.5 enabled:hover:shadow-lg",
                    )}
                    title={tag.tagName}
                  >
                    <img
                      src={toResizedImageUrl(tag.thumbnailUrl, 320)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={cn(
                        "size-full object-cover object-top transition-transform duration-500",
                        !isAdded && "group-hover:scale-110",
                      )}
                    />
                    {isAdded && (
                      <span className="absolute inset-0 bg-teal-500/25" />
                    )}
                    <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/80 to-transparent px-1.5 pt-6 pb-1.5 text-center font-bold text-white text-xs">
                      #{tag.tagName}
                    </span>
                    <span
                      className={cn(
                        "absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full text-white",
                        isAdded
                          ? "bg-teal-500 motion-safe:animate-[aip-support-pop_0.35s_ease-out_both]"
                          : "bg-black/45 backdrop-blur-sm",
                      )}
                    >
                      {isAdded ? (
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
        </div>
      )}
    </div>
  )
}

const tagSearchQuery = graphql(
  `query FollowedTagSearch($search: String!) {
    tags(limit: 12, offset: 0, where: { search: $search }) {
      id
      name
    }
  }`,
)

const recommendedFollowTagsQuery = graphql(
  `query RecommendedFollowTags {
    recommendedTags(limit: 16, where: { isSensitive: false }) {
      tagName
      thumbnailUrl
    }
  }`,
)

const followTagMutation = graphql(
  `mutation FollowTag($input: FollowTagInput!) {
    followTag(input: $input)
  }`,
)
