import { useMutation, useSuspenseQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import { ChevronRightIcon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
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

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t(
            "好きなタグを登録すると、新しい作品がホームの「お気に入りタグ新着」に届きます。",
            "New works with your favorite tags appear in the Favorite tags tab on Home.",
          )}
        </p>
        <FollowedTagEditor
          followedNames={tags.map((tag) => tag.name)}
          onAdded={async (tagName) => {
            setRemovedNames((names) => names.filter((name) => name !== tagName))
            await onChanged()
          }}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">
            {t("登録中のタグ", "Your tags")}
            <span className="ml-2 font-normal text-muted-foreground text-sm tabular-nums">
              {tags.length} / {MAX_FOLLOWED_TAGS}
            </span>
          </h2>
          <Link
            to="/follow-tag-works"
            className="flex shrink-0 items-center text-muted-foreground text-sm hover:text-foreground"
          >
            {t("新着を見る", "See latest")}
            <ChevronRightIcon className="size-4" />
          </Link>
        </div>
        {tags.length === 0 ? (
          <p className="rounded-2xl bg-muted/60 p-6 text-center text-muted-foreground text-sm">
            {t(
              "まだ登録していません。上から好きなタグを追加してみましょう",
              "No tags yet. Add one you like above.",
            )}
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {tags.map((tag) => (
              <li key={tag.id}>
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
