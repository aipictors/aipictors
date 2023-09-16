"use client"
import {
  Box,
  Divider,
  Stack,
  Link as ChakraLink,
  useBreakpoint,
} from "@chakra-ui/react"
import Link from "next/link"
import { FC } from "react"
import {
  TbAlbum,
  TbAward,
  TbBolt,
  TbBrandDiscordFilled,
  TbBrandThreads,
  TbBrandX,
  TbBrandYoutubeFilled,
  TbCamera,
  TbFolder,
  TbHome,
  TbMug,
  TbPhoto,
  TbPhotoPlus,
  TbRubberStamp,
  TbSettings,
  TbSparkles,
  TbUser,
  TbUserDown,
  TbUserUp,
} from "react-icons/tb"
import { HomeNavigationButton } from "app/(main)/components/HomeNavigationButton"

export const HomeNavigation: FC = () => {
  const breakpoint = useBreakpoint()

  if (breakpoint === "base" || breakpoint === "sm") {
    return null
  }

  return (
    <Box
      as={"nav"}
      position={"sticky"}
      top={"64px"}
      h={"calc(100svh - 64px)"}
      minW={"12rem"}
      overflowY={"auto"}
    >
      <Stack p={4}>
        <HomeNavigationButton href={"/"} leftIcon={TbHome}>
          {"ホーム"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/stickers"} leftIcon={TbRubberStamp}>
          {"スタンプ広場"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/ranking"} leftIcon={TbAward}>
          {"ランキング"}
        </HomeNavigationButton>
        <HomeNavigationButton
          href={"https://www.aipictors.com/generate/"}
          leftIcon={TbBolt}
        >
          {"画像生成"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/series"} leftIcon={TbAlbum}>
          {"シリーズ"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/collections"} leftIcon={TbFolder}>
          {"コレクション"}
        </HomeNavigationButton>
        <Box py={2}>
          <Divider />
        </Box>
        <HomeNavigationButton href={"/works/images/2d"} leftIcon={TbPhoto}>
          {"イラスト"}
        </HomeNavigationButton>
        <HomeNavigationButton
          href={"/works/images/2.5d"}
          leftIcon={TbPhotoPlus}
        >
          {"セミリアル"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/works/images/3d"} leftIcon={TbCamera}>
          {"フォト"}
        </HomeNavigationButton>
        <Box py={2}>
          <Divider />
        </Box>
        <HomeNavigationButton href={"/settings/account"} leftIcon={TbUser}>
          {"マイページ"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/viewer"} leftIcon={TbMug}>
          {"ダッシュボード"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/viewer/followees"} leftIcon={TbUserDown}>
          {"フォロワー"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/viewer/followees"} leftIcon={TbUserUp}>
          {"フォロー"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/plus"} leftIcon={TbSparkles}>
          {"Aipictors+"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/viewer"} leftIcon={TbMug}>
          {"支援管理"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/settings/account"} leftIcon={TbSettings}>
          {"設定"}
        </HomeNavigationButton>
        <Box py={2}>
          <Divider />
        </Box>
        <Stack>
          <HomeNavigationButton
            leftIcon={TbBrandX}
            href={"https://twitter.com/Aipictors"}
          >
            {"X（Twitter）"}
          </HomeNavigationButton>
          <HomeNavigationButton
            leftIcon={TbBrandDiscordFilled}
            href={"https://discord.gg/CsSbTHYY"}
          >
            {"Discord"}
          </HomeNavigationButton>
          <HomeNavigationButton
            href={"https://www.threads.net/@aipictors"}
            leftIcon={TbBrandThreads}
          >
            {"Threads"}
          </HomeNavigationButton>
          <HomeNavigationButton
            href={"https://www.youtube.com/@aipictors"}
            leftIcon={TbBrandYoutubeFilled}
          >
            {"Threads"}
          </HomeNavigationButton>
        </Stack>
        <Box py={2}>
          <Divider />
        </Box>
        <Stack pl={3}>
          <ChakraLink href={"/about"} as={Link} fontSize={"xs"}>
            {"このサイトについて"}
          </ChakraLink>
          <ChakraLink href={"/about/us"} as={Link} fontSize={"xs"}>
            {"運営会社"}
          </ChakraLink>
          <ChakraLink href={"/terms"} as={Link} fontSize={"xs"}>
            {"利用規約"}
          </ChakraLink>
          <ChakraLink href={"/privacy"} as={Link} fontSize={"xs"}>
            {"プライバシーポリシー"}
          </ChakraLink>
          <ChakraLink
            href={"/specified-commercial-transaction-act"}
            as={Link}
            fontSize={"xs"}
          >
            {"特定商取引法に基づく表記"}
          </ChakraLink>
        </Stack>
      </Stack>
    </Box>
  )
}
