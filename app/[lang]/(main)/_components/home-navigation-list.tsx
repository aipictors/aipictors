"use client"

import {
  Box,
  Divider,
  Link as ChakraLink,
  Stack,
  useColorMode,
} from "@chakra-ui/react"
import { HomeNavigationButton } from "app/[lang]/(main)/_components/home-navigation-button"
import { AppContext } from "app/_contexts/app-context"
import { Config } from "config"
import Link from "next/link"
import { useContext } from "react"
import {
  TbAlbum,
  TbAlertTriangle,
  TbAward,
  TbBolt,
  TbBox,
  TbBrandDiscordFilled,
  TbBrandThreads,
  TbBrandX,
  TbBrandYoutubeFilled,
  TbBulb,
  TbCamera,
  TbFolder,
  TbHome,
  TbLogin,
  TbLogout,
  TbMoonFilled,
  TbPhoto,
  TbPhotoPlus,
  TbRubberStamp,
  TbSettings,
  TbSunFilled,
} from "react-icons/tb"

type Props = {
  onOpen: () => void
  onOpenLogout: () => void
}

export const HomeNavigationList: React.FC<Props> = (props) => {
  const appContext = useContext(AppContext)

  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Stack>
      <HomeNavigationButton href={"/"} leftIcon={TbHome}>
        {"ホーム"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/themes"}
        leftIcon={TbBulb}
      >
        {"創作アイデア"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/stickers"} leftIcon={TbRubberStamp}>
        {"スタンプ広場"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/awards"}
        leftIcon={TbAward}
      >
        {"ランキング"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={"https://www.aipictors.com/generate/"}
        leftIcon={TbBolt}
      >
        {"画像生成"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/series"}
        leftIcon={TbAlbum}
      >
        {"シリーズ"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/collections"}
        leftIcon={TbFolder}
      >
        {"コレクション"}
      </HomeNavigationButton>
      <Box py={2}>
        <Divider />
      </Box>
      <HomeNavigationButton href={"/works/2d"} leftIcon={TbPhoto}>
        {"イラスト"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/works/2.5d"} leftIcon={TbPhotoPlus}>
        {"セミリアル"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/works/3d"} leftIcon={TbCamera}>
        {"フォト"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/models"} leftIcon={TbBox}>
        {"モデル"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive"} leftIcon={TbAlertTriangle}>
        {"センシティブ"}
      </HomeNavigationButton>
      <Box py={2}>
        <Divider />
      </Box>
      {appContext.isLoggedIn && (
        <HomeNavigationButton href={"/settings/login"} leftIcon={TbSettings}>
          {"設定"}
        </HomeNavigationButton>
      )}
      {appContext.isLoggedIn && (
        <HomeNavigationButton
          onClick={() => {
            props.onOpenLogout()
          }}
          leftIcon={TbLogout}
        >
          {"ログアウト"}
        </HomeNavigationButton>
      )}
      {appContext.isNotLoggedIn && (
        <HomeNavigationButton
          onClick={() => {
            props.onOpen()
          }}
          leftIcon={TbLogin}
        >
          {"ログイン"}
        </HomeNavigationButton>
      )}
      <HomeNavigationButton
        onClick={() => {
          toggleColorMode()
        }}
        leftIcon={colorMode === "dark" ? TbSunFilled : TbMoonFilled}
      >
        {colorMode === "dark" ? "ライトモード" : "ダークモード"}
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
          {"YouTube"}
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
  )
}
