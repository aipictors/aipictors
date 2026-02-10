import { useMutation, useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Plus } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import type { Tag } from "~/components/tag/tag-input"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { FollowedTag } from "~/routes/($lang).settings.followed.tags/components/followed-tag"

type Props = {
  onChanged?: () => void | Promise<void>
}

export function FollowedTagList(props: Props) {
  const appContext = useContext(AuthContext)

  const t = useTranslation()

  const { data = null, refetch } = useSuspenseQuery(viewerFollowedTagsQuery, {
    skip: appContext.isLoading,
    variables: { offset: 0, limit: 32 },
  })

  const [text, setText] = useState("")

  const [_tags, setTags] = useState<Tag[]>()

  useEffect(() => {
    if (data?.viewer?.followingTags) {
      setTags(
        data.viewer.followingTags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          text: tag.name,
        })),
      )
    }
  }, [data])

  const count = text.length

  const [follow, { loading: isFollowing }] = useMutation(followTagMutation)

  const [unFollow, { loading: isUnFollowing }] =
    useMutation(unFollowTagMutation)

  const handleUnFollow = async (tagName: string) => {
    try {
      await unFollow({
        variables: {
          input: {
            tagName: tagName,
          },
        },
      })
      await refetch()
      await props.onChanged?.()
      toast(t("タグを削除しました", "Tag removed"))
    } catch (e) {
      console.error(e)
      if (e instanceof Error) {
        toast(e.message)
      }
    }
  }

  const handleFollow = async () => {
    try {
      await follow({
        variables: {
          input: {
            tagName: text,
          },
        },
      })
      setText("")
      await refetch()
      await props.onChanged?.()
      toast(t("タグを追加しました", "Tag added"))
    } catch (e) {
      console.error(e)
      if (e instanceof Error) {
        toast(e.message)
      }
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start gap-x-2">
          <div className="flex-1">
            <Input
              id="followed-tag-input"
              className="w-full rounded-full"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("タグ", "Tag")}
              maxLength={40}
            />
            <div className="flex justify-end">
              <p className="text-xs">{`${count}/40`}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="rounded-full"
            onClick={handleFollow}
            disabled={isFollowing || text.trim().length === 0}
            aria-label={t("タグを追加", "Add tag")}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
      {data?.viewer?.followingTags.length === 0 && (
        <div className="rounded bg-info p-4">
          <p>{t("フォローしているタグはありません", "No muted tags")}</p>
        </div>
      )}
      <div>
        {data?.viewer?.followingTags.map((followingTag) => (
          // biome-ignore lint/correctness/useJsxKeyInIterable: Intentional
          <div className="pt-1 pb-1">
            <FollowedTag
              key={followingTag.id}
              name={followingTag.name}
              onClick={() => handleUnFollow(followingTag.name)}
            />
          </div>
        ))}
      </div>
    </>
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
