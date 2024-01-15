"use client"

import { MutedTag } from "@/app/[lang]/settings/muted/tags/_components/muted-tag"
import { AuthContext } from "@/app/_contexts/auth-context"
import { Button } from "@/components/ui/button"
import { muteTagMutation } from "@/graphql/mutations/mute-tag"
import { viewerMutedTagsQuery } from "@/graphql/queries/viewer/viewer-muted-tags"
import { ApolloError, useMutation, useSuspenseQuery } from "@apollo/client"
import { useContext, useState } from "react"

export const MutedTagList = () => {
  const appContext = useContext(AuthContext)

  const { data = null, refetch } = useSuspenseQuery(viewerMutedTagsQuery, {
    skip: appContext.isLoading,
    variables: { offset: 0, limit: 128 },
  })

  const [text, setText] = useState("")

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
            <input
              className="rounded-full p-2"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="タグ"
            />
            <div className="flex justify-end">
              <p className="text-xs">{`${count}/12`}</p>
            </div>
          </div>
          <Button
            className="bg-primary text-white rounded-full px-4 py-2"
            onClick={handleMute}
          >
            {"変更を保存"}
          </Button>
        </div>
      </div>
      {data?.viewer?.mutedTags.length === 0 && (
        <div className="bg-info rounded p-4">
          <p>{"ミュートしているタグはありません"}</p>
        </div>
      )}
      <div>
        {data?.viewer?.mutedTags.map((mutedTag) => (
          <MutedTag
            key={mutedTag.id}
            name={mutedTag.name}
            onClick={() => handleUnmute(mutedTag.name)}
          />
        ))}
      </div>
    </>
  )
}
