"use client"

import { HomeNavigationButton } from "@/app/[lang]/(main)/_components/home-navigation-button"
import { AuthContext } from "@/app/_contexts/auth-context"
import { Separator } from "@/components/ui/separator"
import { Config } from "@/config"
import {
  AlertTriangleIcon,
  AwardIcon,
  BookImageIcon,
  BoxIcon,
  CameraIcon,
  FolderIcon,
  HomeIcon,
  ImageIcon,
  LibraryBigIcon,
  LightbulbIcon,
  LogInIcon,
  LogOutIcon,
  SettingsIcon,
  SparklesIcon,
  StampIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"
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

export const HomeNavigationList = (props: Props) => {
  const appContext = useContext(AuthContext)

  return (
    <div className="space-y-1">
      <HomeNavigationButton href={"/"} icon={HomeIcon}>
        {"ホーム"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/themes"}
        icon={LightbulbIcon}
      >
        {"創作アイデア"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/stickers"} icon={StampIcon}>
        {"スタンプ広場"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/awards"}
        icon={AwardIcon}
      >
        {"ランキング"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={"https://www.aipictors.com/generate/"}
        icon={SparklesIcon}
      >
        {"画像生成"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/series"}
        icon={LibraryBigIcon}
      >
        {"シリーズ"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/collections"}
        icon={FolderIcon}
      >
        {"コレクション"}
      </HomeNavigationButton>
      <div className={"py-2"}>
        <Separator />
      </div>
      <HomeNavigationButton href={"/works/2d"} icon={ImageIcon}>
        {"イラスト"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/works/2.5d"} icon={BookImageIcon}>
        {"セミリアル"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/works/3d"} icon={CameraIcon}>
        {"フォト"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/models"} icon={BoxIcon}>
        {"モデル"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive"} icon={AlertTriangleIcon}>
        {"センシティブ"}
      </HomeNavigationButton>
      <div className={"py-2"}>
        <Separator />
      </div>
      {appContext.isLoggedIn && (
        <HomeNavigationButton href={"/accounts/login"} icon={UserIcon}>
          {"アカウント"}
        </HomeNavigationButton>
      )}
      {appContext.isLoggedIn && (
        <HomeNavigationButton
          href={"/settings/restriction"}
          icon={SettingsIcon}
        >
          {"設定"}
        </HomeNavigationButton>
      )}
      {appContext.isLoggedIn && (
        <HomeNavigationButton
          onClick={() => {
            props.onLogout()
          }}
          icon={LogOutIcon}
        >
          {"ログアウト"}
        </HomeNavigationButton>
      )}
      {appContext.isNotLoggedIn && (
        <HomeNavigationButton
          onClick={() => {
            props.onLogin()
          }}
          icon={LogInIcon}
        >
          {"ログイン"}
        </HomeNavigationButton>
      )}
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
      <div className="py-2">
        <Separator />
      </div>
      <div className="flex flex-col space-y-2 pl-3">
        <Link href={"/about"} className={"text-xs"}>
          {"このサイトについて"}
        </Link>
        <Link href={"/about/us"} className={"text-xs"}>
          {"運営会社"}
        </Link>
        <Link href={"/terms"} className={"text-xs"}>
          {"利用規約"}
        </Link>
        <Link href={"/privacy"} className={"text-xs"}>
          {"プライバシーポリシー"}
        </Link>
        <Link
          href={"/specified-commercial-transaction-act"}
          className={"text-xs"}
        >
          {"特定商取引法に基づく表記"}
        </Link>
      </div>
    </div>
  )
}
