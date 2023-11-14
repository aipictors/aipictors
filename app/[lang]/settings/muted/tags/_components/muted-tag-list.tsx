"use client"

import {
  MuteTagDocument,
  ViewerMutedTagsDocument,
} from "@/__generated__/apollo"
import type {
  MuteTagMutation,
  MuteTagMutationVariables,
  ViewerMutedTagsQuery,
  ViewerMutedTagsQueryVariables,
} from "@/__generated__/apollo"
import { MutedTag } from "@/app/[lang]/settings/muted/tags/_components/muted-tag"
import { AppContext } from "@/app/_contexts/app-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ApolloError, useMutation, useSuspenseQuery } from "@apollo/client"
import { useContext, useState } from "react"

export const MutedTagList = () => {
  const appContext = useContext(AppContext)

  const { data = null, refetch } = useSuspenseQuery<
    ViewerMutedTagsQuery,
    ViewerMutedTagsQueryVariables
  >(ViewerMutedTagsDocument, {
    skip: appContext.isLoading,
    variables: { offset: 0, limit: 128 },
  })

  const [text, setText] = useState("")

  const count = text.length

  const { toast } = useToast()

  const [mutation] = useMutation<MuteTagMutation, MuteTagMutationVariables>(
    MuteTagDocument,
  )

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
        toast({})
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
        <div className="bg-info rounded-md p-4">
          <p>ミュートしているタグはありません</p>
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
