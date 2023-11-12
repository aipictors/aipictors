"use client"

import { ApolloError, useMutation, useSuspenseQuery } from "@apollo/client"
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Button,
  Divider,
  HStack,
  Input,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react"
import { MuteTagDocument, ViewerMutedTagsDocument } from "__generated__/apollo"
import type {
  MuteTagMutation,
  MuteTagMutationVariables,
  ViewerMutedTagsQuery,
  ViewerMutedTagsQueryVariables,
} from "__generated__/apollo"
import React, { useContext, useState } from "react"

import { MutedTag } from "app/[lang]/settings/muted/tags/_components/muted-tag"
import { AppContext } from "app/_contexts/app-context"

export const MutedTagList: React.FC = () => {
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

  const toast = useToast()

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
        toast({ status: "error", title: error.message })
      }
    }
  }

  return (
    <Stack w={"100%"} spacing={8}>
      <Text fontWeight={"bold"} fontSize={"2xl"}>
        {"ミュートしているタグ"}
      </Text>
      <Stack>
        <HStack alignItems={"flex-start"}>
          <Stack flex={1}>
            <Input
              borderRadius={"full"}
              value={text}
              onChange={(e) => {
                setText(e.target.value)
              }}
              placeholder="タグ"
            />
            <HStack justifyContent={"flex-end"}>
              <Text fontSize={"xs"}>{`${count}/12`}</Text>
            </HStack>
          </Stack>
          <Button
            colorScheme="primary"
            borderRadius={"full"}
            onClick={handleMute}
          >
            {"変更を保存"}
          </Button>
        </HStack>
      </Stack>
      {data?.viewer?.mutedTags.length === 0 && (
        <Alert status="info" borderRadius={"md"}>
          <AlertIcon />
          <AlertTitle>{"ミュートしているタグはありません"}</AlertTitle>
        </Alert>
      )}
      <Stack divider={<Divider />}>
        {data?.viewer?.mutedTags.map((mutedTag) => (
          <MutedTag
            key={mutedTag.id}
            name={mutedTag.name}
            onClick={() => {
              handleUnmute(mutedTag.name)
            }}
          />
        ))}
      </Stack>
    </Stack>
  )
}
