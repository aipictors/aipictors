import { useMutation, useSuspenseQuery } from "@apollo/client/index"
import { Link } from "~/lib/app/locale-router"
import { graphql } from "gql.tada"
import { ChevronRightIcon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { FollowedTag } from "~/routes/($lang).settings.followed.tags/components/followed-tag"
import {
  FollowedTagEditor,
  MAX_FOLLOWED_TAGS,
} from "~/routes/($lang).settings.followed.tags/components/followed-tag-editor"

type Props = {
  onChanged?: () => void | Promise<void>
}

export function FollowedTagList(props: Props) {
  const appContext = useContext(AuthContext)

  const t = useTranslation()

  const { data = null, refetch } = useSuspenseQuery(viewerFollowedTagsQuery, {
    skip: appContext.isLoading,
    variables: { offset: 0, limit: MAX_FOLLOWED_TAGS },
  })

  /** 解除したものは返事を待たずに消す */
  const [removedNames, setRemovedNames] = useState<string[]>([])

  /** この画面で足したもの（カードをぽんと出す） */
  const [addedNames, setAddedNames] = useState<string[]>([])

  const [follow] = useMutation(followTagMutation)
  const [unFollow] = useMutation(unFollowTagMutation)

  const tags = (data?.viewer?.followingTags ?? []).filter(
    (tag) => !removedNames.includes(tag.name),
  )

  const onChanged = async () => {
    await refetch()
    await props.onChanged?.()
  }

  const undoRemove = async (tagName: string) => {
    try {
      await follow({ variables: { input: { tagName } } })
      await onChanged()
      setRemovedNames((names) => names.filter((name) => name !== tagName))
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : t("戻せませんでした", "Failed"),
      )
    }
  }

  const handleUnFollow = async (tagName: string) => {
    setRemovedNames((names) => [...names, tagName])
    try {
      await unFollow({ variables: { input: { tagName } } })
      await onChanged()
      toast(t(`#${tagName} を解除しました`, `Removed #${tagName}`), {
        action: {
          label: t("元に戻す", "Undo"),
          onClick: () => undoRemove(tagName),
        },
      })
    } catch (e) {
      setRemovedNames((names) => names.filter((name) => name !== tagName))
      toast.error(
        e instanceof Error ? e.message : t("解除できませんでした", "Failed"),
      )
    }
  }

  const progress = Math.min(100, (tags.length / MAX_FOLLOWED_TAGS) * 100)

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-50 via-teal-50 to-orange-50 p-4 pr-24 dark:from-cyan-950/40 dark:via-teal-950/30 dark:to-orange-950/30">
        <div className="-top-10 -left-8 pointer-events-none absolute size-32 rounded-full bg-cyan-300/30 blur-2xl" />
        <div className="relative space-y-2">
          <p className="font-bold text-lg leading-tight">
            {tags.length === 0
              ? t("好きなタグを集めよう", "Collect tags you love")
              : t(
                  `${tags.length} 個のタグをお気に入り中`,
                  `Following ${tags.length} tags`,
                )}
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {t(
              "登録したタグの新しい作品が、ホームの「お気に入りタグ新着」に届きます。",
              "New works with your favorite tags appear in the Favorite tags tab on Home.",
            )}
          </p>
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/70 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-orange-400 transition-[width] duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-semibold text-xs tabular-nums">
              {tags.length} / {MAX_FOLLOWED_TAGS}
            </span>
          </div>
        </div>
        <img
          src={
            tags.length === 0
              ? "/images/pictor-chan/gacha-wow.webp"
              : "/images/pictor-chan/gacha-nice.webp"
          }
          alt=""
          width={90}
          height={120}
          className="-bottom-3 pointer-events-none absolute right-1 h-[120px] w-auto drop-shadow-md motion-safe:animate-[aip-float_3.2s_ease-in-out_infinite]"
        />
      </section>

      <section className="space-y-3">
        <FollowedTagEditor
          followedNames={tags.map((tag) => tag.name)}
          onAdded={async (tagName) => {
            setRemovedNames((names) => names.filter((name) => name !== tagName))
            setAddedNames((names) => [...names, tagName])
            await onChanged()
          }}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">{t("登録中のタグ", "Your tags")}</h2>
          <Link
            to="/follow-tag-works"
            className="flex shrink-0 items-center text-muted-foreground text-sm hover:text-foreground"
          >
            {t("新着を見る", "See latest")}
            <ChevronRightIcon className="size-4" />
          </Link>
        </div>
        {tags.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground text-sm">
            {t(
              "まだ登録していません。上から好きなタグを追加してみましょう",
              "No tags yet. Add one you like above.",
            )}
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {tags.map((tag) => (
              <li
                key={tag.id}
                className={cn(
                  addedNames.includes(tag.name) &&
                    "motion-safe:animate-[aip-support-pop_0.45s_ease-out_both]",
                )}
              >
                <FollowedTag
                  name={tag.name}
                  onClick={() => handleUnFollow(tag.name)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

const viewerFollowedTagsQuery = graphql(
  `query ViewerFollowedTags($offset: Int!, $limit: Int!) {
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

const unFollowTagMutation = graphql(
  `mutation UnFollowTag($input: UnfollowTagInput!) {
    unfollowTag(input: $input)
  }`,
)
