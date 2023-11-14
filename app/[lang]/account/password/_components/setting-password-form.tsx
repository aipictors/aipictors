"use client"

import type {
  UpdateAccountPasswordMutation,
  UpdateAccountPasswordMutationVariables,
} from "@/__generated__/apollo"
import { UpdateAccountPasswordDocument } from "@/__generated__/apollo"
import { ApolloError, useMutation } from "@apollo/client"
import {
  Button,
  HStack,
  Icon,
  IconButton,
  Input,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react"
import { useState } from "react"
import { TbEye } from "react-icons/tb"

export const AccountPasswordForm = () => {
  const [newPassword, setNewPassword] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)

  const [showNewPassword, setShowNewPassword] = useState(false)

  const toast = useToast()

  const [mutation, { loading }] = useMutation<
    UpdateAccountPasswordMutation,
    UpdateAccountPasswordMutationVariables
  >(UpdateAccountPasswordDocument)

  const handleSubmit = async () => {
    try {
      await mutation({
        variables: {
          input: {
            currentPassword: currentPassword,
            newPassword: newPassword,
          },
        },
      })
      setCurrentPassword("")
      setNewPassword("")
      toast({ status: "success", title: "パスワードを変更しました" })
    } catch (error) {
      if (error instanceof ApolloError) {
        toast({ status: "error", title: error.message })
      }
    }
  }

  return (
    <Stack w={"100%"} spacing={8}>
      <Text lineHeight={1} fontWeight={"bold"} fontSize={"2xl"}>
        {"パスワード"}
      </Text>
      <Stack>
        <Text>{"現在のログインパスワード"}</Text>
        <HStack>
          <Input
            placeholder="現在のログインパスワード"
            value={currentPassword}
            type={showPassword ? "text" : "password"}
            onChange={(event) => {
              setCurrentPassword(event.target.value)
            }}
          />
          <IconButton
            aria-label="Search database"
            icon={<Icon as={TbEye} />}
            onClick={() => {
              setShowPassword(!showPassword)
            }}
          />
        </HStack>
      </Stack>
      <Stack>
        <Text>{"新しいログインパスワード"}</Text>
        <HStack>
          <Input
            placeholder="新しいログインパスワード"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value)
            }}
          />
          <IconButton
            aria-label="Search database"
            icon={<Icon as={TbEye} />}
            onClick={() => {
              setShowNewPassword(!showNewPassword)
            }}
          />
        </HStack>
        {/* <Stack spacing={1}>
            <Progress value={80} borderRadius={"full"} />
            <Text fontSize={"xs"}>
              {"パスワード強度スコアが3以上（バーが黄色～緑色）"}
            </Text>
          </Stack> */}
      </Stack>
      <Button
        colorScheme="primary"
        borderRadius={"full"}
        onClick={handleSubmit}
        isLoading={loading}
      >
        {"変更を保存"}
      </Button>
    </Stack>
  )
}
