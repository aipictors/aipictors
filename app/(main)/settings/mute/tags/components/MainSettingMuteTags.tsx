"use client"
import { useSuspenseQuery } from "@apollo/client"
import {
  Box,
  Button,
  Divider,
  HStack,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import React, { useContext, useState } from "react"
import {
  ViewerMutedTagsDocument,
  type ViewerMutedTagsQuery,
  type ViewerMutedTagsQueryVariables,
} from "__generated__/apollo"
import { MutedTag } from "app/(main)/settings/mute/tags/components/MutedTag"
import { AppContext } from "app/contexts/appContext"

export const MainSettingMuteTags: React.FC = () => {
  const appContext = useContext(AppContext)

  const { data = null } = useSuspenseQuery<
    ViewerMutedTagsQuery,
    ViewerMutedTagsQueryVariables
  >(ViewerMutedTagsDocument, {
    skip: appContext.isLoading,
    variables: { offset: 0, limit: 128 },
  })

  const [text, setText] = useState("")

  const onClick = () => {}

  const count = text.length

  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
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
              onClick={onClick}
            >
              {"変更を保存"}
            </Button>
          </HStack>
        </Stack>
        {data?.viewer?.mutedTags.length === 0 && (
          <Stack>
            <Box>
              <Text>{"ミュートしているタグはありません"}</Text>
            </Box>
          </Stack>
        )}
        <Stack divider={<Divider />}>
          {data?.viewer?.mutedTags.map((mutedTag) => (
            <MutedTag key={mutedTag.id} name={mutedTag.name} />
          ))}
        </Stack>
      </Stack>
    </HStack>
  )
}
