"use client"

import { HomeNavigationButton } from "@/app/[lang]/(main)/_components/home-navigation-button"
import { AppContext } from "@/app/_contexts/app-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Home,
  LogIn,
  MessageCircle,
  Moon,
  Rocket,
  Sparkles,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useContext } from "react"
import {
  TbBrandDiscordFilled,
  TbBrandThreads,
  TbBrandX,
  TbBrandYoutubeFilled,
} from "react-icons/tb"

type Props = {
  onLogin(): void
  onLogout(): void
}

export const BetaNavigationList = (props: Props) => {
  const appContext = useContext(AppContext)

  const { setTheme } = useTheme()

  return (
    <div className="flex flex-col space-y-2">
      <HomeNavigationButton
        href={"https://www.aipictors.com"}
        leftIcon={<Home className="w-4" />}
      >
        {"ホーム"}
      </HomeNavigationButton>
      {appContext.isLoggedIn && (
        <HomeNavigationButton
          href={"/plus"}
          leftIcon={<Rocket className="w-4" />}
        >
          {"Aipictors+"}
        </HomeNavigationButton>
      )}
      {appContext.isLoggedIn && (
        <HomeNavigationButton
          href={"/support/chat"}
          leftIcon={<MessageCircle className="w-4" />}
        >
          {"お問い合わせ"}
        </HomeNavigationButton>
      )}
      <HomeNavigationButton
        href={"https://www.aipictors.com/generate/"}
        leftIcon={<Sparkles className="w-4" />}
      >
        {"画像生成"}
      </HomeNavigationButton>
      {/* {appContext.isLoggedIn && (
        <HomeNavigationButton
          isDisabled={Config.isReleaseMode}
          href={"/settings/login"}
          leftIcon={<Settings />}
        >
          {"設定"}
        </HomeNavigationButton>
      )} */}
      {appContext.isNotLoggedIn && (
        <HomeNavigationButton
          onClick={props.onLogin}
          leftIcon={<LogIn className="w-4" />}
        >
          {"ログイン"}
        </HomeNavigationButton>
      )}
      <Button
        className="w-full justify-start"
        size={"sm"}
        variant={"ghost"}
        onClick={() => setTheme("light")}
      >
        <Sun className="mr-4 w-4">{"Light"}</Sun>
        <span>{"ライトモード"}</span>
      </Button>
      <Button
        className="w-full justify-start"
        size={"sm"}
        variant={"ghost"}
        onClick={() => setTheme("dark")}
      >
        <Moon className="mr-4 w-4">{"Dark"}</Moon>
        <span>{"ダークモード"}</span>
      </Button>
      <div className="py-2">
        <Separator />
      </div>
      <div className="flex flex-col space-y-2">
        <HomeNavigationButton
          leftIcon={<TbBrandX fontSize={16} />}
          href={"https://twitter.com/Aipictors"}
        >
          {"Twitter"}
        </HomeNavigationButton>
        <HomeNavigationButton
          leftIcon={<TbBrandDiscordFilled fontSize={16} />}
          href={"https://discord.gg/CsSbTHYY"}
        >
          {"Discord"}
        </HomeNavigationButton>
        <HomeNavigationButton
          href={"https://www.threads.net/@aipictors"}
          leftIcon={<TbBrandThreads fontSize={16} />}
        >
          {"Threads"}
        </HomeNavigationButton>
        <HomeNavigationButton
          href={"https://www.youtube.com/@aipictors"}
          leftIcon={<TbBrandYoutubeFilled fontSize={16} />}
        >
          {"YouTube"}
        </HomeNavigationButton>
      </div>
    </div>
  )
}
