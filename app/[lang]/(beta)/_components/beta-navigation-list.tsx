"use client"

import { HomeNavigationButton } from "@/app/[lang]/(main)/_components/home-navigation-button"
import { ThemeModeButton } from "@/app/[lang]/(main)/_components/theme-mode-button"
import { AppContext } from "@/app/_contexts/app-context"
import { Separator } from "@/components/ui/separator"
import {
  Home,
  LogIn,
  MessageCircle,
  Rocket,
  Sparkles,
  Stamp,
} from "lucide-react"
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

  return (
    <div className="flex flex-col space-y-1">
      <HomeNavigationButton href={"https://www.aipictors.com"} icon={Home}>
        {"ホーム"}
      </HomeNavigationButton>
      {appContext.isLoggedIn && (
        <HomeNavigationButton href={"/stickers"} icon={Stamp}>
          {"スタンプ広場"}
        </HomeNavigationButton>
      )}
      {appContext.isLoggedIn && (
        <HomeNavigationButton href={"/plus"} icon={Rocket}>
          {"Aipictors+"}
        </HomeNavigationButton>
      )}
      {appContext.isLoggedIn && (
        <HomeNavigationButton href={"/support/chat"} icon={MessageCircle}>
          {"お問い合わせ"}
        </HomeNavigationButton>
      )}
      <HomeNavigationButton href={"/generation/"} icon={Sparkles}>
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
        <HomeNavigationButton onClick={props.onLogin} icon={LogIn}>
          {"ログイン"}
        </HomeNavigationButton>
      )}
      <ThemeModeButton />
      <div className="py-2">
        <Separator />
      </div>
      <HomeNavigationButton
        icon={TbBrandX}
        href={"https://twitter.com/Aipictors"}
      >
        {"Twitter"}
      </HomeNavigationButton>
      <HomeNavigationButton
        icon={TbBrandDiscordFilled}
        href={"https://discord.gg/CsSbTHYY"}
      >
        {"Discord"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={"https://www.threads.net/@aipictors"}
        icon={TbBrandThreads}
      >
        {"Threads"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={"https://www.youtube.com/@aipictors"}
        icon={TbBrandYoutubeFilled}
      >
        {"YouTube"}
      </HomeNavigationButton>
    </div>
  )
}
