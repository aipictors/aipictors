import type { Tag } from "@/_components/tag/tag-input"
import { Button } from "@/_components/ui/button"
import { Input } from "@/_components/ui/input"
import { AuthContext } from "@/_contexts/auth-context"
import { PartialMutedTagFieldsFragment } from "@/_graphql/fragments/partial-muted-tag-fields"
import { MutedTag } from "@/routes/($lang).settings.muted.tags/_components/muted-tag"
import {
  ApolloError,
  useMutation,
  useSuspenseQuery,
} from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useEffect, useState } from "react"

export const MutedTagList = () => {
  const appContext = useContext(AuthContext)

  const { data = null, refetch } = useSuspenseQuery(viewerMutedTagsQuery, {
    skip: appContext.isLoading,
    variables: { offset: 0, limit: 128 },
  })

  console.log(data)

  const [text, setText] = useState("")

  const [tags, setTags] = useState<Tag[]>()

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
    try {
      await mutation({
        variables: {
          input: {
            tagName: text,
          },
        },
      })
      setText("")
      await refetch()
    } catch (error) {
      if (error instanceof ApolloError) {
        console.log(error.name)
      }
    }
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
              placeholder="タグ"
              maxLength={40}
            />
            <div className="flex justify-end">
              <p className="text-xs">{`${count}/40`}</p>
            </div>
          </div>
          <Button className="rounded-full" onClick={handleMute}>
            {"タグを追加"}
          </Button>
        </div>
      </div>
      {data?.viewer?.mutedTags.length === 0 && (
        <div className="rounded bg-info p-4">
          <p>{"ミュートしているタグはありません"}</p>
        </div>
      )}
      <div>
        {data?.viewer?.mutedTags.map((mutedTag) => (
          // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
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
      mutedTags(offset: $offset, limit: $limit) {
        ...PartialMutedTagFields
      }
    }
  }`,
  [PartialMutedTagFieldsFragment],
)

const muteTagMutation = graphql(
  `mutation MuteTag($input: MuteTagInput!) {
    muteTag(input: $input) {
      id
    }
  }`,
)
