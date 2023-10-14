"use client"

import { Box, Divider, Stack, useColorMode } from "@chakra-ui/react"
import { HomeNavigationButton } from "app/[lang]/(main)/components/HomeNavigationButton"
import { AppContext } from "app/contexts/appContext"
import { useContext } from "react"
import {
  TbBolt,
  TbBrandDiscordFilled,
  TbBrandThreads,
  TbBrandX,
  TbBrandYoutubeFilled,
  TbHome,
  TbLogin,
  TbLogout,
  TbMessageCircle2,
  TbMoonFilled,
  TbSparkles,
  TbSunFilled,
} from "react-icons/tb"

type Props = {
  onOpen: () => void
  onOpenLogout: () => void
}

export const BetaNavigationList: React.FC<Props> = (props) => {
  const appContext = useContext(AppContext)

  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Stack>
      <HomeNavigationButton
        href={"https://www.aipictors.com"}
        leftIcon={TbHome}
      >
        {"ホーム"}
      </HomeNavigationButton>
      {appContext.isLoggedIn && (
        <HomeNavigationButton href={"/plus"} leftIcon={TbSparkles}>
          {"Aipictors+"}
        </HomeNavigationButton>
      )}

      {appContext.isLoggedIn && (
        <HomeNavigationButton
          href={"/support/chat"}
          leftIcon={TbMessageCircle2}
        >
          {"お問い合わせ"}
        </HomeNavigationButton>
      )}
      <HomeNavigationButton
        href={"https://www.aipictors.com/generate/"}
        leftIcon={TbBolt}
      >
        {"画像生成"}
      </HomeNavigationButton>
      {/* {appContext.isLoggedIn && (
        <HomeNavigationButton
          isDisabled={Config.isReleaseMode}
          href={"/settings/login"}
          leftIcon={TbSettings}
        >
          {"設定"}
        </HomeNavigationButton>
      )} */}
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
      {/* <Box py={2}>
        <Divider />
      </Box> */}
      {/* <Stack pl={3}>
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
      </Stack> */}
    </Stack>
  )
}
