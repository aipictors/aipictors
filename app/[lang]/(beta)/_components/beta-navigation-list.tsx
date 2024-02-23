"use client"

import { HomeNavigationButton } from "@/app/[lang]/(main)/_components/home-navigation-button"
import { LoginNavigationButton } from "@/app/[lang]/_components/navitation-login-button"
import { AuthContext } from "@/app/_contexts/auth-context"
import { Separator } from "@/components/ui/separator"
import {
  GemIcon,
  HomeIcon,
  MessageCircleIcon,
  Rocket,
  StampIcon,
} from "lucide-react"
import { useContext } from "react"
import {
  TbBrandDiscordFilled,
  TbBrandThreads,
  TbBrandX,
  TbBrandYoutubeFilled,
} from "react-icons/tb"

export const BetaNavigationList = () => {
  const authContext = useContext(AuthContext)

  return (
    <div className="space-y-1">
      <HomeNavigationButton href={"https://www.aipictors.com"} icon={HomeIcon}>
        {"ホーム"}
      </HomeNavigationButton>
      {/* {authContext.isLoggedIn && (
        <HomeNavigationButton href={"/generation"} icon={SparklesIcon}>
          {"画像生成"}
        </HomeNavigationButton>
      )} */}
      {/* {authContext.isLoggedIn && (
        <HomeNavigationButton href={"/generation/tasks"} icon={HistoryIcon}>
          {"生成履歴"}
        </HomeNavigationButton>
      )} */}
      <HomeNavigationButton href={"/stickers"} icon={StampIcon}>
        {"スタンプ広場"}
      </HomeNavigationButton>
      {authContext.isLoggedIn && (
        <HomeNavigationButton href={"/plus"} icon={GemIcon}>
          {"Aipictors+"}
        </HomeNavigationButton>
      )}
      {authContext.isLoggedIn && (
        <HomeNavigationButton href={"/support/chat"} icon={MessageCircleIcon}>
          {"お問い合わせ"}
        </HomeNavigationButton>
      )}
      <HomeNavigationButton href={"/milestones"} icon={Rocket}>
        {"開発予定"}
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
      {authContext.isNotLoggedIn && <LoginNavigationButton />}
      <div className="py-2">
        <Separator />
      </div>
      <HomeNavigationButton icon={TbBrandX} href={"https://x.com/Aipictors"}>
        {"Twitter"}
      </HomeNavigationButton>
      <HomeNavigationButton
        icon={TbBrandDiscordFilled}
        href={"https://discord.com/invite/WPJFSbUNwt"}
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
