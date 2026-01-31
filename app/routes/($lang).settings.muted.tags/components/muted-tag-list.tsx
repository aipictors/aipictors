import type { Tag } from "~/components/tag/tag-input"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { AuthContext } from "~/contexts/auth-context"
import { MutedTag } from "~/routes/($lang).settings.muted.tags/components/muted-tag"
import { useMutation, useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useEffect, useState } from "react"
import { useTranslation } from "~/hooks/use-translation"

export function MutedTagList () {
  const appContext = useContext(AuthContext)

  const t = useTranslation()

  const { data = null, refetch } = useSuspenseQuery(viewerMutedTagsQuery, {
    skip: appContext.isLoading,
    variables: { offset: 0, limit: 128 },
  })

  const [text, setText] = useState("")

  const [_tags, setTags] = useState<Tag[]>()

  useEffect(() => {
    if (data?.viewer?.mutedTags) {
      setTags(
        data.viewer.mutedTags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          text: tag.name,
        })),
      )
    }
  }, [data])

  const count = text.length

  const [mutation] = useMutation(muteTagMutation)

  const handleUnmute = async (tagName: string) => {
    await mutation({
      variables: {
        input: {
          tagName: tagName,
        },
      },
    })
    await refetch()
  }

  const handleMute = async () => {
    await mutation({
      variables: {
        input: {
          tagName: text,
        },
      },
    })
    setText("")
    await refetch()
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start space-x-4">
          <div className="flex-1">
            <Input
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
          <Button className="rounded-full" onClick={handleMute}>
            {t("タグを追加", "Add Tag")}
          </Button>
        </div>
      </div>
      {data?.viewer?.mutedTags.length === 0 && (
        <div className="rounded bg-info p-4">
          <p>{t("ミュートしているタグはありません", "No muted tags")}</p>
        </div>
      )}
      <div>
        {data?.viewer?.mutedTags.map((mutedTag) => (
          // biome-ignore lint/correctness/useJsxKeyInIterable: Intentional
          <div className="pt-1 pb-1">
            <MutedTag
              key={mutedTag.id}
              name={mutedTag.name}
              onClick={() => handleUnmute(mutedTag.name)}
            />
          </div>
        ))}
      </div>
    </>
  )
}

const viewerMutedTagsQuery = graphql(
  `query ViewerMutedTags($offset: Int!, $limit: Int!) {
    viewer {
      id
      mutedTags(offset: $offset, limit: $limit) {
        id
        name
      }
    }
  }`,
)

const muteTagMutation = graphql(
  `mutation MuteTag($input: MuteTagInput!) {
    muteTag(input: $input) {
      id
    }
  }`,
)
