"use client"
import { Box, Button, HStack, Icon, Stack } from "@chakra-ui/react"
import Link from "next/link"
import React from "react"
import {
  TbBell,
  TbDownload,
  TbMedal2,
  TbMoodCog,
  TbPhoto,
  TbRubberStamp,
  TbSettings,
  TbTagsOff,
  TbUser,
  TbUserOff,
} from "react-icons/tb"

type Props = {
  children: React.ReactNode
}

const SettingsLayout: React.FC<Props> = (props) => {
  return (
    <HStack alignItems={"flex-start"} spacing={0}>
      <Box as={"aside"} minW={"8rem"}>
        <Stack p={4}>
          <Button
            lineHeight={1}
            leftIcon={<Icon as={TbMoodCog} />}
            justifyContent={"flex-start"}
            variant={"ghost"}
            as={Link}
            href={"/settings/account"}
          >
            {"アカウント"}
          </Button>
          <Button
            lineHeight={1}
            leftIcon={<Icon as={TbUser} />}
            justifyContent={"flex-start"}
            variant={"ghost"}
            as={Link}
            href={"/settings/profile"}
          >
            {"プロフィール"}
          </Button>
          <Button
            lineHeight={1}
            leftIcon={<Icon as={TbBell} />}
            justifyContent={"flex-start"}
            variant={"ghost"}
            as={Link}
            href={"/settings/notification"}
          >
            {"通知・いいね"}
          </Button>
          <Button
            lineHeight={1}
            leftIcon={<Icon as={TbPhoto} />}
            justifyContent={"flex-start"}
            variant={"ghost"}
            as={Link}
            href={"/settings/contents"}
          >
            {"表示コンテンツ"}
          </Button>
          <Button
            lineHeight={1}
            leftIcon={<Icon as={TbUserOff} />}
            justifyContent={"flex-start"}
            variant={"ghost"}
            as={Link}
            href={"/settings/mute/users"}
          >
            {"ユーザミュート"}
          </Button>
          <Button
            lineHeight={1}
            leftIcon={<Icon as={TbTagsOff} />}
            justifyContent={"flex-start"}
            variant={"ghost"}
            as={Link}
            href={"/settings/mute/tags"}
          >
            {"タグミュート"}
          </Button>
          <Button
            lineHeight={1}
            leftIcon={<Icon as={TbRubberStamp} />}
            justifyContent={"flex-start"}
            variant={"ghost"}
            as={Link}
            href={"/settings/stickers"}
          >
            {"作成スタンプ"}
          </Button>
          <Button
            lineHeight={1}
            leftIcon={<Icon as={TbDownload} />}
            justifyContent={"flex-start"}
            variant={"ghost"}
            as={Link}
            href={"/settings/stickers/downloads"}
          >
            {"DLスタンプ"}
          </Button>
          <Button
            lineHeight={1}
            leftIcon={<Icon as={TbMedal2} />}
            justifyContent={"flex-start"}
            variant={"ghost"}
            as={Link}
            href={"/settings/request"}
          >
            {"支援リクエスト"}
          </Button>
          <Button
            lineHeight={1}
            leftIcon={<Icon as={TbSettings} />}
            justifyContent={"flex-start"}
            variant={"ghost"}
            as={Link}
            href={"/settings/interface"}
          >
            {"UIカスタム"}
          </Button>
        </Stack>
      </Box>
      {props.children}
    </HStack>
  )
}

export default SettingsLayout
