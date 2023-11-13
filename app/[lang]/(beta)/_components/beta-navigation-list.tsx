"use client"

import { HomeNavigationButton } from "@/app/[lang]/(main)/_components/home-navigation-button"
import { AppContext } from "@/app/_contexts/app-context"
import { Button } from "@/components/ui/button"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useContext } from "react"
import {
  TbBolt,
  TbBrandDiscordFilled,
  TbBrandThreads,
  TbBrandX,
  TbBrandYoutubeFilled,
  TbHome,
  TbLogin,
  TbMessageCircle2,
  TbSparkles,
} from "react-icons/tb"

export const BetaNavigationList = () => {
  const appContext = useContext(AppContext)

  const { setTheme } = useTheme()

  // const { colorMode, toggleColorMode } = useColorMode()

  return (
    <div className="flex flex-col space-y-4 py-4">
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
      {appContext.isNotLoggedIn && (
        <HomeNavigationButton
          onClick={() => {
            ""
          }}
          leftIcon={TbLogin}
        >
          {"ログイン"}
        </HomeNavigationButton>
      )}
      <Button
        className="justify-start space-x-2 flex flex-row"
        size={"sm"}
        variant="secondary"
        onClick={() => setTheme("light")}
      >
        <Sun>{"Light"}</Sun>
        <span>{"ライトモード"}</span>
      </Button>
      <Button
        className="justify-start space-x-2 flex flex-row"
        size={"sm"}
        variant="secondary"
        onClick={() => setTheme("dark")}
      >
        <Moon>{"Dark"}</Moon>
        <span>{"ダークモード"}</span>
        {/* <Sun
          className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          onClick={() => setTheme("light")}
        />
        <Moon
          className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          onClick={() => setTheme("dark")}
        /> */}
      </Button>
      <div className="py-2">
        <hr className="border-t" />
      </div>
      <div className="flex flex-col space-y-4 py-4">
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
      </div>
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
    </div>
  )
}
